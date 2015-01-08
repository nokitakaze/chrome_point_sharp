function MessageSender() {}
function stub() {}

MessageSender.prototype.css = function(files, callback) {
    this.sendMessage({
        type: 'injectCSSFiles',
        files: files
    }, callback || stub);
};

MessageSender.prototype.js = function(files, callback) {
    this.sendMessage({
        type: 'executeJSFiles',
        files: files
    }, callback || stub);
};

MessageSender.prototype.sendMessage = function() {
    chrome.runtime.sendMessage.apply(chrome.runtime, arguments);
};
