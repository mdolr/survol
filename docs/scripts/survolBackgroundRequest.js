/**
 * Override js/core.js window.survolBackgroundRequest
 */
var REQUEST_CACHE = {};

// Clear cache every 10 mins
setInterval(() => {
    REQUEST_CACHE = {};
}, 1000 * 60 * 10);

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.survolBackgroundRequest = (url, noJSON) => {

            return new Promise((resolve, reject) => {
                let req = { data: { url, noJSON } };
                let res = { status: 'error', data: null };

                // if the request is cached
                if (REQUEST_CACHE[req.data.url]) {
                    res = REQUEST_CACHE[req.data.url];
                    res.cached = true;
                    resolve(res);
                }

                // If the request isn't cached
                else {
                    fetch(`https://cors-anywhere.herokuapp.com/${req.data.url}`)
                        .then((data) => { return req.data.noJSON ? data.text() : data.json(); })
                        .then((data) => {
                            res.data = data;
                            res.status = 'OK';
                            res.cached = false;
                            REQUEST_CACHE[req.data.url] = res;
                            resolve(res);
                        })
                        .catch((error) => {
                            res.data = error;
                            res.status = 'error';

                            console.error('SURVOL - Fetching error', error);
                            reject(res);
                        });
                }
            });
        };
    }, 50);
});