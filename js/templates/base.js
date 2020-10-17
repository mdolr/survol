/* Hover classes bound themselves to a node
 * The baseHover is designed for non-recognized link (still need to identify legit links without applying the class to buttons etc..)
 */
class BaseHover {
    constructor(node, CURRENT_TAB) {
        this.linkType = 'unknown';
        this.CURRENT_TAB = CURRENT_TAB;
    }

    /* bindToContainer
     * Parameters :
     * node - {HTMLNodeElement} - An anchor link element
     * domain - {String} - The domain of the current webpage
     * container - {HTMLNodeElement} - The survol container
     * 
     * This function is called to get the data from the link we
     * want to preview and then attach it to the container
     * Note: data is always inserted into textNodes to avoid
     * malicious script injections.
     */
    bindToContainer(node, domain, container) {
        if (node.href) {

            // The base template is used when we can't request data from an API
            // we use meta-data to build a preview
            // We start by requesting the page in text mode
            window
                .survolBackgroundRequest(node.href, true)
                .then((res) => {

                    // We then use a DOMParser to extract data from the response
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(res.data, 'text/html');

                    // Parse the <title>
                    let title = doc.querySelector('title') ? doc.querySelector('title').innerText : null;

                    // Use <meta> to get description and image / thumbnail
                    let description = doc.querySelector('meta[name="description"]') ? doc.querySelector('meta[name="description"]').content : null;
                    let thumbnail = doc.querySelector('meta[name="og:image"]') ? doc.querySelector('meta[name="og:image"]').content : null;

                    // We make sure that we have enough data
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