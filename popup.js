const autofillBtn = document.getElementById('autofill-btn');
const optionsBtn = document.getElementById('options-btn');
const loginRequired = document.getElementById('login-required');
const popupContent = document.getElementById('popup-content');
const loginSettingsBtn = document.getElementById('login-settings-btn');
const popupEmail = document.getElementById('popup-email');
const popupPlan = document.getElementById('popup-plan');
const popupLimits = document.getElementById('popup-limits');

const SERVER_URL = 'https://nexitsolution.bd/'; // Change this to your production domain later

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['supabaseSession', 'nextAiServerUrl'], async (result) => {
        if (result.supabaseSession && result.supabaseSession.access_token) {
            loginRequired.classList.add('hidden');
            popupContent.classList.remove('hidden');
            popupEmail.textContent = result.supabaseSession.user.email;

            fetchLimits(result.supabaseSession.access_token, result.nextAiServerUrl || SERVER_URL);
        } else {
            loginRequired.classList.remove('hidden');
            popupContent.classList.add('hidden');
        }
    });
});

async function fetchLimits(token, serverUrl) {
    try {
        const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
        const response = await fetch(`${baseUrl}/api/extension/check-limit`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
            const autoUsed = data.autofill?.used ?? (data.used || 0);
            const autoLimit = data.autofill?.limit ?? (data.limit || 1);
            const autoPercentage = Math.min(100, (autoUsed / autoLimit) * 100);

            const extUsed = data.extraction?.used ?? 0;
            const extLimit = data.extraction?.limit ?? 1;
            const extPercentage = Math.min(100, (extUsed / extLimit) * 100);

            const planName = data.plan ? data.plan.replace('_', ' ') : 'Free';

            popupPlan.textContent = planName;
            popupLimits.innerHTML = `
                <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 12px;">
                    <!-- Autofill Limit -->
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 11px; align-items: center; margin-bottom: 4px;">
                            <span style="color: #64748b; font-weight: 500; letter-spacing: -0.025em;">Form Fills</span>
                            <span style="color: #334155; font-weight: 700;">${autoUsed} / ${autoLimit}</span>
                        </div>
                        <div style="width: 100%; height: 6px; background-color: #f1f5f9; border-radius: 999px; overflow: hidden;">
                            <div style="width: ${autoPercentage}%; height: 100%; background-color: #3b82f6; transition: width 0.5s;"></div>
                        </div>
                    </div>

                    <!-- Extraction Limit -->
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 11px; align-items: center; margin-bottom: 4px;">
                            <span style="color: #64748b; font-weight: 500; letter-spacing: -0.025em;">Extractions</span>
                            <span style="color: #334155; font-weight: 700;">${extUsed} / ${extLimit}</span>
                        </div>
                        <div style="width: 100%; height: 6px; background-color: #f1f5f9; border-radius: 999px; overflow: hidden;">
                            <div style="width: ${extPercentage}%; height: 100%; background-color: #10b981; transition: width 0.5s;"></div>
                        </div>
                    </div>
                </div>
            `;
            if ((data.autofill?.remaining ?? data.remaining) <= 0) {
                autofillBtn.disabled = true;
                autofillBtn.textContent = 'Limit Reached';
            }
        } else {
            console.error('API Error:', data);
            popupLimits.innerHTML = `
                <div class="text-xs text-red-500 mt-2 text-center bg-red-50 p-2 rounded-md">
                    ${data.error || 'Failed to sync with server. Please re-login in Settings.'}
                </div>
            `;
            autofillBtn.disabled = true;
            autofillBtn.textContent = 'Authentication Error';
        }
    } catch (e) {
        console.error('Failed to fetch limits:', e);
        popupLimits.innerHTML = `
            <div class="text-xs text-red-500 mt-2 text-center bg-red-50 p-2 rounded-md">
                Unable to reach the server.
            </div>
        `;
        autofillBtn.disabled = true;
        autofillBtn.textContent = 'Connection Error';
    }
}

autofillBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "triggerAutofill" });
    });
});

optionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

loginSettingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});
