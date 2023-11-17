var REQUEST_CACHE = {};

// Clear cache every 10 mins
setInterval(() => {
    REQUEST_CACHE = {};
}, 1000 * 60 * 10);


/* <https://www.chromium.org/Home/chromium-security/extension-content-script-fetches>
 * Later in 2019, Extension Manifest V3 will become available, requiring cross-origin requests to occur in background pages rather than content scripts.  This new manifest version will have its own migration period, before support for Extension Manifest V2 is eventually removed from Chrome.
 * Using the background script to pull data from APIs safely
 */
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action == 'state') {
        var state = req.data;
        chrome.browserAction.setBadgeText({
            text: state,
            tabId: sender.tab.id
        });
    }
    if (req.action == 'request') {

        let res = { status: 'error', data: null };

        // if the request is cached
        if (REQUEST_CACHE[req.data.url]) {
            res = REQUEST_CACHE[req.data.url];
            res.cached = true;
            sendResponse(res);
        }

        // If the request isn't cached
        else {
            fetch(req.data.url, {credentials: 'omit'})
                .then((data) => { return req.data.noJSON ? data.text() : data.json(); })
                .then((data) => {
                    res.data = data;
                    res.status = 'OK';
                    res.cached = false;
                    REQUEST_CACHE[req.data.url] = res;
                    sendResponse(res);
                })
                .catch((error) => {
                    res.data = error;
                    res.status = 'error';
                    sendResponse(res);
                    console.error('SURVOL - Fetching error', error);
                });
        }
    }

    // To avoid leaving the message hanging
    else {
        sendResponse({ action: 'none', status: 'OK' });
    }

    return true;
});


// Those are the extension default settings
const DEFAULT_SETTINGS = {
    version: '0.6.0',
    disabledDomains: ['survol.me'],
    selfReferDisabled: ['github.com', 'ppy.sh'],
    previewMetadata: true,
    darkThemeToggle: false,
    installationType: 'install'
};

// When the extension is installed
chrome.runtime.onInstalled.addListener(() => {

    // Initialize settings
    chrome.storage.local.get(Object.keys(DEFAULT_SETTINGS), (res) => {

        // In order to chose between "Thanks for installing the extension" and "Survol has been updated"
        let oldVersion = res.version;

        res.version = DEFAULT_SETTINGS.version;

        if (res.installationType) {
            res.installationType = (res.version == oldVersion) ? 'none' : 'update';
        }

        Object.keys(DEFAULT_SETTINGS).forEach((key) => {
            res[key] = res[key] || DEFAULT_SETTINGS[key];
        });

        // Save settings then open onboarding page
        chrome.storage.local.set(res, () => {

            // If there has been an update or the extension has just been installed
            if (res.installationType == 'update' || res.installationType == 'install') {
                chrome.tabs.create({ url: chrome.runtime.getURL('./html/onboarding.html') });
            }
        });
    });
});