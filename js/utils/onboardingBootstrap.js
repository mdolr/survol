import { bootstrap } from './bootstrap.js';

(function () {
    
    const url = 'https://api.github.com/repos/mdolr/survol/releases?page=1&per_page=5'

    function getReleaseSectionHTMLTemplate(releaseName, releaseNotes) {
        const releaseSection = document.createElement('section');

        const releaseHeader = document.createElement('p');
        releaseHeader.appendChild(document.createTextNode(releaseName));

        const releaseNoteList = document.createElement('ul');
        releaseNotes.split(/\r?\n/).forEach(entry => {
            let item = entry.indexOf('*') === 0 ? document.createElement('li') : document.createElement('div');
            const cleansedString = entry.indexOf('*') === 0 ? entry.substring(1) : entry;
            item.appendChild(document.createTextNode(cleansedString));
            releaseNoteList.appendChild(item);
        });

        releaseSection.appendChild(releaseHeader);
        releaseSection.appendChild(releaseNoteList);
        return releaseSection;
    }

    async function renderReleaseLog() {
        const changeLogCache = await caches.open('changeLog');

        let response = await changeLogCache.match(url)

        if (!response)
            await changeLogCache.add(url);

        const releaseCollection = await changeLogCache.match(url).then(res => res.json())
        const section = document.getElementById('releaseSection');
        for (var i = 0; i < releaseCollection.length; i++) {
            if (releaseCollection[i].prerelease) {
                continue;
            }
            const releaseSection = getReleaseSectionHTMLTemplate(releaseCollection[i].name, releaseCollection[i].body);
            section.appendChild(releaseSection);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const elementIds = ['generalSettings', 'allowMetadata', 'enableDarkTheme'];
        bootstrap.load(elementIds);
        renderReleaseLog();
    });

})();