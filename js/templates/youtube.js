/* Hover classes bound themselves to a node
 */
class YoutubeHover {
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
        if (this.CURRENT_TAB != 'youtube.com' && (this.redirectLink.includes('/watch?v=') || this.redirectLink.includes('youtu.be'))) {
            if (this.redirectLink.includes('youtu.be')) {
                this.redirectLink = `https://youtube.com/watch?v=${this.redirectLink.split('youtu.be/')[1].replace('?','&')}`
            }

            return 'video';
        } else {
            return 'unknown';
        }
    }

    bindToContainer(node, domain, container) {

        /* TODO: 
         * - Change youtube preview to Thumbnail + title + description
         */
        if (this.linkType == 'video') {
            window
                .survolBackgroundRequest(`https://www.youtube.com/oembed?url=${this.redirectLink}&format=json`)
                .then((res) => {

                    let youtubeContainer = document.createElement('div');
                    youtubeContainer.className = 'survol-youtube-container';

                    let title = document.createElement('h1');
                    title.appendChild(document.createTextNode(res.data.title));

                    let text = document.createElement('p');
                    text.className = 'survol-twitter-author'
                    text.appendChild(document.createTextNode(res.data.author_name));

                    let textContainer = document.createElement('div');
                    textContainer.className = 'survol-youtube-text';

                    let youtubeImageContainer = document.createElement('div');
                    youtubeImageContainer.className = 'survol-youtube-image-container';

                    let image = document.createElement('div');
                    console.log(res.data.thumbnail_url)
                    image.className = 'survol-youtube-image';
                    image.style.backgroundImage = `url(${res.data.thumbnail_url})`;
                    image.style.backgroundPosition = 'center';
                    image.style.backgroundSize = 'cover';
                    image.style.backgroundRepeat = 'no-repeat';

                    youtubeImageContainer.appendChild(image);
                    textContainer.appendChild(title);
                    textContainer.appendChild(text);
                    youtubeContainer.appendChild(youtubeImageContainer);
                    youtubeContainer.appendChild(textContainer);

                    if (window.lastHovered == node && container.innerHTML == '') {
                        container.appendChild(youtubeContainer);
                    }
                })
                .catch(console.error);
        }
    }
}