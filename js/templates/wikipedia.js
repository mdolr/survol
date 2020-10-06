/* Hover classes bound themselves to a node
 * WikipediaHover uses the wikipedia API to get an extract from pages
 */
class WikipediaHover {
    constructor(node, CURRENT_TAB) {
        this.boundNode = node;
        this.redirectLink = node.href;
        this.CURRENT_TAB = CURRENT_TAB;
        this.linkType = this.checkLinkType();
    }

    /* Description: This function is unique to every Hover class,
     * its goal is to determine which type of embed should be chosen for the link.
     * it can also delete the whole class if there is no point in having an embed.
     */
    checkLinkType() {
        /* Wikipedia already has its own embed system so we don't need to overwrite it */
        if (this.CURRENT_TAB != 'wikipedia.org' && this.redirectLink.includes('/wiki/')) {
            return 'article';
        } else {
            return 'unknown';
        }
    }

    bindToContainer(node, domain, container) {
        if (this.linkType == 'article') {

            window
                .survolBackgroundRequest(`https://${this.redirectLink.split('.wikipedia.org')[0].split('//')[1]}.wikipedia.org/api/rest_v1/page/summary/${this.redirectLink.split('/wiki/')[1]}`)
                .then((res) => {

                    let wikipediaContainer = document.createElement('div');
                    wikipediaContainer.className = 'survol-wikipedia-container';

                    /* If there is a thumbnail */
                    if (res.data.thumbnail) {
                        let wikipediaImageContainer = document.createElement('div');
                        wikipediaImageContainer.className = 'survol-wikipedia-image-container';


                        let image = document.createElement('img');
                        image.src = res.data.thumbnail.source;
                        image.className = 'survol-wikipedia-image';

                        wikipediaImageContainer.appendChild(image);
                        wikipediaContainer.appendChild(wikipediaImageContainer);
                    }

                    let title = document.createElement('h1');
                    title.appendChild(document.createTextNode(res.data.displaytitle));

                    let textContainer = document.createElement('div');
                    textContainer.className = 'survol-wikipedia-text';

                    let text = document.createElement('p');
                    text.appendChild(document.createTextNode(res.data.extract));

                    textContainer.appendChild(title);
                    textContainer.appendChild(text);
                    wikipediaContainer.appendChild(textContainer);

                    if (window.lastHovered == node && container.innerHTML == '') {
                        container.appendChild(wikipediaContainer);
                    }
                })
                .catch((res) => {
                    console.log('[Error] Survol - Wikipedia.js - Can\'t fetch API.', res);
                });
        }
    }
}