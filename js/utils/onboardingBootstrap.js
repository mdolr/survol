import { bootstrap }   from './bootstrap.js';

(function() {

    document.addEventListener('DOMContentLoaded', () => {
        const elementIds = ['helpTitle', 'onboardingTitle', 'pageSettings', 'generalSettings', 'allowMetadata', 'enableOnPage', 'enableDarkTheme'];
        bootstrap.load(elementIds);
    })

})();