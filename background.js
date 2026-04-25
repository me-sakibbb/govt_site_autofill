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
async function callGemini(parts, aiModel = 'fastest') {
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
        body: JSON.stringify({ parts, aiModel }),
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
        const { image, textContent, targetLabels, aiModel } = payload;

        // Build the core instruction — kept compact to minimize input tokens
        let prompt = `Extract personal information from the document into the target fields below.\n\n`;

        if (targetLabels && targetLabels.length > 0) {
            prompt += `TARGET FIELDS (use these EXACT strings as JSON keys):\n`;
            prompt += JSON.stringify(targetLabels) + '\n\n';

            prompt += `RULES:\n`;
            prompt += `1. Return ONLY a JSON object. Keys must be the EXACT label strings from the list above — copy them verbatim.\n`;
            prompt += `2. ONLY include fields you found a value for. OMIT fields with no data — do NOT include empty strings.\n`;
            prompt += `3. Intelligent Semantic Mapping: Map document content to target fields by meaning, not just exact text match. E.g., a generic "Address" in the document should be used to fill "Present Address", "Permanent Address", "Village", "Post Office", etc., if those are the targets and you can deduce them.\n`;
            prompt += `4. Cross-lingual & Transliteration: If the document is in Bangla, translate/transliterate to fill English target fields, and vice versa. Always provide both language variants whenever target fields ask for them (e.g., Name (English) and Name (Bangla)).\n`;
            prompt += `5. Intelligent Derivation: Split full names accurately into First/Last/Middle names if requested. Normalize all dates (e.g. YYYY-MM-DD, or DD/MM/YYYY if requested). Infer gender from the name or context if not explicitly stated. Default country/nationality to Bangladesh/Bangladeshi if appropriate. If a single value applies to multiple similar fields, fill all of them.\n`;
            prompt += `6. Maximize Extraction: Be extremely aggressive about filling fields. A reasonable guess or partial match is highly preferred over omitting. Use context clues to fill as many target fields as practically possible. Do not leave fields empty if related data exists.\n`;
        } else {
            prompt += `Extract ALL personal data as a flat JSON with descriptive English snake_case keys.\n`;
            prompt += `Include: name, father_name, mother_name, date_of_birth, national_id, address, phone, email, etc.\n`;
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

        const { parsed, usage } = await callGemini(parts, aiModel || 'fastest');

        sendResponse({ success: true, data: parsed, usageMetadata: usage });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    } finally {
        stopKeepAlive(); // always stop pinging when done
    }
}
