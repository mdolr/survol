/* Hover classes bound themselves to a node
 */
class TwitterHover {
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
        if (this.CURRENT_TAB == 'twitter.com') return 'unknown';
        else if (this.redirectLink.includes('/status/')) return 'tweet';
    }

    bindToNode() {
        if (this.linkType == 'tweet') {

            /* TODO :
             * - Handle embeds
             * - Add tweet date
             * - Get a way to display profile picture etc (i.e: generate tweet like a normal embed would do)
             * - Clean the CSS to make
             */

            window
                .survolBackgroundRequest(`https://publish.twitter.com/oembed?url=${this.redirectLink}`)
                .then(({ data }) => {
                    // Get and clean 
                    const { author_name: tweetAuthorName, author_url, html } = data;
                    const tweetAuthorUsername = author_url.split('twitter.com/')[1];
                    const tweetContent = html.split('dir="ltr">')[1].split('</p>')[0];

                    // Create div content
                    let tweetContainer = document.createElement('div');
                    tweetContainer.className = 'survol-tooltiptext';

                    let container = document.createElement('div');
                    container.className = 'survol-twitter-container';

                    let name = document.createElement('b');
                    name.appendChild(document.createTextNode(tweetAuthorName));

                    let twitterAt = document.createElement('span');
                    twitterAt.className = 'survol-twitter-at';
                    twitterAt.appendChild(document.createTextNode(` @${tweetAuthorUsername}`));

                    let author = document.createElement('div');
                    author.className = 'survol-twitter-author';
                    author.appendChild(name);
                    author.appendChild(twitterAt);

                    let content = document.createElement('div');
                    content.className = 'survol-twitter-content';
                    content.appendChild(document.createTextNode(tweetContent));

                    let linkContainer = document.createElement('div');
                    linkContainer.className = 'survol-twitter-source';

                    let link = document.createElement('a');
                    link.setAttribute('src', this.redirectLink);
                    link.appendChild(document.createTextNode('Tweet on twitter.com'));

                    linkContainer.appendChild(link);

                    container.appendChild(author);
                    container.appendChild(content);
                    container.appendChild(linkContainer);

                    this.boundNode.classList.add('survol-tooltip');

                    tweetContainer.appendChild(container);
                    this.boundNode.appendChild(tweetContainer);
                })
                .catch(console.error);

        }
    }
}