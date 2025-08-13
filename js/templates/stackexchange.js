/* Hover classes bound themselves to a node
 */
class StackExchangeHover {
    constructor(node, CURRENT_TAB) {
        this.boundNode = node;
        this.redirectLink = node.href;
        this.CURRENT_TAB = CURRENT_TAB;
        this.linkType = this.checkLinkType();
    }

    /* Takes {String} link
     * Returns {String} link
     * Description: Returns the site name associated to a full link (e.g. stackoverflow, physics)
     */
    getSite(link) {
        return link.replace('http://', '').replace('https://', '').split('/')[0].split('.')[0];
    }

    /* Description: This function is unique to every Hover class,
     * its goal is to get how many accepted answer are they .
     * it can also give the code of the accepted answer.
     */
    checkLinkType() {
        if (this.CURRENT_TAB != 'stackoverflow.com' && this.CURRENT_TAB != 'stackexchange.com' && this.redirectLink.includes('/questions/')) {
            return 'question';
        } else {
            return 'unknown';
        }
    }

    /* bindToContainer
     * Parameters :
     * node - {HTMLNodeElement} - An anchor link element
     * domain - {String} - The domain of the current webpage
     * container - {HTMLNodeElement} - The survol container
     * 
     * This function is called to get the data from the link we
     * want to preview and then attach it to the container
     * Note: data is always inserted into textNodes to avoid
     * malicious script injections.
     */
    bindToContainer(node, domain, container) {
        if (this.linkType == 'question') {

            // Get the question ID and website from the URL
            const questionID = node.href.split('/questions/')[1].split('/')[0];
            const site = this.getSite(node.href);

            if (questionID) {

                // Build the API request links
                // Get a question GET /questions/{ids} - <https://api.stackexchange.com/docs/questions-by-ids>
                const QUESTION_URL = `https://api.stackexchange.com/2.2/questions/${questionID}?order=desc&sort=activity&site=${site}&filter=withBody`;

                // Get answers to a question GET /questions/{ids}/answers - <https://api.stackexchange.com/docs/answers-on-questions>
                const ANSWERS_URL = `https://api.stackexchange.com/2.2/questions/${questionID}/answers?order=desc&sort=activity&site=${site}&filter=withBody`;

                window
                    .survolBackgroundRequest(QUESTION_URL)
                    .then((res) => {
                        // Make sure the question exists
                        if (res.data && res.data.items && res.data.items[0]) {

                            let data = {
                                question: res.data.items[0]
                            };

                            // If the question has been answered query the answer
                            if (res.data.items[0].is_answered) {
                                window
                                    .survolBackgroundRequest(ANSWERS_URL)
                                    .then((res) => {

                                        // Make sure we can get the answers
                                        if (res.data && res.data.items) {
                                            data.answers = res.data.items;
                                        }

                                        this.generateEmbed(container, node, data);
                                    });
                            }

                            // Only display the question
                            else {
                                this.generateEmbed(container, node, data);
                            }
                        }
                    })
                    .catch(console.error);
            }
        }
    }

    timeSinceCreation(timestamp) {
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

    // <https://stackoverflow.com/questions/822452/strip-html-from-text-javascript/47140708#47140708>
    stripHTML(html) {
        let doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    }

    generateEmbed(container, node, data) {

        // Re-using reddit code
        const generated = document.createElement('div');
        generated.classList.add('survol-reddit-container');

        const divider = document.createElement('div');
        divider.className = 'survol-divider';

        const footer = document.createElement('div');
        footer.className = 'survol-reddit-footer';

        const postDetails = document.createElement('span');
        postDetails.className = 'survol-reddit-post-details';

        const author = document.createElement('span');
        author.className = 'survol-reddit-author';

        const title = document.createElement('strong');
        title.append(document.createTextNode(data.question.title));

        author.append(title);

        const subredditLink = document.createElement('a');
        subredditLink.appendChild(document.createTextNode(`${data.question.answer_count} answers`));

        const scoreCommentDisplay = document.createElement('div');
        const upvoteImage = document.createElement('img');
        upvoteImage.src = chrome.extension.getURL('images/upvote.png');
        upvoteImage.className = 'survol-reddit-upvote-icon';

        scoreCommentDisplay.appendChild(upvoteImage);
        scoreCommentDisplay.appendChild(document.createTextNode(` ${data.question.score} `));

        const date = this.timeSinceCreation(data.question.last_activity_date);

        if (date.time == 1) {
            date.unit = date.unit.substr(0, date.unit.length - 1);
        }

        const datePosted = document.createTextNode(`Last activity : ${date.time} ${date.unit} ago`);

        let commentText = '';
        let acceptedAnswer = null;

        if (data.answers) {
            acceptedAnswer = data.answers.filter((answers) => { return answers.is_accepted; })[0];
        }

        if (acceptedAnswer) {
            commentText = document.createElement('div');
            let answerContainer = document.createElement('div');
            let codeDiv = null;

            // To have some insight about the text after splitting
            let firstIndex = acceptedAnswer.body.startsWith('<code>') ? 0 : 1;

            // Splitting the body to extract code
            let splitted = [];
            let answerBody = acceptedAnswer.body;
            answerBody = answerBody.split('<code>');

            answerBody.forEach((part) => {
                if (part.split('</code>')[0]) {
                    splitted.push(part.split('</code>')[0]);
                }

                if (part.split('</code>')[1]) {
                    splitted.push(part.split('</code>')[1]);
                }
            });

            splitted.forEach((text, index) => {
                if (firstIndex == 0) {
                    // Code
                    if (index % 2 == 1) {
                        answerContainer.appendChild(document.createTextNode(this.stripHTML(text)));
                    }

                    // Normal text
                    else {
                        codeDiv = document.createElement('div');
                        codeDiv.className = 'survol-code-preview';
                        codeDiv.appendChild(document.createTextNode(text));
                        answerContainer.appendChild(codeDiv);
                    }
                } else {
                    // Normal text
                    if (index % 2 == 1) {
                        codeDiv = document.createElement('div');
                        codeDiv.className = 'survol-code-preview';
                        codeDiv.appendChild(document.createTextNode(text));
                        answerContainer.appendChild(codeDiv);
                    }

                    // Code
                    else {
                        answerContainer.appendChild(document.createTextNode(this.stripHTML(text)));
                    }
                }
            });

            commentText.appendChild(answerContainer);
        } else {
            commentText = document.createTextNode('Couldn\'t find an accepted answer');
        }

        const textElement = document.createElement('p');
        textElement.className = 'survol-reddit-selftext';
        textElement.appendChild(commentText);
        generated.appendChild(textElement);

        postDetails.append(author, document.createElement('br'), subredditLink, scoreCommentDisplay, datePosted);
        generated.append(divider, footer);
        footer.append(postDetails);

        let postContainer = document.createElement('div');
        postContainer.className = 'survol-tooltiptext survol-tooltiptext-reddit-post';
        postContainer.appendChild(generated);

        if (window.lastHovered == node && container.innerHTML == '') {
            container.appendChild(postContainer);
        }
    }
}