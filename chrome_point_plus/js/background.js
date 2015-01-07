// Maintaining options version
chrome.storage.sync.get('options_version', function(data) {
    var pp_version = getVersion();
    console.info('Point+ %s. Options are for %s.', pp_version, data.options_version);
    
    if (data.options_version != pp_version) {
        chrome.tabs.create({url: 'options.html'});
    }
});

// Crutches and bikes
/**
 * Inject several JS files
 * @param {number} tabId Unique ID of tab which requested injection
 * @param {Object[]} files Array of objects of files to inject
 * @param {function} onAllInjected allback function running when injection ends
 */
function injectJS(tabId, files, onAllInjected) {
    var item = files.shift();
    if (item) {
        console.log('Injecting JS "%s" to the tab #%s', item.file, tabId);
        
        if ('file' in item) {
            chrome.tabs.executeScript(tabId ? tabId : null, {
                file: item.file,
                runAt: item.runAt || 'document_start'
            }, function(result) {
                console.info('"%s" injected to the tab #%s', item.file, tabId);
                
                injectJS(tabId, files, onAllInjected);
            });
        }
    } else {
        onAllInjected();
    }
}

// @todo Implement injectCSS (because JS execution working always after CSS injection)

// Message listener
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // @todo Check if sender.tab may be undefined in some cases
    console.log('Received message from tab #%i: %O', sender.tab.id, message);
    
    if (message) {
        switch (message.type) {
            case 'showPageAction':
                chrome.pageAction.show(sender.tab.id);
                sendResponse(true);
                
                console.log('Showed pageAction for tab #%s', sender.tab.id);
                
                // Fuck You, Chrome API documentation!!11
                return true;
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
                    }, function(notificationId) {
                        console.info('Notification "%s" created', notificationId);

                        sendResponse(true);
                    } 
                );
                
                // Fuck You, Chrome API documentation!!11
                return true;
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
                
                sendResponse(true);
                
                // Fuck You, Chrome API documentation!
                return true;
                break;

            /**
             * @deprecated since 1.19.1
             */
            case 'injectJSFile':
                console.log('Executing JS: %s', message.file);
                chrome.tabs.executeScript(sender.tab.id ? sender.tab.id : null, {
                    file: message.file,
                    runAt: message.runAt || 'document_start'
                }, function() {
                    sendResponse(true);

                    console.info('JS file executed: "%s"', message.file);
                    return true;
                });
                
                // Fuck You, Chrome API documentation!
                return true;
                break;
                
            // Inject several files
            case 'executeJSFiles':
                //console.debug('Received JS file list: %O', message.files);
                
                if (message.files.length) {
                    injectJS(sender.tab.id ? sender.tab.id : null, message.files, function() {
                        // @fixme does not sending response now!
                        console.info('All scripts executed');
                        
                        sendResponse(true);
                        return true;
                    });
                } else {
                    /* 
                     * May be not?
                     * But I don't want to block some shit-code execution
                     */
                    sendResponse(false);
                    
                    console.warn('No scripts executed (empty script array)');
                }
                
                // Fuck You, Chrome API documentation!
                return true;
                break;

            /**
             * @deprecated since 1.19.1
             */
            case 'injectCSSFile':
                console.log('Injecting CSS: "%s"', message.file);
                chrome.tabs.insertCSS(sender.tab.id ? sender.tab.id : null, {
                    file: message.file
                }, function() {
                    // @todo message response callback processing
                    //sendResponse(true);

                    console.info('CSS file "%s" injected', message.file);
                });
                
                // Fuck You, Chrome API documentation!
                return true;
                break;
                
            case 'injectCSSCode':
                if (message.code !== undefined) {
                    chrome.tabs.insertCSS(sender.tab.id ? sender.tab.id : null, {
                        code: message.code
                    }, function() {
                        // @todo message response callback processing
                        //sendResponse(true);
                        
                        console.info('CSS code injected: \n%s', message.file);
                    });
                }

                // Fuck You, Chrome API documentation!
                return true;
                break;
                
            default:
                sendResponse(false);
                return true;
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