/* Hover classes bound themselves to a node
 */
class RedditHover {
    constructor(node) {
        this.boundNode = node;
        this.redirectLink = node.href;
        this.linkType = this.checkLinkType();
        this.bindToNode();
    }

    /* Unmount everything and delete self R.I.P :( */
    selfDestruction() {
        delete this;
    }

    /* Description: This function is unique to every Hover class,
     * its goal is to determine which type of embed should be chosen for the link.
     * it can also delete the whole class if there is no point in having an embed.
     */
    checkLinkType() {
        if (this.redirectLink.includes('/user/')) {
            return 'user';
        } else if (this.redirectLink.replace('https://', '').split('/').length == 7 && !this.boundNode.classList.length && !this.redirectLink.includes('#')) {
            return 'post';
        } else if (this.redirectLink.replace('https://', '').split('/').length == 8 && !this.boundNode.classList.length && !this.redirectLink.includes('#')) {
            return 'comment';
        } else {
            return 'unknown';
        }
    }

    bindToNode() {
        if (this.linkType == 'comment') {
            let comment = document.createElement('div');

            comment.innerHTML = `<div class="reddit-embed" data-embed-media="www.redditmedia.com" data-embed-parent="false" data-embed-live="false" data-embed-created="${new Date().toISOString()}">
                                    <a href="${this.redirectLink}?">
                                        Comment
                                    </a>
                                    from discussion
                                    <a href="${this.redirectLink.split('/').slice(0, this.redirectLink.split('/').length - 1).join('/')}?"></a>.
                                </div>`;

            this.boundNode.appendChild(comment);

            /* Because for some reason embed code doesn't init itself directly, depends directly of reddit-comment-embed.js */
            window.rembeddit.init();

            this.boundNode.classList.add('tooltip');
            comment.classList.add('tooltiptext');
        }
    }
}