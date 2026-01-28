export const BDRIS_FIELDS = {
    "Office Address Type": "", // BIRTHPLACE, PERMANENT, MISSION
    "Child Name (Bangla)": "",
    "Child Name (English)": "",
    "Gender": "",
    "Date of Birth": "", // DD/MM/YYYY
    "Place of Birth (Bangla)": "",
    "Place of Birth (English)": "",
    "Type of Birth": "",
    "Child Number (of Parents)": "",

    "Father's Name (Bangla)": "",
    "Father's Name (English)": "",
    "Father's Nationality": "",
    "Father's Birth Registration Number": "",
    "Father's National ID": "",
    "Father's Date of Birth": "",
    "Father's Place of Birth": "",
    "Father's Occupation": "",
    "Father's Education": "",

    "Mother's Name (Bangla)": "",
    "Mother's Name (English)": "",
    "Mother's Nationality": "",
    "Mother's Birth Registration Number": "",
    "Mother's National ID": "",
    "Mother's Date of Birth": "",
    "Mother's Place of Birth": "",
    "Mother's Occupation": "",
    "Mother's Education": "",

    "Permanent Address Country": "",
    "Permanent Address Division": "",
    "Permanent Address District": "",
    "Permanent Address Upazila": "",
    "Permanent Address Union/Pourashava": "",
    "Permanent Address Ward": "",
    "Permanent Address Post Office (Bangla)": "",
    "Permanent Address Post Office (English)": "",
    "Permanent Address Village/Area (Bangla)": "",
    "Permanent Address Village/Area (English)": "",
    "Permanent Address House & Road (Bangla)": "",
    "Permanent Address House & Road (English)": "",
    "Permanent Address Post Code": "",

    "Present Address Same as Permanent": "Yes",
    "Present Address Country": "",
    "Present Address Division": "",
    "Present Address District": "",
    "Present Address Upazila": "",
    "Present Address Union/Pourashava": "",
    "Present Address Ward": "",
    "Present Address Post Office (Bangla)": "",
    "Present Address Post Office (English)": "",
    "Present Address Village/Area (Bangla)": "",
    "Present Address Village/Area (English)": "",
    "Present Address House & Road (Bangla)": "",
    "Present Address House & Road (English)": "",
    "Present Address Post Code": "",

    "Applicant Type": "",
    "Applicant Mobile Number": "",
    "Applicant Email": "",
    "Relation with Child": ""
};

export const BDRIS_DUMMY_PROFILE = {
    id: 'bdris_dummy',
    name: 'BDRIS Sample Profile',
    data: {
        // Office Address Selection
        "Office Address Type": "BIRTHPLACE",

        // Child/Person Information
        "Child Name (Bangla)": "আব্দুর রহমান আহমেদ",
        "Child Name (English)": "Abdur Rahman Ahmed",
        "Gender": "Male",
        "Date of Birth": "15/07/2020", // DD/MM/YYYY format
        "Place of Birth (Bangla)": "ঢাকা মেডিকেল কলেজ হাসপাতাল",
        "Place of Birth (English)": "Dhaka Medical College Hospital",
        "Type of Birth": "SINGLE",
        "Child Number (of Parents)": "1", // First child

        // Father's Information
        "Father's Name (Bangla)": "মোহাম্মদ আহমেদ হোসেন",
        "Father's Name (English)": "Mohammad Ahmed Hossain",
        "Father's Nationality": "Bangladeshi",
        "Father's Birth Registration Number": "19901234567890123",
        "Father's National ID": "1234567890123",
        "Father's Date of Birth": "20/03/1990", // DD/MM/YYYY format
        "Father's Place of Birth": "Dhaka",
        "Father's Occupation": "Software Engineer",
        "Father's Education": "Bachelor's Degree",

        // Mother's Information
        "Mother's Name (Bangla)": "ফাতেমা খাতুন",
        "Mother's Name (English)": "Fatema Khatun",
        "Mother's Nationality": "Bangladeshi",
        "Mother's Birth Registration Number": "19921234567890123",
        "Mother's National ID": "9876543210987",
        "Mother's Date of Birth": "10/05/1992", // DD/MM/YYYY format
        "Mother's Place of Birth": "Chittagong",
        "Mother's Occupation": "Teacher",
        "Mother's Education": "Master's Degree",

        // Permanent Address
        "Permanent Address Country": "Bangladesh",
        "Permanent Address Division": "ঢাকা বিভাগ",
        "Permanent Address District": "ঢাকা",
        "Permanent Address Upazila": "মিরপুর",
        "Permanent Address Union/Pourashava": "মিরপুর পৌরসভা",
        "Permanent Address Ward": "৫",
        "Permanent Address Post Office (Bangla)": "মিরপুর",
        "Permanent Address Post Office (English)": "Mirpur",
        "Permanent Address Village/Area (Bangla)": "শাহবাগ এলাকা",
        "Permanent Address Village/Area (English)": "Shahbagh Area",
        "Permanent Address House & Road (Bangla)": "বাসা ১২, রোড ৫, ব্লক এ",
        "Permanent Address House & Road (English)": "House 12, Road 5, Block A",
        "Permanent Address Post Code": "1216",

        // Present Address
        "Present Address Same as Permanent": "Yes",
        "Present Address Country": "Bangladesh",
        "Present Address Division": "ঢাকা বিভাগ",
        "Present Address District": "ঢাকা",
        "Present Address Upazila": "মিরপুর",
        "Present Address Union/Pourashava": "মিরপুর পৌরসভা",
        "Present Address Ward": "৫",
        "Present Address Post Office (Bangla)": "মিরপুর",
        "Present Address Post Office (English)": "Mirpur",
        "Present Address Village/Area (Bangla)": "শাহবাগ এলাকা",
        "Present Address Village/Area (English)": "Shahbagh Area",
        "Present Address House & Road (Bangla)": "বাসা ১২, রোড ৫, ব্লক এ",
        "Present Address House & Road (English)": "House 12, Road 5, Block A",
        "Present Address Post Code": "1216",

        // Applicant Information
        "Applicant Type": "FATHER",
        "Applicant Mobile Number": "+880 1712-345678",
        "Applicant Email": "ahmed.hossain@example.com",
        "Relation with Child": "Father"
    },
    profilePic: null
};
