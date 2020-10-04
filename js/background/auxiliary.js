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
    if (req.action == 'request') {
        const { data: { url } } = req;
        if (REQUEST_CACHE[url]) {
            sendResponse(REQUEST_CACHE[url]);
            return true;
        } 
        let res = { status: 'error', data: null };
        fetch(url)
            .then((data) => { return data.json(); })
            .then((data) => {
                res.data = data;
                res.status = 'OK';
                REQUEST_CACHE[url] = res;
                sendResponse(res);
            })
            .catch((error) => {
                res.data = error;
                res.status = 'error';
                sendResponse(res);
                console.error('SURVOL - Fetching error', error);
            });
    }

    // To avoid leaving the message hanging
    else {
        sendResponse({ action: 'none', status: 'OK' });
    }

    return true;
});