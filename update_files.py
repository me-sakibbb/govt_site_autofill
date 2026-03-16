import os

bdris_config = """export const BDRIS_FIELDS = {
    "personFirstNameBn": {
        "name": "personInfoForBirth.personFirstNameBn",
        "label": "personFirstNameBn"
    },
    "personLastNameBn": {
        "name": "personInfoForBirth.personLastNameBn",
        "label": "personLastNameBn"
    },
    "personFirstNameEn": {
        "name": "personInfoForBirth.personFirstNameEn",
        "label": "personFirstNameEn"
    },
    "personLastNameEn": {
        "name": "personInfoForBirth.personLastNameEn",
        "label": "personLastNameEn"
    },
    "personBirthDate": {
        "name": "personInfoForBirth.personBirthDate",
        "label": "personBirthDate"
    },
    "thChild": {
        "name": "personInfoForBirth.thChild",
        "label": "thChild"
    },
    "gender": {
        "name": "personInfoForBirth.gender",
        "label": "gender"
    },
    "personNid": {
        "name": "personInfoForBirth.personNid",
        "label": "personNid"
    },
    "birthPlaceCountry": {
        "name": "birthPlaceCountry",
        "label": "birthPlaceCountry"
    },
    "birthPlaceDiv": {
        "name": "birthPlaceDiv",
        "label": "birthPlaceDiv"
    },
    "birthPlaceDist": {
        "name": "birthPlaceDist",
        "label": "birthPlaceDist"
    },
    "birthPlaceCityCorpCantOrUpazila": {
        "name": "birthPlaceCityCorpCantOrUpazila",
        "label": "birthPlaceCityCorpCantOrUpazila"
    },
    "birthPlacePaurasavaOrUnion": {
        "name": "birthPlacePaurasavaOrUnion",
        "label": "birthPlacePaurasavaOrUnion"
    },
    "birthPlaceWardInPaurasavaOrUnion": {
        "name": "birthPlaceWardInPaurasavaOrUnion",
        "label": "birthPlaceWardInPaurasavaOrUnion"
    },
    "birthPlacePostOfc": {
        "name": "birthPlacePostOfc",
        "label": "birthPlacePostOfc"
    },
    "birthPlacePostOfcEn": {
        "name": "birthPlacePostOfcEn",
        "label": "birthPlacePostOfcEn"
    },
    "birthPlaceVilAreaTownBn": {
        "name": "birthPlaceVilAreaTownBn",
        "label": "birthPlaceVilAreaTownBn"
    },
    "birthPlaceVilAreaTownEn": {
        "name": "birthPlaceVilAreaTownEn",
        "label": "birthPlaceVilAreaTownEn"
    },
    "birthPlaceHouseRoadBn": {
        "name": "birthPlaceHouseRoadBn",
        "label": "birthPlaceHouseRoadBn"
    },
    "birthPlaceHouseRoadEn": {
        "name": "birthPlaceHouseRoadEn",
        "label": "birthPlaceHouseRoadEn"
    },
    "fatherBrn": {
        "name": "personInfoForBirth.father.ubrn",
        "label": "fatherBrn"
    },
    "fatherBirthDate": {
        "name": "personInfoForBirth.father.personBirthDate",
        "label": "fatherBirthDate"
    },
    "fatherNameBn": {
        "name": "personInfoForBirth.father.personNameBn",
        "label": "fatherNameBn"
    },
    "fatherNameEn": {
        "name": "personInfoForBirth.father.personNameEn",
        "label": "fatherNameEn"
    },
    "fatherNationality": {
        "name": "personInfoForBirth.father.personNationality",
        "label": "fatherNationality"
    },
    "motherBrn": {
        "name": "personInfoForBirth.mother.ubrn",
        "label": "motherBrn"
    },
    "motherBirthDate": {
        "name": "personInfoForBirth.mother.personBirthDate",
        "label": "motherBirthDate"
    },
    "motherNameBn": {
        "name": "personInfoForBirth.mother.personNameBn",
        "label": "motherNameBn"
    },
    "motherNameEn": {
        "name": "personInfoForBirth.mother.personNameEn",
        "label": "motherNameEn"
    },
    "motherNationality": {
        "name": "personInfoForBirth.mother.personNationality",
        "label": "motherNationality"
    }
};

export const BDRIS_DUMMY_PROFILE = {
    "id": "p_bdris_dummy",
    "name": "BDRIS Default Profile",
    "site": "bdris",
    "data": {
        "personFirstNameBn": "",
        "personLastNameBn": "",
        "personFirstNameEn": "",
        "personLastNameEn": "",
        "personBirthDate": "",
        "thChild": "",
        "gender": "",
        "personNid": "",
        "birthPlaceCountry": "",
        "birthPlaceDiv": "",
        "birthPlaceDist": "",
        "birthPlaceCityCorpCantOrUpazila": "",
        "birthPlacePaurasavaOrUnion": "",
        "birthPlaceWardInPaurasavaOrUnion": "",
        "birthPlacePostOfc": "",
        "birthPlacePostOfcEn": "",
        "birthPlaceVilAreaTownBn": "",
        "birthPlaceVilAreaTownEn": "",
        "birthPlaceHouseRoadBn": "",
        "birthPlaceHouseRoadEn": "",
        "fatherBrn": "",
        "fatherBirthDate": "",
        "fatherNameBn": "",
        "fatherNameEn": "",
        "fatherNationality": "",
        "motherBrn": "",
        "motherBirthDate": "",
        "motherNameBn": "",
        "motherNameEn": "",
        "motherNationality": ""
    }
};"""

with open("modules/bdris_config.js", "w", encoding="utf-8") as f:
    f.write(bdris_config)
