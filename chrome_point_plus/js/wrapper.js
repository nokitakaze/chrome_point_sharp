/**
 * Враппер над браузеро-зависимыми функциями
 * Версия для Google Chrome
 */

/**
 * Получаем значение из Local Storage
 *
 * @param key Название элемента
 * @param callback Функция, которую дёрнем, когда получим значение
 */
function local_storage_get(key, callback) {
    // @todo Реализовать через chrome.storage.sync
    console.log("Content code. local_storage_get %s %O", key, callback);
    console.log("Content code. local_storage_get end");
}

/**
 * Сохраняем значение в Local Storage
 *
 * @param data object из значений
 * @param success_callback Функция, которую дёрнем, когда сохраним значение
 */
function local_storage_set(data, success_callback) {
    // @todo Реализовать через chrome.storage.sync
    console.log("Content code. local_storage_set %O", data);
    console.log("Content code. local_storage_set end");
}

/**
 * Сохраняем набор опций
 *
 * @param data object из значений
 * @param success_callback Функция, которую дёрнем, когда сохраним значение
 */
function local_options_set(data, success_callback) {
    // @todo Реализовать через chrome.storage.sync
    console.log("Content code. local_options_set %O", data);
    console.log("Content code. local_options_set end");
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

}

/**
 * Скрываем значок в адресной строке
 */
function urlbar_icon_hide() {
    chrome.runtime.sendMessage({
        type: 'hidePageAction'
    }, null);
}

/**
 * Показываем значок в адресной строке
 */
function urlbar_icon_show() {
    chrome.runtime.sendMessage({
        type: 'showPageAction'
    }, null, function (response) {
        console.debug('showPageAction response: %O', response);
    });
}

/**
 * Версия расширения
 *
 * @param callback function callback с версией
 */
function point_sharp_get_version(callback){
    console.group('point-sharp');

    chrome.runtime.sendMessage(null, {
        type: 'getManifestVersion'
    }, null, function(response) {
        ppVersion = response.version || 'undefined';
        callback(ppVersion);
    });

}

