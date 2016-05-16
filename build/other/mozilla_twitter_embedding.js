/**
 * "It'd be good that you have the complete function and toString() call (or the function in string form)
 *  in that section of the code, rather than reference a function that is elsewhere" (c) Jorge Villalobos
 */

/**
 * Встраиваем твиты из Твиттера
 *
 * Заглушка для Fx
 */
function twitter_tweet_embedding_init() {
    // Встраиваем скрипт так, как описано в best twitter practice https://dev.twitter.com/web/javascript/loading
    var script_text = 'window.twttr = (function(d, s, id) {\
        var js, fjs = d.getElementsByTagName(s)[0],\
            t = window.twttr || {};\
        if (d.getElementById(id)) {\
            return t;\
        }\
        js = d.createElement(s);\
        js.id = id;\
        js.src = "https://platform.twitter.com/widgets.js";\
        fjs.parentNode.insertBefore(js, fjs);\
\
        t._e = [];\
        t.ready = function(f) {\
            t._e.push(f);\
        };\
        setTimeout(twitter_tweet_embedding_wait_for_ready_injected, 100);\
\
        return t;\
    }(document, "script", "twitter-wjs"));';

    var other_code = '%%FX_TWITTER_CODE%%';
    var e = document.createElement("script");
    e.appendChild(document.createTextNode(other_code + script_text));
    document.body.appendChild(e);
}
