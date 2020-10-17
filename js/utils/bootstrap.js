const bootstrap = (function () {

    function setInternationalization(array) {
        if (!array) {
            return;
        }

        array.forEach(function (word) {
            document.getElementById(word).innerText = chrome.i18n.getMessage(word);
        });
    }

    function getDomain(link) {
        let subdomains = link.replace('http://', '').replace('https://', '').split('/')[0].split('.').length;
        return link.replace('http://', '').replace('https://', '').split('/')[0].split('.').slice(subdomains - 2, subdomains).join('.');
    }

    function updateUIElements(isPreviewMetadata, isDarkThemeChecked) {
        document.getElementById('previewMetadata').checked = isPreviewMetadata;
        document.getElementById('darkThemeCheckbox').checked = isDarkThemeChecked;
    }

    function bindEventListenersAndUpdateUI() {
        chrome.storage.local.get(['disabledDomains', 'previewMetadata', 'darkThemeToggle', 'installationType'], function (res) {
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

            switch (res.installationType) {
                case 'install':
                    document.getElementById('welcomeMessage').innerText = chrome.i18n.getMessage('thankInstallation');
                    break;
                case 'update':
                    document.getElementById('welcomeMessage').innerText = chrome.i18n.getMessage('survolUpdated');
                    break;
                case 'none':
                default:
                    document.getElementById('welcomeMessage').innerText = 'Survol';
                    break;
            }

            chrome.storage.local.set({ installationType: 'none' });

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) { // Sanity check
                    let CURRENT_URL = getDomain(tabs[0].url);
                    const previewOnThisPage = !disabledDomains.includes(CURRENT_URL.toLowerCase());

                    updateUIElements(previewMetadata, darkTheme, previewOnThisPage);


                    document.getElementById('previewMetadata').addEventListener('click', () => {
                        chrome.storage.local.set({ previewMetadata: document.getElementById('previewMetadata').checked });
                    });

                    document.getElementById('darkThemeCheckbox').addEventListener('click', () => {
                        chrome.storage.local.set({ darkThemeToggle: document.getElementById('darkThemeCheckbox').checked });
                        document.getElementById('body').classList.toggle('dark-theme');
                    });
                }
            });
        });
    }

    /**
     * Bootstraps the app with event listeners, update UI elements from local storage & set localization
     *
     * @param {Array.<string>} elementsToLocalize The Id of the elements to localize the text.
     */
    function load(elementsToLocalize) {
        setInternationalization(elementsToLocalize);
        bindEventListenersAndUpdateUI();
    }

    return {
        load: load
    }

})();

export {
    bootstrap
};