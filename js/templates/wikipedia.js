/* Hover classes bound themselves to a node
 * WikipediaHover uses the wikipedia API to get an extract from pages
 */
class WikipediaHover {
    constructor(node, CURRENT_TAB) {
        this.boundNode = node;
        this.redirectLink = node.href;
        this.linkType = this.checkLinkType();
        this.CURRENT_TAB = CURRENT_TAB;
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

    bindToNode() {

        /* TODO: Set a way to always try a certain language and then try the original language of the link */

        if (this.linkType == 'article') {

            fetch(`https://${this.redirectLink.split('.wikipedia.org')[0].split('//')[1]}.wikipedia.org/api/rest_v1/page/summary/${this.redirectLink.split('/wiki/')[1]}`)
                .then((res) => { return res.json(); })
                .then((res) => {
                    let container = document.createElement('div');
                    container.className = 'survol-tooltiptext';

                    let wikipediaContainer = document.createElement('div');
                    wikipediaContainer.className = 'survol-wikipedia-container';

                    /* If there is a thumbnail */
                    if (res.thumbnail) {
                        let wikipediaImageContainer = document.createElement('div');
                        wikipediaImageContainer.className = 'survol-wikipedia-image-container';


                        let image = document.createElement('img');
                        image.src = res.thumbnail.source;
                        image.className = 'survol-wikipedia-image';

                        wikipediaImageContainer.appendChild(image);
                        wikipediaContainer.appendChild(wikipediaImageContainer);
                    }

                    let textContainer = document.createElement('div');
                    textContainer.className = 'survol-wikipedia-text';

                    let text = document.createElement('p');
                    text.appendChild(document.createTextNode(res.extract));

                    textContainer.appendChild(text);
                    wikipediaContainer.appendChild(textContainer);

                    this.boundNode.classList.add('survol-tooltip');

                    container.appendChild(wikipediaContainer);
                    this.boundNode.appendChild(container);
                })
                .catch((error) => {
                    console.log('[Error] Survol - Wikipedia.js - Can\'t fetch API.', this, error);
                });
        }
    }
}