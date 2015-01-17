// @todo Выкинуть на хер

document.addEventListener('DOMContentLoaded', function() {
    // Processing all emenents contains data-i18n attribute
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function(elem) {
        elem.innerHTML = chrome.i18n.getMessage(elem.dataset.i18n);
    });
}, false);
