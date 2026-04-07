// background.js - Gemini AI service worker
importScripts('config.js');

// ──────────────────────────────────────────────
// Keep-alive: prevent Chrome MV3 from killing the
// service worker during long Gemini API calls.
// Strategy: open a self-connect port and ping it
// every 20 s; stop as soon as the task completes.
// ──────────────────────────────────────────────
function keepAlive() {
    const port = chrome.runtime.connect({ name: 'keepalive' });
    const interval = setInterval(() => {
        try { port.postMessage('ping'); } catch (_) {}
    }, 20_000);
    const stop = () => { clearInterval(interval); try { port.disconnect(); } catch (_) {} };
    return stop;
}

// Handle the self-connect so it doesn't throw errors
chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== 'keepalive') return;
    port.onMessage.addListener(() => { /* ignore pings */ });
    port.onDisconnect.addListener(() => { /* ignore */ });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const handlers = {
        EXTRACT_DATA: () => handleExtraction(request.payload, sendResponse),
        SESSION_GET: () => chrome.storage.session.get([request.key], r => sendResponse({ value: r[request.key] ?? null })),
        SESSION_SET: () => chrome.storage.session.set({ [request.key]: request.value }, () => sendResponse({ success: true })),
        OPEN_OPTIONS: () => { chrome.runtime.openOptionsPage(); sendResponse({ success: true }); },
        GET_VALID_SESSION: () => {
            getValidSession().then(session => sendResponse({ session })).catch(() => sendResponse({ session: null }));
        },
    };
    if (handlers[request.action]) { handlers[request.action](); return true; }
});

async function getValidSession() {
    let { supabaseSession } = await chrome.storage.local.get(['supabaseSession']);
    if (!supabaseSession || !supabaseSession.access_token) return null;

    try {
        const payloadBase64 = supabaseSession.access_token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
        const expiresAt = payload.exp;

        // Refresh token if it expires in less than 5 minutes
        if (Date.now() / 1000 > expiresAt - 300) {
            const res = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': CONFIG.SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({ refresh_token: supabaseSession.refresh_token })
            });

            if (res.ok) {
                const newData = await res.json();
                supabaseSession = newData;
                await chrome.storage.local.set({ supabaseSession: newData });
            } else {
                await chrome.storage.local.remove('supabaseSession');
                return null;
            }
        }
    } catch (e) {
        console.error('Error handling session token:', e);
        await chrome.storage.local.remove('supabaseSession');
        return null;
    }

    return supabaseSession;
}

// Shared Gemini caller (via server proxy)
async function callGemini(parts) {
    const supabaseSession = await getValidSession();

    if (!supabaseSession || !supabaseSession.access_token) {
        throw new Error('Login expired. Please open extension Options to log in again.');
    }

    const API_ENDPOINT = `${CONFIG.SERVER_URL}/api/extension/gemini`;

    const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseSession.access_token}`
        },
        body: JSON.stringify({ parts }),
    });

    const responseText = await res.text();
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (err) {
        if (responseText.includes('Request Entity Too Large') || res.status === 413) {
            throw new Error('The document is too large. Please use a smaller file or compress the image before extracting.');
        }
        throw new Error(`Server returned an invalid response (Status ${res.status}).`);
    }

    if (!res.ok) {
        throw new Error(data.error || 'Server error calling Gemini');
    }

    return { parsed: data.parsed, usage: data.usage };
}

// Extraction (document to structured profile data)
async function handleExtraction(payload, sendResponse) {
    const stopKeepAlive = keepAlive(); // prevent SW termination during long fetch
    try {
        const { image, textContent, targetFields } = payload;

        // Build the core instruction
        let prompt = `You are an expert data extraction assistant. Your job is to extract personal information from a document and fill a profile form.\n\n`;

        if (targetFields && Object.keys(targetFields).length > 0) {
            prompt += `TARGET PROFILE FIELDS:\n`;
            prompt += `You must extract the information and return a JSON object where the keys are EXACTLY the following IDs. I have provided the human-readable label for each ID to help you map the data:\n`;
            prompt += JSON.stringify(targetFields, null, 2) + '\n\n';

            prompt += `EXTRACTION RULES:\n`;
            prompt += `1. Return ONLY a valid JSON object using the EXACT IDs (keys) listed above. Never use the labels as keys in the JSON.\n`;
            prompt += `2. Perform DEEP SEMANTIC MATCHING - use the provided labels to understand what each ID means. Match document text to the labels, but output the ID.\n`;
            prompt += `   Examples of semantic matching:\n`;
            prompt += `   - "নাম" or "Name" or "Full Name" → match to keys like "Child Name (English)" or "Father's Name (Bangla)" based on context\n`;
            prompt += `   - "জন্ম তারিখ" or "DOB" or "Date of Birth" → "Date of Birth" or "Father's Date of Birth" etc.\n`;
            prompt += `   - "জাতীয় পরিচয়পত্র নং" or "NID" or "National ID" → "Father's National ID" or "Mother's National ID"\n`;
            prompt += `   - "পিতার নাম" or "Father" → "Father's Name (Bangla)" and/or "Father's Name (English)"\n`;
            prompt += `   - "মাতার নাম" or "Mother" → "Mother's Name (Bangla)" and/or "Mother's Name (English)"\n`;
            prompt += `3. If a field has both Bangla and English variants (e.g. "Father's Name (Bangla)" and "Father's Name (English)"):\n`;
            prompt += `   - If the document has the name in Bangla script, fill the Bangla field and transliterate to fill the English one.\n`;
            prompt += `   - If the document has it in English, fill the English field and transliterate for the Bangla one.\n`;
            prompt += `4. DERIVE fields when possible:\n`;
            prompt += `   - If you see a full name "Mohammad Ahmed Hossain", you can split/use it for both Bangla and English name fields.\n`;
            prompt += `   - If you see a date "15-07-1990", convert to "15/07/1990" format for date fields.\n`;
            prompt += `   - If you see age field, and you have the date of birth, calculate the age.\n`;
            prompt += `   - If the country is not present in the document, set it to Bangladesh anyway.\n`;
            prompt += `   - If gender is not specified in the doc, guess the gender from the name.\n`;
            prompt += `5. For fields NOT found in the document, use empty string "" - do NOT guess or hallucinate values. However, if it is possible to derive any value, do it.\n`;
            prompt += `6. Ignore fields that are completely irrelevant to the document (e.g. address fields when document only has personal info).\n`;
            prompt += `7. Be aggressive about filling fields - it's better to fill a field with a reasonable match than leave it empty. However do NOT fill in wrong information.\n`;
            prompt += `8. Be intelligent about filling the fields. Check if any field can be filled from the given information.\n`;
        } else {
            prompt += `Extract ALL personal data from the document as a flat JSON object with descriptive English snake_case keys.\n`;
            prompt += `Include: name, father_name, mother_name, date_of_birth, national_id, address, phone, email, occupation, etc.\n`;
        }

        prompt += `\nReturn ONLY the JSON object, no explanation, no markdown.`;

        const parts = [];

        if (textContent) {
            parts.push({ text: prompt + `\n\nDOCUMENT CONTENT:\n${textContent}` });
        } else if (image) {
            const base64Image = image.split(',')[1];
            const mimeType = image.split(';')[0].split(':')[1];
            parts.push({ text: prompt });
            parts.push({ inline_data: { mime_type: mimeType, data: base64Image } });
        } else {
            throw new Error('No document content provided');
        }

        const { parsed, usage } = await callGemini(parts);

        sendResponse({ success: true, data: parsed, usageMetadata: usage });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    } finally {
        stopKeepAlive(); // always stop pinging when done
    }
}
