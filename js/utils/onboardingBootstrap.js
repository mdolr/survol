import { bootstrap } from './bootstrap.js';

(function () {

    async function getReleaseLog() {
        return fetch('https://api.github.com/repos/mdolr/survol/releases?page=1&per_page=5')
        .then(function (res) {
            return res.json();
        });
    }

    function getReleaseSectionHTMLTemplate(releaseName, releaseNotes) {
        const releaseSection = document.createElement('section');

        const releaseHeader = document.createElement('p');
        releaseHeader.appendChild(document.createTextNode(releaseName));

        const releaseNoteList = document.createElement('ul');
        releaseNotes.split(/\r?\n/).forEach(entry => {
            const item = document.createElement('li');
            const cleansedString = entry.indexOf('*') === 0 ? entry.substring(1) : entry;
            item.appendChild(document.createTextNode(cleansedString));
            releaseNoteList.appendChild(item);
        });

        releaseSection.appendChild(releaseHeader);
        releaseSection.appendChild(releaseNoteList);
        return releaseSection;
    }

    async function renderReleaseLog() {
        const releaseCollection  =  await getReleaseLog();
        const section = document.getElementById('releaseSection');
        for (var i = 0; i < releaseCollection.length; i++) {
            if(releaseCollection[i].prerelease) {
                continue;
            }
            const releaseSection = getReleaseSectionHTMLTemplate(releaseCollection[i].name, releaseCollection[i].body);
            section.appendChild(releaseSection);
            break;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const elementIds = ['generalSettings', 'allowMetadata', 'enableDarkTheme'];
        bootstrap.load(elementIds);
        renderReleaseLog();
    });

})();