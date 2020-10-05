document.addEventListener('DOMContentLoaded', function () {
    fetch('https://api.github.com/repos/mdolr/survol/contributors')
        .then(function (res) {
            return res.json();
        })
        .then(function (res) {
            res.forEach(function (user) {
                if (user.login != 'mdolr') {
                    let profilePicture = document.createElement('img');
                    profilePicture.src = user.avatar_url;
                    profilePicture.className = 'contributor-image';

                    let tr = document.createElement('tr');
                    let tdPicture = document.createElement('td');
                    tdPicture.appendChild(profilePicture);

                    let tdUsername = document.createElement('td');
                    let a = document.createElement('a');
                    a.href = 'https://github.com/' + user.login;
                    a.target = '_blank';
                    a.rel = 'nofollow';
                    a.className = 'link';
                    a.appendChild(document.createTextNode('@' + user.login.toString()));
                    tdUsername.appendChild(a);

                    let tdBio = document.createElement('td');
                    tdBio.appendChild(document.createTextNode('Contributor'));

                    let tdContrib = document.createElement('td');
                    tdContrib.appendChild(document.createTextNode(user.contributions.toString()));

                    tr.appendChild(tdPicture);
                    tr.appendChild(tdUsername);
                    tr.appendChild(tdBio);
                    tr.appendChild(tdContrib);

                    document.getElementById('contributors').appendChild(tr);
                } else {
                    document.getElementById('mdolr-contributions').innerText = user.contributions.toString();
                }
            });
        })
        .catch(function (error) {
            console.error(error);
        })
});