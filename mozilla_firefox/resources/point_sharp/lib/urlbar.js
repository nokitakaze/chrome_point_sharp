var tabs = require("sdk/tabs");
var utils = require('sdk/window/utils');

// Эта функция вызывается один раз при неясных обстоятельствах
function url_icon_init(window, callback) {
    url_icon_create(window, callback);

    tabs.on('open', function(tab) {
        // console.log(tab.id + ', ' + tab.url + " is open: %O %O", utils.getToplevelWindow(window), utils.windows());

        // Вешаем обработчики
        tab.on("load", function(tab) {
            //console.log(tab.id + ', ' + tab.url + " is load");
            check_tab_status(callback);
        });
        tab.on("pageshow", function(tab) {
            //console.log(tab.id + ', ' + tab.url + " is pageshow");
            check_tab_status(callback);
        });
        tab.on("ready", function(tab) {
            //console.log(tab.id + ', ' + tab.url + " is ready");
            check_tab_status(callback);
        });
        tab.on("activate", function(tab) {
            //console.log(tab.id + ', ' + tab.url + " is activated");
            check_tab_status(callback);
        });
        tab.on("deactivate", function(tab) {
            //console.log(tab.id + ', ' + tab.url + " is deactivated");
            check_tab_status(callback);
        });
        tab.on("close", function(tab) {
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
    new_icon.style.listStyleImage = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAACX' +
                                    'BIWXMAABKmAAASpgEyngXBAAAAIGNIUk0AAHolAACAgwAA+f8AAIDoAABSCAABFVgAADqXAAAXb9daH5AAAAIQSURBVHjaYmCAgBcMDAwM7x' +
                                    'gYGP4DAAAA//9iYGBgMIeKMrD9Z2BgAAAAAP//BMFBDQAwCASwfpYQ/KBtAqdnGo4WBo2DBx8VbsgCAAD//zTLwQ0AEBAAwTnRpnZ0oAENaU' +
                                    'MV+LjnJrPJF0ZGrnAKOm5jX6IiEPPLBwAA//80zKENgwAURdHTpqphg67QMToYFoNnBZiA1GNwCMIKWBIEho/5JM88cc+9PtM/ahz53y9MWL' +
                                    'MM/FAGc8f+xAdjSiWWk++D5eY3VChSiJZoGAIXAAAA//9MkLEJgEAQBCewA3uwA/uwG8MPTMTATCzAMr4HDY2MhW9B5Qz+HhbugoU52Budxa' +
                                    '0c6gPXYF5s9qLmxfOzxZH70qNWzYTSwbL7OMCtwKVAB1sNSYEKOIFg0E/wAKsCjQfTVSABNub8frAb8LNJ9ygNRUEUgL/i2QREF2CVwi4ICe' +
                                    '7BJUiwCm4glYWNC4ilyQJcRipJkyKNlYVNSBEQJEkjKXx4UzgXHi/vwnB/5pxh5txTH/cFZe6lIcrAtGpc4wroDV3Hqxu5jBvnxCQe9uhUBn' +
                                    '6KoT/iXESuE9iURfiKy3N2c1XSHJesQpg2RhtSn102eQrnqn/aQ03VJpWbCqhY4yTa2Hxzh9niv/AfrosG0lk4col3pEdu7jlv89pDD59cJN' +
                                    'YFtkHcx17iB1cRv31Op8wxXDDA9pY1HAYAJda1ywhqUdMAAAAASUVORK5CYII=)';
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
