var tabs = require("sdk/tabs");
var utils = require('sdk/window/utils');

// Эта функция вызывается один раз при неясных обстоятельствах
function url_icon_init(window, callback) {
    url_icon_create(window, callback);

    tabs.on('open', function (tab) {
        // console.log(tab.id + ', ' + tab.url + " is open: %O %O", utils.getToplevelWindow(window), utils.windows());

        // Вешаем обработчики
        tab.on("load", function (tab) {
            //console.log(tab.id + ', ' + tab.url + " is load");
            check_tab_status(callback);
        });
        tab.on("pageshow", function (tab) {
            //console.log(tab.id + ', ' + tab.url + " is pageshow");
            check_tab_status(callback);
        });
        tab.on("ready", function (tab) {
            //console.log(tab.id + ', ' + tab.url + " is ready");
            check_tab_status(callback);
        });
        tab.on("activate", function (tab) {
            //console.log(tab.id + ', ' + tab.url + " is activated");
            check_tab_status(callback);
        });
        tab.on("deactivate", function (tab) {
            //console.log(tab.id + ', ' + tab.url + " is deactivated");
            check_tab_status(callback);
        });
        tab.on("close", function (tab) {
            //console.log(tab.id + ', ' + tab.url + " is closed");
            // @todo Написать
            /*
            setTimeout(function () {
                check_tab_status(callback);
            }, 100);
            */
        });

        check_tab_status(callback);
    });

    check_tab_status(callback);
}

/**
 * Создаём иконку в окне, если нужно
 *
 * @param window nsIDOMWindow
 * @param callback closure
 */
function url_icon_create(window, callback) {
    if (typeof(window.document) == 'undefined') {
        return;
    }
    if (window.document.querySelector('#point-sharp-settings-img') !== null) {
        return;
    }
    var new_icon = window.document.createElement('image');
    new_icon.setAttribute('id', 'point-sharp-settings-img');
    new_icon.style.listStyleImage = 'url(data:image/png;base64,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)';
    new_icon.style.width = '16px';
    new_icon.style.height = '16px';
    new_icon.style.opacity = '0.8';
    new_icon.addEventListener('click', callback);

    var urlBarIconsBox = window.document.querySelector('#urlbar-icons');
    urlBarIconsBox.appendChild(new_icon);
}

function showurlicon(window) {
    window.document.querySelector('#point-sharp-settings-img').style.display = '';
}

function hideurlicon(window) {
    window.document.querySelector('#point-sharp-settings-img').style.display = 'none';
}

function check_tab_status(callback) {
    var windows = utils.windows();
    for (var i = 0; i < windows.length; i++) {
        if (typeof(windows[i].gBrowser) == 'undefined') {
            // Это не окно браузера, а какое-то левое окно типа исходного кода
            return;
        }

        // Добавляем иконку
        var a = windows[i].document.querySelector('#point-sharp-settings-img');
        //console.log("Window[%d] %s %O %O", i, windows[i].content.location.href, a !== null, windows[i]);
        if (a == null) {
            url_icon_create(windows[i], callback);
        }

        // Показываем или скрываем иконку в зависимости от...
        if (windows[i].content.location.href.match(new RegExp('^https?://(.+\\.)?point\\.im(/.*)?')) !== null) {
            showurlicon(windows[i])
        } else {
            hideurlicon(windows[i]);
        }

    }
}

// Exports
exports.url_icon_init = url_icon_init;
