$(document).ready(function() {
    // Loading options
    chrome.storage.sync.get(['option_ctrl_enter', 'option_fancybox'], function(options) {
        // Fix the classes and init fancybox
        if (options.option_fancybox == true) {
            $('.postimg').addClass('fancybox-media').fancybox({
                helpers: {
                    media: {
                        youtube: {
                            params: {
                                autoplay: 1
                            }
                        }
                    }
                }
            });
        }

        // Send by CTRL+Enter
        if (options.option_ctrl_enter == true) {
            $('.reply-form textarea').keydown(function(e) {
                //e.preventDefault();
                if (e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13)) {
                    e.preventDefault();
                    $(this).parent('.reply-form').submit();
                }
            });
        }
    });

    // Showing page action
    chrome.extension.sendMessage({type: 'showPageAction'});
});