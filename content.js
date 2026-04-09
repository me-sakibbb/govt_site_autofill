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

const BDRIS_FIELDS = [
    { id: 'personFirstNameBn', name: 'personInfoForBirth.personFirstNameBn', label: 'First Name (Bengali)' },
    { id: 'personLastNameBn', name: 'personInfoForBirth.personLastNameBn', label: 'Last Name (Bengali)' },
    { id: 'personFirstNameEn', name: 'personInfoForBirth.personFirstNameEn', label: 'First Name (English)' },
    { id: 'personLastNameEn', name: 'personInfoForBirth.personLastNameEn', label: 'Last Name (English)' },
    { id: 'personBirthDate', name: 'personInfoForBirth.personBirthDate', label: 'Date of Birth (YYYY-MM-DD)' },
    { id: 'thChild', name: 'personInfoForBirth.thChild', label: 'Child Order' },
    { id: 'gender', name: 'personInfoForBirth.gender', label: 'Gender' },
    { id: 'personNid', name: 'personInfoForBirth.personNid', label: 'NID' },
    { id: 'birthPlaceCountry', name: 'birthPlaceCountry', label: 'Birth Country' },
    { id: 'birthPlaceDiv', name: 'birthPlaceDiv', label: 'Birth Division' },
    { id: 'birthPlaceDist', name: 'birthPlaceDist', label: 'Birth District' },
    { id: 'birthPlaceCityCorpCantOrUpazila', name: 'birthPlaceCityCorpCantOrUpazila', label: 'Birth Upazila' },
    { id: 'birthPlacePaurasavaOrUnion', name: 'birthPlacePaurasavaOrUnion', label: 'Birth Union' },
    { id: 'birthPlaceWardInPaurasavaOrUnion', name: 'birthPlaceWardInPaurasavaOrUnion', label: 'Birth Ward' },
    { id: 'birthPlacePostOfc', name: 'birthPlacePostOfc', label: 'Birth Post Office (BN)' },
    { id: 'birthPlacePostOfcEn', name: 'birthPlacePostOfcEn', label: 'Birth Post Office (EN)' },
    { id: 'birthPlaceVilAreaTownBn', name: 'birthPlaceVilAreaTownBn', label: 'Birth Village (BN)' },
    { id: 'birthPlaceVilAreaTownEn', name: 'birthPlaceVilAreaTownEn', label: 'Birth Village (EN)' },
    { id: 'birthPlaceHouseRoadBn', name: 'birthPlaceHouseRoadBn', label: 'Birth Road (BN)' },
    { id: 'birthPlaceHouseRoadEn', name: 'birthPlaceHouseRoadEn', label: 'Birth Road (EN)' },
    { id: 'fatherBrn', name: 'fatherBrn', label: 'Father BRN' },
    { id: 'fatherBirthDate', name: 'fatherBirthDate', label: 'Father DOB' },
    { id: 'fatherNameBn', name: 'fatherNameBn', label: 'Father Name (BN)' },
    { id: 'fatherNameEn', name: 'fatherNameEn', label: 'Father Name (EN)' },
    { id: 'fatherNationality', name: 'fatherNationality', label: 'Father Nationality' },
    { id: 'motherBrn', name: 'motherBrn', label: 'Mother BRN' },
    { id: 'motherBirthDate', name: 'motherBirthDate', label: 'Mother DOB' },
    { id: 'motherNameBn', name: 'motherNameBn', label: 'Mother Name (BN)' },
    { id: 'motherNameEn', name: 'motherNameEn', label: 'Mother Name (EN)' },
    { id: 'motherNationality', name: 'motherNationality', label: 'Mother Nationality' }
];

// Site detection
const SUPPORTED_SITES = [
    'bdris.gov.bd',
    'teletalk.com.bd',
    'indianvisa-bangladesh.nic.in',
    'pcc.police.gov.bd'
];

function isSupportedSite() {
    const url = window.location.href.toLowerCase();
    return SUPPORTED_SITES.some(site => url.includes(site));
}

let floatBtn = null;

// ─── Toast Notification System ───────────────────────────────────────────────
function showToast(message, type = 'info', duration = 4000) {
    var existing = document.getElementById('ai-autofill-toast-container');
    if (!existing) {
        existing = document.createElement('div');
        existing.id = 'ai-autofill-toast-container';
        var containerStyle = {
            'position': 'fixed', 'bottom': '100px', 'right': '24px',
            'z-index': '2147483646', 'display': 'flex', 'flex-direction': 'column',
            'gap': '10px', 'pointer-events': 'none'
        };
        for (var p in containerStyle) existing.style.setProperty(p, containerStyle[p], 'important');
        document.body.appendChild(existing);
    }
    var colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };
    var icons = {
        success: '<path d="M20 6L9 17l-5-5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
        error: '<path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>',
        info: '<circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="white" stroke-width="2.5" stroke-linecap="round"/>',
        warning: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="white" stroke-width="2"/><path d="M12 9v4M12 17h.01" stroke="white" stroke-width="2.5" stroke-linecap="round"/>'
    };
    var toast = document.createElement('div');
    var toastStyle = {
        'background': colors[type] || colors.info,
        'color': 'white', 'padding': '12px 18px', 'border-radius': '12px',
        'font-family': 'system-ui, -apple-system, sans-serif', 'font-size': '14px',
        'font-weight': '500', 'display': 'flex', 'align-items': 'center', 'gap': '10px',
        'box-shadow': '0 8px 24px rgba(0,0,0,0.25)', 'pointer-events': 'auto',
        'max-width': '320px', 'line-height': '1.4',
        'opacity': '0', 'transform': 'translateX(20px)',
        'transition': 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
    };
    for (var s in toastStyle) toast.style.setProperty(s, toastStyle[s], 'important');
    toast.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">${icons[type] || icons.info}</svg><span>${message}</span>`;
    existing.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.setProperty('opacity', '1', 'important');
        toast.style.setProperty('transform', 'translateX(0)', 'important');
    });
    setTimeout(() => {
        toast.style.setProperty('opacity', '0', 'important');
        toast.style.setProperty('transform', 'translateX(20px)', 'important');
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

// ─── Utility Helpers ─────────────────────────────────────────────────────────
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatDateToYYYYMMDD(value) {
    if (!value) return null;
    var m = String(value).match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (m) return m[3] + '-' + m[2].padStart(2,'0') + '-' + m[1].padStart(2,'0');
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    return null;
}

function formatDateToDDMMYYYY(value) {
    if (!value) return null;
    var m1 = String(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m1) return m1[1].padStart(2,'0') + '/' + m1[2].padStart(2,'0') + '/' + m1[3];
    var m2 = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m2) return m2[3] + '/' + m2[2] + '/' + m2[1];
    var m3 = String(value).match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (m3) return m3[1].padStart(2,'0') + '/' + m3[2].padStart(2,'0') + '/' + m3[3];
    return null;
}

function isDateField(el) {
    if (!el) return false;
    if (el.type === 'date') return true;
    var name = (el.name || el.id || '').toLowerCase();
    var placeholder = (el.placeholder || '').toLowerCase();
    return name.includes('date') || name.includes('dob') || name.includes('birth')
        || placeholder.includes('dd/mm') || placeholder.includes('mm/dd')
        || el.classList.contains('datepicker') || el.classList.contains('hasDatepicker');
}

function handleDatepicker(el, formattedDate) {
    if (!el) return;
    el.value = formattedDate;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    try {
        var script = document.createElement('script');
        script.textContent = `(function(){
            var el = document.getElementById('${el.id}');
            if (typeof jQuery !== 'undefined' && el) {
                try { jQuery(el).datepicker('setDate', '${formattedDate}'); } catch(e) {}
                try { jQuery(el).trigger('change'); } catch(e) {}
            }
        })();`;
        document.body.appendChild(script);
        script.remove();
    } catch(e) {}
}

function checkConditionalCheckbox(el) {
    if (!el) return;
    var parent = el.closest('[data-required-if], [data-show-if], [data-conditional]');
    if (!parent) return;
    var triggerSelector = parent.getAttribute('data-required-if') || parent.getAttribute('data-show-if');
    if (triggerSelector) {
        var trigger = document.querySelector(triggerSelector);
        if (trigger && trigger.type === 'checkbox' && !trigger.checked) {
            trigger.click();
        }
    }
}

// ─── Loading State ────────────────────────────────────────────────────────────
function setLoading(isLoading) {
    if (!floatBtn) return;
    if (isLoading) {
        floatBtn.style.setProperty('pointer-events', 'none', 'important');
        floatBtn.style.setProperty('opacity', '0.75', 'important');
        floatBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                 style="animation: ai-spin 1s linear infinite">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
                <path d="M12 2a10 10 0 0110 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>
            <span>Filling...</span>
        `;
        if (!document.getElementById('ai-autofill-keyframes')) {
            var style = document.createElement('style');
            style.id = 'ai-autofill-keyframes';
            style.textContent = '@keyframes ai-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }
    } else {
        floatBtn.style.setProperty('pointer-events', 'auto', 'important');
        floatBtn.style.setProperty('opacity', '1', 'important');
        updateFloatBtn();
    }
}

// ─── Floating Button Initialization ──────────────────────────────────────────
function injectFloatingButton() {
    if (window.self !== window.top) return;
    if (!isSupportedSite() || document.getElementById('ai-autofill-btn')) return;

    if (!document.body) {
        setTimeout(injectFloatingButton, 500);
        return;
    }

    if (!document.getElementById('ai-autofill-keyframes')) {
        var style = document.createElement('style');
        style.id = 'ai-autofill-keyframes';
        style.textContent = [
            '@keyframes ai-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }',
            '@keyframes ai-btn-entry { 0% { opacity: 0; transform: translateY(20px) scale(0.85); } 100% { opacity: 1; transform: translateY(0) scale(1); } }',
            '@keyframes ai-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); } 70% { box-shadow: 0 0 0 12px rgba(37,99,235,0); } 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); } }'
        ].join(' ');
        document.head.appendChild(style);
    }

    floatBtn = document.createElement('button');
    floatBtn.id = 'ai-autofill-btn';

    var props = {
        'position': 'fixed', 'bottom': '30px', 'right': '30px',
        'z-index': '2147483647', 'padding': '13px 22px',
        'color': 'white', 'border': 'none', 'border-radius': '50px',
        'cursor': 'pointer', 'box-shadow': '0 8px 24px rgba(37,99,235,0.45)',
        'font-size': '15px', 'font-weight': '700',
        'font-family': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        'transition': 'transform 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease',
        'display': 'flex', 'align-items': 'center', 'gap': '8px',
        'line-height': '1', 'min-width': '150px',
        'animation': 'ai-btn-entry 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, ai-pulse-ring 2.5s ease-out 0.6s 2',
        'visibility': 'visible', 'opacity': '1', 'pointer-events': 'auto'
    };
    for (var p in props) floatBtn.style.setProperty(p, props[p], 'important');

    updateFloatBtn();

    floatBtn.onmouseover = function () {
        this.style.setProperty('transform', 'translateY(-3px) scale(1.04)', 'important');
    };
    floatBtn.onmouseout = function () {
        this.style.setProperty('transform', 'translateY(0) scale(1)', 'important');
    };
    floatBtn.onclick = handleAutofillClick;

    document.body.appendChild(floatBtn);

    var observer = new MutationObserver(function () {
        if (!document.getElementById('ai-autofill-btn') && isSupportedSite() && floatBtn) {
            document.body.appendChild(floatBtn);
        }
    });
    observer.observe(document.body, { childList: true });

    chrome.storage.onChanged.addListener(function (changes) {
        if (changes.supabaseSession) updateFloatBtn();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFloatingButton);
} else {
    injectFloatingButton();
}

function updateFloatBtn() {
    if (!floatBtn) return;
    chrome.storage.local.get(['supabaseSession'], function (result) {
        var loggedIn = !!(result.supabaseSession && result.supabaseSession.access_token);
        if (loggedIn) {
            floatBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
                </svg>
                <span>Autofill Now</span>
            `;
            floatBtn.style.setProperty('background', '#2563eb', 'important');
            floatBtn.style.setProperty('box-shadow', '0 8px 24px rgba(37,99,235,0.3)', 'important');
        } else {
            floatBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <span>Login to Use</span>
            `;
            floatBtn.style.setProperty('background', '#64748b', 'important');
            floatBtn.style.setProperty('box-shadow', '0 4px 12px rgba(0,0,0,0.1)', 'important');
        }
    });
}

chrome.runtime.onMessage.addListener(function (request) {
    if (request.action === 'triggerAutofill') handleAutofillClick();
});

async function handleAutofillClick() {
    try {
        var result = await getProfilesData();
        var profiles = result.profiles;
        var lastActiveProfileId = result.lastActiveProfileId;
        var session = result.supabaseSession;

        if (!session || !session.access_token) {
            showToast('Please login via extension settings to use Autofill Genius AI.', 'warning', 6000);
            setTimeout(function () {
                if (confirm('Open extension settings to login?')) {
                    chrome.runtime.sendMessage({ action: 'OPEN_OPTIONS' });
                }
            }, 300);
            return;
        }

        if (floatBtn) setLoading(true);

        if (profiles.length === 0) {
            showToast('Please create a profile in extension settings first.', 'warning', 5000);
            if (floatBtn) setLoading(false);
            return;
        }

        setLoading(false);
        showProfileSelector(profiles, lastActiveProfileId);
    } catch (error) {
        showToast('Error: ' + (error.message || 'Unknown error'), 'error');
        if (floatBtn) setLoading(false);
    }
}

function showProfileSelector(profiles, lastActiveProfileId) {
    var existing = document.getElementById('ai-profile-selector-modal');
    if (existing) existing.remove();

    var backdrop = document.createElement('div');
    backdrop.id = 'ai-profile-selector-modal';
    var backdropProps = {
        'position': 'fixed', 'inset': '0', 'width': '100%', 'height': '100%',
        'background': 'rgba(0,0,0,0.65)', 'backdrop-filter': 'blur(4px)',
        '-webkit-backdrop-filter': 'blur(4px)',
        'z-index': '2147483646',
        'display': 'flex', 'justify-content': 'center', 'align-items': 'center',
        'font-family': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        'animation': 'ai-fade-in 0.2s ease forwards', 'opacity': '0'
    };
    for (var p in backdropProps) backdrop.style.setProperty(p, backdropProps[p], 'important');
    backdrop.onclick = function (e) { if (e.target === backdrop) { backdrop.remove(); setLoading(false); } };

    if (!document.getElementById('ai-modal-styles')) {
        var st = document.createElement('style');
        st.id = 'ai-modal-styles';
        st.textContent = [
            '@keyframes ai-fade-in { from { opacity: 0; } to { opacity: 1; } }',
            '@keyframes ai-slide-up { from { opacity: 0; transform: translateY(24px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }'
        ].join(' ');
        document.head.appendChild(st);
    }

    var card = document.createElement('div');
    var cardProps = {
        'background': '#ffffff',
        'border': '1px solid #e2e8f0',
        'border-radius': '20px',
        'padding': '28px',
        'width': '360px',
        'max-width': 'calc(100vw - 48px)',
        'box-shadow': '0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02)',
        'display': 'flex', 'flex-direction': 'column', 'gap': '20px',
        'animation': 'ai-slide-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'position': 'relative'
    };
    for (var cp in cardProps) card.style.setProperty(cp, cardProps[cp], 'important');

    var header = document.createElement('div');
    header.style.setProperty('display', 'flex', 'important');
    header.style.setProperty('align-items', 'center', 'important');
    header.style.setProperty('justify-content', 'space-between', 'important');

    var titleRow = document.createElement('div');
    titleRow.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#2563eb,#7c3aed);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
                </svg>
            </div>
            <div>
                <div style="color:#0f172a;font-size:16px;font-weight:700;line-height:1.2">Autofill Genius AI</div>
                <div style="color:#64748b;font-size:12px;margin-top:2px">Choose a profile to fill the form</div>
            </div>
        </div>
    `;
    header.appendChild(titleRow);

    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/></svg>';
    var closeBtnProps = {
        'background': '#f1f5f9', 'border': '1px solid #e2e8f0',
        'border-radius': '8px', 'cursor': 'pointer', 'padding': '6px',
        'display': 'flex', 'align-items': 'center', 'justify-content': 'center',
        'transition': 'background 0.2s ease', 'flex-shrink': '0'
    };
    for (var cbp in closeBtnProps) closeBtn.style.setProperty(cbp, closeBtnProps[cbp], 'important');
    closeBtn.onclick = function () { backdrop.remove(); setLoading(false); };
    header.appendChild(closeBtn);
    card.appendChild(header);

    var divider = document.createElement('div');
    divider.style.setProperty('height', '1px', 'important');
    divider.style.setProperty('background', '#f1f5f9', 'important');
    divider.style.setProperty('margin', '-4px 0', 'important');
    card.appendChild(divider);

    var profileGroup = createLabeledSelect(
        'Select Profile',
        profiles.map(function (p) { return { value: p.id, text: p.name }; })
    );
    if (lastActiveProfileId && profiles.some(function (p) { return p.id === lastActiveProfileId; })) {
        profileGroup.select.value = lastActiveProfileId;
    }
    card.appendChild(profileGroup.group);

    var sites = [
        { value: 'bdris', text: 'BDRIS — Birth & Death Registration' },
        { value: 'indian_visa', text: 'Indian Visa Application' },
        { value: 'pcc', text: 'PCC — Police Clearance Certificate' },
        { value: 'teletalk', text: 'Teletalk — Government Job Forms' },
        { value: 'custom', text: 'Custom / Generic Form' },
    ];
    var siteGroup = createLabeledSelect('Form Template', sites);
    card.appendChild(siteGroup.group);

    profileGroup.select.addEventListener('change', function () {
        chrome.storage.local.set({ lastActiveProfileId: profileGroup.select.value });
        var sp = profiles.find(function (p) { return p.id === profileGroup.select.value; });
        if (sp && sp.site) siteGroup.select.value = sp.site;
    });
    profileGroup.select.dispatchEvent(new Event('change'));

    var url = window.location.href;
    if (url.includes('indianvisa-bangladesh.nic.in')) siteGroup.select.value = 'indian_visa';
    else if (url.includes('bdris.gov.bd')) siteGroup.select.value = 'bdris';
    else if (url.includes('teletalk.com.bd')) siteGroup.select.value = 'teletalk';
    else if (url.includes('pcc.police.gov.bd')) siteGroup.select.value = 'pcc';

    var btnRow = document.createElement('div');
    btnRow.style.setProperty('display', 'flex', 'important');
    btnRow.style.setProperty('gap', '10px', 'important');
    btnRow.style.setProperty('margin-top', '4px', 'important');

    var cancelBtn = createBtn('Cancel', false);
    cancelBtn.onclick = function () { backdrop.remove(); setLoading(false); };

    var autofillBtn = createBtn('Start Autofill', true);
    autofillBtn.onclick = function () {
        var selectedProfile = profiles.find(function (p) { return p.id === profileGroup.select.value; });
        var selectedSite = siteGroup.select.value;
        if (!selectedProfile) { showToast('Please select a profile first.', 'warning'); return; }
        selectedProfile.site = selectedSite;
        backdrop.remove();
        if (selectedSite === 'indian_visa') startIndianVisaAutofill(selectedProfile);
        else if (selectedSite === 'pcc') startPCCAutofill(selectedProfile);
        else if (selectedSite === 'bdris') startBDRISAutofill(selectedProfile);
        else startAutofill(selectedProfile);
    };

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(autofillBtn);
    card.appendChild(btnRow);
    backdrop.appendChild(card);
    document.body.appendChild(backdrop);
    requestAnimationFrame(function () {
        backdrop.style.setProperty('opacity', '1', 'important');
    });
}

function showCompletionModal(count) {
    var existing = document.getElementById('ai-completion-modal');
    if (existing) existing.remove();

    if (!document.getElementById('ai-modal-styles')) {
        var st = document.createElement('style');
        st.id = 'ai-modal-styles';
        st.textContent = [
            '@keyframes ai-fade-in { from { opacity: 0; } to { opacity: 1; } }',
            '@keyframes ai-slide-up { from { opacity: 0; transform: translateY(24px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }'
        ].join(' ');
        document.head.appendChild(st);
    }

    var backdrop = document.createElement('div');
    backdrop.id = 'ai-completion-modal';
    var backdropProps = {
        'position': 'fixed', 'inset': '0', 'width': '100%', 'height': '100%',
        'background': 'rgba(0,0,0,0.4)', 'backdrop-filter': 'blur(4px)',
        '-webkit-backdrop-filter': 'blur(4px)',
        'z-index': '2147483647',
        'display': 'flex', 'justify-content': 'center', 'align-items': 'center',
        'font-family': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        'animation': 'ai-fade-in 0.3s ease-out forwards',
        'opacity': '1'
    };
    for (var p in backdropProps) backdrop.style.setProperty(p, backdropProps[p], 'important');

    var card = document.createElement('div');
    var cardProps = {
        'background': '#ffffff',
        'border': '1px solid #e2e8f0',
        'border-radius': '24px',
        'padding': '32px',
        'width': '400px',
        'max-width': 'calc(100vw - 48px)',
        'box-shadow': '0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02)',
        'display': 'flex', 'flex-direction': 'column', 'align-items': 'center', 'text-align': 'center', 'gap': '20px',
        'animation': 'ai-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'position': 'relative'
    };
    for (var cp in cardProps) card.style.setProperty(cp, cardProps[cp], 'important');

    var iconBox = document.createElement('div');
    var ibProps = {
        'width': '64px', 'height': '64px', 'border-radius': '20px',
        'background': 'rgba(34,197,94,0.1)',
        'display': 'flex', 'align-items': 'center', 'justify-content': 'center',
        'margin-bottom': '8px'
    };
    for (var ip in ibProps) iconBox.style.setProperty(ip, ibProps[ip], 'important');
    iconBox.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    card.appendChild(iconBox);

    var title = document.createElement('h2');
    title.innerText = 'অটোফিল সফল হয়েছে!';
    var titleProps = { 'margin': '0', 'color': '#0f172a', 'font-size': '22px', 'font-weight': '800' };
    for (var tp in titleProps) title.style.setProperty(tp, titleProps[tp], 'important');
    card.appendChild(title);

    var msg = document.createElement('p');
    msg.innerText = (count ? count + ' টি তথ্য পূরণ করা হয়েছে। ' : '') + 'এআই (AI) দিয়ে ফর্মটি অটোফিল করা হয়েছে। সাবমিট করার আগে অনুগ্রহ করে সব তথ্যগুলো একবার যাচাই করে নিন।';
    var msgProps = { 'margin': '0', 'color': '#475569', 'font-size': '15px', 'line-height': '1.6', 'font-weight': '500' };
    for (var mp in msgProps) msg.style.setProperty(mp, msgProps[mp], 'important');
    card.appendChild(msg);

    var okBtn = createBtn('ঠিক আছে, যাচাই করে নিচ্ছি', true);
    okBtn.style.setProperty('width', '100%', 'important');
    okBtn.style.setProperty('margin-top', '10px', 'important');
    okBtn.style.setProperty('padding', '14px', 'important');
    okBtn.onclick = function() {
        backdrop.style.setProperty('opacity', '0', 'important');
        backdrop.style.setProperty('transform', 'scale(0.95)', 'important');
        backdrop.style.setProperty('transition', 'all 0.2s ease', 'important');
        setTimeout(function() { backdrop.remove(); }, 200);
    };
    card.appendChild(okBtn);
    backdrop.appendChild(card);
    document.body.appendChild(backdrop);
}

function createLabeledSelect(labelText, options) {
    var group = document.createElement('div');
    group.style.setProperty('display', 'flex', 'important');
    group.style.setProperty('flex-direction', 'column', 'important');
    group.style.setProperty('gap', '6px', 'important');
    var label = document.createElement('label');
    label.innerText = labelText;
    var labelProps = { 'display': 'block', 'font-size': '12px', 'font-weight': '600', 'color': '#64748b' };
    for (var lp in labelProps) label.style.setProperty(lp, labelProps[lp], 'important');
    var select = document.createElement('select');
    var selectProps = { 'width': '100%', 'padding': '10px 14px', 'border-radius': '10px', 'border': '1px solid #e2e8f0', 'background': '#f8fafc', 'color': '#1e293b', 'font-size': '14px' };
    for (var sp in selectProps) select.style.setProperty(sp, selectProps[sp], 'important');
    options.forEach(function (o) {
        var opt = document.createElement('option');
        opt.value = o.value; opt.text = o.text;
        select.appendChild(opt);
    });
    group.appendChild(label);
    group.appendChild(select);
    return { group: group, select: select };
}

function createBtn(text, isPrimary) {
    var btn = document.createElement('button');
    btn.innerText = text;
    var btnProps = isPrimary
        ? { 'flex': '1.5', 'padding': '12px 20px', 'border-radius': '12px', 'cursor': 'pointer', 'font-weight': '700', 'border': 'none', 'color': 'white', 'background': '#2563eb' }
        : { 'flex': '1', 'padding': '12px 16px', 'border-radius': '12px', 'cursor': 'pointer', 'font-weight': '600', 'border': '1px solid #e2e8f0', 'color': '#475569', 'background': '#f8fafc' };
    for (var bp in btnProps) btn.style.setProperty(bp, btnProps[bp], 'important');
    return btn;
}

async function startIndianVisaAutofill(profile) {
    let fieldsToFill;
    let url = window.location.href;
    if (url.includes('Reg_Page1')) fieldsToFill = INDIAN_VISA_PAGE1_FIELDS;
    else if (url.includes('Reg_Page2')) fieldsToFill = INDIAN_VISA_PAGE2_FIELDS;
    else if (url.includes('Reg_Page3')) fieldsToFill = INDIAN_VISA_PAGE3_FIELDS;
    else { alert("This page doesn't seem to be a recognized Indian Visa form page."); setLoading(false); return; }
    await executeAIAutofill(profile, fieldsToFill);
}

async function startPCCAutofill(profile) { await executeAIAutofill(profile, PCC_FIELDS); }

async function startBDRISAutofill(profile) {
    chrome.storage.local.get(['supabaseSession'], function(result) {
        if (result.supabaseSession && result.supabaseSession.access_token) {
            executeBDRISAutofill(profile, result.supabaseSession);
        } else { showToast('Please login to use BDRIS autofill.', 'warning'); }
    });
}

async function executeAIAutofill(profile, fieldsToFill) {
    setLoading(true);
    try {
        var result = await sendMappingRequest(fieldsToFill, profile.data);
        var filledCount = await applyMapping(result.mapping, profile.profilePic);
        showToast('Autofill complete: ' + filledCount + ' fields filled.', 'success');
        showCompletionModal(filledCount);
    } catch (error) { showToast('Autofill error: ' + error.message, 'error'); }
    finally { setLoading(false); }
}

async function startAutofill(profile) {
    setLoading(true);
    try {
        var visibleFields = scrapeVisibleFields(profile.data);
        var result = await sendMappingRequest(visibleFields, profile.data, profile.site);
        var filled = await applyMapping(result.mapping, profile.profilePic);
        showToast('Autofilled ' + filled + ' fields successfully!', 'success');
        showCompletionModal(filled);
    } catch (error) { showToast('Autofill error: ' + error.message, 'error'); }
    finally { setLoading(false); }
}

function getProfilesData() {
    return new Promise(function (resolve, reject) {
        chrome.storage.local.get(['profiles', 'lastActiveProfileId', 'supabaseSession'], function (result) {
            resolve({ profiles: result.profiles || [], lastActiveProfileId: result.lastActiveProfileId, supabaseSession: result.supabaseSession });
        });
    });
}

function sendMappingRequest(formFields, userData) {
    var mapping = {};
    formFields.forEach(function (f) { if (userData[f.id] || userData[f.name]) mapping[f.id] = userData[f.id] || userData[f.name]; });
    return Promise.resolve({ success: true, mapping: mapping });
}

function getProfileValues(data) {
    var values = [];
    for (var key in data) { if (data[key]) values.push(String(data[key]).toLowerCase()); }
    return values;
}

function filterSelectOptions(el, profileValues) {
    return Array.from(el.options).map(o => ({ value: o.value, text: o.text }));
}

function scrapeVisibleFields(profileData) {
    var fields = [];
    document.querySelectorAll('input, select, textarea').forEach(function (input) {
        if (input.type === 'hidden' || input.type === 'submit') return;
        fields.push({ id: input.id || input.name, name: input.name || '', type: input.type, tagName: input.tagName.toLowerCase(), label: input.name || input.id });
    });
    return fields;
}

async function applyMapping(mapping, profilePic) {
    if (!mapping) return 0;
    var filledElements = new Set();
    for (var key in mapping) {
        var value = mapping[key];
        if (value === null || value === undefined || value === '' || value === 'null') continue;
        
        var el = document.getElementById(key) || document.querySelector('[name="' + key + '"]');
        if (!el || filledElements.has(el)) continue;

        // Skip genuinely hidden elements (like type="hidden")
        if (el.type === 'hidden') continue;
        
        // Skip visually hidden elements (e.g., inside display:none containers or tabs)
        // This ensures the count accurately reflects what the user sees on their screen.
        if (el.offsetWidth === 0 && el.offsetHeight === 0) continue;

        let valueStr = String(value).trim();
        let shouldCount = false;

        if (el.tagName.toLowerCase() === 'select') {
            let matchedOption = Array.from(el.options).find(opt => opt.value === valueStr || opt.text.trim().toLowerCase() === valueStr.toLowerCase());
            if (matchedOption) {
                el.value = matchedOption.value;
                shouldCount = true;
            } else {
                continue; // Skip triggering events to avoid server errors on missing options
            }
        } else if (el.type === 'checkbox' || el.type === 'radio') {
            var isTrue = ['true', '1', 'y', 'yes', 'on'].includes(valueStr.toLowerCase()) || valueStr.toLowerCase() === el.value.toLowerCase();
            el.checked = isTrue;
            shouldCount = true;
        } else {
            el.value = valueStr;
            shouldCount = true;
        }

        if (shouldCount) {
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            filledElements.add(el); 
            
            // Highlight filled field
            var originalBG = el.style.backgroundColor;
            el.style.setProperty('background-color', '#f0fdf4', 'important');
            el.style.setProperty('transition', 'background-color 0.5s', 'important');
            (function(element, bg) {
                setTimeout(function() { element.style.backgroundColor = bg; }, 3000);
            })(el, originalBG);
        }
    }
    return filledElements.size;
}

async function executeBDRISAutofill(profile, session) {
    setLoading(true);
    try {
        var result = await sendMappingRequest(BDRIS_FIELDS, profile.data);
        var filledCount = await applyMapping(result.mapping, profile.profilePic);
        showToast('BDRIS Autofill: ' + filledCount + ' fields filled.', 'success');
        showCompletionModal(filledCount);
    } catch (error) { showToast('BDRIS Autofill error: ' + error.message, 'error'); }
    finally { setLoading(false); }
}

function setNativeValue(element, value) {
    element.value = value;
    ['input', 'change'].forEach(e => element.dispatchEvent(new Event(e, { bubbles: true })));
}