importScripts('config.js');

const MODEL = 'gemini-2.5-flash-lite'
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

        const { image, targetFields } = payload;
        // Image comes as "data:image/jpeg;base64,..."
        // Gemini needs just the base64 string
        const base64Image = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];

        let prompt = `
You are an expert Data Extraction AI.
Your goal is to extract personal information from the provided document image with high accuracy.

### Process:
1. **Analyze**: First, carefully scan the entire document to understand its structure and identify where personal data is located.
2. **Reason**: Think about which text corresponds to which requested field. Consider semantic matches (e.g., "Mother's Name" might be labeled as "Name of Mother" or "Matriarch").
3. **Extract**: Extract the exact values.

### Output Format:
Return a single JSON object.
- Include a key "_reasoning" where you briefly explain your thought process and any ambiguities you resolved.
- Keys must match the "Target Fields" exactly if provided.
- If "Target Fields" are not provided, use descriptive snake_case keys.

`;

        if (targetFields && Array.isArray(targetFields) && targetFields.length > 0) {
            prompt += `
### Target Fields:
${JSON.stringify(targetFields)}

### Extraction Rules:
1. **Exact Keys**: You MUST use the exact keys listed in "Target Fields".
2. **Semantic Mapping**: If a field label in the document is slightly different from the Target Field key, use your reasoning to map it correctly.
   - Example: Target "date_of_birth" -> Document "DOB" or "Birth Date".
   - Example: Target "permanent_address" -> Document "Home Address" or "Address (Perm)".
3. **Bilingual Handling**:
   - If a field has (English) and (Bangla) versions in the target list, try to find both.
   - If only one language is present in the document, TRANSLATE or TRANSLITERATE to fill the missing one.
   - Ensure (English) fields contain ONLY English characters.
   - Ensure (Bangla) fields contain ONLY Bangla characters.
4. **Missing Data**: If a field is absolutely not found and cannot be inferred, return an empty string "".
`;
        } else {
            prompt += `
### Task:
Extract all available personal data (Name, Parents' Names, DOB, NID, Address, etc.) as a flat JSON object.
`;
        }

        prompt += "\nReturn ONLY the JSON object. No markdown formatting.";

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
        if (data.usageMetadata) {
            console.log('Extraction Token Usage:', data.usageMetadata);
        }
        if (data.error) {
            throw new Error(data.error.message);
        }

        let content = data.candidates[0].content.parts[0].text;

        // Robust JSON extraction
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            content = jsonMatch[0];
        }

        const extractedData = JSON.parse(content);

        // Log reasoning and then remove it from payload
        if (extractedData._reasoning) {
            console.log("AI Extraction Reasoning:", extractedData._reasoning);
            delete extractedData._reasoning;
        }

        sendResponse({ success: true, data: extractedData, usageMetadata: data.usageMetadata });

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

        const { formFields, userData, site } = payload;

        // Optimization: Concise but clear prompt
        let prompt = `
You are a form autofill assistant.
Task: Map "User Data" values to "Form Fields".

Rules:
1. Match User Data keys to Form Field IDs/Labels/Names.
2. Return a JSON object: { "Field_ID": "Value" }.
3. For Dropdowns/Radios: Return the "value" (preferred) or "text" that matches the User Data.
4. If no match found for a field, omit it.
5. Output ONLY valid JSON. Do not use markdown formatting or code blocks.
`;

        if (site === 'bdris') {
            prompt += `
Special Rule for BDRIS:
- If the target field is 'Nationality' or 'জাতীয়তা' and no matching value is found in User Data, use 'বাংলাদেশী'.
`;
        }

        prompt += `
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
        if (data.usageMetadata) {
            console.log('Mapping Token Usage:', data.usageMetadata);
        }
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

        sendResponse({ success: true, mapping: mapping, raw_response: content, parse_error: parseError, usageMetadata: data.usageMetadata });

    } catch (error) {
        console.error('Mapping Error:', error);
        sendResponse({ success: false, error: error.message });
    }
}
