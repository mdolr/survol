/* 
 * core.js is used to reference every <a href="?"/> and link them to the different
 * hovering functions we support.
 * 
 * It is responsible for checking if links are from known or unknown website and to add events
 * regarding wether we have a template for them or not.
 */
document.addEventListener('DOMContentLoaded', () => {

    /* Keeping track of the current tab is important as we'll need to disable some of the 
     * embed shown while hovering on certain site as some already have hovering functions for profiles 
     * (ex: reddit profiles on reddit)
     */
    var CURRENT_TAB = document.location.href;

    /* Just in case some sites use the pushState js function to navigate across pages. */
    window.onpopstate = () => {
        CURRENT_TAB = document.location.href;
    };

    /* Takes {String} link
     * Returns {String} link
     * Description: Returns the domain name associated to a full link
     */
    function getDomain(link) {
        let subdomains = link.replace('http://', '').replace('https://', '').split('/')[0].split('.').length;
        return link.replace('http://', '').replace('https://', '').split('/')[0].split('.').slice(subdomains - 2, subdomains).join('.');
    }

    /* Returns the adequate hover element for a given link
     * takes 
     * {Node} node
     * {String} link
     */
    function dispatcher(node, link) {
        let domain = getDomain(link);

        switch (domain) {
            case 'reddit.com':
                return new RedditHover(node);
            default:
                break;
                //return new BaseHover(node);
        }
    }

    /* Retrieves every <a> element on the page
     * it is separated as some sites need to reload displayed elements (ex: Twitter deletes nodes out of the screen)
     * resolves a Nodelist see <https://developer.mozilla.org/fr/docs/Web/API/Document/querySelectorAll>
     */
    function gatherHrefs() {
        return new Promise((resolve, reject) => {
            document.querySelectorAll('a').length ? resolve(document.querySelectorAll('a')) : reject('Can\'t find a single <a> node');
        });
    }

    /* Takes a nodelist as an argument */
    function equipNodes(nodes) {
        return new Promise((resolve, reject) => {
            nodes.forEach((node) => {
                if (node.href) {
                    dispatcher(node, node.href);
                }
            });
        });
    }

    gatherHrefs()
        .then(equipNodes);
});