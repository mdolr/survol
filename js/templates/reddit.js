/* Hover classes bound themselves to a node
 * The reddit class is directly depending from /utils/reddit-comment-embed which is the embedding library needed for the support
 * of dynamically added content.
 */
class RedditHover {
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
        /* As comments are the only thing implemented for now let's ignore the rest
        TODO : 
        - Implement users when on other sites
        - Implement discussions (couldn't get discussion embed code from reddit when I tried (bug?))
        - Improve link detection for comments
        
        if (this.redirectLink.includes('/user/')) {
            return 'user';
        } else if (this.redirectLink.replace('https://', '').split('/').length == 7 && !this.boundNode.classList.length && !this.redirectLink.includes('#')) {
            return 'post';
        } else */

        /* Split by '/', but remove final empty string */
        const urlChunks = this.redirectLink.replace('https://', '').split('/').filter(e => e !== '');
        /* Comments have a 7-character unique ID, which is the last slash enclosed path part */
        if (urlChunks.length == 7 && /[a-z0-9]{7}/.test(urlChunks[6])) {
            return 'comment';
        } else if (urlChunks.length == 6 && /\/comments\/[^\/]+\/[^\/]+\/[^\/]*$/.test(this.redirectLink)) {
            return 'post'
        } else {
            return 'unknown';
        }
    }

    bindToNode() {
        if (this.linkType == 'comment') {
            /* Building node using js functions is required by Firefox to get the permission to publish the extension officialy
             * (At least I had to do it the last time I did one).
             * Also the commentContainer is needed as rembeddit overwrites the comment to an iframe and the iframe is not affected by class change.
             */

            let commentContainer = document.createElement('div');
            commentContainer.className = 'survol-tooltiptext';

            /* This is a reconstitution of the reddit embed code when sharing a comment.*/
            let comment = document.createElement('div');
            comment.setAttribute('data-embed-media', 'www.redditmedia.com');
            comment.setAttribute('data-embed-parent', 'false');
            comment.setAttribute('data-embed-live', 'false');
            comment.setAttribute('data-embed-created', `${new Date().toISOString()}`);
            comment.className = 'reddit-embed';

            let commentDirectLink = document.createElement('a');
            commentDirectLink.href = `${this.redirectLink}?`;
            commentDirectLink.appendChild(document.createTextNode('Comment'));

            let discussionDirectLink = document.createElement('a');
            discussionDirectLink.href = `${this.redirectLink.split('/').slice(0, this.redirectLink.split('/').length - 1).join('/')}?`;
            discussionDirectLink.appendChild(document.createTextNode('discussion'));

            comment.appendChild(commentDirectLink);
            comment.appendChild(document.createTextNode('from discussion'));
            comment.appendChild(discussionDirectLink);

            commentContainer.appendChild(comment);
            this.boundNode.appendChild(commentContainer);

            /* Because for some reason embed code doesn't init itself directly when added dynamically, depends directly of reddit-comment-embed.js */
            window.rembeddit.init();

            this.boundNode.classList.add('survol-tooltip');
        } else if (this.linkType === 'post') {
            let postContainer = document.createElement('div');
            postContainer.className = 'survol-tooltiptext tooltiptext-reddit-post';

            let postEmbed = document.createElement('blockquote');
            postEmbed.classList.add('reddit-card');
            let postLink = document.createElement('a');
            postLink.setAttribute('href', this.redirectLink);

            postEmbed.appendChild(postLink);
            postContainer.appendChild(postEmbed);
            this.boundNode.appendChild(postContainer);

            this.boundNode.classList.add('survol-tooltip');
        }
    }
}