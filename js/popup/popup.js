document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('generalSettings').addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('./html/onboarding.html') });
    });

    /* Takes {String} link
     * Returns {String} link
     * Description: Returns the domain name associated to a full link
     */
    function getDomain(link) {
        return new URL(link).hostname;
    }

    ['pageSettings', 'generalSettings', 'enableOnPage'].forEach(function (word) {
        document.getElementById(word).innerText = chrome.i18n.getMessage(word);
    });

    chrome.storage.local.get(['disabledDomains', 'darkThemeToggle'], function (res) {
        let disabledDomains = res.disabledDomains ? res.disabledDomains : ['survol.me'];

        if (res.darkThemeToggle === true) {
            document.getElementById('body').classList.add('dark-theme');
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) { // Sanity check
                let CURRENT_URL = getDomain(tabs[0].url);
                document.getElementById('currentURL').innerText = CURRENT_URL;

                if (disabledDomains.includes(CURRENT_URL.toLowerCase())) {
                    document.getElementById('previewOnThisPage').checked = false;
                }

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