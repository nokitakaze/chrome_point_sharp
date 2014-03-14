$(document).ready(function() {
    // Loading options
    chrome.storage.sync.get(['option_fancybox_images', 'option_fancybox_videos', 'option_fancybox_posts', 'option_ctrl_enter'], function(options) {
        // Fancybox
        // Images
        if (options.option_fancybox_images == true) {
            $('.postimg:not(.video)').fancybox();
        }
        // Videos
        if (options.option_fancybox_videos == true) {
            $('.postimg.video').addClass('fancybox-media').fancybox({
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
        // Posts
        if (options.option_fancybox_posts == true) {
            $('.post-id a').attr('data-fancybox-type', 'iframe').fancybox({
                maxWidth: 780
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