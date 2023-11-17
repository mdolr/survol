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
        return new URL(link).host;
    }

    function updateUIElements(isPreviewMetadata, isDarkThemeChecked) {
        document.getElementById('previewMetadata').checked = isPreviewMetadata;
        document.getElementById('darkThemeCheckbox').checked = isDarkThemeChecked;
    }

    function bindEventListenersAndUpdateUI() {
        chrome.storage.local.get(['disabledDomains', 'previewMetadata', 'darkThemeToggle', 'installationType', 'selfReferDisabled'], function (res) {
            let disabledDomains = res.disabledDomains ? res.disabledDomains : ['survol.me'];
            let selfReferDisabled = res.selfReferDisabled ? res.selfReferDisabled : [];
            let previewMetadata = true;
            let darkTheme = false;

            if (res.previewMetadata === false) {
                previewMetadata = false;
            }

            if (res.darkThemeToggle === true) {
                darkTheme = true;
                document.getElementById('body').classList.add('dark-theme');
            }

            document.getElementById('disabledList').value = disabledDomains.join(',');
            document.getElementById('innerLinksList').value = selfReferDisabled.join(',');

            switch (res.installationType) {
                case 'install':
                    document.getElementById('welcomeMessage').innerText = chrome.i18n.getMessage('thankInstallation') || 'Survol';
                    break;
                case 'update':
                    document.getElementById('welcomeMessage').innerText = chrome.i18n.getMessage('survolUpdated') || 'Survol';
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

                    document.getElementById('disabledList').addEventListener('keyup', () => {
                        chrome.storage.local.set({ disabledDomains: document.getElementById('disabledList').value.toLowerCase().replace(/ /g, '').split(',') });
                    });

                    document.getElementById('innerLinksList').addEventListener('keyup', () => {
                        chrome.storage.local.set({ selfReferDisabled: document.getElementById('innerLinksList').value.toLowerCase().replace(/ /g, '').split(',') });
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