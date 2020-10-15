document.addEventListener('DOMContentLoaded', () => {
    /* Takes {String} link
     * Returns {String} link
     * Description: Returns the domain name associated to a full link
     */
    function getDomain(link) {
        let subdomains = link.replace('http://', '').replace('https://', '').split('/')[0].split('.').length;
        return link.replace('http://', '').replace('https://', '').split('/')[0].split('.').slice(subdomains - 2, subdomains).join('.');
    }

    ['pageSettings', 'generalSettings', 'allowMetadata', 'enableOnPage', 'enableDarkTheme'].forEach(function (word) {
        document.getElementById(word).innerText = chrome.i18n.getMessage(word);
    });

    chrome.storage.local.get(['disabledDomains', 'previewMetadata', 'darkThemeToggle'], function (res) {
        let disabledDomains = res.disabledDomains ? res.disabledDomains : ['survol.me'];
        let previewMetadata = true;
        let darkTheme = false;

        if (res.previewMetadata === false) {
            previewMetadata = false;
        }

        if (res.darkThemeToggle === true) {
            darkTheme = true;
            document.getElementById('body').classList.add('dark-theme');
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) { // Sanity check
                let CURRENT_URL = getDomain(tabs[0].url);
                document.getElementById('currentURL').innerText = CURRENT_URL;

                if (disabledDomains.includes(CURRENT_URL.toLowerCase())) {
                    changeBadge("OFF");
                    document.getElementById('previewOnThisPage').checked = false;                                    
                }
                else
                {
                    changeBadge("ON");
                }               

                document.getElementById('previewMetadata').checked = previewMetadata;

                document.getElementById('previewMetadata').addEventListener('click', () => {
                    chrome.storage.local.set({ previewMetadata: document.getElementById('previewMetadata').checked });
                });

                document.getElementById('darkThemeCheckbox').checked = darkTheme;

                document.getElementById('darkThemeCheckbox').addEventListener('click', () => {
                    chrome.storage.local.set({ darkThemeToggle: document.getElementById('darkThemeCheckbox').checked });
                    document.getElementById('body').classList.toggle('dark-theme');
                });

                document.getElementById('previewOnThisPage').addEventListener('click', () => {
                    // if the box gets unchecked i.e domain disabled, and the domain is not already in the list add it
                    if (!document.getElementById('previewOnThisPage').checked && !disabledDomains.includes(CURRENT_URL.toLowerCase())) {
                        disabledDomains.push(CURRENT_URL.toLowerCase());
                        changeBadge("OFF");
                    }

                    // If the box gets checked and the domain is disabled, remove it from the disabled domains list
                    else if (document.getElementById('previewOnThisPage').checked && disabledDomains.includes(CURRENT_URL.toLowerCase())) {
                        disabledDomains = disabledDomains.filter((domains) => { return domains != CURRENT_URL.toLowerCase(); });
                        changeBadge("ON");
                    }
                   
                    chrome.storage.local.set({ disabledDomains: disabledDomains });
                    
                });
            }
        });
    });

    /* Badge on the extension icon 
     * Used to display ON/OFF depending on the state of the extension
     */
    function changeBadge(status)
    {
        chrome.browserAction.setBadgeText({text: status});
    }

});