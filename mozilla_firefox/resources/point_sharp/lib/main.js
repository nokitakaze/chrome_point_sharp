//sdk requirements
//make sure all api's are mobile compatible
var pageMod = require("sdk/page-mod");
//var store = require("sdk/simple-storage");
//var request = require("sdk/request").Request;
var notify = require("sdk/notifications");
//var tabs = require("sdk/tabs");
var data = require("sdk/self").data;
var self = this;
var utils = require('sdk/window/utils');
var urlbar = require('point_sharp/urlbar');
var simplestore = require("sdk/simple-storage");

//main
exports.main = function () {
    console.info("I'm alive");

    // Создаём иконку в адресной строке
    urlbar.url_icon_init(utils.getMostRecentBrowserWindow(), function () {
        utils.getMostRecentBrowserWindow().gBrowser.selectedTab =
            utils.getMostRecentBrowserWindow().gBrowser.addTab("https://point.im/point-sharp-settings.html");
    });

    // Инициализируем Storage, если его не существовало
    if (typeof(simplestore.storage) == 'undefined') {
        simplestore.storage = {};
    }

    // Пишем текущие данные в хранилище
    // @debug
    console.log('Extension code. Entire storage: ', simplestore.storage);

    // Весь Поинт
    pageMod.PageMod({
        include: new RegExp('^https?://(.+\\.)?point\\.im(/.*)?'),
        contentScriptWhen: "end",
        contentStyleFile: [
            self.data.url("css/additional/point-plus.css"),
            self.data.url("css/additional/fancybox/style.css"),
            self.data.url("css/additional/markitup/sets/markdown/style.css"),
            self.data.url("css/additional/markitup/skins/markitup/style.css"),
            self.data.url("css/additional/modules/at_before_username.css"),
            self.data.url("vendor/fancybox/source/jquery.fancybox.css"),
            self.data.url("css/additional/fancybox/style.css"),
            self.data.url("vendor/markitup/markitup/skins/markitup/style.css")
        ],
        contentScriptFile: [
            self.data.url("js/jquery.js"),
            self.data.url("js/bquery_ajax.js"),
            self.data.url("js/point_sharp_options_list.js"),
            self.data.url("js/point_sharp_shared_code_additional.js"),
            self.data.url("js/point_sharp_shared_code_websocket.js"),

            self.data.url("vendor/soundcloud/soundcloud.player.api.js"),
            self.data.url("vendor/fancybox/source/jquery.fancybox.pack.js"),
            self.data.url("vendor/fancybox/source/helpers/jquery.fancybox-media.js"),
            self.data.url("vendor/markitup/markitup/jquery.markitup.js"),
            self.data.url("js/markitup_set.js"),


            self.data.url("js/wrapper.js"),
            self.data.url("js/point_sharp_shared_code.js"),
            self.data.url("js/point_sharp_settings.js")// Страница Опций
        ],
        onAttach: function (worker) {
            // @hint Поскольку в Fx исключено появление двух одинаковых extension'ов, скрытие иконки я не реализую

            // Storage

            // Получаем значение
            worker.port.on('get_storage_value', function (json) {
                var data = JSON.parse(json);
                console.log("Extension code. get_storage_value ", data);
                var value;
                if (typeof(data.key) == 'object') {
                    value = [];
                    for (var single_key in data.key) {
                        value[single_key] = (typeof(simplestore.storage[single_key]) !== 'undefined')
                            ? simplestore.storage[single_key] : null;
                    }
                } else {
                    value = (typeof(simplestore.storage[data.key]) !== 'undefined')
                        ? simplestore.storage[data.key] : null;
                }

                console.log("Extension code. get_storage_value.return ", value);
                worker.port.emit('get_storage_value_' + data.callback, JSON.stringify(value));
            });

            // Сохраняем значения в стороже
            worker.port.on('set_storage_value', function (json) {
                var data = JSON.parse(json);
                console.log("Extension code. set_storage_value ", data);
                for (var key in data.data) {
                    simplestore.storage[key] = data.data[key];
                }

                worker.port.emit('set_storage_value_' + data.callback, 'true');
            });

        }
    });

};
