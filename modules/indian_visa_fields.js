// Indian Visa Application (indianvisa-bangladesh.nic.in)
// Form field definitions used by content.js for autofill mapping.

// Page 1 — Registration page
export const INDIAN_VISA_PAGE1_FIELDS = [
    { id: 'countryname_id',  name: 'appl.countryname',    type: 'select', label: 'Country/Region applying from' },
    { id: 'missioncode_id',  name: 'appl.missioncode',    type: 'select', label: 'Indian Mission/Office' },
    { id: 'nationality_id',  name: 'appl.nationality',    type: 'select', label: 'Nationality/Region' },
    { id: 'dob_id',          name: 'appl.birthdate',      type: 'text',   label: 'Date of Birth (DD/MM/YYYY)' },
    { id: 'email_id',        name: 'appl.email',          type: 'text',   label: 'Email ID' },
    { id: 'email_re_id',     name: 'appl.email_re',       type: 'text',   label: 'Re-enter Email ID' },
    { id: 'jouryney_id',     name: 'appl.journeydate',    type: 'text',   label: 'Expected Date of Arrival (DD/MM/YYYY)' },
    { id: 'visaService',     name: 'appl.visa_service_id',type: 'select', label: 'Visa Type' },
    { id: 'purpose',         name: 'appl.purpose',        type: 'select', label: 'Purpose of Visit' },
    // captcha is intentionally omitted
];

// Page 2 — Applicant details page
export const INDIAN_VISA_PAGE2_FIELDS = [
    { id: 'surname',              name: 'appl.surname',                        type: 'text',     label: 'Surname (as in Passport)' },
    { id: 'givenName',            name: 'appl.applname',                       type: 'text',     label: 'Given Name/s (as in Passport)' },
    { id: 'changedSurnameCheck',  name: 'appl.changedSurnameCheck',            type: 'checkbox', label: 'Have you ever changed your name?' },
    { id: 'prev_surname',         name: 'appl.prev_surname',                   type: 'text',     label: 'Previous Surname' },
    { id: 'prev_given_name',      name: 'appl.prev_given_name',                type: 'text',     label: 'Previous Given Name' },
    { id: 'gender',               name: 'appl.applsex',                        type: 'select',   label: 'Gender (M/F/X)' },
    { id: 'birth_place',          name: 'appl.placbrth',                       type: 'text',     label: 'Town/City of Birth' },
    { id: 'country_birth',        name: 'appl.country_of_birth',               type: 'select',   label: 'Country/Region of Birth' },
    { id: 'nic_number',           name: 'appl.nic_no',                         type: 'text',     label: 'Citizenship/National Id No.' },
    { id: 'religion',             name: 'appl.religion',                       type: 'select',   label: 'Religion' },
    { id: 'religion_other',       name: 'appl.religionOther',                  type: 'text',     label: 'Religion (if Others)' },
    { id: 'identity_marks',       name: 'appl.visual_mark',                    type: 'text',     label: 'Visible identification marks' },
    { id: 'education',            name: 'appl.edu_id',                         type: 'select',   label: 'Educational Qualification' },
    { id: 'nationality_by',       name: 'appl.nationality_by',                 type: 'select',   label: 'Nationality acquired by birth or naturalization?' },
    { id: 'prev_nationality',     name: 'appl.prev_nationality',               type: 'select',   label: 'Previous Nationality/Region' },
    { id: 'passport_no',          name: 'appl.passport_number',                type: 'text',     label: 'Passport Number' },
    { id: 'passport_issue_place', name: 'appl.passport_issue_place',           type: 'text',     label: 'Passport Place of Issue' },
    { id: 'passport_issue_date',  name: 'appl.passport_issue_date',            type: 'text',     label: 'Passport Date of Issue (DD/MM/YYYY)' },
    { id: 'passport_expiry_date', name: 'appl.passport_expiry_date',           type: 'text',     label: 'Passport Date of Expiry (DD/MM/YYYY)' },
    { id: 'other_ppt_1',          name: 'appl.oth_ppt',                        type: 'radio',    label: 'Any other valid Passport - YES' },
    { id: 'other_ppt_2',          name: 'appl.oth_ppt',                        type: 'radio',    label: 'Any other valid Passport - NO' },
    { id: 'other_ppt_country_issue', name: 'appl.prev_passport_country_issue', type: 'select',   label: 'Other Passport Country of Issue' },
    { id: 'other_ppt_no',         name: 'appl.oth_pptno',                      type: 'text',     label: 'Other Passport No.' },
    { id: 'other_ppt_issue_date', name: 'appl.previous_passport_issue_date',   type: 'text',     label: 'Other Passport Date of Issue (DD/MM/YYYY)' },
    { id: 'other_ppt_issue_place',name: 'appl.other_ppt_issue_place',          type: 'text',     label: 'Other Passport Place of Issue' },
    { id: 'other_ppt_nat',        name: 'appl.other_ppt_nationality',          type: 'select',   label: 'Other Passport Nationality mentioned therein' },
];
