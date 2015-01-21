/**
 * Враппер над браузеро-зависимыми функциями
 * Версия для Mozilla Firefox
 */

/**
 * Получаем значение из Local Storage
 *
 * @param key Название элемента. Если передаётся строка, до будет возвращено одно значение, иначе array
 * @param callback Функция, которую дёрнем, когда получим значение
 */
function local_storage_get(key, callback) {
    // @todo Удалять старые прослушивальщики
    // console.log("Content code. local_storage_get %s %O", key, callback);
    var callback_rand = Math.random();
    self.port.on('get_storage_value_' + callback_rand, function(value) {
        // console.log("Content code. local_storage_get.callback %s", value);
        callback(JSON.parse(value));
    });
    self.port.emit('get_storage_value', JSON.stringify({
        'key': key,
        'callback': callback_rand
    }));
    // console.log("Content code. local_storage_get end");
}

/**
 * Сохраняем значение в Local Storage
 *
 * @param data object из значений
 * @param success_callback Функция, которую дёрнем, когда сохраним значение
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
 * @param options Опции
 */
function point_loaded_first(options) {

}

/**
 * Функция, которая выполняется после всех улучшений
 *
 * @param options Опции
 */
function point_loaded_last(options) {
    // Запуск страницы Settings
    if (document.location.href.match(new RegExp('https?://point\\.im/point\\-sharp\\-settings\\.html(\\?.*)?$'))) {
        point_sharp_settings_page_init(options);
    }
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
 * @param callback function callback с версией
 */
function point_sharp_get_version(callback) {
    // @todo Удалять старые прослушивальщики
    var callback_rand = Math.random();
    self.port.on('set_extension_version' + callback_rand, function(version) {
        callback(version);
    });
    self.port.emit('get_extension_version', callback_rand);
}


function console_group(group_name){
}

function console_group_collapsed(group_name){
}

function console_group_end(){
}
