// Create and inject the floating button
// Supported sites for autofill button
const SUPPORTED_SITES = [
    /bdris\.gov\.bd/,
    /teletalk\.com\.bd/,
    /localhost/,
    /127\.0\.0\.1/,
    /options\.html/ // Allow on options page for testing
];

function isSupportedSite() {
    return SUPPORTED_SITES.some(pattern => pattern.test(window.location.href));
}

// Create and inject the floating button ONLY if on a supported site
let floatBtn = null;

if (isSupportedSite()) {
    floatBtn = document.createElement('button');
    floatBtn.innerText = '✨ Autofill';
    floatBtn.id = 'ai-autofill-btn';
    Object.assign(floatBtn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '9999',
        padding: '12px 24px',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transition: 'transform 0.2s, background-color 0.2s'
    });

    floatBtn.onmouseover = () => floatBtn.style.transform = 'scale(1.05)';
    floatBtn.onmouseout = () => floatBtn.style.transform = 'scale(1)';
    floatBtn.onclick = handleAutofillClick;

    document.body.appendChild(floatBtn);
}

// Also listen for messages from popup (if used)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "triggerAutofill") {
        handleAutofillClick();
    }
});

async function handleAutofillClick() {
    if (floatBtn) setLoading(true);

    try {
        const { profiles, lastActiveProfileId } = await getProfilesData();

        if (!profiles || profiles.length === 0) {
            alert('Please create a profile in the extension options first.');
            if (floatBtn) setLoading(false);
            return;
        }

        if (profiles.length === 1) {
            // Only one profile, use it directly
            startAutofill(profiles[0]);
        } else {
            // Multiple profiles, ask user
            showProfileSelector(profiles, lastActiveProfileId);
        }
    } catch (error) {
        console.error("Autofill initialization failed:", error);
        if (floatBtn) setLoading(false);
    }
}

function showProfileSelector(profiles, lastActiveProfileId) {
    // Remove existing selector if any
    const existing = document.getElementById('ai-profile-selector-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'ai-profile-selector-modal';
    Object.assign(modal.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: '10000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    });

    const card = document.createElement('div');
    Object.assign(card.style, {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        width: '320px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    });

    const title = document.createElement('h3');
    title.innerText = 'Autofill Settings';
    title.style.margin = '0 0 8px 0';
    title.style.color = '#1f2937';
    card.appendChild(title);

    // Profile Selector
    const profileGroup = document.createElement('div');
    const profileLabel = document.createElement('label');
    profileLabel.innerText = 'Select Profile';
    profileLabel.style.display = 'block';
    profileLabel.style.fontSize = '14px';
    profileLabel.style.fontWeight = '500';
    profileLabel.style.marginBottom = '4px';
    profileLabel.style.color = '#374151';

    const profileSelect = document.createElement('select');
    Object.assign(profileSelect.style, {
        width: '100%',
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #d1d5db',
        fontSize: '14px'
    });

    profiles.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.text = p.name;
        profileSelect.appendChild(opt);
    });

    // Pre-select last active profile
    if (lastActiveProfileId && profiles.some(p => p.id === lastActiveProfileId)) {
        profileSelect.value = lastActiveProfileId;
    }

    // Save selection on change
    profileSelect.addEventListener('change', () => {
        chrome.storage.local.set({ lastActiveProfileId: profileSelect.value });
    });

    profileGroup.appendChild(profileLabel);
    profileGroup.appendChild(profileSelect);
    card.appendChild(profileGroup);

    // Site Selector
    const siteGroup = document.createElement('div');
    const siteLabel = document.createElement('label');
    siteLabel.innerText = 'Select Site / Template';
    siteLabel.style.display = 'block';
    siteLabel.style.fontSize = '14px';
    siteLabel.style.fontWeight = '500';
    siteLabel.style.marginBottom = '4px';
    siteLabel.style.color = '#374151';

    const siteSelect = document.createElement('select');
    Object.assign(siteSelect.style, {
        width: '100%',
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #d1d5db',
        fontSize: '14px'
    });

    const sites = [
        { value: 'bdris', text: 'BDRIS (Birth Reg)' },
        { value: 'teletalk', text: 'Teletalk (Jobs)' },
        { value: 'custom', text: 'Custom / Generic' }
    ];

    sites.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.value;
        opt.text = s.text;
        siteSelect.appendChild(opt);
    });
    siteGroup.appendChild(siteLabel);
    siteGroup.appendChild(siteSelect);
    card.appendChild(siteGroup);

    // Update Site when Profile changes
    profileSelect.addEventListener('change', () => {
        const selectedProfile = profiles.find(p => p.id === profileSelect.value);
        if (selectedProfile && selectedProfile.site) {
            siteSelect.value = selectedProfile.site;
        }
    });

    // Trigger change once to set initial site
    profileSelect.dispatchEvent(new Event('change'));

    // Actions
    const actionGroup = document.createElement('div');
    actionGroup.style.display = 'flex';
    actionGroup.style.gap = '10px';
    actionGroup.style.marginTop = '8px';

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel';
    Object.assign(cancelBtn.style, {
        flex: '1',
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        backgroundColor: 'white',
        color: '#374151',
        cursor: 'pointer',
        fontWeight: '500'
    });
    cancelBtn.onclick = () => {
        modal.remove();
        setLoading(false);
    };

    const autofillBtn = document.createElement('button');
    autofillBtn.innerText = 'Start Autofill';
    Object.assign(autofillBtn.style, {
        flex: '1',
        padding: '10px',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: '#2563eb',
        color: 'white',
        cursor: 'pointer',
        fontWeight: '500'
    });

    autofillBtn.onclick = () => {
        const selectedProfile = profiles.find(p => p.id === profileSelect.value);
        const selectedSite = siteSelect.value;

        // We can attach the selected site to the profile object temporarily for this session
        // or pass it separately. For now, let's just update the profile object in memory.
        if (selectedProfile) {
            selectedProfile.site = selectedSite; // Override or set site
            modal.remove();
            startAutofill(selectedProfile);
        }
    };

    actionGroup.appendChild(cancelBtn);
    actionGroup.appendChild(autofillBtn);
    card.appendChild(actionGroup);

    modal.appendChild(card);
    document.body.appendChild(modal);
}

async function startAutofill(profile) {
    setLoading(true);
    console.log('Starting multi-pass autofill with profile:', profile.name);

    let totalTokens = { input: 0, output: 0, total: 0 };

    try {
        let totalFilled = 0;
        let previousFieldCount = 0;
        let maxIterations = 3; // Limit to 3 passes as requested
        let iteration = 0;

        // Multi-pass autofill: keep filling until no new fields appear
        while (iteration < maxIterations) {
            iteration++;
            console.log(`\n=== Pass ${iteration} ===`);

            // 1. Scrape visible fields
            const visibleFields = scrapeVisibleFields(profile.data);

            // Optimization: Filter out fields that are already filled
            const fieldsToSend = visibleFields.filter(f => {
                const el = document.getElementById(f.id) || document.querySelector(`[name="${f.name}"]`);
                if (!el) return false;

                // Check if empty
                if (el.value === '' || el.value === null) return true;

                // For radios/checkboxes, check if NOT checked
                if (el.type === 'radio' || el.type === 'checkbox') return !el.checked;

                // For selects, check if value is default/empty
                if (el.tagName.toLowerCase() === 'select') return el.value === '' || el.value === '-1';

                return false;
            });

            const currentFieldCount = visibleFields.length;
            console.log(`Found ${currentFieldCount} visible fields, sending ${fieldsToSend.length} to AI`);

            if (fieldsToSend.length === 0) {
                console.log('No unfilled fields found, stopping.');
                break;
            }

            // If no new fields appeared and we are not in the first pass, we might stop
            if (iteration > 1 && currentFieldCount === previousFieldCount && fieldsToSend.length === 0) {
                console.log('No new fields detected, stopping.');
                break;
            }

            previousFieldCount = currentFieldCount;

            // 2. Send to AI for mapping
            const result = await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    action: 'MAP_FIELDS',
                    payload: {
                        formFields: fieldsToSend, // Send only filtered fields
                        userData: profile.data,
                        site: profile.site
                    }
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Mapping error:', chrome.runtime.lastError.message);
                        resolve({ mapping: {} });
                    } else if (response && response.success) {
                        if (Object.keys(response.mapping).length === 0) {
                            console.warn('AI returned empty mapping.');
                            console.log('Raw AI Response:', response.raw_response);
                            if (response.parse_error) console.error('Parse Error:', response.parse_error);
                        }
                        resolve({ mapping: response.mapping, usage: response.usageMetadata });
                    } else {
                        console.error('Mapping failed:', response?.error);
                        resolve({ mapping: {} });
                    }
                });
            });

            const mapping = result.mapping;
            if (result.usage) {
                totalTokens.input += result.usage.promptTokenCount || 0;
                totalTokens.output += result.usage.candidatesTokenCount || 0;
                totalTokens.total += result.usage.totalTokenCount || 0;
            }

            console.log('Received mapping:', mapping);

            // 3. Apply mapping and track filled count
            const filledThisRound = await applyMappingSingle(mapping, profile.profilePic);
            totalFilled += filledThisRound;

            console.log(`Filled ${filledThisRound} fields this pass, ${totalFilled} total`);

            if (filledThisRound === 0) {
                console.log('No fields filled this pass, stopping.');
                break;
            }

            // Wait longer for cascading fields to appear and become visible
            console.log('Waiting 1.5 seconds for cascading fields...');
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        console.log(`\n=== Autofill Complete ===`);
        console.log(`Total: ${totalFilled} fields filled in ${iteration} pass${iteration > 1 ? 'es' : ''}`);

        const tokenMsg = `Token Usage: Input: ${totalTokens.input}, Output: ${totalTokens.output}, Total: ${totalTokens.total}`;
        console.log(tokenMsg);
        alert(`✅ Autofilled ${totalFilled} fields in ${iteration} pass${iteration > 1 ? 'es' : ''}!\n\n${tokenMsg}`);

    } catch (error) {
        console.error('Autofill Error:', error);
        alert('An error occurred: ' + error.message);
    } finally {
        setLoading(false);
    }
}

function getProfilesData() {
    return new Promise((resolve, reject) => {
        if (!chrome || !chrome.storage || !chrome.storage.local) {
            const msg = "Extension updated or reloaded. Please refresh this page to use the autofill feature.";
            alert(msg);
            reject(new Error(msg));
            return;
        }
        try {
            chrome.storage.local.get(['profiles', 'lastActiveProfileId'], (result) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve({
                        profiles: result.profiles || [],
                        lastActiveProfileId: result.lastActiveProfileId
                    });
                }
            });
        } catch (e) {
            const msg = "Extension context invalidated. Please refresh the page.";
            alert(msg);
            reject(new Error(msg));
        }
    });
}

function scrapeVisibleFields(profileData = {}) {
    const inputs = document.querySelectorAll('input, select, textarea');
    const fields = [];

    // Prepare profile values for smart filtering (lowercase, string, ignore short)
    const profileValues = Object.values(profileData)
        .filter(v => v && String(v).length > 1)
        .map(v => String(v).toLowerCase());

    inputs.forEach(input => {
        // Check visibility
        if (!isVisible(input)) return;
        if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;

        // Get label
        let label = '';
        if (input.id) {
            const labelElem = document.querySelector(`label[for="${input.id}"]`);
            if (labelElem) label = labelElem.innerText.trim();
        }
        if (!label && input.parentElement) {
            // Try finding label in parent
            const parentLabel = input.parentElement.querySelector('label');
            if (parentLabel) label = parentLabel.innerText.trim();
        }
        // Fallback to placeholder or name
        if (!label) label = input.placeholder || input.name || '';

        const fieldInfo = {
            id: input.id || input.name, // Prefer ID, fallback to name
            type: input.type,
            tagName: input.tagName.toLowerCase(),
            label: label,
            placeholder: input.placeholder || '',
            name: input.name || ''
        };

        // For select elements, include available options (Smart Filtered)
        if (input.tagName.toLowerCase() === 'select') {
            const allOptions = Array.from(input.options);

            // Filter: Keep options that match ANY profile value
            let relevantOptions = allOptions.filter(opt => {
                const text = opt.text.toLowerCase();
                const val = opt.value.toLowerCase();
                // Match against all profile values
                return profileValues.some(pv => text.includes(pv) || pv.includes(text) || val === pv);
            });

            // Always include the first option (usually "Select...")
            if (allOptions.length > 0 && !relevantOptions.includes(allOptions[0])) {
                relevantOptions.unshift(allOptions[0]);
            }

            // If we found matches, use them. If not, cap at 10 to show format.
            // Also if list is small (<20), just send all.
            let finalOptions = (relevantOptions.length > 1 || allOptions.length < 20)
                ? (relevantOptions.length > 1 ? relevantOptions : allOptions)
                : allOptions.slice(0, 10);

            // Deduplicate just in case
            finalOptions = [...new Set(finalOptions)];

            fieldInfo.options = finalOptions.map(opt => ({
                value: opt.value,
                text: opt.text
            }));

            if (allOptions.length > fieldInfo.options.length) {
                fieldInfo.options.push({
                    value: "",
                    text: `... (${allOptions.length - fieldInfo.options.length} more options)`
                });
            }
        }

        fields.push(fieldInfo);
    });

    return fields;
}

function isVisible(elem) {
    if (!elem) return false;
    return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
}

async function applyMappingSingle(mapping, profilePic) {
    let filledCount = 0;
    const entries = Object.entries(mapping);

    // Process fields sequentially
    for (const [key, value] of entries) {
        // Try finding by ID first, then Name
        let element = document.getElementById(key);
        if (!element) {
            element = document.querySelector(`[name="${key}"]`);
        }

        if (element) {
            // Check if element is actually visible to the user
            // If we fill hidden fields, it might break the form logic or just be confusing
            // But sometimes we WANT to fill hidden fields. 
            // For now, let's try to fill everything but log it.

            let filled = false;

            if (element.type === 'file' && profilePic) {
                // Handle File Input (Profile Pic)
                try {
                    const blob = dataURItoBlob(profilePic);
                    const file = new File([blob], "profile_pic.jpg", { type: "image/jpeg" });
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    element.files = dataTransfer.files;
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                    filled = true;
                } catch (e) {
                    console.warn('Could not set file input:', e);
                }
            } else if (element.type === 'radio' || element.type === 'checkbox') {
                if (element.value === value || element.value === value.toString()) {
                    if (!element.checked) {
                        element.click(); // Click is often better for radios/checkboxes
                        // Fallback if click didn't work
                        if (!element.checked) {
                            element.checked = true;
                            element.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        filled = true;
                    }
                }
            } else if (element.tagName.toLowerCase() === 'select') {
                // Handle Select Dropdown
                let optionFound = false;

                // First try exact value match
                for (let option of element.options) {
                    if (option.value === value || option.value === value.toString()) {
                        setNativeValue(element, option.value);
                        optionFound = true;
                        break;
                    }
                }

                // If not found, try matching by text content
                if (!optionFound) {
                    for (let option of element.options) {
                        if (option.text.toLowerCase().includes(value.toString().toLowerCase()) ||
                            value.toString().toLowerCase().includes(option.text.toLowerCase())) {
                            setNativeValue(element, option.value);
                            optionFound = true;
                            break;
                        }
                    }
                }

                if (optionFound) {
                    filled = true;
                    // Extra delay for selects to allow cascading
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            } else {
                // Handle text, date, and other inputs
                let finalValue = value;

                // Date Handling: Check if it's a date field and reformat if necessary
                if (isDateField(element)) {
                    const formattedDate = formatDateToDDMMYYYY(value);
                    if (formattedDate) {
                        finalValue = formattedDate;
                        console.log(`Formatted date '${value}' to '${finalValue}' for field '${element.id}'`);

                        // Special handling for datepickers
                        if (element.classList.contains('datepicker') || element.classList.contains('hasDatepicker')) {
                            handleDatepicker(element, finalValue);
                            filled = true;
                            // Skip standard setter if handled by datepicker logic
                            // But we might want to do both just in case
                        }
                    }
                }

                // Use robust setter (even if handled by datepicker, setting native value is good backup)
                setNativeValue(element, finalValue);
                filled = true;
            }

            if (filled) {
                filledCount++;
                // Highlight filled field
                element.style.backgroundColor = '#e6fffa';
                element.style.transition = 'background-color 0.5s';
                setTimeout(() => element.style.backgroundColor = '', 2000);
            }
        }
    }

    return filledCount;
}

async function applyMappingSingle(mapping, profilePic) {
    let filledCount = 0;
    const entries = Object.entries(mapping);

    // Process fields sequentially
    for (const [key, value] of entries) {
        // Try finding by ID first, then Name
        let element = document.getElementById(key);
        if (!element) {
            element = document.querySelector(`[name="${key}"]`);
        }

        if (element) {
            // Check if element is actually visible to the user
            // If we fill hidden fields, it might break the form logic or just be confusing
            // But sometimes we WANT to fill hidden fields. 
            // For now, let's try to fill everything but log it.

            let filled = false;

            if (element.type === 'file' && profilePic) {
                // Handle File Input (Profile Pic)
                try {
                    const blob = dataURItoBlob(profilePic);
                    const file = new File([blob], "profile_pic.jpg", { type: "image/jpeg" });
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    element.files = dataTransfer.files;
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                    filled = true;
                } catch (e) {
                    console.warn('Could not set file input:', e);
                }
            } else if (element.type === 'radio' || element.type === 'checkbox') {
                if (value !== null && value !== undefined && (element.value === value || element.value === value.toString())) {
                    if (!element.checked) {
                        element.click(); // Click is often better for radios/checkboxes
                        // Fallback if click didn't work
                        if (!element.checked) {
                            element.checked = true;
                            element.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        filled = true;
                    }
                }
            } else if (element.tagName.toLowerCase() === 'select') {
                // Handle Select Dropdown
                let optionFound = false;

                // First try exact value match
                for (let option of element.options) {
                    if (value !== null && value !== undefined && (option.value === value || option.value === value.toString())) {
                        setNativeValue(element, option.value);
                        optionFound = true;
                        break;
                    }
                }

                // If not found, try matching by text content
                if (!optionFound && value !== null && value !== undefined) {
                    const valStr = value.toString().toLowerCase();
                    for (let option of element.options) {
                        if (option.text.toLowerCase().includes(valStr) ||
                            valStr.includes(option.text.toLowerCase())) {
                            setNativeValue(element, option.value);
                            optionFound = true;
                            break;
                        }
                    }
                }

                if (optionFound) {
                    filled = true;
                    // Extra delay for selects to allow cascading
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            } else {
                // Handle text, date, and other inputs
                let finalValue = value;

                // Date Handling: Check if it's a date field and reformat if necessary
                if (isDateField(element)) {
                    // For HTML5 date inputs (type="date"), use YYYY-MM-DD format
                    if (element.type === 'date') {
                        const formattedDate = formatDateToYYYYMMDD(value);
                        if (formattedDate) {
                            finalValue = formattedDate;
                            console.log(`Formatted date '${value}' to '${finalValue}' (YYYY-MM-DD) for field '${element.id}'`);
                        }
                    } else {
                        // For datepicker inputs, use DD/MM/YYYY format
                        const formattedDate = formatDateToDDMMYYYY(value);
                        if (formattedDate) {
                            finalValue = formattedDate;
                            console.log(`Formatted date '${value}' to '${finalValue}' (DD/MM/YYYY) for field '${element.id}'`);

                            // Special handling for datepickers
                            if (element.classList.contains('datepicker') || element.classList.contains('hasDatepicker')) {
                                handleDatepicker(element, finalValue);
                                filled = true;
                            }
                        }
                    }
                }

                // Check if this field belongs to a conditional section and auto-check the "If Applicable" checkbox
                checkConditionalSectionCheckbox(element);

                // Use robust setter (even if handled by datepicker, setting native value is good backup)
                setNativeValue(element, finalValue);
                filled = true;
            }

            if (filled) {
                filledCount++;
                // Highlight filled field
                element.style.backgroundColor = '#e6fffa';
                element.style.transition = 'background-color 0.5s';
                setTimeout(() => element.style.backgroundColor = '', 2000);
            }
        }
    }

    return filledCount;
}

// Robust value setter for React/Angular/Vue compatibility
function setNativeValue(element, value) {
    const lastValue = element.value;
    element.value = value;
    const event = new Event('input', { bubbles: true });

    // React 15/16 hack
    const tracker = element._valueTracker;
    if (tracker) {
        tracker.setValue(lastValue);
    }

    element.dispatchEvent(new Event('focus', { bubbles: true }));
    element.dispatchEvent(event);
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
}

function setLoading(isLoading) {
    if (isLoading) {
        floatBtn.innerText = '⏳ Working...';
        floatBtn.disabled = true;
        floatBtn.style.opacity = '0.7';
    } else {
        floatBtn.innerText = '✨ Autofill';
        floatBtn.disabled = false;
        floatBtn.style.opacity = '1';
    }
}

// Helper to convert Base64 to Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

// Helper to check if an element is a date field
function isDateField(element) {
    if (element.type === 'date') return true;
    const id = element.id.toLowerCase();
    const name = element.name.toLowerCase();
    const placeholder = (element.placeholder || '').toLowerCase();
    const className = element.className.toLowerCase();

    return id.includes('date') ||
        id.includes('dob') ||
        name.includes('date') ||
        name.includes('dob') ||
        placeholder.includes('dd/mm/yyyy') ||
        placeholder.includes('yyyy-mm-dd') ||
        className.includes('datepicker');
}

// Helper to format date to DD/MM/YYYY (for datepickers)
function formatDateToDDMMYYYY(value) {
    if (!value) return null;

    // Check if already in DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

    // Try parsing YYYY-MM-DD
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    }

    // Try parsing other formats using Date object
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    return value; // Return original if parsing fails
}

// Helper to format date to YYYY-MM-DD (for HTML5 date inputs)
function formatDateToYYYYMMDD(value) {
    if (!value) return null;

    // Check if already in YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    // Try parsing DD/MM/YYYY
    const ddmmyyyyMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmmyyyyMatch) {
        return `${ddmmyyyyMatch[3]}-${ddmmyyyyMatch[2]}-${ddmmyyyyMatch[1]}`;
    }

    // Try parsing other formats using Date object
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }

    return value; // Return original if parsing fails
}

// Helper to check if a field belongs to a conditional section and auto-check the checkbox
function checkConditionalSectionCheckbox(element) {
    // Check for Masters section fields
    if (element.id && (element.id.startsWith('mas_') || element.name?.startsWith('mas_'))) {
        const checkbox = document.getElementById('if_applicable_mas');
        if (checkbox && !checkbox.checked) {
            console.log('Auto-checking Masters "If Applicable" checkbox');
            checkbox.click();
        }
    }

    // Check for Job Experience section fields
    if (element.id && (element.id.includes('employment_type') || element.id.includes('designation') ||
        element.id.includes('organization') || element.id.includes('job_start_date') ||
        element.name?.includes('job['))) {
        const checkbox = document.getElementById('if_applicable_exp');
        if (checkbox && !checkbox.checked) {
            console.log('Auto-checking Job Experience "If Applicable" checkbox');
            checkbox.click();
        }
    }
}

// Aggressive Datepicker Handler
function handleDatepicker(element, value) {
    // 1. Focus
    element.focus();
    element.click();

    // 2. Set Value directly and via attribute
    element.value = value;
    element.setAttribute('value', value);

    // 3. Dispatch events
    const events = ['keydown', 'keypress', 'input', 'keyup', 'change', 'blur'];
    events.forEach(eventType => {
        element.dispatchEvent(new Event(eventType, { bubbles: true }));
    });

    // 4. jQuery Datepicker specific (if jQuery is present on page)
    // We can't access page's jQuery directly from content script easily without injecting script.
    // But we can try to trigger standard events that jQuery listens to.

    // 5. Try closing the datepicker if it opened
    // Sometimes clicking opens it, we might want to close it or let user close it.
    // element.blur(); 
}
