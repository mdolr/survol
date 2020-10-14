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

    chrome.storage.local.get(['disabledDomains', 'disabledSelfReferDomains', 'previewMetadata', 'darkThemeToggle'], function (res) {
        let disabledDomains = res.disabledDomains ? res.disabledDomains : ['survol.me'];
        let disabledSelfReferDomains = res.disabledSelfReferDomains ? res.disabledSelfReferDomains : ['survol.me'];
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
                    document.getElementById('previewOnThisPage').checked = false;
                }

                if (disabledSelfReferDomains.includes(CURRENT_URL.toLowerCase())) {
                    document.getElementById('disableSelfReferButton').checked = true;
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
                    }

                    // If the box gets checked and the domain is disabled, remove it from the disabled domains list
                    else if (document.getElementById('previewOnThisPage').checked && disabledDomains.includes(CURRENT_URL.toLowerCase())) {
                        disabledDomains = disabledDomains.filter((domains) => { return domains != CURRENT_URL.toLowerCase(); });
                    }

                    chrome.storage.local.set({ disabledDomains: disabledDomains });
                });

                document.getElementById('disableSelfReferButton').addEventListener('click', () => {
                    // if the box gets unchecked i.e domain self-referencing disabled, and the domain is not already in the list add it
                    if (document.getElementById('disableSelfReferButton').checked && !disabledSelfReferDomains.includes(CURRENT_URL.toLowerCase())) {
                        disabledSelfReferDomains.push(CURRENT_URL.toLowerCase());
                    }

                    // If the box gets checked and the domain self-referencing is disabled, remove it from the disabled domains list
                    else if (!document.getElementById('disableSelfReferButton').checked && disabledSelfReferDomains.includes(CURRENT_URL.toLowerCase())) {
                        disabledSelfReferDomains = disabledSelfReferDomains.filter((domains) => { return domains != CURRENT_URL.toLowerCase(); });
                    }

                    chrome.storage.local.set({ disabledSelfReferDomains: disabledSelfReferDomains });
                });
            }
        });
    });

    /* w3schools collapsible js */
    var coll = document.getElementsByClassName("collapsible");
    var i;
    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        if (this.classList.contains("active")) {
            this.classList.remove("right");
            this.classList.add("down");
        } else {
            this.classList.remove("down");
            this.classList.add("right");
        }
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    }

});