/* <https://www.chromium.org/Home/chromium-security/extension-content-script-fetches>
 * Later in 2019, Extension Manifest V3 will become available, requiring cross-origin requests to occur in background pages rather than content scripts.  This new manifest version will have its own migration period, before support for Extension Manifest V2 is eventually removed from Chrome.
 * Using the background script to pull data from APIs safely
 */

chrome.runtime.onConnect.addListener((req) => {
    /* For each injected core.js */
    req.onMessage.addListener((message) => {
        /* Forward requests from content script */
        if (message.action == 'request') {
            let res = { status: 'error', data: null };

            fetch(message.data.url)
                .then((data) => { return data.json(); })
                .then((data) => {
                    res.data = data;
                    res.status = 'OK';
                    req.postMessage(res);
                })
                .catch((error) => {
                    res.data = error;
                    res.status = 'error';
                    req.postMessage(res);
                    console.error('SURVOL - Fetching error', error);
                });
        }

    });
});