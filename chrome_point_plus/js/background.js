chrome.extension.onMessage.addListener(function(message, sender) {
    if (message && message.type === 'showPageAction') {
        var tab = sender.tab;
        chrome.pageAction.show(tab.id);
    }
    
    if (message && message.type === 'showNotification') {
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
    }
});