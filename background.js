// background.js - Gemini AI service worker
const MODEL = 'gemini-2.5-flash-lite';
const SERVER_URL = 'http://localhost:3000'; // Change this to your production domain later

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const handlers = {
        EXTRACT_DATA: () => handleExtraction(request.payload, sendResponse),
        MAP_FIELDS: () => handleMapping(request.payload, sendResponse),
        SESSION_GET: () => chrome.storage.session.get([request.key], r => sendResponse({ value: r[request.key] ?? null })),
        SESSION_SET: () => chrome.storage.session.set({ [request.key]: request.value }, () => sendResponse({ success: true })),
        OPEN_OPTIONS: () => { chrome.runtime.openOptionsPage(); sendResponse({ success: true }); },
    };
    if (handlers[request.action]) { handlers[request.action](); return true; }
});

// Shared Gemini caller (via Next JS Server)
async function callGemini(parts) {
    const { supabaseSession, nextAiServerUrl } = await chrome.storage.local.get(['supabaseSession', 'nextAiServerUrl']);

    if (!supabaseSession || !supabaseSession.access_token) {
        throw new Error('Not logged in. Open extension Options to login to Next AI Solution.');
    }

    const API_ENDPOINT = `${nextAiServerUrl || SERVER_URL}/api/extension/gemini`;

    const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseSession.access_token}`
        },
        body: JSON.stringify({ parts }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Server error calling Gemini');
    }

    return { parsed: data.parsed, usage: data.usage };
}

// Extraction (document to structured profile data)
async function handleExtraction(payload, sendResponse) {
    try {
        const { image, textContent, targetFields } = payload;

        // Build the core instruction
        let prompt = `You are an expert data extraction assistant. Your job is to extract personal information from a document and fill a profile form.\n\n`;

        if (targetFields && targetFields.length > 0) {
            prompt += `TARGET PROFILE FIELDS (these are the EXACT keys you must use in your response):\n`;
            prompt += JSON.stringify(targetFields, null, 2) + '\n\n';

            prompt += `EXTRACTION RULES:\n`;
            prompt += `1. Return ONLY a valid JSON object using the EXACT keys listed above.\n`;
            prompt += `2. Perform DEEP SEMANTIC MATCHING - the document labels may be different from the target keys. Use meaning, not exact text.\n`;
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
            prompt += `5. For fields NOT found in the document, use empty string "" - do NOT guess or hallucinate values.\n`;
            prompt += `6. Ignore fields that are completely irrelevant to the document (e.g. address fields when document only has personal info).\n`;
            prompt += `7. Be aggressive about filling fields - it's better to fill a field with a reasonable match than leave it empty. However do NOT fill in wrong information.\n`;
            prompt += `8. If a field has both Bangla and English variants (e.g. "Father's Name (Bangla)" and "Father's Name (English)"):\n`;
            prompt += `   - If the document has the name in Bangla script, fill the Bangla field and transliterate to fill the English one.\n`;
            prompt += `   - If the document has it in English, fill the English field and transliterate for the Bangla one.\n`;
            prompt += `9. Be intelligent about filling the fields. Check if any field can be filled from the given information.\n`;
        } else {
            prompt += `Extract ALL personal data from the document as a flat JSON object with descriptive English snake_case keys.\n`;
            prompt += `Include: name, father_name, mother_name, date_of_birth, national_id, address, phone, email, occupation, etc.\n`;
        }

        prompt += `\nReturn ONLY the JSON object, no explanation, no markdown.`;

        const parts = [];

        // Add content - either text or image
        if (textContent) {
            // For plain text files (TXT, etc.)
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
    }
}

// Mapping (user data to form field IDs)
async function handleMapping(payload, sendResponse) {
    try {
        const { formFields, userData, site } = payload;

        let prompt = 'Map user data values to form fields. Return JSON: {"field_id": "value"}.\n';
        prompt += 'Rules:\n';
        prompt += '- Match by semantic meaning of labels/names/IDs.\n';
        prompt += '- For dropdowns/radios: return the option "value" attribute that best matches.\n';
        prompt += '- Omit fields with no matching data.\n';

        if (site === 'bdris') {
            prompt += '- Default Nationality to "bangladeshi" if not in user data.\n';
        }

        prompt += '\nUser Data:\n' + JSON.stringify(userData) + '\n\nForm Fields:\n' + JSON.stringify(formFields);

        const { parsed, usage } = await callGemini([{ text: prompt }]);

        sendResponse({ success: true, mapping: parsed, usageMetadata: usage });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}
