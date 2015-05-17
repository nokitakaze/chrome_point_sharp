/**
 * Враппер над браузеро-зависимыми функциями
 * Версия для Google Chrome
 */

/**
 * Получаем значение из Local Storage
 *
 * @param {String|Array} key Название элемента. Если передаётся строка, до будет возвращено одно значение, иначе array
 * @param {Function} callback Функция, которую дёрнем, когда получим значение
 */
function local_storage_get(key, callback) {
    console.log("Content code. local_storage_get", key);
    var real_keys = [];
    if (typeof(key) == 'string') {
        // Одно значение
        real_keys.push(key + '_index_count');
        real_keys.push(key);
    } else {
        // Несколько значений
        for (var real_key in key) {
            real_keys.push(key[real_key] + '_index_count');
            real_keys.push(key[real_key]);
        }
    }

    chrome.storage.sync.get(real_keys, function(sync_data_index) {
        var full_values = {};
        var real_keys = [];
        if (typeof(key) == 'string') {
            if (typeof(sync_data_index[key + '_index_count']) == 'undefined') {
                callback(sync_data_index[key]);
                return;
            }

            var max = sync_data_index[key + '_index_count'];
            for (var i = 0; i <= max; i++) {
                real_keys.push(key + '_index_' + i);
            }
        } else {
            for (var real_key in key) {
                if (typeof(sync_data_index[key[real_key] + '_index_count']) == 'undefined') {
                    full_values[real_key] = sync_data_index[key[real_key]];
                    continue;
                }

                var max = sync_data_index[key[real_key] + '_index_count'];
                for (var i = 0; i <= max; i++) {
                    real_keys.push(key[real_key] + '_index_' + i);
                }
            }

            if (real_keys.length == 0) {
                callback(full_values);
                return;
            }
        }

        chrome.storage.sync.get(real_keys, function(sync_data) {
            if (typeof(key) == 'string') {
                var max = sync_data_index[key + '_index_count'];
                var str = '';
                for (var i = 0; i <= max; i++) {
                    str += sync_data[key + '_index_' + i];
                }
                try {
                    var temporary_value = JSON.parse(str);
                } catch (e) {
                    temporary_value = null;
                }
                callback(temporary_value);
            } else {
                for (var real_key in key) {
                    var max = sync_data_index[key[real_key] + '_index_count'];
                    str = '';
                    for (var i = 0; i <= max; i++) {
                        str += sync_data[key[real_key] + '_index_' + i];
                    }
                    try {
                        temporary_value = JSON.parse(str);
                    } catch (e) {
                        temporary_value = null;
                    }

                    full_values[key[real_key]] = temporary_value;
                }
                callback(full_values);
            }
        });
    });
    console.log("Content code. local_storage_get end");
}

/**
 * Сохраняем значение в Local Storage
 *
 * @param {Object} data object из значений
 * @param {Function} success_callback Функция, которую дёрнем, когда сохраним значение
 */
function local_storage_set(data, success_callback) {
    console.log("Content code. local_storage_set", data);
    var data_processed = {};
    const max_item_length = chrome.storage.sync.QUOTA_BYTES_PER_ITEM - 10;
    for (var key in data) {
        var value = JSON.stringify(data[key]);
        var count = 0;
        while (value.length > 0) {
            data_processed[key + '_index_' + count] = value.substr(0, max_item_length);
            value = value.substr(max_item_length);
            count++;
        }
        data_processed[key + '_index_count'] = count - 1;
    }

    chrome.storage.sync.set(data_processed, function() {
        if (typeof(success_callback) == 'function') {
            success_callback();
        }
    });
    console.log("Content code. local_storage_set end");
}

/**
 * Функция, которая выполняется перед всеми улучшениями
 *
 * @param {Object} options Опции
 */
function point_loaded_first(options) {

}

/**
 * Функция, которая выполняется после всех улучшений
 *
 * @param {Object} options Опции
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
 * @param {Function} callback function callback с версией
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
    if (typeof(settings.url) != 'undefined') {
        settings.onclick = function() {
            window.open(settings.url);
        };
    } else {
        settings.onclick = function() { };
    }

    settings.type = 'showNotification';
    chrome.runtime.sendMessage(settings, response);
}

/**
 * Записываем текст камента в DOM
 *
 * @param {object} commentData
 * @param {string} commentData.html
 * @param {jQuery} dom
 */
function set_comment_text_to_dom(commentData, dom) {
    if (typeof(commentData.html) !== 'undefined') {
        dom.html(commentData.html);
    } else {
        safe_saned_text(commentData.text, dom);
    }
}
