document.getElementById('autofill-btn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "triggerAutofill" });
    });
});

document.getElementById('options-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});
