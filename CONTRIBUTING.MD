# How to contribute
Everything you need to know before making a pull request


## Guidelines
* Please test your PR before submitting it
* Using `console.log` while testing is fine but please remove them from your PR when pushing it
* Don't fix more than one issue by PR if possible, make multiple PRs when you want to work on multiple issues.
* Don't be afraid to ask questions!

## Quick introduction to the project

Survol is a browser extension, the goal is to provide a preview for every hoverable link on a page (every <a href="..." element).  
We might use "survol-able" to say that a link works with the extension.

## Main script : `js/core.js`
It is a content script, injected on each page. 
The core script injects the "survol-container" div into the DOM, positions the div, and fill it with content.  

It uses the mousemove event to detect when the cursor is hovering an anchor link. It is responsible for checking if this anchor link has an href, if the link should be previewed or not, and which preview template should be used.  

It defines functions like :
* `insertSurvolDiv` : This function:
     * - Inserts the div into the DOM
     * - Positions the div
     * - Applies the div theme (light/dark)
     * - Detects anchor link hovering

* `survolBackgroundRequest` : which sends data to the background, using browser messages, script when we need to make a request in order to avoid CORS. 

* `dispatcher` : given a link it returns which template should be used and checks if the link should be previewed

## Templates

There are 2 types of templates :  
Every templates has a `bindToContainer` function in which it attachs itself to the survol div.

### Base template : `js/templates/base.js`
This file is used to preview anything that hasn't a custom implementation, it pulls data by doing a background request and parses meta tags (title, description, thumbnail) to build the preview

### Custom templates : `js/templates/[website].js`
These files are custom implementations of a certain website, they pull data using APIs and display more data (reddit upvote count and post date, twitter tweet's author profile picture, ...)  

They also check if they are not affecting native integrations, Github, wikipedia already provide preview for everything on their site so custom templates shouldn't work when the site already has an implementation (i.e: disable wikipedia template on wikipedia)  

A template might implement multiple things depending on the link type (reddit comments vs reddit posts, youtube channels vs videos, tweet vs twitter profile) ...

## Background requests : `js/background/auxiliary.js`
Everything related to request should be done here in order to avoid CORS. It communicates with the front script using browser background messages.
