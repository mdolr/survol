// https://docs.embed.ly/docs/platformjs
(function(w, d){
    setTimeout(function(){
        var id='embedly-platform', n = 'script', h = 'head';
        if (!d.getElementById(id)){
            w.embedly = w.embedly || function() {(w.embedly.q = w.embedly.q || []).push(arguments);};
            var e = d.createElement(n); e.id = id; e.async=1;
            e.src = ('https:' === document.location.protocol ? 'https' : 'http') + '://cdn.embedly.com/widgets/platform.js';
            var s = d.getElementsByTagName(h)[0];
            s.appendChild(e);
        }
    },100);
})(window, document);