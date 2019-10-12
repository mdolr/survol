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

            /* TODO :
             * - Handle embeds
             * - Add tweet date
             * - Get a way to display profile picture etc (i.e: generate tweet like a normal embed would do)
             * - Clean the CSS to make
             */

            window
                .survolBackgroundRequest(`https://publish.twitter.com/oembed?url=${this.redirectLink}`)
                .then((res) => {
                    let tweetContainer = document.createElement('div');
                    tweetContainer.className = 'survol-tooltiptext survol-tweet';

                    let container = document.createElement('blockquote');
                    container.className = 'twitter-tweet';

                    let tweetContent = document.createElement('p');
                    tweetContent.setAttribute('lang', 'en');
                    tweetContent.setAttribute('dir', 'ltr');
                    tweetContent.appendChild(document.createTextNode(res.data.html.split('dir="ltr">')[1].split('</p>')[0]));

                    /*let link = document.createElement('a');
                    link.setAttribute('src', this.redirectLink);
                    link.appendChild(document.createTextNode('date));*/

                    container.appendChild(tweetContent);
                    container.appendChild(document.createTextNode(`${res.data.author_name} - (@${res.data.author_url.split('twitter.com/')[1]})`));
                    //container.appendChild(link);

                    this.boundNode.classList.add('survol-tooltip');

                    tweetContainer.appendChild(container);
                    this.boundNode.appendChild(tweetContainer);
                })
                .catch(console.error);

        }
    }
}