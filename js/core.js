/* core.js is the heart of the extension.
 * It is a content script, injected on each page.
 * 
 * The core script injects the "survol-container" div into the DOM,
 * positions the div, and fill it with content.
 * 
 * It uses the mousemove event to detect when the cursor is hovering an anchor link (<a href>)
 * It is responsible for checking if this anchor link has an href, if the link should be
 * previewed or not, and which preview template should be used.
 */
document.addEventListener('DOMContentLoaded', () => {

    /* Keeping track of the current tab is important as we'll need to disable some of the
     * embed shown while hovering on certain site as some already have hovering functions for profiles
     * (ex: reddit profiles on reddit)
     */
    var CURRENT_TAB = document.location.href;

    // The survol container div used to preview content.
    var container = document.createElement('div');

    // Those are settings
    var previewMetadata = true;
    var darkTheme = false;

    // The intent timeout is used to make sure the user wants to preview a certain link
    // by checking if the user hovers it for more than {intent} seconds.
    var intentTimeout = null;
    var intent = 0.75; // Wait duration in seconds before loading the preview

    // Just in case some sites use the pushState js function to navigate across pages. Updates the current taba
    window.onpopstate = () => {
        CURRENT_TAB = document.location.href;
    };

    // We use this to keep track of which anchor link is currently hovered, can be null if no anchor link is hovered
    window.lastHovered = null;

    /* <https://www.chromium.org/Home/chromium-security/extension-content-script-fetches>
     * "Later in 2019, Extension Manifest V3 will become available, requiring cross-origin requests to occur in background pages rather than content scripts.  This new manifest version will have its own migration period, before support for Extension Manifest V2 is eventually removed from Chrome."
     * 
     * Using the background script to pull data from APIs safely, i.e forwarding request from the content script to the background script
     * Direct asynchronous messaging, making it as a function to avoid having some request code across every file
     *
     * survolBackgroundRequest
     * Parameters:
     * url - {String} - The request URL
     * noJSON - {Boolean} - If the response should be JSON parsed or just returned as text
     *
     * The whole logic behind this function is situated in js/background/auxiliary.js
     */
    window.survolBackgroundRequest = (url, noJSON) => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: 'request', data: { url, noJSON } }, (res) => {
                (res.status == 'OK') ? resolve(res): reject(res);
            });
        });
    };

    /* insertSurvolDiv
     * Parameters: 
     * selfReferDisabled - {Boolean} - A setting to disable preview of inner links on a list of websites.
     *
     * This function:
     * - Inserts the div into the DOM
     * - Positions the div
     * - Applies the div theme (light/dark)
     * - Detects anchor link hovering
     */
    function insertSurvolDiv(selfReferDisabled) {
        return new Promise((resolve) => {
            container.className = `survol-container ${darkTheme ? 'dark-theme' : ''} hidden`;
            container.id = 'survol-container';

            //set the buffer (popup distance from mouse)
            const buffer = 20;

            // On cursor movement
            document.addEventListener('mousemove', function (e) {

                // Query select every anchor link that is currently hovered and check if it is different
                // than the last hovered element = detect when we hover a link
                if (document.querySelectorAll('a:hover')[0] != window.lastHovered) {

                    window.lastHovered = document.querySelectorAll('a:hover')[0];
                    container.innerHTML = ''; // Reset the preview, if the link changes or a link is not hoevered anymore

                    // If we're hovering a link
                    if (document.querySelectorAll('a:hover')[0] && document.querySelectorAll('a:hover')[0].href) {
                        // Check if the user stays for more than {intent} seconds
                        intentTimeout = setTimeout(() => {
                            if (window.lastHovered && window.lastHovered.href) {
                                // Let the dispatcher handle which template should be used
                                dispatcher(window.lastHovered, window.lastHovered.href, selfReferDisabled);
                            }
                        }, 1000 * intent);
                    }

                    // If nothing is hovered
                    else {
                        // The user doesn't want to preview anything, hide the container
                        clearTimeout(intentTimeout);
                        container.className = `survol-container ${darkTheme ? 'dark-theme' : ''} hidden`;
                        container.innerHTML = '';
                    }
                }

                //get the popup dims
                let popupWidth = container.clientWidth;
                let popupHeight = container.clientHeight;
                //get the current scroll distance
                let scrolled = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;

                //calculate the popup positions
                //if the current mouse X position plus the popup width is greater than the width of the viewport set the popup to the left, else right
                let leftPosition = (e.pageX + popupWidth + buffer >= window.innerWidth) ? `${e.pageX - (popupWidth + buffer)}px` : `${e.pageX + buffer}px`;
                //if the current mouse Y position (mius scroll distance) plus the popup height is greater than viewport height, set the popup above mouse, else below
                let topPosition = ((e.pageY - scrolled) + popupHeight + buffer >= window.innerHeight) ? `${e.pageY - (popupHeight + buffer)}px` : `${e.pageY + buffer}px`;

                //update the popup with the calculated values
                container.style.left = leftPosition;
                container.style.top = topPosition;

            });

            // Insert the container into the DOM
            document.body.appendChild(container);
            resolve();
        });
    }

    /* getDomain
     * Parameters:
     * link - {String} - A full URL
     * Returns {String} - The domain name + TLD ex: example.com, github.com
     * Description: Returns the domain name associated to a full link
     */
    function getDomain(link) {
        let subdomains = link.replace('http://', '').replace('https://', '').split('/')[0].split('.').length;
        return link.replace('http://', '').replace('https://', '').split('/')[0].split('.').slice(subdomains - 2, subdomains).join('.');
    }

    /* getPotentialHover
     * Parameters:
     * node - {HTMLNodeElement} - An anchor link element (<a href="...">)
     * domain - {String} - A domain name + TLD
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

                // If the site has no custom template, it should be previewed using meta-data parsing
            default:
                return previewMetadata ? new BaseHover(node, getDomain(CURRENT_TAB)) : null;
        }
    }

    /* dispatcher
     * Parameters:
     * node - {HTMLNodeElement} - The currently hovered anchor link
     * link - {String} - The link which the anchor link points to
     * selfReferDisabled - {Boolean} - Setting to know if inner links should be previewed or not
     */
    function dispatcher(node, link, selfReferDisabled) {
        // Get the domain which the anchor link points to
        let domain = getDomain(link);

        // Make sure inner links are not disabled || this is not an inner link
        if (!selfReferDisabled || domain.toLowerCase() != getDomain(CURRENT_TAB).toLowerCase()) {

            // Get the template that should be used to preview the link
            let potentialHover = getPotentialHover(node, domain);

            // If a template exists which means the website should be previewed
            // make sure the link is correct and then bind the template to the container
            if (potentialHover && potentialHover.bindToContainer != null && node.href && node.href.startsWith('http')) {
                potentialHover.bindToContainer(node, domain, container);
                container.className = `survol-container ${darkTheme ? 'dark-theme' : ''}`;
                window.lastHovered = node;
            }

            // If the node / anchor link is invalid
            else {
                // In case the node has no href feed it to the garbage collector
                potentialHover = null;
            }
        }
    }


    // This part is used to determine the environnement in which the extension is running
    // as this script is also used on https://survol.me so users can test the extension
    // before downloading it

    // If running in extension mode
    if ((window.chrome && chrome.runtime && chrome.runtime.id) || chrome) {

        // Load the settings using the chrome storage API
        chrome.storage.local.get(['disabledDomains', 'selfReferDisabled', 'previewMetadata', 'darkThemeToggle'], function (res) {

            // Initialize the settings in case they're not
            let disabledDomains = res.disabledDomains ? res.disabledDomains : ['survol.me'];
            let selfReferDisabled = res.selfReferDisabled ? res.selfReferDisabled.includes(getDomain(CURRENT_TAB).toLowerCase()) : false;

            if (res.previewMetadata === false) {
                previewMetadata = false;
            }

            if (res.darkThemeToggle === true) {
                darkTheme = true;
            }

            // If the extension is not disabled on the currently visited website
            // and the current website is not a wordpress admin panel (have encoutered some problems with the extension there in the past)
            if (!disabledDomains.includes(getDomain(CURRENT_TAB).toLowerCase()) && !CURRENT_TAB.includes('/wp-admin')) {
                insertSurvolDiv(selfReferDisabled);
            }
        });
    }

    // Else the script is running in demo-mode on survol.me, no need to worry about settings
    else {
        insertSurvolDiv();
    }
});