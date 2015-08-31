/**
 * Скрипт, выполняющийся на заднем плане в Google Chrome
 */

console.info('Point# background.js loaded');

// Getting version from manifest.json
function getVersion() {
    /**
     * @deprecated XMLHttpRequest in the background worker is deprecated
     * according to the Chrome warning. But we definitely need synchronous
     * AJAX here
     */
    var xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL('manifest.json'), false);
    xhr.send(null);
    var manifest = JSON.parse(xhr.responseText);
    return manifest.version;
}

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
                sendResponse({version: getVersion()});
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

            default:
                sendResponse(false);
                return true;
        }
    }
});
