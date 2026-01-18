// import { BDRIS_FIELDS } from './modules/bdris.js'; // Removed dependency

document.addEventListener('DOMContentLoaded', () => {
    const fieldsContainer = document.getElementById('fieldsContainer');
    const addFieldBtn = document.getElementById('addFieldBtn');
    const saveBtn = document.getElementById('saveBtn');
    const extractBtn = document.getElementById('extractBtn');
    const docInput = document.getElementById('docInput');
    const profilePicInput = document.getElementById('profilePicInput');
    const profilePicPreview = document.getElementById('profilePicPreview');
    const extractionStatus = document.getElementById('extractionStatus');
    const saveStatus = document.getElementById('saveStatus');

    // Profile Elements
    const profileSelector = document.getElementById('profileSelector');
    const newProfileBtn = document.getElementById('newProfileBtn');
    const deleteProfileBtn = document.getElementById('deleteProfileBtn');

    let profiles = [];
    let currentProfileId = null;

    // Comprehensive fields matching site_1.txt form
    const defaultFields = {
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

    // Comprehensive Dummy Data with DD/MM/YYYY dates
    const dummyProfile = {
        id: 'dummy_1',
        name: 'আব্দুর রহমান (Sample)',
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

    // ====================
    // Profile Management
    // ====================

    async function loadProfiles() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['profiles'], (result) => {
                profiles = result.profiles || [];

                // Initialize with dummy profile if empty
                if (profiles.length === 0) {
                    profiles.push(dummyProfile);
                }

                resolve();
            });
        });
    }

    function saveProfiles() {
        return new Promise((resolve) => {
            chrome.storage.local.set({ profiles }, resolve);
        });
    }

    function updateProfileSelector() {
        profileSelector.innerHTML = '';
        profiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.id;
            option.textContent = profile.name;
            profileSelector.appendChild(option);
        });

        if (currentProfileId) {
            profileSelector.value = currentProfileId;
        } else if (profiles.length > 0) {
            currentProfileId = profiles[0].id;
            profileSelector.value = currentProfileId;
        }
    }

    function getCurrentProfile() {
        return profiles.find(p => p.id === currentProfileId);
    }

    async function switchProfile(profileId) {
        currentProfileId = profileId;
        const profile = getCurrentProfile();
        if (profile) {
            displayProfile(profile);
        }
    }

    async function createNewProfile() {
        const name = prompt('Enter profile name:');
        if (!name) return;

        const newProfile = {
            id: 'profile_' + Date.now(),
            name: name,
            data: { ...defaultFields },
            profilePic: null
        };

        profiles.push(newProfile);
        await saveProfiles();
        currentProfileId = newProfile.id;
        updateProfileSelector();
        displayProfile(newProfile);
    }

    async function deleteCurrentProfile() {
        if (profiles.length <= 1) {
            alert('Cannot delete the last profile!');
            return;
        }

        if (!confirm('Are you sure you want to delete this profile?')) return;

        profiles = profiles.filter(p => p.id !== currentProfileId);
        await saveProfiles();
        currentProfileId = profiles[0].id;
        updateProfileSelector();
        displayProfile(getCurrentProfile());
    }

    function displayProfile(profile) {
        // Display profile picture
        if (profile.profilePic) {
            profilePicPreview.innerHTML = `<img src="${profile.profilePic}" style="max-width: 100%; max-height: 200px; border-radius: 4px;">`;
        } else {
            profilePicPreview.innerHTML = '<span class="placeholder-text">No image selected</span>';
        }

        // Display fields
        fieldsContainer.innerHTML = '';
        Object.entries(profile.data).forEach(([key, value]) => {
            addFieldRow(key, value);
        });
    }

    // ====================
    // Field Management
    // ====================

    function addFieldRow(key = '', value = '') {
        const template = document.getElementById('fieldTemplate');
        const row = template.content.cloneNode(true).querySelector('.field-row');

        row.querySelector('.field-key').value = key;
        row.querySelector('.field-value').value = value;

        row.querySelector('.remove-field-btn').addEventListener('click', () => {
            row.remove();
        });

        fieldsContainer.appendChild(row);
    }

    function collectFieldData() {
        const data = {};
        const rows = fieldsContainer.querySelectorAll('.field-row');
        rows.forEach(row => {
            const key = row.querySelector('.field-key').value.trim();
            const value = row.querySelector('.field-value').value.trim();
            if (key) {
                data[key] = value;
            }
        });
        return data;
    }

    // ====================
    // Save & Load
    // ====================

    async function saveCurrentProfile() {
        const profile = getCurrentProfile();
        if (!profile) return;

        profile.data = collectFieldData();
        await saveProfiles();

        saveStatus.textContent = '✓ Profile saved!';
        saveStatus.style.color = '#10b981';
        setTimeout(() => saveStatus.textContent = '', 3000);
    }

    // ====================
    // Profile Picture Upload
    // ====================

    profilePicInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            const profile = getCurrentProfile();
            if (profile) {
                profile.profilePic = event.target.result;
                saveProfiles();
                profilePicPreview.innerHTML = `<img src="${event.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 4px;">`;
            }
        };
        reader.readAsDataURL(file);
    });

    // ====================
    // Document Extraction with AI
    // ====================

    extractBtn.addEventListener('click', async () => {
        const file = docInput.files[0];
        if (!file) {
            alert('Please select a document first.');
            return;
        }

        extractionStatus.textContent = '⏳ Extracting data...';
        extractionStatus.style.color = '#3b82f6';

        const reader = new FileReader();
        reader.onload = async function (e) {
            const base64 = e.target.result;

            chrome.runtime.sendMessage({
                action: 'EXTRACT_DATA',
                payload: {
                    image: base64
                }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    extractionStatus.textContent = '✗ Error: ' + chrome.runtime.lastError.message;
                    extractionStatus.style.color = '#ef4444';
                } else if (response && response.success) {
                    const profile = getCurrentProfile();
                    if (profile) {
                        // Merge extracted data into current profile
                        Object.assign(profile.data, response.data);
                        displayProfile(profile);
                        extractionStatus.textContent = '✓ Data extracted successfully!';
                        extractionStatus.style.color = '#10b981';
                    }
                } else {
                    extractionStatus.textContent = '✗ Extraction failed: ' + (response?.error || 'Unknown error');
                    extractionStatus.style.color = '#ef4444';
                }
            });
        };
        reader.readAsDataURL(file);
    });

    // ====================
    // Event Listeners
    // ====================

    addFieldBtn.addEventListener('click', () => addFieldRow());
    saveBtn.addEventListener('click', saveCurrentProfile);
    profileSelector.addEventListener('change', (e) => switchProfile(e.target.value));
    newProfileBtn.addEventListener('click', createNewProfile);
    deleteProfileBtn.addEventListener('click', deleteCurrentProfile);

    // ====================
    // Initialize
    // ====================

    (async () => {
        await loadProfiles();
        updateProfileSelector();
        const profile = getCurrentProfile();
        if (profile) {
            displayProfile(profile);
        }
    })();
});
