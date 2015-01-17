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
    console.group("Point#");

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
    console.log('Extension code. Storage: %O', simplestore.storage);

    // Весь Поинт
    pageMod.PageMod({
        include: new RegExp('^https?://(.+\\.)?point\\.im(/.*)?'),
        contentScriptWhen: "end",
        contentScriptFile: [
            self.data.url("js/jquery.js"),
            self.data.url("js/bquery_ajax.js"),
            self.data.url("js/point_sharp_options_list.js"),
            self.data.url("js/point_sharp_shared_code.js"),

            self.data.url("js/wrapper.js"),
            self.data.url("js/point_test.js"),
            self.data.url("js/point_sharp_settings.js")
        ],
        onAttach: function (worker) {
            // @hint Поскольку в Fx исключено появление двух одинаковых extension'ов, скрытие иконки я не реализую

            // Storage

            // Получаем значение
            worker.port.on('get_storage_value', function (json) {
                var data = JSON.parse(json);
                //console.log("Extension code. get_storage_value %O", data);
                var value = (typeof(simplestore.storage[data.key]) !== 'undefined')
                    ? simplestore.storage[data.key] : null;

                worker.port.emit('get_storage_value_' + data.callback, JSON.stringify(value));
            });

            // Сохраняем значения в стороже
            worker.port.on('set_storage_value', function (json) {
                var data = JSON.parse(json);
                //console.log("Extension code. set_storage_value %O", data);
                // @todo Переписать, теперь там object из значений
                console.error('main.js, Переписать эту строку');
                simplestore.storage[data.key] = data.value;

                worker.port.emit('set_storage_value_' + data.callback, 'true');
            });

            // Сохраняем значения опций
            worker.port.on('set_options_value', function (json) {
                var data = JSON.parse(json);
                //console.log("Extension code. set_storage_value %O", data);
                // @todo Реализовать
                console.error('main.js, Не реализовано');


                worker.port.emit('set_options_value_' + data.callback, 'true');
            });


        }
    });

};
