/**
 * Враппер над браузеро-зависимыми функциями
 * Версия для Mozilla Firefox
 */

/**
 * Получаем значение из Local Storage
 *
 * @param {string} key Название элемента. Если передаётся строка, до будет возвращено одно значение, иначе array
 * @param {function} callback Функция, которую дёрнем, когда получим значение
 */
function local_storage_get(key, callback) {
    // @todo Удалять старые прослушивальщики
    var callback_rand = Math.random();
    self.port.on('get_storage_value_' + callback_rand, function(value) {
        // console.log("Content code. local_storage_get.callback %s", value);
        callback(JSON.parse(value));
    });
    self.port.emit('get_storage_value', JSON.stringify({
        'key': key,
        'callback': callback_rand
    }));
}

/**
 * Сохраняем значение в Local Storage
 *
 * @param {object} data object из значений
 * @param {function} success_callback Функция, которую дёрнем, когда сохраним значение
 */
function local_storage_set(data, success_callback) {
    // @todo Удалять старые прослушивальщики
    // console.log("Content code. local_storage_set %O", data);
    var callback_rand = Math.random();
    self.port.on('set_storage_value_' + callback_rand, function(value) {
        // @todo Проверять value, вдруг там не true
        // console.log("Content code. local_storage_set.callback %s", value);
        if (typeof(success_callback) == 'function') {
            success_callback();
        }
    });
    self.port.emit('set_storage_value', JSON.stringify({
        'data': data,
        'callback': callback_rand
    }));
    // console.log("Content code. local_storage_set end");
}


/**
 * Функция, которая выполняется перед всеми улучшениями
 *
 * @param {object} options Опции
 */
function point_loaded_first(options) {
    if (options.is('option_ws_posts_notifications') || options.is('option_ws_comments_notifications')) {
        // Включаем HTML5 Notification
        if (!("Notification" in window)) {
            console.error("This browser does not support desktop notification");
        } else if (Notification.permission === "granted") {
            // Всё в порядке, уже разрешено
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function(permission) {});
        }
    }
}

/**
 * Функция, которая выполняется после всех улучшений
 *
 * @param {object} options Опции
 */
function point_loaded_last(options) {
    // Запуск страницы Settings
    if (document.location.href.match(new RegExp('https?://point\\.im/point\\-sharp\\-settings\\.html(\\?.*)?$'))) {
        point_sharp_settings_page_init(options);
    }

    // Добавляем в левое меню пункт настроек
    var left_menu_point_sharp_settings_item = document.createElement('a');
    $(left_menu_point_sharp_settings_item).attr({
        'href': 'https://point.im/point-sharp-settings.html',
        'target': '_blank'
    }).text('Point# настройки');

    $('#left-menu')[0].insertBefore(left_menu_point_sharp_settings_item, $('#left-menu #top-link')[0]);
}

/**
 * Скрываем значок в адресной строке
 *
 * В Mozilla Firefox нет кейса, в котором его было бы надо скрывать. Реализовывать не нужно
 */
function urlbar_icon_hide() {
}

/**
 * Показываем значок в адресной строке
 *
 * В Mozilla Firefox он уже есть, реализовывать не нужно
 */
function urlbar_icon_show() {
}

/**
 * Версия расширения
 *
 * @param {function} callback function callback с версией
 */
function point_sharp_get_version(callback) {
    // @todo Удалять старые прослушивальщики
    var callback_rand = Math.random();
    self.port.on('set_extension_version' + callback_rand, function(version) {
        callback(version);
    });
    self.port.emit('get_extension_version', callback_rand);
}

/**
 * Функции для console
 */

function console_group(group_name) {
}

function console_group_collapsed(group_name) {
}

function console_group_end() {
}

/**
 * Создаём HTML5 notification
 *
 * @param {object} settings
 * @param {Function} response
 */
function html5_notification(settings, response) {
    if (typeof(settings.url) != 'undefined') {
        var onclick = function() {
            window.open(settings.url);
        };
    } else {
        onclick = function() { };
    }

    var current_notification = new Notification(settings.title, {
        'lang': 'ru',
        'icon': settings.avatarUrl,
        'tag': settings.notificationId,
        'body': settings.text,
        'onclick': onclick
    });
}

/**
 * Записываем текст камента в DOM
 *
 * @param {object} commentData
 * @param {string} commentData.text
 * @param {jQuery} dom
 */
function set_comment_text_to_dom(commentData, dom){
    safe_saned_text(commentData.text, dom);
}
