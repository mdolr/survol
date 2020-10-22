/* Hover classes bound themselves to a node
 */
class GitHubHover {
    constructor(node, CURRENT_TAB) {
        this.boundNode = node;
        this.redirectLink = node.href;
        this.CURRENT_TAB = CURRENT_TAB;
        this.linkType = this.checkLinkType();
        this.parser = new DOMParser();
    }

    checkLinkType() {
        if (this.CURRENT_TAB == 'github.com' || this.redirectLink.match(/(github.com)\/[\w]{1,256}\/[\w]{1,256}\/[\w]/g)) return 'unknown';
        else if (this.redirectLink.match(/(github.com)\/[\w]{1,256}\/[\w]{1,256}/g)) return 'repo';
        else return 'profile';
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
        if (this.linkType == 'profile') {

            const username = this.redirectLink.split('github.com/')[1];

            window
                .survolBackgroundRequest(`https://api.github.com/users/${username}`)
                .then(({ data }) => {

                    let githubContainer = document.createElement('div');
                    githubContainer.className = 'survol-github-container';

                    let githubProfileContainer = document.createElement('div');
                    githubProfileContainer.id = 'survol-github-profile';

                    let profilePic = document.createElement('img');
                    profilePic.id = 'survol-github-avatar';
                    profilePic.src = data.avatar_url;
                    profilePic.style.width = '80px';
                    githubProfileContainer.appendChild(profilePic);

                    let profInfo = document.createElement('div');
                    profInfo.id = 'survol-github-user-info';
                    
                    profInfo.style = 'display: inline-block';

                    let name = document.createElement('span');
                    name.className = 'survol-github-name';
                    name.appendChild(document.createTextNode(data.name));

                    let githubAt = document.createElement('span');
                    githubAt.className = 'survol-github-at';
                    githubAt.appendChild(document.createTextNode(` @${data.login}`));
                    
                    let bio = document.createElement('span');
                    bio.className = 'survol-github-bio' ;
                    bio.appendChild(document.createTextNode(data.bio? data.bio : ''));

                    profInfo.appendChild(name);
                    profInfo.appendChild(githubAt);
                    profInfo.appendChild(bio);

                    githubProfileContainer.appendChild(profInfo);

                    let profStats = document.createElement('div');
                    profStats.className = "survol-github-profile-stats";

                    let statdata = [{'name' : 'Repos', 'stat': data.public_repos},
                                    {'name' : 'Followers', 'stat': data.followers},
                                    {'name' : 'Following', 'stat': data.following}];

                    statdata.forEach((x)=>{
                        let stat = document.createElement('a');
                        stat.className = 'survol-github-profile-stat';

                        let statNumber = document.createElement('b');
                        statNumber.className = 'survol-github-prof-stat-val';
                        statNumber.appendChild(document.createTextNode(x.stat));
                        let statName = document.createElement('span');
                        statName.className = 'survol-github-prof-stat-name';
                        statName.appendChild(document.createTextNode(x.name));

                        stat.appendChild(statNumber);
                        stat.appendChild(statName);

                        profStats.appendChild(stat);
                    });

                    
                    githubProfileContainer.appendChild(profStats);

                    let githubLinksContainer = document.createElement('div');
                    githubLinksContainer.className = 'survol-github-links';

                    let links = [{"name": "Workplace: ", "link" : data.company? data.company : 'not available'},
                                  {"name": "Twitter: ", "link" : data.twitter_username ? '@' + data.twitter_username : 'not available'},
                                  {"name": "Website: ", "link" : data.blog? data.blog : 'not available'}];

                    links.forEach((link)=>{
                        let linkContainer = document.createElement('div');

                        let linkName = document.createElement('span');
                        linkName.appendChild(document.createTextNode(link.name));
                        linkName.className = 'survol-github-link';

                        linkContainer.appendChild(linkName);

                        let linkText = document.createElement('span');
                        linkText.appendChild(document.createTextNode(link.link));

                        if (link.link.includes('not available')){
                            linkText.className = 'survol-github-link empty';
                        }else{
                            linkText.className = 'survol-github-link';
                        }

                        linkContainer.appendChild(linkText);

                        githubLinksContainer.appendChild(linkContainer);
                    })
                    
                    githubProfileContainer.appendChild(githubLinksContainer);

                    githubContainer.appendChild(githubProfileContainer);

                    if (window.lastHovered == node && container.innerHTML == '') {
                        container.appendChild(githubContainer);
                    }
                })
                .catch(console.error);

        }
    }
}