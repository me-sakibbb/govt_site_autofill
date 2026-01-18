importScripts('config.js');

const MODEL = 'gemma-3-27b-it'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_DATA') {
        handleExtraction(request.payload, sendResponse);
        return true; // Keep channel open for async response
    }
    if (request.action === 'MAP_FIELDS') {
        handleMapping(request.payload, sendResponse);
        return true;
    }
});

async function getApiKey() {
    return GEMINI_API_KEY;
}

async function handleExtraction(payload, sendResponse) {
    try {
        const apiKey = await getApiKey();
        if (!apiKey) {
            sendResponse({ success: false, error: 'API Key not found. Please set it in Options.' });
            return;
        }

        const { image } = payload;
        // Image comes as "data:image/jpeg;base64,..."
        // Gemini needs just the base64 string
        const base64Image = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];

        const prompt = "Extract all personal data from this document as a flat JSON object. Keys should be descriptive (e.g., 'Full Name', 'Passport Number', 'Date of Birth'). Return ONLY the JSON object, no markdown formatting.";

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Image
                            }
                        }
                    ]
                }],
                generationConfig: {
                    // response_mime_type: "application/json" // Not supported by gemma-3-27b-it
                }
            })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }

        let content = data.candidates[0].content.parts[0].text;

        // Robust JSON extraction (Gemini usually returns clean JSON with response_mime_type, but good to be safe)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            content = jsonMatch[0];
        }

        const extractedData = JSON.parse(content);
        sendResponse({ success: true, data: extractedData });

    } catch (error) {
        console.error('Extraction Error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

async function handleMapping(payload, sendResponse) {
    try {
        const apiKey = await getApiKey();
        if (!apiKey) {
            sendResponse({ success: false, error: 'API Key not found.' });
            return;
        }

        const { formFields, userData } = payload;

        // Optimization: Concise but clear prompt
        const prompt = `
You are a form autofill assistant.
Task: Map "User Data" values to "Form Fields".

Rules:
1. Match User Data keys to Form Field IDs/Labels/Names.
2. Return a JSON object: { "Field_ID": "Value" }.
3. For Dropdowns/Radios: Return the "value" (preferred) or "text" that matches the User Data.
4. If no match found for a field, omit it.
5. Output ONLY valid JSON. Do not use markdown formatting or code blocks.

User Data:
${JSON.stringify(userData)}

Form Fields:
${JSON.stringify(formFields)}
`;

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt }
                    ]
                }],
                generationConfig: {
                    // response_mime_type: "application/json" // Not supported by gemma-3-27b-it
                }
            })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }

        let content = data.candidates[0].content.parts[0].text;

        // Robust JSON extraction
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            content = jsonMatch[0];
        }

        let mapping = {};
        let parseError = null;
        try {
            mapping = JSON.parse(content);
        } catch (e) {
            console.error('JSON Parse Error:', e);
            parseError = e.message;
        }

        sendResponse({ success: true, mapping: mapping, raw_response: content, parse_error: parseError });

    } catch (error) {
        console.error('Mapping Error:', error);
        sendResponse({ success: false, error: error.message });
    }
}
