/* Hover classes bound themselves to a node
 */
class TwitterHover {
    constructor(node, CURRENT_TAB) {
        this.boundNode = node;
        this.redirectLink = node.href;
        this.CURRENT_TAB = CURRENT_TAB;
        this.linkType = this.checkLinkType();
        this.parser = new DOMParser();
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
             * - Get a way to display profile picture etc (i.e: generate tweet like a normal embed would do)
             * - Add line returns
             */

            window
                .survolBackgroundRequest(`https://publish.twitter.com/oembed?url=${this.redirectLink}&hide_thread=true`)
                .then(({ data }) => {
                    // Get and clean 
                    const { author_name: tweetAuthorName, author_url, html } = data;
                    const tweetAuthorUsername = author_url.split('twitter.com/')[1];
                    const tweetContent = html.split('dir="ltr">')[1].split('</p>')[0]; /* .replace(/<br>/gmi, '\n'); find a way to add line return in tweets*/
                    const htmlDoc = this.parser.parseFromString(html, 'text/html');
                    // Get the date and converting it to default locale date (depending on user's computer locale)
                    const htmlDocDate = htmlDoc.getElementsByTagName('a')[htmlDoc.getElementsByTagName('a').length - 1].text;
                    const tweetDate = new Date(htmlDocDate).toLocaleDateString(undefined, { dateStyle: 'long' });

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

                    let date = document.createElement('span');
                    date.className = 'survol-twitter-date';
                    date.appendChild(document.createTextNode(tweetDate));

                    let link = document.createElement('a');
                    link.setAttribute('src', this.redirectLink);
                    link.appendChild(document.createTextNode('Tweet on twitter.com'));

                    // if tweet has no media media is null
                    // added for potential media embedding in the future
                    let htmlmedia = (htmlDoc.getElementsByTagName('a').length > 1 ? htmlDoc.getElementsByTagName('a')[0] : null);


                    linkContainer.appendChild(link);

                    container.appendChild(author);
                    container.appendChild(content);
                    container.appendChild(date);
                    container.appendChild(linkContainer);

                    this.boundNode.classList.add('survol-tooltip');

                    tweetContainer.appendChild(container);
                    this.boundNode.appendChild(tweetContainer);
                })
                .catch(console.error);

        }
    }
}