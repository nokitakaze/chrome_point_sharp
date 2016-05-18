/**
 * Скрипт, выполняющийся на заднем плане в Google Chrome
 */

// Getting version from manifest.json
var point_sharp_version = null;
(function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL('manifest.json'));
    xhr.onreadystatechange = function() {
        if (this.readyState !== 4) {return;}
        if (this.status == 200) {
            var manifest = JSON.parse(this.responseText);
            point_sharp_version = manifest.version;
            console.info('Point# v%s background.js loaded', point_sharp_version);
        } else {
            throw Error('Can not get manifest.json');
        }
    };
    xhr.send(null);
})();

// Adding notification click event listener
chrome.notifications.onClicked.addListener(function(notificationId) {
    // Detecting notification type
    if (notificationId.indexOf('comment_') === 0) {
        var tab_url = 'https://point.im/' + notificationId.replace(/comment_/g, '');
    } else if (notificationId.indexOf('post_') === 0) {
        tab_url = 'https://point.im/' + notificationId.replace(/post_/g, '');
    }
    console.log('Notification %s clicked! Opening new tab: %s', notificationId, tab_url);

    if (tab_url !== undefined) {
        chrome.tabs.create({
            url: tab_url
        });
    }
});

var unread_count_status_last_time = 0;

// Message listener
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log('Received message from tab #%s: %O',
        (typeof(sender.tab) != 'undefined') ? sender.tab.id : 'undefined', message);

    if (message) {
        switch (message.type) {
            case 'showPageAction':
                chrome.pageAction.show(sender.tab.id);
                sendResponse(true);

                console.log('Showed pageAction for tab #%s', sender.tab.id);
                return true;

            case 'hidePageAction':
                chrome.pageAction.hide(sender.tab.id);
                sendResponse(true);

                console.log('Hide pageAction for tab #%s', sender.tab.id);
                return true;

            case 'showNotification':
                chrome.notifications.create(
                    message.notificationId, {
                        type: 'basic',
                        iconUrl: message.avatarUrl,
                        title: message.title,
                        message: message.text,
                        priority: 0,
                        isClickable: true
                    }, function(notificationId) {
                        console.info('Notification "%s" created', notificationId);

                        sendResponse(true);
                    }
                );
                return true;

            case 'getManifestVersion':
                sendResponse({version: point_sharp_version});
                return true;

            case 'listenNotificationClicks':
                // Adding notification click event listener
                chrome.notifications.onClicked.addListener(function(notificationId) {
                    // Detecting notification type
                    if (notificationId.indexOf('comment_') === 0) {
                        var tab_url = message.protocol + '//' + 'point.im/' + notificationId.replace(/comment_/g, '');
                    } else if (notificationId.indexOf('post_') === 0) {
                        tab_url = message.protocol + '//' + 'point.im/' + notificationId.replace(/post_/g, '');
                    }
                    console.log('Notification %s clicked! Opening new tab: %s', notificationId, tab_url);

                    if (tab_url !== undefined) {
                        chrome.tabs.create({
                            url: tab_url
                        });
                    }
                });

                sendResponse(true);
                return true;

            case 'new_unread_count_status':
                // проверяем время
                var this_time = message.date;
                if (this_time <= unread_count_status_last_time) {
                    return true;
                }
                unread_count_status_last_time = this_time;

                chrome.tabs.query({}, function(tabs) {
                    var reg = new RegExp('^https?://([a-z0-9-]+\\.)point\\.im/', '');
                    /**
                     * @var [Tabs] tabs
                     */
                    for (var i = 0; i < tabs.length; i++) {
                        if ((typeof tabs[i].id == 'undefined') || (typeof tabs[i].url == 'undefined')) {
                            continue;
                        } else if (!tabs[i].url.match(reg)) {
                            continue;
                        }

                        chrome.tabs.sendMessage(tabs[i].id, {
                            'type': 'new_unread_count',
                            'counts': [message.recent_count, message.comments_count, message.messages_count]
                        });
                    }
                });
                return true;
            case 'update_options':
                update_options();
                return true;

            default:
                console.warn('No such message type');
                sendResponse(false);
                return true;
        }
    }
});

setInterval(function() {
    // @todo Вернуть всё обратно

    /*
     var keys = ['options', 'point_user_hints', 'post_manual_hidden_list'];
     chrome.storage.sync.get(['time_last_saved'], function(data_sync) {
     if (typeof(data_sync.time_last_saved) !== 'undefined') {
     var sync_time_last_saved = data_sync.time_last_saved;
     } else {
     sync_time_last_saved = 0;
     }
     chrome.storage.local.get(['time_last_saved'], function(data_local) {
     if (typeof(data_local.time_last_saved) !== 'undefined') {
     var local_time_last_saved = data_local.time_last_saved;
     } else {
     local_time_last_saved = 0;
     }
     console.log('Data get sync interval tick', sync_time_last_saved, local_time_last_saved);
     // @todo Вставить получение set-параметров

     });
     });
     */
}, 15 * 60 * 1000);

/**
 * Получаем значение из Local Storage
 *
 * @param {String} key Название элемента. Если передаётся строка, до будет возвращено одно значение, иначе array
 * @param {Function} callback Функция, которую дёрнем, когда получим значение
 */
function local_storage_get(key, callback) {
    console.log("Content code. local_storage_get", key);
    var real_keys = [];
    // Одно значение
    real_keys.push(key + '_index_count');
    real_keys.push(key + '_index_time');

    local_storage_get_inner(real_keys, [key], 'local', function(got_data_local, got_time_local, no_keys_local) {
            if (no_keys_local.length === 0) {
                // Нет неполученных ключей
                if (typeof(key) == 'string') {
                    callback(got_data_local[key]);
                } else {
                    callback(got_data_local);
                }
            } else {
                local_storage_get_inner(real_keys, [key], 'sync', function(got_data_sync, got_time_sync, no_keys_sync) {
                    var real_keys_list = [key];
                    for (var real_key in real_keys_list) {
                        var current_key = real_keys_list[real_key];
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

                    callback(got_data_local[key]);
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

var raw_options = null;
/**
 * @var {WebSocket} current_websocket
 */
var current_websocket = null;
/**
 * @var {number} current_websocket_last_ping
 */
var current_websocket_last_ping = 0;

/**
 * @var {String|null} current_login
 */
var current_login = null;

function update_options(callback) {
    if (typeof callback == 'undefined') {
        callback = function() {};
    }
    local_storage_get('options', function(raw_options_here) {
        raw_options = raw_options_here;
        console.log('new options: ', raw_options);
        callback();
    });
}

update_options(function() {
    start_websocket();
    setInterval(function() {
        if (current_websocket === null) {
            return;
        }
        var d = (new Date()).getTime() / 1000;
        if (d >= current_websocket_last_ping + 180) {
            console.error('No ping for %f seconds', d - current_websocket_last_ping);
            try {
                current_websocket.close();
            } catch (e) {}
            current_websocket = null;
            setTimeout(start_websocket, 0);
        }
    }, 10000);
});

/*
 * Ставим уведомлялку о текущем статусе соединения с PointIM
 */
setInterval(function() {
    chrome.tabs.query({}, function(tabs) {
        var reg = new RegExp('^https?://([a-z0-9-]+\\.)point\\.im/', '');
        /**
         * @var [Tabs] tabs
         */
        for (var i = 0; i < tabs.length; i++) {
            if ((typeof tabs[i].id == 'undefined') || (typeof tabs[i].url == 'undefined')) {
                continue;
            } else if (!tabs[i].url.match(reg)) {
                continue;
            }

            chrome.tabs.sendMessage(tabs[i].id, {
                'type': (current_websocket === null) ? 'websocket_disconnected' : 'websocket_connected'
            });
        }
    });
}, 30000);

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

    chrome.notifications.create(
        settings.notificationId, {
            type: 'basic',
            iconUrl: settings.avatarUrl,
            title: settings.title,
            message: settings.text,
            priority: 0,
            isClickable: true
        }, function(notificationId) {
        }
    );
    chrome.runtime.sendMessage(settings, response);
}

function start_websocket() {
    if (current_websocket !== null) {
        return;
    }

    // SSL or plain
    current_websocket = new WebSocket('wss://point.im/ws');
    console.log('WebSocket created: ', current_websocket);

    // Error handler
    current_websocket.onerror = function(err) {
        console.error('WebSocket error: ', err);
        try {
            current_websocket.close();
        } catch (e) {}
        current_websocket = null;
        setTimeout(start_websocket, 0);
    };

    // Error handler
    //noinspection JSUndefinedPropertyAssignment
    current_websocket.onclose = function(event) {
        console.warn('WebSocket close: ', event);
        //noinspection JSUnresolvedVariable
        if (!event.wasClean) {
            setTimeout(start_websocket, 0);
        }
    };

    current_websocket_last_ping = (new Date()).getTime() / 1000;

    // Message handler
    current_websocket.onmessage = function(evt) {
        try {
            if (evt.data == 'ping') {
                current_websocket_last_ping = (new Date()).getTime() / 1000;
                console.info('ws-ping');
                return;
            }
            /**
             * @var {Object} wsMessage
             */
            var wsMessage = JSON.parse(evt.data);
            console.log('WS Message: ', evt, wsMessage);
            // месаги во все окна
            chrome.tabs.query({}, function(tabs) {
                var reg = new RegExp('^https?://([a-z0-9-]+\\.)point\\.im/', '');
                /**
                 * @var [Tabs] tabs
                 */
                for (var i = 0; i < tabs.length; i++) {
                    if ((typeof tabs[i].id == 'undefined') || (typeof tabs[i].url == 'undefined')) {
                        continue;
                    } else if (!tabs[i].url.match(reg)) {
                        continue;
                    }

                    chrome.tabs.sendMessage(tabs[i].id, {
                        'type': 'websocket_reaction',
                        'wsMessage': wsMessage
                    });
                }
            });

            if (wsMessage.hasOwnProperty('a') && (wsMessage.a != '')) {
                // HTML5 уведомления
                switch (wsMessage.a) {
                    // Comments
                    case 'comment':
                    case 'ok':
                        if (raw_options.option_ws_comments_notifications &&
                            (wsMessage.author.toLowerCase() != current_login)) {
                            html5_notification({
                                notificationId: 'comment_' + wsMessage.post_id + '#' + wsMessage.comment_id,
                                avatarUrl: 'https://point.im/avatar/' + wsMessage.author + '/80',
                                title: '@' + wsMessage.author + ' #' + wsMessage.post_id + '/' +
                                       wsMessage.comment_id,
                                text: wsMessage.text,
                                url: 'https://' + wsMessage.author.toLowerCase() + '.point.im/' +
                                     wsMessage.post_id + '#' + wsMessage.comment_id
                            }, function(response) {});
                        }
                        break;

                    // Posts
                    case 'post':
                        if (raw_options.option_ws_posts_notifications &&
                            (wsMessage.author.toLowerCase() != current_login)) {
                            var tags_text = '';
                            for (var i = 0; i < wsMessage.tags.length; i++) {
                                tags_text += ' ' + wsMessage.tags[i];
                            }
                            if (tags_text != '') {
                                tags_text = tags_text.substr(1) + "\r\n";
                            }

                            html5_notification({
                                notificationId: 'post_' + wsMessage.post_id,
                                avatarUrl: 'https://point.im/avatar/' + wsMessage.author + '/80',
                                title: 'Post by @' + wsMessage.author + ' #' + wsMessage.post_id,
                                text: tags_text + wsMessage.text,
                                url: 'https://' + wsMessage.author.toLowerCase() + '.point.im/' + wsMessage.post_id
                            }, function(response) {});
                        }
                        break;

                    // Subscribe
                    case 'sub':
                        var subscription_user_name = wsMessage.from.toLowerCase();
                        if (raw_options.option_ws_subscription) {
                            html5_notification({
                                notificationId: 'subscription_' + subscription_user_name,
                                avatarUrl: 'https://point.im/avatar/' + subscription_user_name + '/80',
                                title: '@' + wsMessage.from + ' подписался на вас',
                                text: '',
                                url: 'https://' + subscription_user_name + '.point.im/'
                            }, function(response) {});
                        }
                        break;

                    default:
                        break;
                }
            } else {
                if (wsMessage.hasOwnProperty('login')) {
                    //noinspection JSUnresolvedVariable
                    current_login = wsMessage.login.toLowerCase();
                }
            }
        } catch (e) {
            //noinspection JSUnresolvedVariable
            console.error('WebSocket handler exception: ', e.name, e.message, e.fileName || null, e.lineNumber || null);
        }
    };
}