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

    // Configuration
    const SERVER_URL = 'http://localhost:3000'; // Change this to your production domain later

    // Server & Login Elements
    const loginFormContainer = document.getElementById('loginFormContainer');
    const loginEmailInput = document.getElementById('loginEmailInput');
    const loginPasswordInput = document.getElementById('loginPasswordInput');
    const loginBtn = document.getElementById('loginBtn');
    const loginStatus = document.getElementById('loginStatus');
    const loggedInContainer = document.getElementById('loggedInContainer');
    const loggedInEmail = document.getElementById('loggedInEmail');
    const logoutBtn = document.getElementById('logoutBtn');
    const userLimits = document.getElementById('userLimits');
    const mainContent = document.querySelector('main');
    const mainFooter = document.querySelector('footer');

    // Load session
    chrome.storage.local.get(['supabaseSession'], (result) => {
        if (result.supabaseSession) {
            showLoggedIn(result.supabaseSession.user.email);
            fetchLimits(result.supabaseSession.access_token, SERVER_URL);
        } else {
            showLoggedOut();
        }
    });

    function showLoggedIn(email) {
        loginFormContainer.classList.add('hidden');
        loggedInContainer.style.display = 'block';
        loggedInEmail.textContent = email;
        const avatar = document.getElementById('userAvatar');
        if (avatar) avatar.textContent = email.charAt(0).toUpperCase();
        mainContent.classList.remove('hidden');
        mainFooter.classList.remove('hidden');
    }

    function showLoggedOut() {
        loginFormContainer.classList.remove('hidden');
        loggedInContainer.style.display = 'none';
        loggedInEmail.textContent = '';
        mainContent.classList.add('hidden');
        mainFooter.classList.add('hidden');
    }

    async function fetchLimits(token, serverUrl) {
        try {
            const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
            const response = await fetch(`${baseUrl}/api/extension/check-limit`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                // Compatibility layer
                const autoUsed = data.autofill?.used ?? (data.used || 0);
                const autoLimit = data.autofill?.limit ?? (data.limit || 1);
                const autoPercentage = Math.min(100, (autoUsed / autoLimit) * 100);

                const extUsed = data.extraction?.used ?? 0;
                const extLimit = data.extraction?.limit ?? 1;
                const extPercentage = Math.min(100, (extUsed / extLimit) * 100);

                const planName = data.plan ? data.plan.replace('_', ' ') : 'Free';

                userLimits.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <!-- Autofill Limit -->
                        <div>
                            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="padding: 2px 8px; background-color: #eff6ff; color: #2563eb; border-radius: 6px; font-weight: 700; text-transform: uppercase; letter-spacing: -0.025em;">${planName}</span>
                                    <span style="color: #64748b; font-weight: 500;">Form Fills: ${autoUsed}/${autoLimit}</span>
                                </div>
                                <span style="font-weight: 700; color: #2563eb;">${data.autofill?.remaining ?? (data.remaining || 0)} left</span>
                            </div>
                            <div style="width: 100%; height: 6px; background-color: #e2e8f0; border-radius: 999px; overflow: hidden;">
                                <div style="width: ${autoPercentage}%; height: 100%; background-color: #3b82f6; border-radius: 999px; transition: width 0.5s;"></div>
                            </div>
                        </div>

                        <!-- Extraction Limit -->
                        <div>
                            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="color: #64748b; font-weight: 500;">Document Extractions: ${extUsed}/${extLimit}</span>
                                </div>
                                <span style="font-weight: 700; color: #10b981;">${data.extraction?.remaining ?? 0} left</span>
                            </div>
                            <div style="width: 100%; height: 6px; background-color: #e2e8f0; border-radius: 999px; overflow: hidden;">
                                <div style="width: ${extPercentage}%; height: 100%; background-color: #10b981; border-radius: 999px; transition: width 0.5s;"></div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                console.error('API Error:', data);
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
        const serverUrl = SERVER_URL;

        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        loginStatus.textContent = 'Logging in...';
        loginStatus.style.color = '#3b82f6';
        loginBtn.disabled = true;

        try {
            // We use the Supabase Auth directly if possible, or a proxy on the server.
            // Since we want to use the same logic as the web app, let's look at how the web app authenticates.
            // For the extension, it's easier to hit the Supabase API directly if we have the URL and Anon Key.
            // However, the user asked to "use the same supabase login".
            // Let's assume the server has an endpoint for login or we use Supabase directly.
            // Given the context of "Next AI Solution", the Supabase URL is in .env.local.

            const supabaseUrl = "https://yowcwwmswbxutklckwgt.supabase.co"; // Hardcoded for simplicity in extension or fetched from server
            const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvd2N3d21zd2J4dXRrbGNrd2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjMwMDEsImV4cCI6MjA4NTU5OTAwMX0.NLRig5wdJb-NnUEZuHwqsaSEwo7tJt5hKsNsny33S8Y";

            const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseAnonKey,
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
                fetchLimits(data.access_token, serverUrl);
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

        // Profile field labels (the keys) as targets for AI
        const targetFields = Object.keys(profile.data);

        const setStatus = (msg, color = '#3b82f6') => {
            extractionStatus.textContent = msg;
            extractionStatus.style.color = color;
        };

        try {
            setStatus('⏳ Reading document...');

            let payload;

            if (isImage || isPdf) {
                // Image / PDF: send as base64 inline_data for Gemini vision
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
