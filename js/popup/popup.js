document.addEventListener('DOMContentLoaded', () => {
    /* Takes {String} link
     * Returns {String} link
     * Description: Returns the domain name associated to a full link
     */
    function getDomain(link) {
        let subdomains = link.replace('http://', '').replace('https://', '').split('/')[0].split('.').length;
        return link.replace('http://', '').replace('https://', '').split('/')[0].split('.').slice(subdomains - 2, subdomains).join('.');
    }

    ['pageSettings', 'generalSettings', 'allowMetadata', 'enableOnPage'].forEach(function (word) {
        document.getElementById(word).innerText = chrome.i18n.getMessage(word);
    });

    chrome.storage.local.get(['disabledDomains', 'previewMetadata'], function (res) {
        let disabledDomains = res.disabledDomains ? res.disabledDomains : ['survol.me'];
        let previewMetadata = true;

        if (res.previewMetadata === false) {
            previewMetadata = false;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) { // Sanity check
                let CURRENT_URL = getDomain(tabs[0].url);
                document.getElementById('currentURL').innerText = CURRENT_URL;

                if (disabledDomains.includes(CURRENT_URL.toLowerCase())) {
                    document.getElementById('previewOnThisPage').checked = false;
                }

                document.getElementById('previewMetadata').checked = previewMetadata;

                document.getElementById('previewMetadata').addEventListener('click', () => {
                    chrome.storage.local.set({ previewMetadata: document.getElementById('previewMetadata').checked });
                });

                document.getElementById('previewOnThisPage').addEventListener('click', () => {
                    // if the box gets unchecked i.e domain disabled, and the domain is not already in the list add it
                    if (!document.getElementById('previewOnThisPage').checked && !disabledDomains.includes(CURRENT_URL.toLowerCase())) {
                        disabledDomains.push(CURRENT_URL.toLowerCase());
                    }

                    // If the box gets checked and the domain is disabled, remove it from the disabled domains list
                    else if (document.getElementById('previewOnThisPage').checked && disabledDomains.includes(CURRENT_URL.toLowerCase())) {
                        disabledDomains = disabledDomains.filter((domains) => { return domains != CURRENT_URL.toLowerCase(); });
                    }

                    chrome.storage.local.set({ disabledDomains: disabledDomains });
                });
            }
        });
    });

});