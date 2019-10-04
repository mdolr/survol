/* Trying things see: <https://twittercommunity.com/t/twitter-widget-not-working-as-content-script/130526> */
twttr.ready(() => {
    console.log('Twttr ready!');

    twttr.events.bind('loaded', (event) => {
        console.log('Load event', event);
    });

    twttr.widgets.load().then(() => { console.log('Success?'); }).catch((error) => { console.log('Error', error); });
    twttr.widgets.createTweet('1178129849057038337', document.getElementById('tweet')).then(() => { console.log('Success?'); }).catch((error) => { console.log('Error', error); });
});