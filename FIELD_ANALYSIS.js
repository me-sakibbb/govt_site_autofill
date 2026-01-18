// Analysis of site_1.txt form fields
// This file documents all fields found in the Bangladesh birth registration form

/*
COMPREHENSIVE FIELD LIST FROM site_1.txt:

STEP 1: Office Address Selection
- officeAddressType (radio): BIRTHPLACE, PERMANENT, MISSION
- bdMissionCheckbox (checkbox)

Geographic Location Fields (Office Address):
- officeAddrCountry (select)
- officeAddrDiv (select) - Division
- officeAddrDist (select) - District  
- officeAddrCityCorpCantOrUpazila (select)
- officeAddrPaurasavaOrUnion (select)
- officeAddrWardInCityCorp (select)
- officeAddrArea (select)
- officeAddrWardInPaurasavaOrUnion (select)
- officeAddrPostOfc (text) - Post Office Bangla
- officeAddrPostOfcEn (text) - Post Office English
- officeAddrVilAreaTownBn (textarea) - Village/Area Bangla
- officeAddrVilAreaTownEn (textarea) - Village/Area English
- officeAddrHouseRoadBn (textarea) - House & Road Bangla
- officeAddrHouseRoadEn (textarea) - House & Road English

Permanent Address Fields:
- permAddrCountry (select)
- permAddrDiv (select)
- permAddrDist (select)
- permAddrCityCorpCantOrUpazila (select)
- permAddrPaurasavaOrUnion (select)
- permAddrWardInCityCorp (select)
- permAddrArea (select)
- permAddrWardInPaurasavaOrUnion (select)
- permAddrPostOfc (text)
- permAddrPostOfcEn (text)
- permAddrVilAreaTownBn (textarea)
- permAddrVilAreaTownEn (textarea)
- permAddrHouseRoadBn (textarea)
- permAddrHouseRoadEn (textarea)
- permAddrPostCode (text)

Present Address Fields:
- copyPermAddrToPrsntAddr (checkbox) - Same as permanent
- prsntAddrCountry (select)
- prsntAddrDiv (select)
- prsntAddrDist (select)
- prsntAddrCityCorpCantOrUpazila (select)
- prsntAddrPaurasavaOrUnion (select)
- prsntAddrWardInCityCorp (select)
- prsntAddrArea (select)
- prsntAddrWardInPaurasavaOrUnion (select)
- prsntAddrPostOfc (text)
- prsntAddrPostOfcEn (text)
- prsntAddrVilAreaTownBn (textarea)
- prsntAddrVilAreaTownEn (textarea)
- prsntAddrHouseRoadBn (textarea)
- prsntAddrHouseRoadEn (textarea)
- prsntAddrPostCode (text)

STEP 2: Child/Person Information
- childNameBn (text) - Name Bangla
- childNameEn (text) - Name English
- gender (radio): MALE, FEMALE, OTHER
- dateOfBirth (date)
- placeOfBirth (text)
- typeOfBirth (select): SINGLE, TWIN, TRIPLET, etc.

STEP 3: Father's Information
- fatherNameBn (text)
- fatherNameEn (text)
- fatherNationality (select)
- fatherNationalId (text)
- fatherDateOfBirth (date)
- fatherPlaceOfBirth (text)
- fatherOccupation (text)
- fatherEducation (text)

STEP 4: Mother's Information
- motherNameBn (text)
- motherNameEn (text)
- motherNationality (select)
- motherNationalId (text)
- motherDateOfBirth (date)
- motherPlaceOfBirth (text)
- motherOccupation (text)
- motherEducation (text)

Additional Fields:
- applicantType (select): SELF, FATHER, MOTHER, etc.
- applicantMobileNo (text)
- applicantEmail (text)
- relationWithChild (text)
*/
