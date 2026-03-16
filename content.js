// content.js - Form autofill content script

// Indian Visa field definitions (inlined - content scripts cannot use ES modules)
const INDIAN_VISA_PAGE1_FIELDS = [
    { id: 'countryname_id', name: 'appl.countryname', type: 'select', label: 'Country/Region applying from' },
    { id: 'missioncode_id', name: 'appl.missioncode', type: 'select', label: 'Indian Mission/Office' },
    { id: 'nationality_id', name: 'appl.nationality', type: 'select', label: 'Nationality/Region' },
    { id: 'dob_id', name: 'appl.birthdate', type: 'text', label: 'Date of Birth (DD/MM/YYYY)' },
    { id: 'email_id', name: 'appl.email', type: 'text', label: 'Email ID' },
    { id: 'email_re_id', name: 'appl.email_re', type: 'text', label: 'Re-enter Email ID' },
    { id: 'jouryney_id', name: 'appl.journeydate', type: 'text', label: 'Expected Date of Arrival (DD/MM/YYYY)' },
    { id: 'visaService', name: 'appl.visa_service_id', type: 'select', label: 'Visa Type' },
    { id: 'purpose', name: 'appl.purpose', type: 'select', label: 'Purpose of Visit' },
];

const INDIAN_VISA_PAGE2_FIELDS = [
    { id: 'surname', name: 'appl.surname', type: 'text', label: 'Surname (as in Passport)' },
    { id: 'givenName', name: 'appl.applname', type: 'text', label: 'Given Name/s (as in Passport)' },
    { id: 'changedSurnameCheck', name: 'appl.changedSurnameCheck', type: 'checkbox', label: 'Have you ever changed your name?' },
    { id: 'prev_surname', name: 'appl.prev_surname', type: 'text', label: 'Previous Surname' },
    { id: 'prev_given_name', name: 'appl.prev_given_name', type: 'text', label: 'Previous Given Name' },
    { id: 'gender', name: 'appl.applsex', type: 'select', label: 'Gender (M/F/X)' },
    { id: 'birth_place', name: 'appl.placbrth', type: 'text', label: 'Town/City of Birth' },
    { id: 'country_birth', name: 'appl.country_of_birth', type: 'select', label: 'Country/Region of Birth' },
    { id: 'nic_number', name: 'appl.nic_no', type: 'text', label: 'Citizenship/National Id No.' },
    { id: 'religion', name: 'appl.religion', type: 'select', label: 'Religion' },
    { id: 'religion_other', name: 'appl.religionOther', type: 'text', label: 'Religion (if Others)' },
    { id: 'identity_marks', name: 'appl.visual_mark', type: 'text', label: 'Visible identification marks' },
    { id: 'education', name: 'appl.edu_id', type: 'select', label: 'Educational Qualification' },
    { id: 'nationality_by', name: 'appl.nationality_by', type: 'select', label: 'Nationality acquired by birth or naturalization?' },
    { id: 'prev_nationality', name: 'appl.prev_nationality', type: 'select', label: 'Previous Nationality/Region' },
    { id: 'passport_no', name: 'appl.passport_number', type: 'text', label: 'Passport Number' },
    { id: 'passport_issue_place', name: 'appl.passport_issue_place', type: 'text', label: 'Passport Place of Issue' },
    { id: 'passport_issue_date', name: 'appl.passport_issue_date', type: 'text', label: 'Passport Date of Issue (DD/MM/YYYY)' },
    { id: 'passport_expiry_date', name: 'appl.passport_expiry_date', type: 'text', label: 'Passport Date of Expiry (DD/MM/YYYY)' },
    { id: 'other_ppt_1', name: 'appl.oth_ppt', type: 'radio', label: 'Any other valid Passport - YES' },
    { id: 'other_ppt_2', name: 'appl.oth_ppt', type: 'radio', label: 'Any other valid Passport - NO' },
    { id: 'other_ppt_country_issue', name: 'appl.prev_passport_country_issue', type: 'select', label: 'Other Passport Country of Issue' },
    { id: 'other_ppt_no', name: 'appl.oth_pptno', type: 'text', label: 'Other Passport No.' },
    { id: 'other_ppt_issue_date', name: 'appl.previous_passport_issue_date', type: 'text', label: 'Other Passport Date of Issue (DD/MM/YYYY)' },
    { id: 'other_ppt_issue_place', name: 'appl.other_ppt_issue_place', type: 'text', label: 'Other Passport Place of Issue' },
    { id: 'other_ppt_nat', name: 'appl.other_ppt_nationality', type: 'select', label: 'Other Passport Nationality mentioned therein' },
];

// Site detection
const SUPPORTED_SITES = [
    /bdris\.gov\.bd/,
    /teletalk\.com\.bd/,
    /indianvisa-bangladesh\.nic\.in/,
    /localhost/,
    /127\.0\.0\.1/,
];

function isSupportedSite() {
    return SUPPORTED_SITES.some(p => p.test(window.location.href));
}

// Floating button
let floatBtn = null;

if (isSupportedSite()) {
    floatBtn = document.createElement('button');
    floatBtn.id = 'ai-autofill-btn';
    Object.assign(floatBtn.style, {
        position: 'fixed', bottom: '20px', right: '20px', zIndex: '9999',
        padding: '12px 24px', backgroundColor: '#2b2d42', color: 'white',
        border: '3px solid #2563eb', borderRadius: '50px', cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontSize: '15px',
        fontWeight: 'bold', fontFamily: 'system-ui, -apple-system, sans-serif',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', alignItems: 'center', gap: '8px'
    });

    updateFloatBtn();

    floatBtn.onmouseover = function () {
        floatBtn.style.transform = 'translateY(-2px) scale(1.02)';
        floatBtn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
    };
    floatBtn.onmouseout = function () {
        floatBtn.style.transform = 'translateY(0) scale(1)';
        floatBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    };
    floatBtn.onclick = handleAutofillClick;
    document.body.appendChild(floatBtn);

    // Watch for login changes
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.supabaseSession) updateFloatBtn();
    });
}

function updateFloatBtn() {
    if (!floatBtn) return;
    chrome.storage.local.get(['supabaseSession'], (result) => {
        const loggedIn = !!(result.supabaseSession && result.supabaseSession.access_token);
        if (loggedIn) {
            floatBtn.innerHTML = 'Autofill Now';
            floatBtn.style.backgroundColor = '#2563eb';
            floatBtn.style.opacity = '1';
        } else {
            floatBtn.innerHTML = 'Login to Use';
            floatBtn.style.backgroundColor = '#4b5563';
            floatBtn.style.opacity = '0.9';
        }
    });
}

// Listen for popup trigger
chrome.runtime.onMessage.addListener(function (request) {
    if (request.action === 'triggerAutofill') handleAutofillClick();
});

// Main autofill entry point
async function handleAutofillClick() {
    try {
        var result = await getProfilesData();
        var profiles = result.profiles;
        var lastActiveProfileId = result.lastActiveProfileId;
        var session = result.supabaseSession;

        if (!session || !session.access_token) {
            if (confirm('Connection Required: Please login to Next AI Solution in extension settings to use AI Autofill.\n\nOpen Settings now?')) {
                chrome.runtime.sendMessage({ action: 'OPEN_OPTIONS' });
            }
            return;
        }

        if (floatBtn) setLoading(true);

        if (!profiles || profiles.length === 0) {
            alert('Please create a profile in the extension options first.');
            if (floatBtn) setLoading(false);
            return;
        }
        var isIndianVisa = window.location.href.includes('indianvisa-bangladesh.nic.in');
        if (profiles.length === 1) {
            isIndianVisa ? startIndianVisaAutofill(profiles[0]) : startAutofill(profiles[0]);
        } else {
            showProfileSelector(profiles, lastActiveProfileId);
        }
    } catch (error) {
        if (floatBtn) setLoading(false);
    }
}

// Profile selector modal
function showProfileSelector(profiles, lastActiveProfileId) {
    var existing = document.getElementById('ai-profile-selector-modal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.id = 'ai-profile-selector-modal';
    Object.assign(modal.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: '10000',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    });

    var card = document.createElement('div');
    Object.assign(card.style, {
        backgroundColor: 'white', padding: '24px', borderRadius: '12px',
        width: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', gap: '16px',
    });

    var title = document.createElement('h3');
    title.innerText = 'Autofill Settings';
    title.style.margin = '0 0 8px 0';
    title.style.color = '#1f2937';
    card.appendChild(title);

    // Profile dropdown
    var profileSelect = createLabeledSelect('Select Profile', profiles.map(function (p) { return { value: p.id, text: p.name }; }));
    if (lastActiveProfileId && profiles.some(function (p) { return p.id === lastActiveProfileId; })) {
        profileSelect.select.value = lastActiveProfileId;
    }
    card.appendChild(profileSelect.group);

    // Site dropdown
    var sites = [
        { value: 'bdris', text: 'BDRIS (Birth Reg)' },
        { value: 'indian_visa', text: 'Indian Visa Application' },
        { value: 'teletalk', text: 'Teletalk (Jobs)' },
        { value: 'custom', text: 'Custom / Generic' },
    ];
    var siteSelect = createLabeledSelect('Select Site / Template', sites);
    card.appendChild(siteSelect.group);

    profileSelect.select.addEventListener('change', function () {
        chrome.storage.local.set({ lastActiveProfileId: profileSelect.select.value });
        var sp = profiles.find(function (p) { return p.id === profileSelect.select.value; });
        if (sp && sp.site) siteSelect.select.value = sp.site;
    });
    profileSelect.select.dispatchEvent(new Event('change'));

    // Auto-detect site from URL
    var url = window.location.href;
    if (url.includes('indianvisa-bangladesh.nic.in')) siteSelect.select.value = 'indian_visa';
    else if (url.includes('bdris.gov.bd')) siteSelect.select.value = 'bdris';
    else if (url.includes('teletalk.com.bd')) siteSelect.select.value = 'teletalk';

    // Action buttons
    var actionGroup = document.createElement('div');
    actionGroup.style.display = 'flex';
    actionGroup.style.gap = '10px';
    actionGroup.style.marginTop = '8px';

    var cancelBtn = createBtn('Cancel', 'white', '#374151', '1px solid #d1d5db');
    cancelBtn.onclick = function () { modal.remove(); setLoading(false); };

    var autofillBtn = createBtn('Start Autofill', '#2563eb', 'white', 'none');
    autofillBtn.onclick = function () {
        var selectedProfile = profiles.find(function (p) { return p.id === profileSelect.select.value; });
        var selectedSite = siteSelect.select.value;
        if (selectedProfile) {
            selectedProfile.site = selectedSite;
            modal.remove();
            selectedSite === 'indian_visa'
                ? startIndianVisaAutofill(selectedProfile)
                : startAutofill(selectedProfile);
        }
    };

    actionGroup.appendChild(cancelBtn);
    actionGroup.appendChild(autofillBtn);
    card.appendChild(actionGroup);
    modal.appendChild(card);
    document.body.appendChild(modal);
}

// UI Helpers
function createLabeledSelect(labelText, options) {
    var group = document.createElement('div');
    var label = document.createElement('label');
    label.innerText = labelText;
    Object.assign(label.style, { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' });
    var select = document.createElement('select');
    Object.assign(select.style, { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' });
    options.forEach(function (o) {
        var opt = document.createElement('option');
        opt.value = o.value;
        opt.text = o.text;
        select.appendChild(opt);
    });
    group.appendChild(label);
    group.appendChild(select);
    return { group: group, select: select };
}

function createBtn(text, bg, color, border) {
    var btn = document.createElement('button');
    btn.innerText = text;
    Object.assign(btn.style, {
        flex: '1', padding: '10px', borderRadius: '6px', cursor: 'pointer',
        fontWeight: '500', backgroundColor: bg, color: color, border: border,
    });
    return btn;
}

// Indian Visa autofill (multi-page, single AI call)
async function startIndianVisaAutofill(profile) {
    setLoading(true);
    var isPage1 = !!document.getElementById('countryname_id');
    var isPage2 = !!document.getElementById('surname');
    var STORAGE_KEY = 'indianVisaMapping';

    try {
        var mapping = null;
        var stored = await sessionGet(STORAGE_KEY);

        if (stored) {
            mapping = stored;
        } else {
            var COUNTRY_DEFAULTS = {
                'countryname_id': 'BGD', 'nationality_id': 'BGD', 'country_birth': 'BGD',
                'prev_nationality': '', 'other_ppt_country_issue': '', 'other_ppt_nat': '',
            };
            var profileValues = getProfileValues(profile.data);
            var allFields = [].concat(INDIAN_VISA_PAGE1_FIELDS, INDIAN_VISA_PAGE2_FIELDS)
                .filter(function (f) { return !(f.id in COUNTRY_DEFAULTS); })
                .map(function (f) { return enrichFieldWithOptions(f, profileValues); });

            var result = await sendMappingRequest(allFields, profile.data, 'indian_visa');
            mapping = result.mapping;

            for (var id in COUNTRY_DEFAULTS) {
                if (COUNTRY_DEFAULTS[id]) mapping[id] = COUNTRY_DEFAULTS[id];
            }
            await sessionSet(STORAGE_KEY, mapping);
        }

        var pageFields = isPage1 ? INDIAN_VISA_PAGE1_FIELDS : INDIAN_VISA_PAGE2_FIELDS;
        var pageFieldIds = {};
        pageFields.forEach(function (f) { pageFieldIds[f.id] = true; });
        var pageMapping = {};
        for (var key in mapping) {
            if (pageFieldIds[key]) pageMapping[key] = mapping[key];
        }

        var filledCount = 0;
        if (isPage1) {
            var cascadeOrder = ['countryname_id', 'missioncode_id', 'nationality_id', 'visaService'];
            var delays = [800, 1200, 600, 800];
            var handled = {};
            for (var i = 0; i < cascadeOrder.length; i++) {
                var fid = cascadeOrder[i];
                if (pageMapping[fid]) {
                    var m = {}; m[fid] = pageMapping[fid];
                    filledCount += await applyMapping(m, profile.profilePic);
                    await sleep(delays[i]);
                    handled[fid] = true;
                }
            }
            var rest = {};
            for (var k in pageMapping) {
                if (!handled[k]) rest[k] = pageMapping[k];
            }
            filledCount += await applyMapping(rest, profile.profilePic);
        } else {
            filledCount = await applyMapping(pageMapping, profile.profilePic);
        }

        var pageLabel = isPage1 ? 'Page 1 (Registration)' : 'Page 2 (Applicant Details)';
        alert('Indian Visa: ' + filledCount + ' fields filled on ' + pageLabel + '.\nCaptcha must be filled manually.\nMapping saved for next page.');
    } catch (error) {
        alert('Indian Visa Autofill error: ' + error.message);
    } finally {
        setLoading(false);
    }
}

// Generic multi-pass autofill
async function startAutofill(profile) {
    setLoading(true);
    try {
        var totalFilled = 0;
        var prevFieldCount = 0;
        var MAX_PASSES = 3;

        for (var pass = 1; pass <= MAX_PASSES; pass++) {
            var visibleFields = scrapeVisibleFields(profile.data);
            var unfilled = visibleFields.filter(function (f) {
                var el = document.getElementById(f.id) || document.querySelector('[name="' + f.name + '"]');
                if (!el) return false;
                if (el.type === 'radio' || el.type === 'checkbox') return !el.checked;
                if (el.tagName.toLowerCase() === 'select') return !el.value || el.value === '-1';
                return !el.value;
            });

            if (unfilled.length === 0) break;
            if (pass > 1 && visibleFields.length === prevFieldCount) break;
            prevFieldCount = visibleFields.length;

            var result = await sendMappingRequest(unfilled, profile.data, profile.site);
            var filled = await applyMapping(result.mapping, profile.profilePic);
            totalFilled += filled;

            if (filled === 0) break;
            await sleep(1500);
        }

        alert('Autofilled ' + totalFilled + ' fields.');
    } catch (error) {
        alert('Autofill error: ' + error.message);
    } finally {
        setLoading(false);
    }
}

// Data helpers
function getProfilesData() {
    return new Promise(function (resolve, reject) {
        if (!chrome || !chrome.storage || !chrome.storage.local) {
            var msg = 'Extension context invalidated. Please refresh the page.';
            alert(msg);
            return reject(new Error(msg));
        }
        chrome.storage.local.get(['profiles', 'lastActiveProfileId', 'supabaseSession'], function (result) {
            if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
            else resolve({
                profiles: result.profiles || [],
                lastActiveProfileId: result.lastActiveProfileId,
                supabaseSession: result.supabaseSession
            });
        });
    });
}

function sessionGet(key) {
    return new Promise(function (resolve) {
        chrome.runtime.sendMessage({ action: 'SESSION_GET', key: key }, function (r) {
            resolve(r && r.value ? r.value : null);
        });
    });
}

function sessionSet(key, value) {
    return new Promise(function (resolve) {
        chrome.runtime.sendMessage({ action: 'SESSION_SET', key: key, value: value }, resolve);
    });
}

function localMapFields(formFields, userData, site) {
    if (!userData || Object.keys(userData).length === 0) return null;
    var mapping = {};
    var matchedCount = 0;
    
    formFields.forEach(function(f) {
        var val = null;
        var key = f.name || f.id;
        
        if (key && userData.hasOwnProperty(key) && userData[key]) {
            val = userData[key];
        } else {
            // Also try to find a key in userData that matches the input name exactly
            var matchedKey = Object.keys(userData).find(k => k === f.id || k === f.name);
            if (matchedKey && userData[matchedKey]) {
                val = userData[matchedKey];
            }
        }
        
        if (val) {
            mapping[f.id] = val;
            matchedCount++;
        }
    });
    
    // Use local mapping exclusively if there's any match 
    if (matchedCount > 0) {
        return { success: true, mapping: mapping };
    }
    return { success: true, mapping: {} };
}

function sendMappingRequest(formFields, userData, site) {
    return new Promise(function (resolve) {
        var localResult = localMapFields(formFields, userData, site);
        console.log('Using local mapping for', site);
        return resolve(localResult);
    });
}

// Shared option-filtering for select elements
function getProfileValues(data) {
    var values = [];
    for (var key in data) {
        var v = data[key];
        if (v && String(v).length > 1) values.push(String(v).toLowerCase());
    }
    return values;
}

function filterSelectOptions(el, profileValues) {
    var allOpts = Array.from(el.options);
    if (allOpts.length <= 20) return allOpts.map(function (o) { return { value: o.value, text: o.text }; });

    var relevant = allOpts.filter(function (opt) {
        var t = opt.text.toLowerCase(), v = opt.value.toLowerCase();
        return profileValues.some(function (pv) { return t.includes(pv) || pv.includes(t) || v === pv; });
    });

    if (allOpts.length > 0 && relevant.indexOf(allOpts[0]) === -1) relevant.unshift(allOpts[0]);

    var final = relevant.length > 1 ? relevant : allOpts.slice(0, 15);
    var unique = [];
    var seen = {};
    final.forEach(function (o) {
        var k = o.value + '|' + o.text;
        if (!seen[k]) { seen[k] = true; unique.push(o); }
    });

    var mapped = unique.map(function (o) { return { value: o.value, text: o.text }; });
    if (allOpts.length > mapped.length) {
        mapped.push({ value: '', text: '... (' + (allOpts.length - mapped.length) + ' more)' });
    }
    return mapped;
}

function enrichFieldWithOptions(field, profileValues) {
    var enriched = {};
    for (var key in field) enriched[key] = field[key];
    if (field.type === 'select') {
        var el = document.getElementById(field.id);
        if (el && el.tagName && el.tagName.toLowerCase() === 'select') {
            enriched.options = filterSelectOptions(el, profileValues);
        }
    }
    return enriched;
}

// Field scraping
function scrapeVisibleFields(profileData) {
    var inputs = document.querySelectorAll('input, select, textarea');
    var fields = [];
    var profileValues = getProfileValues(profileData || {});

    inputs.forEach(function (input) {
        if (!isVisible(input)) return;
        if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;

        var label = '';
        if (input.id) {
            var labelEl = document.querySelector('label[for="' + input.id + '"]');
            if (labelEl) label = labelEl.innerText.trim();
        }
        if (!label && input.parentElement) {
            var parentLabel = input.parentElement.querySelector('label');
            if (parentLabel) label = parentLabel.innerText.trim();
        }
        if (!label) label = input.placeholder || input.name || '';

        var fieldInfo = {
            id: input.id || input.name,
            type: input.type,
            tagName: input.tagName.toLowerCase(),
            label: label,
            placeholder: input.placeholder || '',
            name: input.name || '',
        };

        if (input.tagName.toLowerCase() === 'select') {
            fieldInfo.options = filterSelectOptions(input, profileValues);
        }

        fields.push(fieldInfo);
    });
    return fields;
}

function isVisible(elem) {
    return !!(elem && (elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length));
}

// Apply mapping to DOM (single consolidated version)
async function applyMapping(mapping, profilePic) {
    var filledCount = 0;
    for (var key in mapping) {
        var value = mapping[key];
        var el = document.getElementById(key) || document.querySelector('[name="' + key + '"]');
        if (!el) continue;

        var filled = false;

        if (el.type === 'file' && profilePic) {
            filled = trySetFile(el, profilePic);
        } else if (el.type === 'radio' || el.type === 'checkbox') {
            if (value != null && el.value === String(value) && !el.checked) {
                el.click();
                if (!el.checked) { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); }
                filled = true;
            }
        } else if (el.tagName.toLowerCase() === 'select') {
            filled = setSelectValue(el, value);
            if (filled) await sleep(300);
        } else {
            var finalValue = value;
            if (isDateField(el)) {
                finalValue = el.type === 'date'
                    ? (formatDateToYYYYMMDD(value) || value)
                    : (formatDateToDDMMYYYY(value) || value);
                if (el.classList.contains('datepicker') || el.classList.contains('hasDatepicker')) {
                    handleDatepicker(el, finalValue);
                    filled = true;
                    // Skip setNativeValue — jQuery datepicker manages the field itself
                    if (filled) {
                        filledCount++;
                        el.style.backgroundColor = '#e6fffa';
                        el.style.transition = 'background-color 0.5s';
                        (function (elem) { setTimeout(function () { elem.style.backgroundColor = ''; }, 2000); })(el);
                    }
                    continue;
                }
            }
            checkConditionalCheckbox(el);
            setNativeValue(el, finalValue);
            filled = true;
        }

        if (filled) {
            filledCount++;
            el.style.backgroundColor = '#e6fffa';
            el.style.transition = 'background-color 0.5s';
            (function (elem) { setTimeout(function () { elem.style.backgroundColor = ''; }, 2000); })(el);
        }
    }
    return filledCount;
}

// DOM manipulation helpers
function setNativeValue(element, value) {
    var last = element.value;
    element.value = value;
    var tracker = element._valueTracker;
    if (tracker) tracker.setValue(last);
    var events = ['focus', 'input', 'change', 'blur'];
    for (var i = 0; i < events.length; i++) {
        element.dispatchEvent(new Event(events[i], { bubbles: true }));
    }
}

function setSelectValue(el, value) {
    if (value == null) return false;
    var valStr = String(value).toLowerCase().trim();
    var i;
    
    // 1. Exact value match
    for (i = 0; i < el.options.length; i++) {
        if (el.options[i].value === String(value)) { 
            setNativeValue(el, el.options[i].value); 
            return true; 
        }
    }
    
    // 2. Exact text match
    for (i = 0; i < el.options.length; i++) {
        if (el.options[i].text.toLowerCase().trim() === valStr) {
            setNativeValue(el, el.options[i].value);
            return true;
        }
    }

    // 3. Best partial match (find option with highest similarity or inclusion)
    var bestMatchIndex = -1;
    var bestMatchScore = 0;

    var valueWords = valStr.split(/\s+/);

    for (i = 0; i < el.options.length; i++) {
        var optText = el.options[i].text.toLowerCase().trim();
        if (!optText) continue;

        if (optText.includes(valStr) || valStr.includes(optText)) {
            // Give preference to includes matches
            setNativeValue(el, el.options[i].value);
            return true;
        }

        var matchCount = 0;
        valueWords.forEach(word => {
            if (word.length > 2 && optText.includes(word)) matchCount++;
        });

        if (matchCount > bestMatchScore) {
            bestMatchScore = matchCount;
            bestMatchIndex = i;
        }
    }
    
    if (bestMatchIndex !== -1) {
        setNativeValue(el, el.options[bestMatchIndex].value);
        return true;
    }

    return false;
}

function trySetFile(el, dataURI) {
    try {
        var byteString = atob(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        var file = new File([new Blob([ab], { type: mimeString })], 'profile_pic.jpg', { type: 'image/jpeg' });
        var dt = new DataTransfer();
        dt.items.add(file);
        el.files = dt.files;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    } catch (e) { return false; }
}

function setLoading(isLoading) {
    if (!floatBtn) return;
    floatBtn.innerText = isLoading ? 'Working...' : 'Autofill';
    floatBtn.disabled = isLoading;
    floatBtn.style.opacity = isLoading ? '0.7' : '1';
}

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

// Date helpers
function isDateField(el) {
    if (el.type === 'date') return true;
    var haystack = [el.id, el.name, el.placeholder, el.className].join(' ').toLowerCase();
    return /date|dob|dd\/mm\/yyyy|yyyy-mm-dd|datepicker/.test(haystack);
}

function formatDateToDDMMYYYY(value) {
    if (!value) return null;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
    var iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return iso[3] + '/' + iso[2] + '/' + iso[1];
    var d = new Date(value);
    if (!isNaN(d.getTime())) {
        return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
    }
    return value;
}

function formatDateToYYYYMMDD(value) {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    var ddmm = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmm) return ddmm[3] + '-' + ddmm[2] + '-' + ddmm[1];
    var d = new Date(value);
    if (!isNaN(d.getTime())) {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    return value;
}

function checkConditionalCheckbox(el) {
    if (el.id && (el.id.indexOf('mas_') === 0 || (el.name && el.name.indexOf('mas_') === 0))) {
        var cb = document.getElementById('if_applicable_mas');
        if (cb && !cb.checked) cb.click();
    }
    if (el.id && /employment_type|designation|organization|job_start_date/.test(el.id) || (el.name && el.name.indexOf('job[') !== -1)) {
        var cb2 = document.getElementById('if_applicable_exp');
        if (cb2 && !cb2.checked) cb2.click();
    }
}

function handleDatepicker(el, value) {
    // value is already in DD/MM/YYYY at this point
    // Try jQuery datepicker API first (Indian Visa uses jQuery UI datepicker)
    if (typeof window.jQuery !== 'undefined' && window.jQuery(el).data('datepicker')) {
        try {
            // jQuery UI datepicker expects DD/MM/YYYY when dateFormat is 'dd/mm/yy'
            window.jQuery(el).datepicker('setDate', value);
            // Also sync the hidden input that shares the same name
            var hidden = document.querySelector('input[type="hidden"][name="' + el.name + '"]');
            if (hidden) {
                hidden.value = value;
                hidden.dispatchEvent(new Event('change', { bubbles: true }));
            }
            return;
        } catch (e) { /* fall through to manual approach */ }
    }
    // Fallback: manual value + event cascade
    el.focus();
    el.click();
    el.value = value;
    el.setAttribute('value', value);
    var events = ['keydown', 'keypress', 'input', 'keyup', 'change', 'blur'];
    for (var i = 0; i < events.length; i++) {
        el.dispatchEvent(new Event(events[i], { bubbles: true }));
    }
}
