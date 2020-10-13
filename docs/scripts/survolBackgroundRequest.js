/**
 * Override js/core.js window.survolBackgroundRequest
 * Force request cache because cors-anywhere is overloaded.
 */
var REQUEST_CACHE = {
    'https://en.wikipedia.org/api/rest_v1/page/summary/Product_Hunt': JSON.parse(`{"status":"OK","data":{"type":"standard","title":"Product Hunt","displaytitle":"Product Hunt","namespace":{"id":0,"text":""},"wikibase_item":"Q18153331","titles":{"canonical":"Product_Hunt","normalized":"Product Hunt","display":"Product Hunt"},"pageid":43328771,"thumbnail":{"source":"https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/Product_Hunt_Homepage_2019.png/320px-Product_Hunt_Homepage_2019.png","width":320,"height":181},"originalimage":{"source":"https://upload.wikimedia.org/wikipedia/en/7/7e/Product_Hunt_Homepage_2019.png","width":420,"height":238},"lang":"en","dir":"ltr","revision":"978508583","tid":"a401cf40-f739-11ea-abfb-853904482b72","timestamp":"2020-09-15T09:55:48Z","description":"product discovery website","description_source":"central","content_urls":{"desktop":{"page":"https://en.wikipedia.org/wiki/Product_Hunt","revisions":"https://en.wikipedia.org/wiki/Product_Hunt?action=history","edit":"https://en.wikipedia.org/wiki/Product_Hunt?action=edit","talk":"https://en.wikipedia.org/wiki/Talk:Product_Hunt"},"mobile":{"page":"https://en.m.wikipedia.org/wiki/Product_Hunt","revisions":"https://en.m.wikipedia.org/wiki/Special:History/Product_Hunt","edit":"https://en.m.wikipedia.org/wiki/Product_Hunt?action=edit","talk":"https://en.m.wikipedia.org/wiki/Talk:Product_Hunt"}},"extract":"Product Hunt is an American website that lets users share and discover new products. The site, which was founded by Ryan Hoover in November 2013, is backed by Y Combinator. Users submit products, which are listed in a linear format by day. The site includes a comments system and a voting system similar to Hacker News or Reddit. The products with the most votes rise to the top of each day's list.","extract_html":"<p><b>Product Hunt</b> is an American website that lets users share and discover new products. The site, which was founded by Ryan Hoover in November 2013, is backed by Y Combinator. Users submit products, which are listed in a linear format by day. The site includes a comments system and a voting system similar to Hacker News or Reddit. The products with the most votes rise to the top of each day's list.</p>"},"cached":false}`),
    'https://www.producthunt.com/': { status: 'OK', data: '<!DOCTYPE html><html><head><title>Product Hunt – The best new products in tech.</title><meta name="description" content="Product Hunt is a curation of the best new products, every day. Discover the latest mobile apps, websites, and technology products that everyone&#x27;s talking about.\"/>' },
    'https://publish.twitter.com/oembed?url=https://twitter.com/hacktoberfest/status/1295752863986196480&hide_thread=true': {
        status: 'OK',
        data: {
            url: 'https://twitter.com/hacktoberfest/status/1295752863986196480',
            author_name: 'Hacktoberfest',
            author_url: 'https://twitter.com/hacktoberfest',
            html: '<blockquote class=\"twitter-tweet\"><p lang=\"en\" dir=\"ltr\">Welcome to <a href=\"https://twitter.com/hashtag/Hacktoberfest?src=hash&amp;ref_src=twsrc%5Etfw\">#Hacktoberfest</a> 2020! Get involved with open source this October and earn yourself some swag. 👕 Brought to you by <a href=\"https://twitter.com/digitalocean?ref_src=twsrc%5Etfw\">@digitalocean</a>, <a href=\"https://twitter.com/intel?ref_src=twsrc%5Etfw\">@intel</a> and <a href=\"https://twitter.com/ThePracticalDev?ref_src=twsrc%5Etfw\">@ThePracticalDev</a>, our site has more details and great resources: <a href=\"https://t.co/EABbXwl8QX\">https://t.co/EABbXwl8QX</a> 🔗 💙</p>&mdash; Hacktoberfest (@hacktoberfest) <a href=\"https://twitter.com/hacktoberfest/status/1295752863986196480?ref_src=twsrc%5Etfw\">August 18, 2020</a></blockquote>\n<script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>',
            width: 550,
            height: null,
            type: 'rich',
            cache_age: '3153600000',
            provider_name: 'Twitter',
            provider_url: 'https://twitter.com',
            version: '1.0'
        },
        cached: false
    }
};

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