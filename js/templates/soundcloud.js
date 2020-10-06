/* Hover classes bound themselves to a node
 */
class SoundCloudHover {
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
        let trackLinkRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?soundcloud\.com\/[a-zA-Z0-9_]+\/[a-zA-Z0-9-_]+\/?$/;
        if (this.CURRENT_TAB != 'soundcloud.com' && this.redirectLink.match(trackLinkRegex)) {
            return 'track';
        } else {
            return 'unknown';
        }
    }

    bindToContainer(node, domain, container) {
        if (this.linkType == 'track') {

            window
                .survolBackgroundRequest(`https://soundcloud.com/oembed?url=${this.redirectLink}&format=json`)
                .then((res) => {

                    console.log('res:', res);
                    let soundCloudContainer = document.createElement('div');
                    soundCloudContainer.className = 'survol-soundcloud-container';

                    let title = document.createElement('h1');
                    title.appendChild(document.createTextNode(res.data.title));

                    let description = document.createElement('p');
                    description.className = 'survol-soundcloud-description';
                    let descriptionMaxLength = 72;
                    let truncatedDescription = res.data.description.length >= descriptionMaxLength ? `${res.data.description.slice(0, descriptionMaxLength)}...` : res.data.description;
                    description.appendChild(document.createTextNode(truncatedDescription));

                    let textContainer = document.createElement('div');
                    textContainer.className = 'survol-soundcloud-text';

                    let soundCloudImageContainer = document.createElement('div');
                    soundCloudImageContainer.className = 'survol-soundcloud-image-container';

                    let image = document.createElement('div');
                    image.className = 'survol-soundcloud-image';
                    image.style.backgroundImage = `url(${res.data.thumbnail_url})`;
                    image.style.backgroundPosition = 'center';
                    image.style.backgroundSize = 'cover';
                    image.style.backgroundRepeat = 'no-repeat';

                    soundCloudImageContainer.appendChild(image);
                    textContainer.appendChild(title);
                    textContainer.appendChild(description);
                    soundCloudContainer.appendChild(soundCloudImageContainer);
                    soundCloudContainer.appendChild(textContainer);

                    if (window.lastHovered == node && container.innerHTML == '') {
                        container.appendChild(soundCloudContainer);
                    }
                })
                .catch((res) => {
                    console.log('[Error] Survol - SoundCloud.js - Can\'t fetch API.', res);
                });
        }
    }
}