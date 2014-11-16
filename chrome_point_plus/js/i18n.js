$(document).ready(function() {
    // Processing all emenents contains data-i18n attribute
    $('[data-i18n]').each(function() {
        $(this).html(chrome.i18n.getMessage($(this).data('i18n')));
    });
});