/* Hover classes bound themselves to a node
 * The baseHover is designed for non-recognized link (still need to identify legit links without applying the class to buttons etc..)
 */
class BaseHover {
    constructor(node, CURRENT_TAB) {
        this.linkType = 'unknown';
        this.CURRENT_TAB = CURRENT_TAB;
    }

    bindToContainer(node, domain, container) {
        if (node.href) {
            window
                .survolBackgroundRequest(node.href, true)
                .then((res) => {
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(res.data, 'text/html');
                    let title = doc.querySelector('title') ? doc.querySelector('title').innerText : null;
                    let description = doc.querySelector('meta[name="description"]') ? doc.querySelector('meta[name="description"]').content : null;
                    let thumbnail = doc.querySelector('meta[name="og:image"]') ? doc.querySelector('meta[name="og:image"]').content : null;

                    if (title && description) {
                        // re-using wikipedia css
                        let wikipediaContainer = document.createElement('div');
                        wikipediaContainer.className = 'survol-wikipedia-container';

                        /* If there is a thumbnail */
                        if (thumbnail) {
                            let wikipediaImageContainer = document.createElement('div');
                            wikipediaImageContainer.className = 'survol-wikipedia-image-container';


                            let image = document.createElement('img');
                            image.src = thumbnail;
                            image.className = 'survol-wikipedia-image';

                            wikipediaImageContainer.appendChild(image);
                            wikipediaContainer.appendChild(wikipediaImageContainer);
                        }

                        let webTitle = document.createElement('h1');
                        webTitle.appendChild(document.createTextNode(title));

                        let textContainer = document.createElement('div');
                        textContainer.className = 'survol-wikipedia-text';

                        let text = document.createElement('p');
                        text.appendChild(document.createTextNode(description));

                        textContainer.appendChild(webTitle);
                        textContainer.appendChild(text);
                        wikipediaContainer.appendChild(textContainer);

                        if (window.lastHovered == node && container.innerHTML == '') {
                            container.appendChild(wikipediaContainer);
                        }
                    }
                })
                .catch((error) => {
                    console.error('SURVOL - Background request failed', error);
                });
        }

    }
}