// BDRIS Website Field Definitions

export const BDRIS_FIELDS = [
    // STEP 1: Office Address Selection
    { id: 'officeAddressType', label: 'Office Address Type', type: 'radio' },
    { id: 'bdMissionCheckbox', label: 'BD Mission', type: 'checkbox' },

    // Geographic Location Fields (Office Address)
    { id: 'officeAddrCountry', label: 'Office Country', type: 'select' },
    { id: 'officeAddrDiv', label: 'Office Division', type: 'select' },
    { id: 'officeAddrDist', label: 'Office District', type: 'select' },
    { id: 'officeAddrCityCorpCantOrUpazila', label: 'Office City/Upazila', type: 'select' },
    { id: 'officeAddrPaurasavaOrUnion', label: 'Office Paurasava/Union', type: 'select' },
    { id: 'officeAddrWardInCityCorp', label: 'Office Ward (City Corp)', type: 'select' },
    { id: 'officeAddrArea', label: 'Office Area', type: 'select' },
    { id: 'officeAddrWardInPaurasavaOrUnion', label: 'Office Ward (Union)', type: 'select' },
    { id: 'officeAddrPostOfc', label: 'Office Post Office (Bn)', type: 'text' },
    { id: 'officeAddrPostOfcEn', label: 'Office Post Office (En)', type: 'text' },
    { id: 'officeAddrVilAreaTownBn', label: 'Office Village/Area (Bn)', type: 'textarea' },
    { id: 'officeAddrVilAreaTownEn', label: 'Office Village/Area (En)', type: 'textarea' },
    { id: 'officeAddrHouseRoadBn', label: 'Office House/Road (Bn)', type: 'textarea' },
    { id: 'officeAddrHouseRoadEn', label: 'Office House/Road (En)', type: 'textarea' },

    // Permanent Address Fields
    { id: 'permAddrCountry', label: 'Permanent Country', type: 'select' },
    { id: 'permAddrDiv', label: 'Permanent Division', type: 'select' },
    { id: 'permAddrDist', label: 'Permanent District', type: 'select' },
    { id: 'permAddrCityCorpCantOrUpazila', label: 'Permanent City/Upazila', type: 'select' },
    { id: 'permAddrPaurasavaOrUnion', label: 'Permanent Paurasava/Union', type: 'select' },
    { id: 'permAddrWardInCityCorp', label: 'Permanent Ward (City Corp)', type: 'select' },
    { id: 'permAddrArea', label: 'Permanent Area', type: 'select' },
    { id: 'permAddrWardInPaurasavaOrUnion', label: 'Permanent Ward (Union)', type: 'select' },
    { id: 'permAddrPostOfc', label: 'Permanent Post Office (Bn)', type: 'text' },
    { id: 'permAddrPostOfcEn', label: 'Permanent Post Office (En)', type: 'text' },
    { id: 'permAddrVilAreaTownBn', label: 'Permanent Village/Area (Bn)', type: 'textarea' },
    { id: 'permAddrVilAreaTownEn', label: 'Permanent Village/Area (En)', type: 'textarea' },
    { id: 'permAddrHouseRoadBn', label: 'Permanent House/Road (Bn)', type: 'textarea' },
    { id: 'permAddrHouseRoadEn', label: 'Permanent House/Road (En)', type: 'textarea' },
    { id: 'permAddrPostCode', label: 'Permanent Post Code', type: 'text' },

    // Present Address Fields
    { id: 'copyPermAddrToPrsntAddr', label: 'Same as Permanent', type: 'checkbox' },
    { id: 'prsntAddrCountry', label: 'Present Country', type: 'select' },
    { id: 'prsntAddrDiv', label: 'Present Division', type: 'select' },
    { id: 'prsntAddrDist', label: 'Present District', type: 'select' },
    { id: 'prsntAddrCityCorpCantOrUpazila', label: 'Present City/Upazila', type: 'select' },
    { id: 'prsntAddrPaurasavaOrUnion', label: 'Present Paurasava/Union', type: 'select' },
    { id: 'prsntAddrWardInCityCorp', label: 'Present Ward (City Corp)', type: 'select' },
    { id: 'prsntAddrArea', label: 'Present Area', type: 'select' },
    { id: 'prsntAddrWardInPaurasavaOrUnion', label: 'Present Ward (Union)', type: 'select' },
    { id: 'prsntAddrPostOfc', label: 'Present Post Office (Bn)', type: 'text' },
    { id: 'prsntAddrPostOfcEn', label: 'Present Post Office (En)', type: 'text' },
    { id: 'prsntAddrVilAreaTownBn', label: 'Present Village/Area (Bn)', type: 'textarea' },
    { id: 'prsntAddrVilAreaTownEn', label: 'Present Village/Area (En)', type: 'textarea' },
    { id: 'prsntAddrHouseRoadBn', label: 'Present House/Road (Bn)', type: 'textarea' },
    { id: 'prsntAddrHouseRoadEn', label: 'Present House/Road (En)', type: 'textarea' },
    { id: 'prsntAddrPostCode', label: 'Present Post Code', type: 'text' },

    // STEP 2: Child/Person Information
    { id: 'childNameBn', label: 'Child Name (Bn)', type: 'text' },
    { id: 'childNameEn', label: 'Child Name (En)', type: 'text' },
    { id: 'gender', label: 'Gender', type: 'radio' },
    { id: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
    { id: 'placeOfBirth', label: 'Place of Birth', type: 'text' },
    { id: 'typeOfBirth', label: 'Type of Birth', type: 'select' },

    // STEP 3: Father's Information
    { id: 'fatherNameBn', label: 'Father Name (Bn)', type: 'text' },
    { id: 'fatherNameEn', label: 'Father Name (En)', type: 'text' },
    { id: 'fatherNationality', label: 'Father Nationality', type: 'select' },
    { id: 'fatherNationalId', label: 'Father NID', type: 'text' },
    { id: 'fatherDateOfBirth', label: 'Father DOB', type: 'date' },
    { id: 'fatherPlaceOfBirth', label: 'Father Place of Birth', type: 'text' },
    { id: 'fatherOccupation', label: 'Father Occupation', type: 'text' },
    { id: 'fatherEducation', label: 'Father Education', type: 'text' },

    // STEP 4: Mother's Information
    { id: 'motherNameBn', label: 'Mother Name (Bn)', type: 'text' },
    { id: 'motherNameEn', label: 'Mother Name (En)', type: 'text' },
    { id: 'motherNationality', label: 'Mother Nationality', type: 'select' },
    { id: 'motherNationalId', label: 'Mother NID', type: 'text' },
    { id: 'motherDateOfBirth', label: 'Mother DOB', type: 'date' },
    { id: 'motherPlaceOfBirth', label: 'Mother Place of Birth', type: 'text' },
    { id: 'motherOccupation', label: 'Mother Occupation', type: 'text' },
    { id: 'motherEducation', label: 'Mother Education', type: 'text' },

    // Additional Fields
    { id: 'applicantType', label: 'Applicant Type', type: 'select' },
    { id: 'applicantMobileNo', label: 'Applicant Mobile', type: 'text' },
    { id: 'applicantEmail', label: 'Applicant Email', type: 'text' },
    { id: 'relationWithChild', label: 'Relation with Child', type: 'text' }
];
