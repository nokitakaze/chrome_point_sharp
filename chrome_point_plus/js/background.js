// Maintaining options version
chrome.storage.sync.get('options_version', function(data) {
    var pp_version = getVersion();
    console.info('Point+ %s. Options are for %s.', pp_version, data.options_version);
    
    if (data.options_version != pp_version) {
        chrome.tabs.create({url: 'options.html'});
    }
});

// Message listener
chrome.extension.onMessage.addListener(function(message, sender) {
    console.log('Received message: %O', message);
    
    if (message) {
        switch (message.type) {
            case 'showPageAction':
                var tab = sender.tab;
                chrome.pageAction.show(tab.id);
                break;
                
            case 'showNotification':
                chrome.notifications.create(
                    message.notificationId, {   
                        type: 'basic', 
                        iconUrl: message.avatarUrl, 
                        title: message.title, 
                        message: message.text,
                        priority: 0,
                        isClickable: true
                    },
                    function() { /* Error checking goes here */} 
                );
                
                console.log('Showing notification %s', message.notificationId); 
                break;
                
            case 'listenNotificationClicks':
                // Adding notification click event listener
                chrome.notifications.onClicked.addListener(function(notificationId) {
                    // Detecting notification type
                    if (notificationId.indexOf('comment_') === 0) {
                        tab_url = message.protocol + '//' + 'point.im/' + notificationId.replace(/comment_/g, '');
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
                break;
                
            case 'injectJSFile':
                console.log('Injecting JS: %s', message.file);
                chrome.tabs.executeScript(null, {
                    file: message.file
                    //,runAt: 'document_end'
                });
                break;
                
            case 'injectCSSFile':
                console.log('Injecting CSS: %s', message.file);
                chrome.tabs.insertCSS(null, {
                    file: message.file
                });
                break;
                
            case 'injectCSSCode':
                if (message.code !== undefined) {
                    chrome.tabs.insertCSS(null, {
                        code: message.code
                    });
                }

                break;
        }
    }   
});

// Getting version from manifest.json
function getVersion() { 
    var xhr = new XMLHttpRequest(); 
    xhr.open('GET', chrome.extension.getURL('manifest.json'), false); 
    xhr.send(null); 
    var manifest = JSON.parse(xhr.responseText); 
    return manifest.version; 
} 