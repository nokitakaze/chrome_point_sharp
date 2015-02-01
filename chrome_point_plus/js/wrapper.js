/**
 * Враппер над браузеро-зависимыми функциями
 * Версия для Google Chrome
 */

/**
 * Получаем значение из Local Storage
 *
 * @param key Название элемента. Если передаётся строка, до будет возвращено одно значение, иначе array
 * @param callback Функция, которую дёрнем, когда получим значение
 */
function local_storage_get(key, callback) {
    console.log("Content code. local_storage_get", key);
    chrome.storage.sync.get(key, function(sync_data) {
        callback((typeof(key) == 'string') ? sync_data[key] : sync_data);
    });
    console.log("Content code. local_storage_get end");
}

/**
 * Сохраняем значение в Local Storage
 *
 * @param data object из значений
 * @param success_callback Функция, которую дёрнем, когда сохраним значение
 */
function local_storage_set(data, success_callback) {
    console.log("Content code. local_storage_set", data);
    chrome.storage.sync.set(data, function() {
        success_callback();
    });
    console.log("Content code. local_storage_set end");
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
    }, null, function(response) {
        console.debug('showPageAction response: %O', response);
    });
}

/**
 * Версия расширения
 *
 * @param callback function callback с версией
 */
function point_sharp_get_version(callback) {
    chrome.runtime.sendMessage(null, {
        type: 'getManifestVersion'
    }, null, function(response) {
        var ppVersion = response.version || 'undefined';
        callback(ppVersion);
    });

}


function console_group(group_name) {
    console.group(group_name);
}

function console_group_collapsed(group_name) {
    console.groupCollapsed(group_name);
}

function console_group_end() {
    console.groupEnd();
}

/**
 * Создаём HTML5 notification
 *
 * @param {object} settings
 * @param {function} response
 */
function html5_notification(settings, response) {
    settings.type = 'showNotification';
    chrome.runtime.sendMessage(settings, response);
}
