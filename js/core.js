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
    var previewMetadata = true;
    var darkTheme = false;
    var container = document.createElement('div');
    var capturedNodes = [];

    /* Just in case some sites use the pushState js function to navigate across pages. */
    window.onpopstate = () => {
        CURRENT_TAB = document.location.href;
    };

    window.lastHovered = null;

    /* <https://www.chromium.org/Home/chromium-security/extension-content-script-fetches>
     * "Later in 2019, Extension Manifest V3 will become available, requiring cross-origin requests to occur in background pages rather than content scripts.  This new manifest version will have its own migration period, before support for Extension Manifest V2 is eventually removed from Chrome."
     * Using the background script to pull data from APIs safely, i.e forwarding request from the content script to the background script
     * Direct asynchronous messaging, making it as a function to avoid having some request code across every file
     */
    window.survolBackgroundRequest = (url, noJSON) => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: 'request', data: { url, noJSON } }, (res) => {
                (res.status == 'OK') ? resolve(res): reject(res);
            });
        });
    };

    /* Used to do everything using CSS, however it was messy.
     * We will now use a single div that we will move across the screen based on the mouse position
     */
    function insertSurvolDiv() {
        return new Promise((resolve) => {
            container.className = `survol-container ${darkTheme ? 'dark-theme' : ''} hidden`;
            container.id = 'survol-container';

            //set the buffer (popup distance from mouse)
            const buffer = 20;

            document.addEventListener('mousemove', function (e) {

                // Link detection, doesn't need to refresh nodes on asynchronous requests, doesn't need to add thousands of event listener
                // Pretty reliable
                if (document.querySelectorAll('a:hover')[0] != window.lastHovered) {
                    window.lastHovered = document.querySelectorAll('a:hover')[0];

                    if (document.querySelectorAll('a:hover')[0]) {
                        dispatcher(window.lastHovered, window.lastHovered.href);
                    } else {
                        container.className = `survol-container ${darkTheme ? 'dark-theme' : ''} hidden`;
                        container.innerHTML = '';
                    }
                }

                //get the popup dims
                let popupWidth = container.clientWidth;
                let popupHeight = container.clientHeight;
                //get the current scroll distance
                let scrolled = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop

                //calculate the popup positions
                //if the current mouse X position plus the popup width is greater than the width of the viewport set the popup to the left, else right
                let leftPosition = (e.pageX + popupWidth + buffer >= window.innerWidth) ? `${e.pageX - (popupWidth + buffer)}px` : `${e.pageX + buffer}px`;
                //if the current mouse Y position (mius scroll distance) plus the popup height is greater than viewport height, set the popup above mouse, else below
                let topPosition = ((e.pageY - scrolled) + popupHeight + buffer >= window.innerHeight) ? `${e.pageY - (popupHeight + buffer)}px` : `${e.pageY + buffer}px`;

                //update the popup with the calculated values
                container.style.left = leftPosition;
                container.style.top = topPosition;

            });

            document.body.appendChild(container);

            // MutationObserver will observe the page if there is any nodes are added to the page
            /*const observer = new MutationObserver(domMutationCallback);
            const bodyNode = document.getElementsByTagName('BODY')[0];
            const config = { childList: true, subtree: true };
            observer.observe(bodyNode, config);*/

            resolve();
        });
    }

    /* Takes {String} link
     * Returns {String} link
     * Description: Returns the domain name associated to a full link
     */
    function getDomain(link) {
        let subdomains = link.replace('http://', '').replace('https://', '').split('/')[0].split('.').length;
        return link.replace('http://', '').replace('https://', '').split('/')[0].split('.').slice(subdomains - 2, subdomains).join('.');
    }

    /* Node is a DOM Node
     * domain is a string
     * Description: Returns the correct hover CLass for a given domain.
     */
    function getPotentialHover(node, domain) {
        switch (domain) {
            case 'reddit.com':
                return new RedditHover(node, getDomain(CURRENT_TAB));
            case 'wikipedia.org':
                return new WikipediaHover(node, getDomain(CURRENT_TAB));
            case 'youtube.com':
            case 'youtu.be':
                return new YoutubeHover(node, getDomain(CURRENT_TAB));
            case 'twitter.com':
                return new TwitterHover(node, getDomain(CURRENT_TAB));
            case 'stackoverflow.com':
                return new StackExchangeHover(node, getDomain(CURRENT_TAB));
            case 'soundcloud.com':
                return new SoundCloudHover(node, getDomain(CURRENT_TAB));

            default:
                return previewMetadata ? new BaseHover(node, getDomain(CURRENT_TAB)) : null;
                //return new BaseHover(node);
        }
    }

    /* Checks if the hover class is working with the given link and deletes it if it's not.
     * takes
     * {Node} node
     * {String} link
     */
    function dispatcher(node, link) {
        let domain = getDomain(link);

        let potentialHover = getPotentialHover(node, domain);
        /* If we do not support the domain we might not get anything in return of getPotentialHover */
        if (potentialHover && potentialHover.bindToContainer != null && node.href && node.href.startsWith('http') && isNotCaptured(node)) {
            potentialHover.bindToContainer(node, domain, container);
            container.className = `survol-container ${darkTheme ? 'dark-theme' : ''}`;
            window.lastHovered = node;
        } else {
            // In case the node has no href feed it to the garbage collector
            potentialHover = null;
        }
    }

    // If the script is part of the extension
    if ((window.chrome && chrome.runtime && chrome.runtime.id) || chrome) {
        chrome.storage.local.get(['disabledDomains', 'previewMetadata', 'darkThemeToggle'], function (res) {
            let disabledDomains = res.disabledDomains ? res.disabledDomains : ['survol.me'];

            if (res.previewMetadata === false) {
                previewMetadata = false;
            }

            if (res.darkThemeToggle === true) {
                darkTheme = true;
            }

            if (!disabledDomains.includes(getDomain(CURRENT_TAB).toLowerCase())) {
                insertSurvolDiv();
            }
        });
    }

    // Else the script is running in demo-mode on survol.me
    else {
        insertSurvolDiv();
    }
});