import { BDRIS_FIELDS, BDRIS_DUMMY_PROFILE } from './modules/bdris_config.js';
import { TELETALK_FIELDS, TELETALK_DUMMY_PROFILE } from './modules/teletalk_config.js';
import { INDIAN_VISA_FIELDS, INDIAN_VISA_DUMMY_PROFILE } from './modules/indian_visa_config.js';

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
            chrome.storage.local.get(['profiles', 'lastActiveProfileId'], (result) => {
                profiles = result.profiles || [];

                // Initialize with dummy profiles if empty
                if (profiles.length === 0) {
                    profiles.push(BDRIS_DUMMY_PROFILE);
                    profiles.push(TELETALK_DUMMY_PROFILE);
                    profiles.push(INDIAN_VISA_DUMMY_PROFILE);
                }

                // Restore last active profile if it exists
                if (result.lastActiveProfileId) {
                    currentProfileId = result.lastActiveProfileId;
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

        if (currentProfileId && profiles.find(p => p.id === currentProfileId)) {
            profileSelector.value = currentProfileId;
        } else if (profiles.length > 0) {
            currentProfileId = profiles[0].id;
            profileSelector.value = currentProfileId;
            // Save the default if we fell back to it
            chrome.storage.local.set({ lastActiveProfileId: currentProfileId });
        }
    }

    function getCurrentProfile() {
        return profiles.find(p => p.id === currentProfileId);
    }

    async function switchProfile(profileId) {
        currentProfileId = profileId;
        chrome.storage.local.set({ lastActiveProfileId: currentProfileId }); // Persist selection
        const profile = getCurrentProfile();
        if (profile) {
            displayProfile(profile);
        }
    }

    // ====================
    // Modal & Wizard Logic
    // ====================

    const modal = document.getElementById('profileModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    // Wizard State
    let wizardState = {
        name: '',
        site: '',
        method: ''
    };

    function openModal() {
        modal.classList.remove('hidden');
        resetWizard();
    }

    function closeModal() {
        modal.classList.add('hidden');
    }

    function resetWizard() {
        wizardState = { name: '', site: '', method: '' };
        document.getElementById('newProfileName').value = '';
        document.querySelectorAll('input[name="siteSelect"]').forEach(el => el.checked = false);

        showStep(1);
    }

    function showStep(stepNum) {
        step1.classList.add('hidden');
        step2.classList.add('hidden');
        step3.classList.add('hidden');

        if (stepNum === 1) step1.classList.remove('hidden');
        if (stepNum === 2) step2.classList.remove('hidden');
        if (stepNum === 3) step3.classList.remove('hidden');
    }

    // Step 1: Name
    document.getElementById('step1Next').addEventListener('click', () => {
        const name = document.getElementById('newProfileName').value.trim();
        if (!name) {
            alert('Please enter a profile name.');
            return;
        }
        wizardState.name = name;
        showStep(2);
    });

    // Step 2: Site
    document.getElementById('step2Next').addEventListener('click', () => {
        const selectedSite = document.querySelector('input[name="siteSelect"]:checked');
        if (!selectedSite) {
            alert('Please select a site template.');
            return;
        }
        wizardState.site = selectedSite.value;
        showStep(3);
    });

    document.getElementById('step2Back').addEventListener('click', () => showStep(1));

    // Step 3: Method
    document.getElementById('methodManual').addEventListener('click', () => finishWizard('manual'));
    document.getElementById('methodScan').addEventListener('click', () => finishWizard('scan'));
    document.getElementById('step3Back').addEventListener('click', () => showStep(2));

    closeModalBtn.addEventListener('click', closeModal);

    async function finishWizard(method) {
        wizardState.method = method;
        await createProfileFromWizard();
        closeModal();

        if (method === 'scan') {
            // Highlight extraction area
            const extractionSection = document.querySelector('#doc-upload').closest('.card');
            extractionSection.scrollIntoView({ behavior: 'smooth' });
            extractionSection.style.border = '2px solid #2563eb';
            setTimeout(() => extractionSection.style.border = 'none', 2000);
            alert('Profile created! Now upload a document to extract data.');
        }
    }

    async function createProfileFromWizard() {
        let initialData = {};

        // Load template based on site
        if (wizardState.site === 'bdris') {
            initialData = { ...BDRIS_FIELDS };
        } else if (wizardState.site === 'teletalk') {
            initialData = { ...TELETALK_FIELDS };
        } else if (wizardState.site === 'indian_visa') {
            initialData = { ...INDIAN_VISA_FIELDS };
        }

        const newProfile = {
            id: 'profile_' + Date.now(),
            name: wizardState.name,
            site: wizardState.site, // Store the site type
            data: initialData,
            profilePic: null
        };

        profiles.push(newProfile);
        await saveProfiles();
        currentProfileId = newProfile.id;
        chrome.storage.local.set({ lastActiveProfileId: currentProfileId }); // Persist new profile
        updateProfileSelector();
        displayProfile(newProfile);
    }

    // Replaces old createNewProfile
    function createNewProfile() {
        openModal();
    }

    // ... (rest of the file)

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

        // Update header or show site info if needed (optional)
        // console.log(`Displaying profile: ${profile.name} (${profile.site})`);
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

        const profile = getCurrentProfile();
        if (!profile) {
            alert('Please select or create a profile first.');
            return;
        }

        extractionStatus.textContent = '⏳ Extracting data...';
        extractionStatus.style.color = '#3b82f6';

        // Get keys from current profile to guide extraction
        const targetFields = Object.keys(profile.data);

        const reader = new FileReader();
        reader.onload = async function (e) {
            const base64 = e.target.result;

            chrome.runtime.sendMessage({
                action: 'EXTRACT_DATA',
                payload: {
                    image: base64,
                    targetFields: targetFields
                }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    extractionStatus.textContent = '✗ Error: ' + chrome.runtime.lastError.message;
                    extractionStatus.style.color = '#ef4444';
                } else if (response && response.success) {
                    if (profile) {
                        // Merge extracted data into current profile, filtering strictly
                        const extracted = response.data;
                        let updateCount = 0;

                        Object.keys(extracted).forEach(key => {
                            // Only update if the key exists in the profile
                            if (profile.data.hasOwnProperty(key)) {
                                profile.data[key] = extracted[key];
                                updateCount++;
                            }
                        });

                        displayProfile(profile);
                        extractionStatus.textContent = `✓ Data extracted successfully! (${updateCount} fields updated)`;
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
