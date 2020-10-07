/* Hover classes bound themselves to a node
 * The reddit class is directly depending from /utils/reddit-comment-embed which is the embedding library needed for the support
 * of dynamically added content.
 */
class RedditHover {
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
        /* As comments are the only thing implemented for now let's ignore the rest
         * TODO : 
         * - Implement users when on other sites
         * - Implement discussions (couldn't get discussion embed code from reddit when I tried (bug?))
         * - Improve link detection for comments
         */

        /* Due to lags because of the number of self referencing links on reddit */
        if ((this.CURRENT_TAB == 'reddit.com' && this.boundNode.classList.length == 0 && !this.boundNode.href.includes('#')) || this.CURRENT_TAB != 'reddit.com') {

            /* Split by '/', but remove final empty string */
            const urlChunks = this.redirectLink.replace('https://', '').split('/').filter(e => e !== '');
            /* Comments have a 7-character unique ID, which is the last slash enclosed path part */
            if (urlChunks.length == 7 && /[a-z0-9]{7}/.test(urlChunks[6])) {
                return 'comment';
            } else if (urlChunks.length == 6 && /\/comments\/[^\/]+\/[^\/]+\/?[^\/]*$/.test(this.redirectLink)) {
                return 'post';
            } else {
                return 'unknown';
            }

        } else {
            return 'unknown';
        }
    }

    bindToContainer(node, domain, container) {
        if (this.linkType == 'comment') {
            const commentId = this.redirectLink.split("/").reverse()[1]
            window
                .survolBackgroundRequest(`https://api.reddit.com/api/info/?id=t1_${commentId}`)
                .then((res) => {
                    const generatedEmbed = RedditHover.redditJsonToHoverElem(res.data, false);
                    let postContainer = document.createElement('div');
                    postContainer.className = 'survol-tooltiptext survol-tooltiptext-reddit-post';
                    postContainer.appendChild(generatedEmbed);

                    if (window.lastHovered == node) {
                        container.appendChild(postContainer);
                    }
                })
                .catch((error) => {
                    console.error('SURVOL - Background request failed', error);
                });

        } else if (this.linkType === 'post') {
            /* We need the specific post ID to get JSON */
            /* Post ID should be 6 character alpha-numeric (base36) */
            console.log(this.redirectLink);
            const postId = /\/r\/[^\/]+\/comments\/([a-z0-9]{6,})\//.exec(this.redirectLink)[1];

            window
                .survolBackgroundRequest(`https://api.reddit.com/api/info/?id=t3_${postId}`)
                .then((res) => {
                    const generatedEmbed = RedditHover.redditJsonToHoverElem(res.data);
                    let postContainer = document.createElement('div');
                    postContainer.className = 'survol-tooltiptext survol-tooltiptext-reddit-post';
                    postContainer.appendChild(generatedEmbed);

                    if (window.lastHovered == node && container.innerHTML == '') {
                        container.appendChild(postContainer);
                    }
                })
                .catch((error) => {
                    console.error('SURVOL - Background request failed', error);
                });
        }
    }

    // postData.created_utc = timestamp
    static timeSinceCreation(timestamp) {
        let secondsSinceCreation = Math.floor(Date.now() / 1000) - timestamp;

        if (secondsSinceCreation < 60) {
            return { time: secondsSinceCreation, unit: 'seconds' };
        } else if (secondsSinceCreation < 60 * 60) {
            return { time: Math.floor(secondsSinceCreation / 60), unit: 'minutes' };
        } else if (secondsSinceCreation < 60 * 60 * 24) {
            return { time: Math.floor(secondsSinceCreation / 60 / 60), unit: 'hours' };
        } else if (secondsSinceCreation < 60 * 60 * 24 * 30) {
            return { time: Math.floor(secondsSinceCreation / 60 / 60 / 24), unit: 'days' };
        } else if (secondsSinceCreation < 60 * 60 * 24 * 365) {
            return { time: Math.floor(secondsSinceCreation / 60 / 60 / 24 / 30), unit: 'months' };
        } else {
            return { time: Math.floor(secondsSinceCreation / 60 / 60 / 24 / 365 * 10) / 10, unit: 'years' };
        }
    }

    static getAuthor(json) {
        const author = document.createElement('span');
        author.className = 'survol-reddit-author';

        const postedBy = document.createTextNode('Posted by ');
        const authorBold = document.createElement('b');
        const authorName = document.createTextNode(`u/${json.author}`);

        author.append(postedBy, authorBold, authorName)
        return author;
    }

    static getSubReddit(json) {
        const subredditLink = document.createElement('a');
        const subredditLinkBold = document.createElement('b');

        subredditLinkBold.appendChild(document.createTextNode(`/${json.subreddit_name_prefixed}`));
        subredditLink.appendChild(document.createTextNode(`In `));
        subredditLink.appendChild(subredditLinkBold);

        return subredditLink;
    }
    static getUpVotes(json) {
        const scoreCommentDisplay = document.createElement('div');
        const upvoteImage = document.createElement('img');
        upvoteImage.src = chrome.extension.getURL('images/upvote.png');
        upvoteImage.className = 'survol-reddit-upvote-icon';

        scoreCommentDisplay.appendChild(upvoteImage);
        scoreCommentDisplay.appendChild(document.createTextNode(` ${json.score} `));
        return scoreCommentDisplay;
    }
    static getDatePosted(json) {
        const date = this.timeSinceCreation(json.created_utc);

        if (date.time == 1) {
            date.unit = date.unit.substr(0, date.unit.length - 1);
        }
        return document.createTextNode(date.time + ' ' + date.unit + ' ago');
    }
    static getPostTitle(json) {
        const title = document.createElement('b');
        title.className = 'survol-reddit-post-title';
        title.appendChild(document.createTextNode(json.title));
        return title;
    }
    static getPostImage(json) {
        const image = document.createElement('img');
        image.classList.add('survol-reddit-image');
        image.setAttribute('src', json.thumbnail);
        return image;
    }

    /* Parse Reddit API JSON and construct preview embed */
    static redditJsonToHoverElem(json, isPost = true) {
        const postData = json.data.children[0].data;

        // Basic HTML elements for styling
        const container = document.createElement('div');
        container.classList.add('survol-reddit-container');

        const divider = document.createElement('div');
        divider.className = 'survol-divider';

        const footer = document.createElement('div');
        footer.className = 'survol-reddit-footer';

        const postDetails = document.createElement('span');
        postDetails.className = 'survol-reddit-post-details';

        const redditLogo = document.createElement('img');
        redditLogo.src = chrome.extension.getURL('images/reddit.png');
        redditLogo.className = 'survol-reddit-logo';

        const commentImage = document.createElement('img');
        commentImage.src = chrome.extension.getURL('images/comment.png');
        commentImage.className = 'survol-reddit-comment-icon';
        //-----

        const title = RedditHover.getPostTitle(postData);
        const postImage = RedditHover.getPostImage(postData);
        const subredditLink = RedditHover.getSubReddit(postData);
        const author = RedditHover.getAuthor(postData);
        const scoreCommentDisplay = RedditHover.getUpVotes(postData);
        const datePosted = RedditHover.getDatePosted(postData);

        footer.appendChild(redditLogo);

        // Only add this for posts and not comments
        if (isPost) {
            scoreCommentDisplay.appendChild(commentImage);
            scoreCommentDisplay.appendChild(document.createTextNode(` ${postData.num_comments}`));

            footer.appendChild(title);
        }
        // Add comment text or post image | post text
        if (postData.thumbnail != 'self' && isPost) {
            container.appendChild(postImage);
        } else {
            const commentText = document.createTextNode(isPost ? postData.selftext : postData.body);
            const textElement = document.createElement('p');
            textElement.className = 'survol-reddit-selftext';
            textElement.appendChild(commentText);
            container.appendChild(textElement);
        }
        postDetails.append(author, document.createElement('br'), subredditLink, scoreCommentDisplay, datePosted);
        container.append(divider, footer);
        footer.append(postDetails);

        return container;
    }
}