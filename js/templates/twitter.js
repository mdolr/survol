/* Hover classes bound themselves to a node
 */
class TwitterHover {
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
        if (this.CURRENT_TAB == 'twitter.com') {
            return 'unknown';
        } else if (this.redirectLink.includes('/status/')) {
            return 'tweet';
        }
    }

    bindToNode() {
        if (this.linkType == 'tweet') {

            let tweetContainer = document.createElement('div');
            tweetContainer.className = 'tooltiptext';

            let tweet = document.createElement('div');
            tweet.innerHTML = `<blockquote class="twitter-tweet"><p lang="fr" dir="ltr"></p>&mdash; (@${this.redirectLink.split('/')[3]}) <a href="${this.redirectLink}"></a></blockquote>`;

            this.boundNode.classList.add('tooltip');

            tweetContainer.appendChild(tweet);
            this.boundNode.appendChild(tweetContainer);

            /* Can't find a way to load tweets that works while using twttr lib as a content script for now */
        }

    }
}