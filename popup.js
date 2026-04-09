const autofillBtn = document.getElementById('autofill-btn');
const optionsBtn = document.getElementById('options-btn');
const sidebarBtn = document.getElementById('sidebar-btn');
const loginRequired = document.getElementById('login-required');
const popupContent = document.getElementById('popup-content');
const loginSettingsBtn = document.getElementById('login-settings-btn');
const popupShop = document.getElementById('popup-shop');
const popupPlan = document.getElementById('popup-plan');
const popupLimits = document.getElementById('popup-limits');
const popupBalance = document.getElementById('popup-balance');
const addBalanceBtn = document.getElementById('add-balance-btn');
const newProfileBtn = document.getElementById('new-profile-btn');

document.addEventListener('DOMContentLoaded', () => {
    // Show cached data immediately for faster perceived performance
    chrome.storage.local.get(['cached_shopName', 'cached_balance', 'cached_plan'], (result) => {
        if (result.cached_shopName) popupShop.textContent = result.cached_shopName;
        if (result.cached_balance !== undefined) popupBalance.textContent = `${result.cached_balance} ৳`;
        if (result.cached_plan) popupPlan.textContent = result.cached_plan.replace('_', ' ');
    });

    chrome.runtime.sendMessage({ action: 'GET_VALID_SESSION' }, (response) => {
        const session = response && response.session;
        if (session && session.access_token) {
            loginRequired.classList.add('hidden');
            popupContent.classList.remove('hidden');
            fetchLimits(session.access_token);
        } else {
            loginRequired.classList.remove('hidden');
            popupContent.classList.add('hidden');
        }
    });
});

async function fetchLimits(token) {
    try {
        const response = await fetch(`${CONFIG.SERVER_URL}/api/extension/check-limit`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
            if (data.shopName) {
                popupShop.textContent = data.shopName;
                chrome.storage.local.set({ 'cached_shopName': data.shopName });
            }
            if (data.balance !== undefined) {
                popupBalance.textContent = `${data.balance} ৳`;
                chrome.storage.local.set({ 'cached_balance': data.balance });
            }
            
            if (addBalanceBtn) {
                addBalanceBtn.href = `${CONFIG.SERVER_URL}/dashboard/billing`;
            }

            const extUsed = data.extraction?.used ?? 0;
            const extLimit = data.extraction?.limit ?? 1;
            const extRemaining = data.extraction?.remaining ?? (extLimit - extUsed);
            const extPercentage = Math.min(100, (extUsed / extLimit) * 100);
            
            const planName = data.plan ? data.plan.replace('_', ' ') : 'Free';
            popupPlan.textContent = planName;
            chrome.storage.local.set({ 'cached_plan': data.plan });
            
            let upgradeMessage = '';
            if (extRemaining <= 0) {
                upgradeMessage = `
                    <div style="font-size: 11px; margin-top: 8px; padding: 8px; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; color: #c53030;">
                        <div style="font-weight: 600; margin-bottom: 2px;">Limit Reached!</div>
                        <div>Extractions cost 1 Taka/each from your balance.</div>
                        <a href="${CONFIG.SERVER_URL}/dashboard/billing" target="_blank" style="color: #3182ce; text-decoration: underline; font-weight: 500; display: inline-block; margin-top: 4px;">Upgrade Subscription</a>
                    </div>
                `;
            }

            popupLimits.innerHTML = `
                <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 12px;">
                    <!-- Extraction Limit -->
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 11px; align-items: center; margin-bottom: 4px;">
                            <span style="color: #64748b; font-weight: 500; letter-spacing: -0.025em;">Extractions</span>
                            <span style="color: #334155; font-weight: 700;">${extUsed} / ${extLimit}</span>
                        </div>
                        <div style="width: 100%; height: 6px; background-color: #f1f5f9; border-radius: 999px; overflow: hidden;">
                            <div style="width: ${extPercentage}%; height: 100%; background-color: ${extRemaining <= 0 ? '#ef4444' : '#10b981'}; transition: width 0.5s;"></div>
                        </div>
                        ${upgradeMessage}
                    </div>
                </div>
            `;

            if (!data.allowed) {
                autofillBtn.disabled = true;
                autofillBtn.textContent = 'Account Locked / No Balance';
            } else {
                autofillBtn.disabled = false;
                autofillBtn.textContent = extRemaining <= 0 ? 'Autofill (1T/ext)' : 'Autofill Form';
            }
        } else {
            popupLimits.innerHTML = `
                <div style="font-size: 11px; color: #ef4444; margin-top: 8px; text-align: center; background: #fef2f2; padding: 8px; border-radius: 6px;">
                    ${data.error || 'Failed to sync with server. Please re-login in Settings.'}
                </div>
            `;
            autofillBtn.disabled = true;
            autofillBtn.textContent = 'Authentication Error';
        }
    } catch (e) {
        console.error('Failed to fetch limits:', e);
        popupLimits.innerHTML = `
            <div style="font-size: 11px; color: #ef4444; margin-top: 8px; text-align: center; background: #fef2f2; padding: 8px; border-radius: 6px;">
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

sidebarBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.sidePanel && tabs[0]) {
            chrome.sidePanel.open({ tabId: tabs[0].id });
        } else {
            // Fallback for older Chrome builds
            chrome.runtime.openOptionsPage();
        }
    });
    window.close();
});

loginSettingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

if (newProfileBtn) {
    newProfileBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage(() => {
            // Give the options page a moment to load, then send a message to open the modal
            setTimeout(() => {
                chrome.runtime.sendMessage({ action: 'OPEN_NEW_PROFILE_MODAL' });
            }, 500);
        });
    });
}
