// Create and inject the floating button
const floatBtn = document.createElement('button');
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

// Also listen for messages from popup (if used)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "triggerAutofill") {
        handleAutofillClick();
    }
});

async function handleAutofillClick() {
    setLoading(true);

    const profiles = await getProfiles();

    if (!profiles || profiles.length === 0) {
        alert('Please create a profile in the extension options first.');
        setLoading(false);
        return;
    }

    if (profiles.length === 1) {
        // Only one profile, use it directly
        startAutofill(profiles[0]);
    } else {
        // Multiple profiles, ask user
        showProfileSelector(profiles);
    }
}

function showProfileSelector(profiles) {
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
        alignItems: 'center'
    });

    const card = document.createElement('div');
    Object.assign(card.style, {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        minWidth: '300px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    });

    const title = document.createElement('h3');
    title.innerText = 'Select Profile';
    title.style.marginTop = '0';
    card.appendChild(title);

    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '10px';

    profiles.forEach(profile => {
        const btn = document.createElement('button');
        btn.innerText = profile.name;
        Object.assign(btn.style, {
            padding: '10px',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            backgroundColor: '#f9fafb',
            cursor: 'pointer',
            textAlign: 'left'
        });
        btn.onmouseover = () => btn.style.backgroundColor = '#f3f4f6';
        btn.onmouseout = () => btn.style.backgroundColor = '#f9fafb';

        btn.onclick = () => {
            modal.remove();
            startAutofill(profile);
        };
        list.appendChild(btn);
    });

    card.appendChild(list);

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel';
    Object.assign(cancelBtn.style, {
        marginTop: '15px',
        width: '100%',
        padding: '8px',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#6b7280',
        cursor: 'pointer'
    });
    cancelBtn.onclick = () => {
        modal.remove();
        setLoading(false);
    };
    card.appendChild(cancelBtn);

    modal.appendChild(card);
    document.body.appendChild(modal);
}

async function startAutofill(profile) {
    setLoading(true);
    console.log('Starting multi-pass autofill with profile:', profile.name);

    try {
        let totalFilled = 0;
        let previousFieldCount = 0;
        let maxIterations = 10; // Prevent infinite loops
        let iteration = 0;

        // Multi-pass autofill: keep filling until no new fields appear
        while (iteration < maxIterations) {
            iteration++;
            console.log(`\n=== Pass ${iteration} ===`);

            // 1. Scrape visible fields
            const visibleFields = scrapeVisibleFields(profile.data);

            // Optimization: Filter out fields that are already filled
            // We only send fields that are empty or have default values
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
            const mapping = await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    action: 'MAP_FIELDS',
                    payload: {
                        formFields: fieldsToSend, // Send only filtered fields
                        userData: profile.data
                    }
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Mapping error:', chrome.runtime.lastError.message);
                        resolve({});
                    } else if (response && response.success) {
                        if (Object.keys(response.mapping).length === 0) {
                            console.warn('AI returned empty mapping.');
                            console.log('Raw AI Response:', response.raw_response);
                            if (response.parse_error) console.error('Parse Error:', response.parse_error);
                        }
                        resolve(response.mapping);
                    } else {
                        console.error('Mapping failed:', response?.error);
                        resolve({});
                    }
                });
            });

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
        alert(`✅ Autofilled ${totalFilled} fields in ${iteration} pass${iteration > 1 ? 'es' : ''}!`);

    } catch (error) {
        console.error('Autofill Error:', error);
        alert('An error occurred: ' + error.message);
    } finally {
        setLoading(false);
    }
}

function getProfiles() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['profiles'], (result) => {
            resolve(result.profiles || []);
        });
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

// Helper to format date to DD/MM/YYYY
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
