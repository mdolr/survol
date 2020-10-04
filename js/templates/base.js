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
                    let title = null;
                    let description = null;

                    if (res.data.includes('<title>') && res.data.includes('</title>')) {
                        title = res.data.split('<title>')[1].split('</title>')[0];
                    }

                    if (res.data.includes('name="description"') && res.data.includes('content="')) {
                        description = res.data.split('name="description"')[1].split('content="')[1].split('"')[0];
                    }

                    if (title && description) {
                        // re-using wikipedia css
                        let wikipediaContainer = document.createElement('div');
                        wikipediaContainer.className = 'survol-wikipedia-container';


                        let webTitle = document.createElement('h1');
                        webTitle.appendChild(document.createTextNode(title));

                        let textContainer = document.createElement('div');
                        textContainer.className = 'survol-wikipedia-text';

                        let text = document.createElement('p');
                        text.appendChild(document.createTextNode(description));

                        textContainer.appendChild(webTitle);
                        textContainer.appendChild(text);
                        wikipediaContainer.appendChild(textContainer);

                        container.appendChild(wikipediaContainer);
                    }
                })
                .catch((error) => {
                    console.error('SURVOL - Background request failed', error);
                });
        }

    }
}