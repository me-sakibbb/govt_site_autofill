// content.js - Form autofill content script

// Indian Visa field definitions (inlined — content scripts cannot use ES modules)
// SOURCE OF TRUTH: modules/indian_visa_config.js — keep these in sync
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

const INDIAN_VISA_PAGE3_FIELDS = [
    { id: 'pres_add1', name: 'appl.pres_add1', type: 'text', label: 'Present Address: House No./Street' },
    { id: 'pres_add2', name: 'appl.pres_add2', type: 'text', label: 'Present Address: Village/Town/City' },
    { id: 'pres_country', name: 'appl.pres_country', type: 'select', label: 'Present Address: Country' },
    { id: 'state_name', name: 'appl.state_name', type: 'select', label: 'Present Address: State/Province/District' },
    { id: 'province_name', name: 'appl.province_name', type: 'text', label: 'Present Address: State/Province/District (China/Other)' },
    { id: 'pincode', name: 'appl.pincode', type: 'text', label: 'Present Address: Postal/Zip Code' },
    { id: 'pres_phone', name: 'appl.pres_phone', type: 'text', label: 'Present Address: Phone No.' },
    { id: 'isd_code', name: 'appl.isd_code', type: 'text', label: 'Mobile No. ISD Code' },
    { id: 'mobile', name: 'appl.mobile', type: 'text', label: 'Mobile No.' },
    { id: 'sameAddress', name: 'sameAddress', type: 'checkbox', label: 'Click Here for Same Address' },
    { id: 'perm_add1', name: 'appl.perm_add1', type: 'text', label: 'Permanent Address: House No./Street' },
    { id: 'perm_add2', name: 'appl.perm_add2', type: 'text', label: 'Permanent Address: Village/Town/City' },
    { id: 'perm_add3', name: 'appl.perm_add3', type: 'select', label: 'Permanent Address: State/Province/District' },
    { id: 'fthrname', name: 'appl.fthrname', type: 'text', label: 'Father\'s Name' },
    { id: 'father_nationality', name: 'appl.father_nationality', type: 'select', label: 'Father\'s Nationality/Region' },
    { id: 'father_previous_nationality', name: 'appl.father_previous_nationality', type: 'select', label: 'Father\'s Previous Nationality/Region' },
    { id: 'father_place_of_birth', name: 'appl.father_place_of_birth', type: 'text', label: 'Father\'s Place of birth' },
    { id: 'father_country_of_birth', name: 'appl.father_country_of_birth', type: 'select', label: 'Father\'s Country/Region of birth' },
    { id: 'mother_name', name: 'appl.mother_name', type: 'text', label: 'Mother\'s Name' },
    { id: 'mother_nationality', name: 'appl.mother_nationality', type: 'select', label: 'Mother\'s Nationality/Region' },
    { id: 'mother_previous_nationality', name: 'appl.mother_previous_nationality', type: 'select', label: 'Mother\'s Previous Nationality/Region' },
    { id: 'mother_place_of_birth', name: 'appl.mother_place_of_birth', type: 'text', label: 'Mother\'s Place of birth' },
    { id: 'mother_country_of_birth', name: 'appl.mother_country_of_birth', type: 'select', label: 'Mother\'s Country/Region of birth' },
    { id: 'marital_status', name: 'appl.marital_status', type: 'select', label: 'Applicant\'s Marital Status' },
    { id: 'spouse_name', name: 'appl.spouse_name', type: 'text', label: 'Spouse\'s Name' },
    { id: 'spouse_nationality', name: 'appl.spouse_nationality', type: 'select', label: 'Spouse\'s Nationality/Region' },
    { id: 'spouse_previous_nationality', name: 'appl.spouse_previous_nationality', type: 'select', label: 'Spouse\'s Previous Nationality/Region' },
    { id: 'spouse_place_of_birth', name: 'appl.spouse_place_of_birth', type: 'text', label: 'Spouse\'s Place of birth' },
    { id: 'spouse_country_of_birth', name: 'appl.spouse_country_of_birth', type: 'select', label: 'Spouse\'s Country/Region of birth' },
    { id: 'grandparent_flag_yes', name: 'appl.grandparent_flag', type: 'radio', label: 'Grandfather/Grandmother Pakistan Nationals? (YES)' },
    { id: 'grandparent_flag_no', name: 'appl.grandparent_flag', type: 'radio', label: 'Grandfather/Grandmother Pakistan Nationals? (NO)' },
    { id: 'grandparent_details', name: 'appl.grandparent_details', type: 'text', label: 'If Yes, give details' },
    { id: 'occupation', name: 'appl.occupation', type: 'select', label: 'Present Occupation' },
    { id: 'occupationOther', name: 'appl.occupationOther', type: 'text', label: 'Occupation (If Others)' },
    { id: 'occ_flag', name: 'appl.occ_flag', type: 'text', label: 'Specify occupation details of: Father/Mother/Spouse' },
    { id: 'empname', name: 'appl.empname', type: 'text', label: 'Employer Name/business' },
    { id: 'empdesignation', name: 'appl.empdesignation', type: 'text', label: 'Designation' },
    { id: 'empaddress', name: 'appl.empaddress', type: 'text', label: 'Address' },
    { id: 'empphone', name: 'appl.empphone', type: 'text', label: 'Phone' },
    { id: 'previous_occupation', name: 'appl.previous_occupation', type: 'select', label: 'Past Occupation, if any' },
    { id: 'previous_occupation_details', name: 'appl.previous_occupation_details', type: 'text', label: 'Past Occupation details' },
    { id: 'prev_org_yes', name: 'appl.prev_org', type: 'radio', label: 'Military/Police/Security Organization? (YES)' },
    { id: 'prev_org_no', name: 'appl.prev_org', type: 'radio', label: 'Military/Police/Security Organization? (NO)' },
    { id: 'previous_organization', name: 'appl.previous_organization', type: 'text', label: 'Previous Organization' },
    { id: 'previous_designation', name: 'appl.previous_designation', type: 'text', label: 'Previous Designation' },
    { id: 'previous_rank', name: 'appl.previous_rank', type: 'text', label: 'Previous Rank' },
    { id: 'previous_posting', name: 'appl.previous_posting', type: 'text', label: 'Previous Place of Posting' },
];

const PCC_FIELDS = [
    { id: 'P12_PASSPORT_NO', label: 'Passport No', type: 'text' },
    { id: 'P12_NATIONALITY', label: 'Issuing Country', type: 'select' },
    { id: 'P12_ISSUE_DATE', label: 'Issue Date (DD-MON-YYYY)', type: 'date' },
    { id: 'P12_ISSUE_PLACE', label: 'Issue Place', type: 'text' },
    { id: 'P12_EXPIRE_DATE', label: 'Expiry Date (DD-MON-YYYY)', type: 'date' },
    { id: 'P12_MOBILE_NO', label: 'Mobile No (Applicant)', type: 'text' },
    { id: 'P12_EMAIL', label: 'Email ID (Applicant)', type: 'text' },
    { id: 'P12_NID', label: 'NID (Numbers only)', type: 'text' },
    { id: 'P12_GENDER', label: 'Salutation (Mr./Ms./None)', type: 'radio_group' },
    { id: 'P12_PERSON_NAME', label: 'Full Name', type: 'text' },
    { id: 'P12_RELATION', label: 'Relation (Father/Spouse)', type: 'radio_group' },
    { id: 'P12_FATHER_NAME', label: 'Father\'s / Husband Name', type: 'text' },
    { id: 'P12_MOTHER_NAME', label: 'Mother\'s Name', type: 'text' },
    { id: 'P12_DOB', label: 'Date of Birth (DD-MON-YYYY)', type: 'date' },

    { id: 'P60_EMER_PUBLIC_DIVISION', label: 'Emergency Division', type: 'select' },
    { id: 'P60_EMER_DISTRICT', label: 'Emergency District', type: 'select' },
    { id: 'P60_EMER_THANA', label: 'Emergency Thana', type: 'select' },
    { id: 'P60_EMER_POST_CODE', label: 'Emergency Post Code', type: 'text' },
    { id: 'P60_EMER_POST_OFFICE', label: 'Emergency Post Office', type: 'text' },
    { id: 'P60_EMER_VILL_AREA', label: 'Emergency Village/Area/Sector', type: 'text' },
    { id: 'P60_EMER_HOUSE_ROAD', label: 'Emergency Road', type: 'text' },
    { id: 'P60_EMER_HOUSE', label: 'Emergency House', type: 'text' },

    { id: 'P60_SET_PERM_ADDRESS', label: 'Permanent Address Match (emer/man)', type: 'radio_group' },
    { id: 'P60_PERM_PUBLIC_DIVISION', label: 'Permanent Division', type: 'select' },
    { id: 'P60_PERM_DISTRICT', label: 'Permanent District', type: 'select' },
    { id: 'P60_PERM_THANA', label: 'Permanent Thana', type: 'select' },
    { id: 'P60_PERM_POST_CODE', label: 'Permanent Post Code', type: 'text' },
    { id: 'P60_PERM_POST_OFFICE', label: 'Permanent Post Office', type: 'text' },
    { id: 'P60_PERM_VILL_AREA', label: 'Permanent Village/Area/Sector', type: 'text' },
    { id: 'P60_PERM_HOUSE_ROAD', label: 'Permanent Road', type: 'text' },
    { id: 'P60_PERM_HOUSE', label: 'Permanent House', type: 'text' },

    { id: 'P60_SET_PRES_ADDRESS', label: 'Present Address Match (emer/perm/man)', type: 'radio_group' },
    { id: 'P60_PRES_PUBLIC_DIVISION', label: 'Present Division', type: 'select' },
    { id: 'P60_PRES_DISTRICT', label: 'Present District', type: 'select' },
    { id: 'P60_PRES_THANA', label: 'Present Thana', type: 'select' },
    { id: 'P60_PRES_POST_CODE', label: 'Present Post Code', type: 'text' },
    { id: 'P60_PRES_POST_OFFICE', label: 'Present Post Office', type: 'text' },
    { id: 'P60_PRES_VILL_AREA', label: 'Present Village/Area/Sector', type: 'text' },
    { id: 'P60_PRES_HOUSE_ROAD', label: 'Present Road', type: 'text' },
    { id: 'P60_PRES_HOUSE', label: 'Present House', type: 'text' },

    { id: 'P60_DELIVERY_TYPE', label: 'Delivery Type', type: 'select' },
    { id: 'P60_DELIVERY_FROM', label: 'Delivery From', type: 'select' }
];

// Site detection
const SUPPORTED_SITES = [
    /bdris\.gov\.bd/,
    /teletalk\.com\.bd/,
    /indianvisa-bangladesh\.nic\.in/,
    /pcc\.police\.gov\.bd/
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
        var isPCC = window.location.href.includes('pcc.police.gov.bd');
        if (profiles.length === 1) {
            if (isIndianVisa) startIndianVisaAutofill(profiles[0]);
            else if (isPCC) startPCCAutofill(profiles[0]);
            else startAutofill(profiles[0]);
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
    let fieldsToFill;
    let url = window.location.href;
    
    if (url.includes('Reg_Page1')) fieldsToFill = INDIAN_VISA_PAGE1_FIELDS;
    else if (url.includes('Reg_Page2')) fieldsToFill = INDIAN_VISA_PAGE2_FIELDS;
    else if (url.includes('Reg_Page3')) fieldsToFill = INDIAN_VISA_PAGE3_FIELDS;
    else {
        alert("This page doesn't seem to be a recognized Indian Visa form page.");
        if(floatBtn) setLoading(false);
        return;
    }
    
    await executeAIAutofill(profile, fieldsToFill);
}

async function startPCCAutofill(profile) {
    await executeAIAutofill(profile, PCC_FIELDS);
}

// Central AI API Call (Shared for all sites)
async function executeAIAutofill(profile, fieldsToFill) {
    setLoading(true);
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
            var allFields = fieldsToFill
                .filter(function (f) { return !(f.id in COUNTRY_DEFAULTS); })
                .map(function (f) { return enrichFieldWithOptions(f, profileValues); });

            var result = await sendMappingRequest(allFields, profile.data, 'indian_visa');
            mapping = result.mapping;

            for (var id in COUNTRY_DEFAULTS) {
                if (COUNTRY_DEFAULTS[id]) mapping[id] = COUNTRY_DEFAULTS[id];
            }
            await sessionSet(STORAGE_KEY, mapping);
        }

        var pageFields = fieldsToFill;
        var pageFieldIds = {};
        pageFields.forEach(function (f) { pageFieldIds[f.id] = true; });
        var pageMapping = {};
        for (var key in mapping) {
            if (pageFieldIds[key]) {
                pageMapping[key] = mapping[key];
                var fDef = pageFields.find(function (f) { return f.id === key; });
                if (fDef && fDef.name && fDef.name !== key) {
                    pageMapping[fDef.name] = mapping[key];
                }
            }
        }

        var filledCount = 0;
        if (fieldsToFill === INDIAN_VISA_PAGE1_FIELDS) {
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

        var pageLabel = fieldsToFill === INDIAN_VISA_PAGE1_FIELDS ? 'Page 1 (Registration)' : (fieldsToFill === INDIAN_VISA_PAGE2_FIELDS ? 'Page 2 (Applicant Details)' : 'Page 3 (Address & Family)');

        if (fieldsToFill !== INDIAN_VISA_PAGE1_FIELDS && fieldsToFill !== INDIAN_VISA_PAGE2_FIELDS && fieldsToFill !== INDIAN_VISA_PAGE3_FIELDS) {
            pageLabel = 'Page Detect Error';
        }

        alert('Indian Visa: ' + filledCount + ' fields filled on ' + pageLabel + '.\nMapping saved for next page.');
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

    formFields.forEach(function (f) {
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
    var filledElements = []; // Keep track to prevent double-filling
    for (var key in mapping) {
        var value = mapping[key];
        var el = document.getElementById(key) || document.querySelector('[name="' + key + '"]');
        if (!el || filledElements.includes(el)) continue;

        var filled = false;

        if (el.type === 'file' && profilePic) {
            filled = trySetFile(el, profilePic);
        } else if (el.type === 'radio') {
            // For radios, we need to find the specific button with the matching value
            var radios = document.querySelectorAll('[name="' + el.name + '"]');
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].value === String(value) && !radios[i].checked) {
                    radios[i].click();
                    if (!radios[i].checked) { radios[i].checked = true; radios[i].dispatchEvent(new Event('change', { bubbles: true })); }
                    filled = true;
                    el = radios[i]; // update el for highlighting
                    break;
                } else if (radios[i].value === String(value) && radios[i].checked) {
                    // Already selected correctly but mark as touched/filled
                    filled = true;
                    el = radios[i];
                    break;
                }
            }
        } else if (el.type === 'checkbox') {
            if (value != null && el.value === String(value) && !el.checked) {
                el.click();
                if (!el.checked) { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); }
                filled = true;
            }
        } else if (el.tagName.toLowerCase() === 'select') {
            if (window.location.href.includes('pcc.police.gov.bd') && el.classList.contains('select2-hidden-accessible')) {
                // PCC Select2 specific handler
                let valueToFind = String(value).toLowerCase().trim();
                let bestMatch = null;
                for (let option of el.options) {
                    if (!option.value) continue;
                    let optText = option.innerText.toLowerCase().trim();
                    let optVal = option.value.toLowerCase().trim();
                    if (optText === valueToFind || optVal === valueToFind) {
                        bestMatch = option.value;
                        break;
                    }
                    if (optText.includes(valueToFind) || valueToFind.includes(optText)) {
                        bestMatch = option.value;
                    }
                }
                if (bestMatch) {
                    el.value = bestMatch;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    const scriptWrapper = document.createElement('script');
                    scriptWrapper.textContent = `if (typeof jQuery !== 'undefined') jQuery('#${el.id}').val('${bestMatch}').trigger('change');`;
                    document.body.appendChild(scriptWrapper);
                    scriptWrapper.remove();
                    filled = true;
                }
            } else {
                filled = setSelectValue(el, value);
            }
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
                        filledElements.push(el);
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
            filledElements.push(el);
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
    } catch (e) { }
}

// BDRIS API Calls & execution logic
async function executeBDRISAutofill(profile, session) {
    setLoading(true);
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
            var allFields = PCC_FIELDS
                .filter(function (f) { return !(f.id in COUNTRY_DEFAULTS); })
                .map(function (f) { return enrichFieldWithOptions(f, profileValues); });

            var result = await sendMappingRequest(allFields, profile.data, 'bdris');
            mapping = result.mapping;

            for (var id in COUNTRY_DEFAULTS) {
                if (COUNTRY_DEFAULTS[id]) mapping[id] = COUNTRY_DEFAULTS[id];
            }
            await sessionSet(STORAGE_KEY, mapping);
        }

        // Check limits/allowance
        var limitResponse = await fetch(`${CONFIG.SERVER_URL}/api/extension/check-limit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ action: 'autofill', site: 'bdris' }),
        });

        if (!limitResponse.ok) {
            var err = await limitResponse.json();
            throw new Error(err.error || 'Server error');
        }

        var limitData = await limitResponse.json();
        if (!limitData.allowed) {
            alert('Autofill not allowed. Please check your extension balance/limits.');
            if(floatBtn) setLoading(false);
            return;
        }

        // Setup the payload specifically for the current site logic
        // This execution block wraps the custom mapping if provided
        
        let targetFields = PCC_FIELDS;
        let pccSelect2 = window.location.href.includes('pcc.police.gov.bd');

        // AI Request
        var response = await fetch(`${CONFIG.SERVER_URL}/api/extension/autofill-visa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                profile: JSON.stringify(profileData),
                fields: JSON.stringify(targetFields)
            }),
        });

        if (!response.ok) {
            var err = await response.json();
            throw new Error(err.error || 'Server error');
        }

        var data = await response.json();
        let mapping = data.mapping;
        let profilePic = profile.personal.profilePic;

        var filledCount = 0;
        
        // Custom filling for fixed sets of fields
        for (var i = 0; i < targetFields.length; i++) {
            var field = targetFields[i];
            var fieldData = mapping.find(m => m.id === field.id || m.name === field.name);
            
            if (fieldData && fieldData.value) {
                var el = document.getElementById(field.id) || document.querySelector('[name="' + (field.name || field.id) + '"]');
                if (el) {
                    if (el.tagName === 'SELECT') {
                        if (pccSelect2 && el.classList.contains('select2-hidden-accessible')) {
                            let valueToFind = String(fieldData.value).toLowerCase().trim();
                            let bestMatch = null;
                            for (let option of el.options) {
                                if (!option.value) continue;
                                let optText = option.innerText.toLowerCase().trim();
                                let optVal = option.value.toLowerCase().trim();
                                if (optText === valueToFind || optVal === valueToFind) {
                                    bestMatch = option.value;
                                    break;
                                }
                                if (optText.includes(valueToFind) || valueToFind.includes(optText)) {
                                    bestMatch = option.value;
                                }
                            }
                            if (bestMatch) {
                                el.value = bestMatch;
                                el.dispatchEvent(new Event('change', { bubbles: true }));
                                const scriptWrapper = document.createElement('script');
                                scriptWrapper.textContent = `if (typeof jQuery !== 'undefined') jQuery('#${el.id}').val('${bestMatch}').trigger('change');`;
                                document.body.appendChild(scriptWrapper);
                                scriptWrapper.remove();
                                filledCount++;
                            }
                        } else {
                            let valueToFind = String(fieldData.value).toLowerCase().trim();
                            let match = Array.from(el.options).find(opt => 
                                opt.value.toLowerCase() === valueToFind || 
                                opt.text.toLowerCase() === valueToFind
                            );
                            if (!match) {
                                match = Array.from(el.options).find(opt => 
                                    opt.value.toLowerCase().includes(valueToFind) || 
                                    opt.text.toLowerCase().includes(valueToFind)
                                );
                            }
                            if (match) {
                                el.value = match.value;
                                el.dispatchEvent(new Event('change', { bubbles: true }));
                                filledCount++;
                            }
                        }
                    } else if (el.type === 'radio' || field.type === 'radio' || field.type === 'radiogroup' || field.type === 'radio_group') {
                        const container = document.getElementById(`${field.id}_CONTAINER`) || document.getElementById(field.id) || el.parentElement;
                        if (container) {
                            const radios = Array.from(container.querySelectorAll('input[type="radio"]'));
                            const targetValStr = String(fieldData.value).toLowerCase().trim();
                            for (const r of radios) {
                               const rVal = String(r.value).toLowerCase().trim();
                               const rLabel = (document.querySelector(`label[for="${r.id}"]`)?.innerText || '').toLowerCase().trim();
                               const rDataDisplay = (r.getAttribute('data-display') || '').toLowerCase().trim();
                               
                               if (rVal === targetValStr || rLabel.includes(targetValStr) || rDataDisplay.includes(targetValStr)) {
                                   r.click();
                                   r.checked = true;
                                   r.dispatchEvent(new Event('change', { bubbles: true }));
                                   break;
                               }
                            }
                            filledCount++;
                        }
                    } else if (el.type === 'checkbox') {
                        if (value != null && el.value === String(value) && !el.checked) {
                            el.click();
                            if (!el.checked) { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); }
                            filled = true;
                        }
                    } else {
                        setNativeValue(el, fieldData.value);
                        filled = true;
                    }
                }
            }
        }

        alert('PCC Autofill: ' + filledCount + ' fields filled.');
    } catch (error) {
        alert('PCC Autofill error: ' + error.message);
    } finally {
        setLoading(false);
    }
}