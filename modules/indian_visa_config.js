// Indian Visa Application (indianvisa-bangladesh.nic.in) Field Definitions

export const INDIAN_VISA_FIELDS = {
    // === Registration (Page 1) ===
    "Country Applying From": "BANGLADESH",       // e.g. BANGLADESH
    "Indian Mission/Office": "",                  // e.g. BANGLADESH-DHAKA
    "Nationality": "BANGLADESH",                  // ISO-3 code e.g. BGD
    "Date of Birth": "",                          // DD/MM/YYYY
    "Email": "",
    "Re-enter Email": "",
    "Expected Date of Arrival": "",               // DD/MM/YYYY
    "Visa Type": "",                              // e.g. TOURIST VISA
    "Purpose of Visit": "",                       // e.g. FOR TOURISM

    // === Applicant Details (Page 2) ===
    "Surname": "",                                // Family name as in passport
    "Given Name": "",                             // First/given name as in passport
    "Have You Changed Name": "NO",               // YES or NO
    "Previous Surname": "",
    "Previous Given Name": "",
    "Gender": "",                                 // MALE, FEMALE, or TRANSGENDER
    "Town/City of Birth": "",
    "Country of Birth": "",                       // ISO-3 code e.g. BGD
    "National ID Number": "",                     // NID or type NA
    "Religion": "",                               // ISLAM, HINDU, CHRISTIAN, etc.
    "Religion (if Others)": "",
    "Visible Identification Marks": "",
    "Educational Qualification": "",             // GRADUATE, POST GRADUATE, etc.
    "Nationality Acquired By": "BY BIRTH",       // BY BIRTH or NATURALIZATION
    "Previous Nationality": "",                   // ISO-3 code if applicable

    // Passport Details
    "Passport Number": "",
    "Passport Place of Issue": "",
    "Passport Date of Issue": "",                 // DD/MM/YYYY
    "Passport Date of Expiry": "",                // DD/MM/YYYY

    // Other/Previous Passport
    "Other Valid Passport": "NO",                // YES or NO
    "Other Passport Country of Issue": "",
    "Other Passport Number": "",
    "Other Passport Date of Issue": "",          // DD/MM/YYYY
    "Other Passport Place of Issue": "",
    "Other Passport Nationality": "",
};

export const INDIAN_VISA_DUMMY_PROFILE = {
    id: 'profile_indian_visa_demo',
    name: 'Indian Visa (Demo)',
    site: 'indian_visa',
    profilePic: null,
    data: {
        "Country Applying From": "BANGLADESH",
        "Indian Mission/Office": "BANGLADESH-DHAKA",
        "Nationality": "BGD",
        "Date of Birth": "15/02/1990",
        "Email": "demo@example.com",
        "Re-enter Email": "demo@example.com",
        "Expected Date of Arrival": "01/06/2026",
        "Visa Type": "TOURIST VISA",
        "Purpose of Visit": "FOR TOURISM",
        "Surname": "DOE",
        "Given Name": "JOHN",
        "Have You Changed Name": "NO",
        "Previous Surname": "",
        "Previous Given Name": "",
        "Gender": "MALE",
        "Town/City of Birth": "DHAKA",
        "Country of Birth": "BGD",
        "National ID Number": "1234567890",
        "Religion": "ISLAM",
        "Religion (if Others)": "",
        "Visible Identification Marks": "NONE",
        "Educational Qualification": "GRADUATE",
        "Nationality Acquired By": "BY BIRTH",
        "Previous Nationality": "",
        "Passport Number": "AA1234567",
        "Passport Place of Issue": "DHAKA",
        "Passport Date of Issue": "01/01/2020",
        "Passport Date of Expiry": "01/01/2030",
        "Other Valid Passport": "NO",
        "Other Passport Country of Issue": "",
        "Other Passport Number": "",
        "Other Passport Date of Issue": "",
        "Other Passport Place of Issue": "",
        "Other Passport Nationality": "",
    }
};
