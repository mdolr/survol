import { bootstrap } from './bootstrap.js';

(function () {

    document.addEventListener('DOMContentLoaded', () => {
        const elementIds = ['generalSettings', 'allowMetadata', 'enableDarkTheme'];
        bootstrap.load(elementIds);
    });

})();