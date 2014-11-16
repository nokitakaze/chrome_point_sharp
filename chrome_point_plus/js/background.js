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
                console.log(chrome.notifications.create(
                    message.notificationId, {   
                        type: 'basic', 
                        iconUrl: message.avatarUrl, 
                        title: message.title, 
                        message: message.text,
                        priority: 0
                    },
                    function() { /* Error checking goes here */} 
                )); 
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