// background.js - service worker for Autofill Genius AI
importScripts('config.js');

// ──────────────────────────────────────────────
// Keep-alive: prevent Chrome MV3 from killing the
// service worker during long AI API calls.
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

// Shared AI caller (via server proxy)
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
        throw new Error(data.error || 'Server error during extraction');
    }

    return { parsed: data.parsed, usage: data.usage };
}

// Extraction (document to structured profile data)
async function handleExtraction(payload, sendResponse) {
    const stopKeepAlive = keepAlive(); // prevent SW termination during long fetch
    try {
        const { image, textContent, targetLabels } = payload;

        // Build the core instruction
        let prompt = `You are an expert data extraction assistant. Your job is to extract personal information from a document and fill a profile form.\n\n`;

        if (targetLabels && targetLabels.length > 0) {
            prompt += `TARGET PROFILE FIELDS:\n`;
            prompt += `You must extract information from the document and return a JSON object where the keys are EXACTLY the following human-readable field labels (copy them verbatim as JSON keys):\n`;
            prompt += JSON.stringify(targetLabels, null, 2) + '\n\n';

            prompt += `EXTRACTION RULES:\n`;
            prompt += `1. Use these EXACT label strings as JSON keys — do NOT modify, abbreviate, or translate them.\n`;
            prompt += `2. Perform DEEP SEMANTIC MATCHING — read the document and map its content to each label by meaning, not by exact wording.\n`;
            prompt += `   Examples of semantic matching:\n`;
            prompt += `   - Document says "নাম", "Name", "Full Name" → match to labels like "First Name (Bengali)", "Last Name (English)" split by context.\n`;
            prompt += `   - Document says "জন্ম তারিখ", "DOB", "Date of Birth" → match to "Date of Birth" or "Father's Date of Birth" labels.\n`;
            prompt += `   - Document says "জাতীয় পরিচয়পত্র নং", "NID", "National ID" → match to labels containing "National ID".\n`;
            prompt += `   - Document says "পিতার নাম", "Father's Name" → match to labels like "Father's Name (Bengali)" and "Father's Name (English)".\n`;
            prompt += `   - Document says "মাতার নাম", "Mother's Name" → match to labels like "Mother's Name (Bengali)" and "Mother's Name (English)".\n`;
            prompt += `3. For labels that have both Bengali and English variants:\n`;
            prompt += `   - If the document value is in Bengali script → fill the Bengali label and transliterate to fill the English label.\n`;
            prompt += `   - If the document value is in English → fill the English label and transliterate to fill the Bengali label.\n`;
            prompt += `4. DERIVE fields intelligently when possible:\n`;
            prompt += `   - Split a full name ("Mohammad Ahmed") across "First Name" and "Last Name" labels.\n`;
            prompt += `   - Normalize dates to YYYY-MM-DD format unless the label specifies otherwise.\n`;
            prompt += `   - If gender is not in the document, infer from the name.\n`;
            prompt += `   - If country is absent, default to Bangladesh.\n`;
            prompt += `5. For labels whose value is NOT found in the document, use empty string "" — do NOT hallucinate values.\n`;
            prompt += `6. Be aggressive about filling — a reasonable semantic match is better than leaving a field empty. But do NOT fill in incorrect information.\n`;
            prompt += `7. Include ALL labels in your response, even if the value is empty string.\n`;
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
