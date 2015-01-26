var VERSION = (function() {
    /**
     * @deprecated XMLHttpRequest in the background worker is deprecated
     * according to the Chrome warning. But we definitely need synchronous
     * AJAX here
     */
    var xhr = new XMLHttpRequest(),
        manifest;

    xhr.open('GET', chrome.extension.getURL('manifest.json'), false);
    xhr.send(null);

    manifest = JSON.parse(xhr.responseText);

    return manifest.version;
})();

/**
 * Вставка нескольких файлов друг за другом
 * @param {Array} files Список файлов
 * @param {Function} injectOne Функция вставки одного файла. Должна принимать file и callback
 * @param {Function} [onAllInjected] Функция обработки ответа
 * @param {Array} [results] Результаты вставки (их не нужно передавать при запуске извне)
 */
function injectFiles(files, injectOne, onAllInjected, results) {
    results = results || [];

    if (files.length) {
        injectOne(files.shift(), function(res) {
            if (res) {
                results.unshift(res[0]);
            }

            injectFiles(files, injectOne, onAllInjected, results);
        });
    } else {
        onAllInjected(results);
    }
}

/**
 * @constructor Менеджер сообщений
 */
function MessageListener() {
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (this.isMethodAvailable(message)) {
            console.info('Call #%s() method for tab #%s', message.type, this.getTabId(sender));
            this[message.type].apply(this, arguments);

            return true;
        } else {
            console.warn('Method #%s() called from tab #%s does not exists', message.type, this.getTabId(sender));

            return false;
        }
    }.bind(this));
}

/**
 * @param {Object} message Сообщение
 * @returns {Boolean} Есть ли необходимый метод в MessageListener
 */
MessageListener.prototype.isMethodAvailable = function(message) {
    return message && message.type && typeof this[message.type] === 'function';
};

/**
 * @param {Object} sender
 * @returns {Number|Null} Идентификатор вкладки, с которой пришло сообщение
 */
MessageListener.prototype.getTabId = function(sender) {
    return sender.tab && sender.tab.id || null;
};

/**
 * @param {Object} message Сообщение
 * @param {Object} sender Отправитель
 * @param {Function} sendResponse Коллбек для обработки результата
 */
MessageListener.prototype.showPageAction = function(message, sender, sendResponse) {
    chrome.pageAction.show(this.getTabId(sender));
    sendResponse(true);
};

/**
 * Показывает нотификацию
 * @param {Object} message Сообщение
 * @param {Object} sender Отправитель
 * @param {Function} sendResponse Коллбек для обработки результата
 */
MessageListener.prototype.showNotification = function(message, sender, sendResponse) {
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
};

/**
 * Получает версию плагина из манифеста
 * @param {Object} message Сообщение
 * @param {Object} sender Отправитель
 * @param {Function} sendResponse Коллбек для обработки результата
 */
MessageListener.prototype.getManifestVersion = function(message, sender, sendResponse) {
    sendResponse({ version: VERSION });
};

/**
 * @param {Object} message Сообщение
 */
MessageListener.prototype.getFiles = function(message, defaultRunAt) {
    var files;

    if ( ! message.files) {
        return false;
    } else {
        files = Array.isArray(message.files) ? message.files : [ message.files ];

        return files.map(function(file) {
            return {
                file: typeof file === 'string' ? file : file.file,
                runAt: file.runAt || defaultRunAt
            };
        });
    }
};

/**
 * Вставляет JS-файлы во вкладку
 * @param {Object} message Сообщение
 * @param {Object} sender Отправитель
 * @param {Function} sendResponse Коллбек для обработки результата
 */
MessageListener.prototype.executeJSFiles = function(message, sender, sendResponse) {
    var tabId = this.getTabId(sender);

    injectFiles(
        this.getFiles(message, 'document_end'),
        function(file, callback) {
            chrome.tabs.executeScript(tabId, file, callback)
        },
        sendResponse
    );
};

/**
 * Вставляет CSS-файлы во вкладку
 * @param {Object} message Сообщение
 * @param {Object} sender Отправитель
 * @param {Function} sendResponse Коллбек для обработки результата
 */
MessageListener.prototype.injectCSSFiles = function(message, sender, sendResponse) {
    var tabId = this.getTabId(sender);

    injectFiles(
        this.getFiles(message),
        function(file, callback) {
            chrome.tabs.insertCSS(tabId, file, callback);
        },
        sendResponse
    );

};

new MessageListener();

// Maintaining options version
chrome.storage.sync.get('options_version', function(data) {
    console.info('Point+ %s. Options are for %s.', VERSION, data.options_version);

    if (data.options_version !== VERSION) {
        chrome.tabs.create({ url: 'options.html' });
    }
});

// Adding notification click event listener
chrome.notifications.onClicked.addListener(function(notificationId) {
    // Detecting notification type
    if (notificationId.indexOf('comment_') === 0) {
        tab_url = 'https://point.im/' + notificationId.replace(/comment_/g, '');
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
