/**
 * Враппер над браузеро-зависимыми функциями
 * Версия для Google Chrome & Mozilla Firefox WebExtensions
 */

/**
 * Получаем значение из Local Storage
 *
 * @param {String|String[]} key Название элемента. Если передаётся строка, до будет возвращено одно значение, иначе array
 * @param {Function} callback Функция, которую дёрнем, когда получим значение
 */
function local_storage_get(key, callback) {
    console.log("Content code. local_storage_get", key);
    var real_keys = [];
    var real_keys_list;
    if (typeof(key) == 'string') {
        // Одно значение
        real_keys.push(key + '_index_count');
        real_keys.push(key + '_index_time');
        real_keys.push(key);
        real_keys_list = [key];
    } else {
        // Несколько значений
        for (var real_key in key) {
            real_keys.push(key[real_key] + '_index_count');
            real_keys.push(key[real_key] + '_index_time');
            real_keys.push(key[real_key]);
        }
        real_keys_list = key;
    }

    local_storage_get_inner(real_keys, real_keys_list, 'local', function(got_data_local, got_time_local, no_keys_local) {
            if (no_keys_local.length === 0) {
                // Нет неполученных ключей
                if (typeof(key) == 'string') {
                    callback(got_data_local[key]);
                } else {
                    callback(got_data_local);
                }
            } else {
                local_storage_get_inner(real_keys, real_keys_list, 'sync', function(got_data_sync, got_time_sync, no_keys_sync) {
                    for (var real_key in real_keys_list) {
                        var current_key = real_keys_list[real_key];
                        if (no_keys_sync.indexOf(current_key) !== -1) {
                            // Sync не существует
                            continue;
                        }
                        if (no_keys_local.indexOf(current_key) !== -1) {
                            // Local не существует, Sync существует
                            got_data_local[current_key] = got_data_sync[current_key];
                            continue;
                        }
                        if (got_time_sync[current_key] == 0) {
                            continue;
                        }

                        if ((got_time_local[current_key] == 0) || (got_time_local[current_key] < got_time_sync[current_key])) {
                            got_data_local[current_key] = got_data_sync[current_key];
                        }
                    }
                    // @todo Сохранять всё в local

                    if (typeof(key) == 'string') {
                        callback(got_data_local[key]);
                    } else {
                        callback(got_data_local);
                    }
                });
            }
        }
    );
    console.log("Content code. local_storage_get end");
}

/**
 *
 * @param {String[]} real_keys Название элементов
 * @param {String[]} real_keys_list
 * @param {Function} callback Функция, которую дёрнем, когда получим значение
 * @param {String} type
 */
function local_storage_get_inner(real_keys, real_keys_list, type, callback) {
    if (type == 'local') {
        var call = chrome.storage.local;
    } else {
        call = chrome.storage.sync;
    }

    call.get(real_keys, function(sync_data_index) {
        var full_values = {};
        var full_times = {};
        var real_keys = [];
        var no_keys = [];
        if (typeof(sync_data_index) == 'undefined') {
            // Mozilla Firefox behaviour
            sync_data_index = [];
        }
        for (var real_key in real_keys_list) {
            var current_key = real_keys_list[real_key];
            if (typeof(sync_data_index[current_key + '_index_count']) == 'undefined') {
                if (typeof(sync_data_index[current_key]) == 'undefined') {
                    no_keys.push(current_key);
                }

                full_values[current_key] = sync_data_index[current_key];
                full_times[current_key] = 0;
            } else {
                var max = sync_data_index[current_key + '_index_count'];
                for (var i = 0; i <= max; i++) {
                    real_keys.push(current_key + '_index_' + i);
                }

                if (typeof(sync_data_index[current_key + '_index_time']) == 'undefined') {
                    full_times[current_key] = 0;
                } else {
                    full_times[current_key] = parseFloat(sync_data_index[current_key + '_index_time']);
                }
            }
        }
        if (real_keys.length == 0) {
            // Не нужно ничего дёргать
            callback(full_values, full_times, no_keys);
            return;
        }

        call.get(real_keys, function(sync_data) {
            for (var real_key in real_keys_list) {
                var max = sync_data_index[real_keys_list[real_key] + '_index_count'];
                var str = '';
                for (var i = 0; i <= max; i++) {
                    str += sync_data[real_keys_list[real_key] + '_index_' + i];
                }
                try {
                    var temporary_value = JSON.parse(str);
                } catch (e) {
                    temporary_value = null;
                }

                full_values[real_keys_list[real_key]] = temporary_value;
            }

            callback(full_values, full_times, no_keys);
        });
    });
}

function get_sync_quota_length() {
    if (typeof chrome.storage.sync.QUOTA_BYTES_PER_ITEM == 'undefined') {
        return 2038;
    } else {
        return chrome.storage.sync.QUOTA_BYTES_PER_ITEM - 10;
    }
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
    const max_item_length = get_sync_quota_length();
    var full_length_to_write = 0;
    for (var key in data) {
        var value = JSON.stringify(data[key]);
        full_length_to_write += value.length;
        var count = 0;
        while (value.length > 0) {
            data_processed[key + '_index_' + count] = value.substr(0, max_item_length);
            value = value.substr(max_item_length);
            count++;
        }
        data_processed[key + '_index_count'] = count - 1;
        data_processed[key + '_index_time'] = (new Date()).getTime() / 1000;
    }

    chrome.storage.local.set(data_processed, function() {
        if (typeof(success_callback) == 'function') {
            success_callback();
        }
    });
    setTimeout(function() {
        var need_remove_keys = [];
        for (var key in data) {
            need_remove_keys.push(key);
        }

        chrome.storage.sync.remove(need_remove_keys, function() {});
        chrome.storage.sync.set(data_processed, function() {});
        chrome.storage.local.remove(need_remove_keys, function() {});
    }, 0);
    console.log("Content code. local_storage_set end. ", full_length_to_write, " bytes to write");
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
 * @param {boolean} from_websocket
 */
function html5_notification(settings, response, from_websocket) {
    if (from_websocket) {
        return;
    }
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

/**
 * Встраиваем твиты из Твиттера
 *
 * Workaround для Google Chrome
 */
function twitter_tweet_embedding_init() {
    // Чёрная магия. Выбираемся из манямирка, прихватив с собой пару сраных функций
    // https://developer.chrome.com/extensions/content_scripts Isolated World
    var e = document.createElement("script");
    e.appendChild(document.createTextNode(twitter_tweet_embedding_wait_for_ready_injected.toString() +
                                          twitter_tweet_embedding_parse_links.toString() +
                                          'twitter_tweet_embedding_wait_for_ready_injected();'));
    document.head.appendChild(e);

    // Встраиваем скрипт так, как описано в best twitter practice https://dev.twitter.com/web/javascript/loading
    window.twttr = (function(d, s, id) {
        var t, js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "https://platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js, fjs);
        return window.twttr || (t = {
                _e: [], ready: function(f) {
                    t._e.push(f);
                }
            });
    }(document, "script", "twitter-wjs"));
}

/**
 * Выставляем кол-во unread на всех страницах
 *
 * @param {Number} recent_count
 * @param {Number} comments_count
 * @param {Number} messages_count
 */
function set_new_unread_count_status(recent_count, comments_count, messages_count) {
    chrome.runtime.sendMessage({
        'type': 'new_unread_count_status',
        'recent_count': recent_count,
        'comments_count': comments_count,
        'messages_count': messages_count,
        'date': (new Date()).getTime()
    }, function() {

    });
}

/**
 * @param {OptionsManager} options
 */
function set_message_listener(options) {
    var last_connected_status = true;

    /**
     * Message Listener
     */
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        console.log('Received message',
            sender.tab ? "from a content script:" + sender.tab.url : "from the extension background");
        switch (message.type) {
            case 'new_unread_count':
                update_left_menu_unread_budges(message.counts[0], message.counts[1], message.counts[2], options);
                return true;
            case 'websocket_reaction':
                //noinspection JSUnresolvedVariable
                ws_socket_reaction(message.wsMessage, options);
                return true;
            case 'websocket_connected':
                if (!last_connected_status) {
                    disconnected_status_hide();
                    last_connected_status = true;
                }
                return true;
            case 'websocket_disconnected':
                if (last_connected_status) {
                    disconnected_status_show();
                    last_connected_status = false;
                }
                return true;

            default:
                console.warn('No such message type');
                sendResponse(false);
                return true;
        }
    });
}

function ws_socket_reaction(wsMessage, options) {
    // Detecting post id if presented
    var postId = $('#top-post').attr('data-id');

    var my_nick_lower = get_my_nick().toLowerCase();
    if (!wsMessage.hasOwnProperty('a') || (wsMessage.a == '')) {
        if (wsMessage.hasOwnProperty('login')) {
            //noinspection JSUnresolvedVariable
            my_nick_lower = wsMessage.login.toLowerCase();
        }
        return;
    }
    switch (wsMessage.a) {
        // Comments
        case 'comment':
        case 'ok':
            ws_message_comment(wsMessage, my_nick_lower, postId, options);
            break;

        // Posts
        case 'post':
            ws_message_post(wsMessage, my_nick_lower, options);
            break;

        // Subscribe
        case 'sub':
            ws_message_sub(wsMessage, options);
            break;

        default:
            break;
    }
}

/**
 * Выставляем кол-во unread на всех страницах
 */
function set_new_unread_count_listener() {
    // Ничего не нужно
}

/**
 * Инициализация приёма сообщений через Вебсоккеты
 *
 * @param {OptionsManager} options Опции, полученные из основной функции
 */
function smart_websocket_init(options) {
    // Ничего не нужно, всё работает на background.js
}

function disconnected_status_init() {
    var d = document.createElement('div');
    $(d).attr({
        'id': 'disconnected_status'
    }).on('click', function() {
        disconnected_status_hide();
    }).css({
        'padding': '10px',
        'position': 'fixed',
        'bottom': '120px',
        'right': '20px',
        'border-radius': '3px',
        'border': '1px solid #666',
        'background-color': 'pink',
        'display': 'none',
        'cursor': 'pointer'
    }).text('PointIM отключен');
    document.body.appendChild(d);
}

function disconnected_status_show() {
    $('#disconnected_status').hide().fadeIn(500);
}

function disconnected_status_hide() {
    $('#disconnected_status').fadeOut(500);
}