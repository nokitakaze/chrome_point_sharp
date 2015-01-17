/**
 * Враппер над браузеро-зависимыми функциями
 * Версия для Mozilla Firefox
 */

/**
 * Получаем значение из Local Storage
 *
 * @param key Название элемента
 * @param callback Функция, которую дёрнем, когда получим значение
 */
function local_storage_get(key, callback) {
// @todo Удалять старые прослушивальщики
    // console.log("Content code. local_storage_get %s %O", key, callback);
    var callback_rand = Math.random();
    self.port.on('get_storage_value_' + callback_rand, function (value) {
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
 * @param key Название элемента
 * @param value Значение элемента
 * @param success_callback Функция, которую дёрнем, когда сохраним значение
 */
function local_storage_set(key, value, success_callback) {
// @todo Удалять старые прослушивальщики
    // console.log("Content code. local_storage_set %s = %O", key, value);
    var callback_rand = Math.random();
    self.port.on('set_storage_value_' + callback_rand, function (value) {
        // @todo Проверять value, вдруг там не true
        // console.log("Content code. local_storage_set.callback %s", value);
        if (typeof(success_callback) == 'function') {
            success_callback();
        }
    });
    self.port.emit('set_storage_value', JSON.stringify({
        'key': key,
        'value': value,
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
        point_sharp_settings_page_init();
    }
}
