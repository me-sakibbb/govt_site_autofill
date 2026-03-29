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

    // Doc Extractor UI refs
    const docFileInfo = document.getElementById('docFileInfo');
    const docFileName = document.getElementById('docFileName');
    const docFileSize = document.getElementById('docFileSize');
    const docClearBtn = document.getElementById('docClearBtn');
    const docDropZone = document.getElementById('docDropZone');
    const docDropLabel = document.getElementById('docDropLabel');

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function showFileInfo(file) {
        docDropZone.style.display = 'none';
        docFileInfo.style.display = 'flex';
        docFileName.textContent = file.name;
        docFileSize.textContent = formatBytes(file.size);
    }

    function clearFile() {
        docInput.value = '';
        docFileInfo.style.display = 'none';
        docDropZone.style.display = 'flex';
        extractionStatus.textContent = '';
        extractionStatus.style.color = '';
    }

    if (docInput) {
        docInput.addEventListener('change', () => {
            if (docInput.files && docInput.files[0]) showFileInfo(docInput.files[0]);
        });
    }
    if (docClearBtn) docClearBtn.addEventListener('click', clearFile);

    // Drag & drop visual feedback on the label
    if (docDropZone) {
        docDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            docDropZone.style.borderColor = '#3b82f6';
            docDropZone.style.background = '#eff6ff';
        });
        docDropZone.addEventListener('dragleave', () => {
            docDropZone.style.borderColor = '#cbd5e1';
            docDropZone.style.background = '#f8fafc';
        });
        docDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            docDropZone.style.borderColor = '#cbd5e1';
            docDropZone.style.background = '#f8fafc';
            const files = e.dataTransfer.files;
            if (files && files[0]) {
                // Set file to input for later reading
                const dt = new DataTransfer();
                dt.items.add(files[0]);
                docInput.files = dt.files;
                showFileInfo(files[0]);
            }
        });
    }

    // Profile Elements
    const profileSelector = document.getElementById('profileSelector');
    const newProfileBtn = document.getElementById('newProfileBtn');
    const deleteProfileBtn = document.getElementById('deleteProfileBtn');

    // Configuration (loaded from config.js)

    // Server & Login Elements
    const loginFormContainer = document.getElementById('loginFormContainer');
    const loginEmailInput = document.getElementById('loginEmailInput');
    const loginPasswordInput = document.getElementById('loginPasswordInput');
    const loginBtn = document.getElementById('loginBtn');
    const loginStatus = document.getElementById('loginStatus');
    const loggedInContainer = document.getElementById('loggedInContainer');
    const loggedInEmail = document.getElementById('loggedInEmail');
    const loggedInName = document.getElementById('loggedInName');
    const loggedInShop = document.getElementById('loggedInShop');
    const logoutBtn = document.getElementById('logoutBtn');
    const userLimits = document.getElementById('userLimits');
    const mainContent = document.querySelector('main');
    const mainFooter = document.querySelector('footer');

    // Load session
    chrome.runtime.sendMessage({ action: 'GET_VALID_SESSION' }, (response) => {
        const session = response && response.session;
        if (session) {
            showLoggedIn(session.user.email);
            fetchLimits(session.access_token);
        } else {
            showLoggedOut();
        }
    });

    function showLoggedIn(email, name = '', shop = '') {
        loginFormContainer.classList.add('hidden');
        loggedInContainer.style.display = 'block';
        
        if (loggedInEmail) loggedInEmail.textContent = email || '';
        if (loggedInName) loggedInName.textContent = name || '';
        if (loggedInShop) loggedInShop.textContent = shop || 'Loading Shop...';

        const avatar = document.getElementById('userAvatar');
        if (avatar && email) avatar.textContent = email.charAt(0).toUpperCase();

        mainContent.classList.remove('hidden');
        mainFooter.classList.remove('hidden');
    }

    function showLoggedOut() {
        loginFormContainer.classList.remove('hidden');
        loggedInContainer.style.display = 'none';
        
        if (loggedInEmail) loggedInEmail.textContent = '';
        if (loggedInName) loggedInName.textContent = '';
        if (loggedInShop) loggedInShop.textContent = '';

        mainContent.classList.add('hidden');
        mainFooter.classList.add('hidden');
    }

    async function fetchLimits(token) {
        try {
            const response = await fetch(`${CONFIG.SERVER_URL}/api/extension/check-limit`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                // Setup profile headers if they arrived
                if (data.email) {
                    showLoggedIn(data.email, data.userName, data.shopName);
                }

                // Extration limits
                const extUsed = data.extraction?.used ?? 0;
                const extLimit = data.extraction?.limit ?? 1;
                const extRemaining = data.extraction?.remaining ?? 0;
                const extPercentage = Math.min(100, (extUsed / extLimit) * 100);

                const planName = data.plan ? data.plan.replace('_', ' ') : 'Free';
                
                let upgradeMessage = '';
                if (extRemaining <= 0) {
                    upgradeMessage = `
                        <div style="font-size: 13px; margin-top: 12px; padding: 12px; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; color: #c53030;">
                            <div style="font-weight: 600; margin-bottom: 2px;">Limit Reached!</div>
                            <div style="margin-bottom: 6px;">Extractions now cost 1 Taka/each from your balance.</div>
                            <a href="${CONFIG.SERVER_URL}/dashboard/billing" target="_blank" style="display: inline-block; padding: 6px 12px; background: #e53e3e; color: white; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 12px; transition: background 0.2s;">Upgrade Subscription</a>
                        </div>
                    `;
                }

                userLimits.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <!-- Extraction Limit -->
                        <div>
                            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="padding: 2px 8px; background-color: #eff6ff; color: #2563eb; border-radius: 6px; font-weight: 700; text-transform: uppercase; letter-spacing: -0.025em;">${planName}</span>
                                    <span style="color: #64748b; font-weight: 500;">Document Extractions: ${extUsed}/${extLimit}</span>
                                </div>
                                <span style="font-weight: 700; color: ${extRemaining <= 0 ? '#ef4444' : '#10b981'};">${extRemaining} left</span>
                            </div>
                            <div style="width: 100%; height: 6px; background-color: #e2e8f0; border-radius: 999px; overflow: hidden;">
                                <div style="width: ${extPercentage}%; height: 100%; background-color: ${extRemaining <= 0 ? '#ef4444' : '#10b981'}; border-radius: 999px; transition: width 0.5s;"></div>
                            </div>
                            ${upgradeMessage}
                        </div>
                    </div>
                `;
            } else {
                console.error('API Error:', data);
                if (response.status === 401 || response.status === 403 || (data.error && data.error.toLowerCase().includes('token'))) {
                    chrome.storage.local.remove(['supabaseSession'], () => {
                        showLoggedOut();
                    });
                    return;
                }
                userLimits.innerHTML = `
                    <div class="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded-md border border-red-100 font-medium">
                        ${data.error || 'Failed to sync with server. Please log out and re-login.'}
                    </div>
                `;
            }
        } catch (e) {
            console.error('Failed to fetch limits:', e);
            userLimits.innerHTML = `
                <div class="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded-md border border-red-100 font-medium">
                    Connection error. Please check your internet or server URL.
                </div>
            `;
        }
    }

    loginBtn.addEventListener('click', async () => {
        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value.trim();

        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        loginStatus.textContent = 'Logging in...';
        loginStatus.style.color = '#3b82f6';
        loginBtn.disabled = true;

        try {

            const response = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': CONFIG.SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error_description || data.error || 'Login failed');
            }

            chrome.storage.local.set({ supabaseSession: data }, () => {
                loginStatus.textContent = 'Login successful!';
                loginStatus.style.color = '#10b981';
                showLoggedIn(data.user.email);
                fetchLimits(data.access_token);
                setTimeout(() => loginStatus.textContent = '', 3000);
            });
        } catch (error) {
            loginStatus.textContent = error.message;
            loginStatus.style.color = '#ef4444';
        } finally {
            loginBtn.disabled = false;
        }
    });

    logoutBtn.addEventListener('click', () => {
        chrome.storage.local.remove('supabaseSession', () => {
            showLoggedOut();
        });
    });

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
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        resetWizard();
    }

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function resetWizard() {
        wizardState = { name: '', site: '', method: '' };
        document.getElementById('newProfileName').value = '';
        document.querySelectorAll('input[name="siteSelect"]').forEach(el => el.checked = false);

        showStep(1);
    }

    function showStep(stepNum) {
        step1.style.display = 'none';
        step2.style.display = 'none';
        step3.style.display = 'none';

        if (stepNum === 1) step1.style.display = 'block';
        if (stepNum === 2) step2.style.display = 'block';
        if (stepNum === 3) step3.style.display = 'block';
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
            const extractionSection = document.getElementById('doc-upload-section');
            if (extractionSection) {
                extractionSection.scrollIntoView({ behavior: 'smooth' });
                extractionSection.style.border = '2px solid #2563eb';
                setTimeout(() => extractionSection.style.border = '1px solid #e2e8f0', 2000);
            }
            alert('Profile created! Now upload a document to extract data.');
        }
    }

    async function createProfileFromWizard() {
        let initialData = {};

        // Load template based on site
        if (wizardState.site === 'bdris') {
            initialData = { ...BDRIS_DUMMY_PROFILE.data };
        } else if (wizardState.site === 'teletalk') {
            initialData = { ...TELETALK_DUMMY_PROFILE.data };
        } else if (wizardState.site === 'indian_visa') {
            initialData = { ...INDIAN_VISA_DUMMY_PROFILE.data };
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
        // Display fields
        fieldsContainer.innerHTML = '';
        Object.entries(profile.data).forEach(([key, value]) => {
            addFieldRow(key, value, profile.site);
        });
    }

    // ====================
    // Field Management
    // ====================

    function formatLabel(key, site) {
        let label = key;

        let fieldsObj = null;
        if (site === 'bdris' && typeof BDRIS_FIELDS !== 'undefined') fieldsObj = BDRIS_FIELDS;
        else if (site === 'teletalk' && typeof TELETALK_FIELDS !== 'undefined') fieldsObj = TELETALK_FIELDS;
        else if (site === 'indian_visa' && typeof INDIAN_VISA_FIELDS !== 'undefined') fieldsObj = INDIAN_VISA_FIELDS;

        if (fieldsObj) {
            // Try direct key match
            if (fieldsObj[key] && fieldsObj[key].label) {
                label = fieldsObj[key].label;
            } else {
                // Otherwise try matching the 'name' or 'id' property
                const matchedField = Object.values(fieldsObj).find(f => f.name === key || f.id === key);
                if (matchedField && matchedField.label) {
                    label = matchedField.label;
                }
            }
        }

        // If it's empty, fallback to the key itself    
        return label;
    } function addFieldRow(key = '', value = '', site = '') {
        const template = document.getElementById('fieldTemplate');
        const row = template.content.cloneNode(true).querySelector('.field-row');

        if (key) {
            row.dataset.key = key;
        }

        const keyInput = row.querySelector('.field-key');
        if (key) {
            // Replace the input with a simple text element (span)
            const textLabel = document.createElement('span');
            textLabel.className = 'block w-full text-sm font-medium text-slate-700 truncate px-1';
            textLabel.textContent = formatLabel(key, site);
            keyInput.parentNode.replaceChild(textLabel, keyInput);
        } else {
            keyInput.value = '';
        }

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
            let key = row.dataset.key;
            if (!key) {
                const keyInput = row.querySelector('.field-key');
                key = keyInput ? keyInput.value.trim() : '';
            }
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

        saveStatus.textContent = 'Profile saved successfully';
        saveStatus.style.color = '#10b981';
        setTimeout(() => saveStatus.textContent = '', 3000);
    }

    // ====================
    // Profile Picture Upload (guarded - element may not exist)
    // ====================

    if (profilePicInput) {
        profilePicInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (event) {
                const profile = getCurrentProfile();
                if (profile) {
                    profile.profilePic = event.target.result;
                    saveProfiles();
                    if (profilePicPreview) {
                        profilePicPreview.innerHTML = `<img src="${event.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 4px;">`;
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // ====================
    // Document Extraction with AI
    // ====================

    // Helper: read file as text (for non-image files)
    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // Helper: read file as base64
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Helper: compress image and return as base64
    function compressImageToBase64(file, maxSizeMB = 1.5) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Cap dimensions to save memory and size
                    const MAX_DIMENSION = 1600;
                    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                        if (width > height) {
                            height = Math.round((height * MAX_DIMENSION) / width);
                            width = MAX_DIMENSION;
                        } else {
                            width = Math.round((width * MAX_DIMENSION) / height);
                            height = MAX_DIMENSION;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Try compressing with quality until it fits under maxSizeMB
                    const targetBytes = maxSizeMB * 1024 * 1024;
                    let quality = 0.9;
                    let base64 = canvas.toDataURL('image/jpeg', quality);

                    // base64 size roughly = length * 0.75
                    while (base64.length * 0.75 > targetBytes && quality > 0.1) {
                        quality -= 0.1;
                        base64 = canvas.toDataURL('image/jpeg', quality);
                    }

                    resolve(base64);
                };
                img.onerror = reject;
                img.src = event.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Helper: extract plain text from a DOCX file client-side
    // DOCX = ZIP archive containing word/document.xml (DEFLATE compressed)
    async function extractDocxText(file) {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const decoder = new TextDecoder('utf-8');

        // Read a 4-byte little-endian uint from the buffer
        const readUint32 = (offset) =>
            bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24);
        const readUint16 = (offset) =>
            bytes[offset] | (bytes[offset + 1] << 8);

        // Scan for local file headers: PK\x03\x04
        let offset = 0;
        while (offset < bytes.length - 30) {
            if (bytes[offset] !== 0x50 || bytes[offset + 1] !== 0x4B ||
                bytes[offset + 2] !== 0x03 || bytes[offset + 3] !== 0x04) {
                offset++;
                continue;
            }

            const compression = readUint16(offset + 8);   // 0=stored, 8=deflate
            const compressedSz = readUint32(offset + 18);
            const filenameLen = readUint16(offset + 26);
            const extraLen = readUint16(offset + 28);
            const filename = decoder.decode(bytes.slice(offset + 30, offset + 30 + filenameLen));
            const dataStart = offset + 30 + filenameLen + extraLen;
            const compressedData = bytes.slice(dataStart, dataStart + compressedSz);

            if (filename === 'word/document.xml') {
                let xmlText;

                if (compression === 0) {
                    // Stored (no compression)
                    xmlText = decoder.decode(compressedData);
                } else if (compression === 8) {
                    // DEFLATE — use native DecompressionStream (Chrome 80+)
                    const ds = new DecompressionStream('deflate-raw');
                    const writer = ds.writable.getWriter();
                    const reader = ds.readable.getReader();
                    writer.write(compressedData);
                    writer.close();

                    const chunks = [];
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        chunks.push(value);
                    }

                    // Concatenate chunks
                    const total = chunks.reduce((n, c) => n + c.length, 0);
                    const out = new Uint8Array(total);
                    let pos = 0;
                    for (const chunk of chunks) { out.set(chunk, pos); pos += chunk.length; }

                    xmlText = decoder.decode(out);
                } else {
                    throw new Error(`Unsupported DOCX compression method: ${compression}`);
                }

                // Strip XML tags, decode entities, clean up whitespace
                return xmlText
                    .replace(/<w:p[ />][^>]*>/g, '\n')  // paragraphs → newlines
                    .replace(/<w:br[^>]*\/>/g, '\n')    // line breaks
                    .replace(/<w:tab[^>]*\/>/g, '\t')   // tabs
                    .replace(/<[^>]+>/g, '')              // strip all other tags
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&apos;/g, "'")
                    .replace(/&#x[0-9A-Fa-f]+;/g, ' ')
                    .replace(/[ \t]+/g, ' ')
                    .replace(/\n{3,}/g, '\n\n')
                    .trim();
            }

            // Advance to next entry
            offset = dataStart + compressedSz;
        }

        throw new Error('Could not find document text in DOCX. The file may be corrupted or encrypted.');
    }

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

        // Determine file type
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';
        const isText = file.type === 'text/plain' || file.name.endsWith('.txt');
        const isDocx = file.name.endsWith('.docx') || file.type.includes('wordprocessingml');

        // Profile field labels as targets for AI
        let activeSiteFields = {};
        if (profile.site === 'bdris') activeSiteFields = BDRIS_FIELDS;
        else if (profile.site === 'indian_visa') activeSiteFields = INDIAN_VISA_FIELDS;
        else if (profile.site === 'teletalk') activeSiteFields = TELETALK_FIELDS;

        const targetFields = {};
        Object.keys(profile.data).forEach(key => {
            targetFields[key] = activeSiteFields[key] ? activeSiteFields[key].label : key;
        });

        const setStatus = (msg, color = '#3b82f6') => {
            extractionStatus.textContent = msg;
            extractionStatus.style.color = color;
        };

        try {
            setStatus('⏳ Reading document...');

            let payload;

            if (isImage) {
                setStatus('🖼️ Compressing image...');
                const base64 = await compressImageToBase64(file, 1.5);
                payload = { image: base64, targetFields };
            } else if (isPdf) {
                if (file.size > 3.5 * 1024 * 1024) throw new Error('PDF file is too large (over 3.5MB). Please compress it first to avoid server limits.');
                const base64 = await readFileAsBase64(file);
                payload = { image: base64, targetFields };
            } else if (isText) {
                // Plain text: send content directly
                const text = await readFileAsText(file);
                payload = { textContent: text, targetFields };
            } else if (isDocx) {
                // DOCX: extract text client-side from ZIP/XML, then send as text
                // (Gemini does not support the DOCX MIME type directly)
                setStatus('📄 Parsing DOCX...');
                const text = await extractDocxText(file);
                if (!text || text.length < 10) throw new Error('No readable text found in the DOCX file.');
                console.log('[DOCX] Extracted text preview:', text.substring(0, 300));
                payload = { textContent: text, targetFields };
            } else {
                // Fallback: treat as image
                const base64 = await readFileAsBase64(file);
                payload = { image: base64, targetFields };
            }

            setStatus('🤖 Extracting with AI...');

            chrome.runtime.sendMessage({
                action: 'EXTRACT_DATA',
                payload
            }, (response) => {
                if (chrome.runtime.lastError) {
                    setStatus('✗ ' + chrome.runtime.lastError.message, '#ef4444');
                    return;
                }

                if (response && response.success) {
                    const extracted = response.data;
                    let updateCount = 0;
                    const skipped = [];

                    Object.keys(extracted).forEach(key => {
                        const value = extracted[key];
                        if (!value || value === '') return; // skip empty values

                        if (profile.data.hasOwnProperty(key)) {
                            profile.data[key] = value;
                            updateCount++;
                        } else {
                            skipped.push(key);
                        }
                    });

                    // If AI returned mismatched keys, log them for debug
                    if (skipped.length > 0) {
                        console.warn('Skipped fields (no exact match):', skipped);
                    }

                    saveProfiles();
                    displayProfile(profile);

                    if (updateCount > 0) {
                        setStatus(`✓ ${updateCount} fields filled successfully!`, '#10b981');
                    } else {
                        setStatus('⚠ Extracted data but no fields matched. Try a clearer document.', '#f59e0b');
                    }

                      // Clear the file input after success
                      clearFile();

                      // Refresh limits to show updated extraction usage or balance deduction
                      chrome.runtime.sendMessage({ action: 'GET_VALID_SESSION' }, (sessionResp) => {
                          if (sessionResp && sessionResp.session && sessionResp.session.access_token) {
                              fetchLimits(sessionResp.session.access_token);
                          }
                      });

                  } else {
                      setStatus('✗ ' + (response?.error || 'Extraction failed'), '#ef4444');
                }
            });

        } catch (err) {
            setStatus('✗ ' + err.message, '#ef4444');
        }
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
