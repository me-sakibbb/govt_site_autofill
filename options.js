import { BDRIS_FIELDS, BDRIS_DUMMY_PROFILE } from './modules/bdris_config.js';
import { TELETALK_FIELDS, TELETALK_DUMMY_PROFILE } from './modules/teletalk_config.js';

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

    // ====================
    // Profile Management
    // ====================

    async function loadProfiles() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['profiles'], (result) => {
                profiles = result.profiles || [];

                // Initialize with dummy profiles if empty
                if (profiles.length === 0) {
                    profiles.push(BDRIS_DUMMY_PROFILE);
                    profiles.push(TELETALK_DUMMY_PROFILE);
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

        // Ask user for template type
        const type = prompt('Enter template type (1 for BDRIS, 2 for Teletalk, leave empty for blank):');

        let initialData = {};
        if (type === '1') {
            initialData = { ...BDRIS_FIELDS };
        } else if (type === '2') {
            initialData = { ...TELETALK_FIELDS };
        }

        const newProfile = {
            id: 'profile_' + Date.now(),
            name: name,
            data: initialData,
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
