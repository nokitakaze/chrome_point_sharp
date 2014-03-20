$(document).ready(function() {
    // Loading options
    chrome.storage.sync.get(['option_fancybox_images', 'option_fancybox_videos', 'option_fancybox_posts', 'option_ctrl_enter', 'option_fluid_layout', 'option_images_load_original'], function(options) {
        // Fancybox
        // Images
        if (options.option_fancybox_images == true) {
            // TODO: group images to the galeries
            $('.postimg:not(.youtube)').fancybox();
        }
        // Videos
        if (options.option_fancybox_videos == true) {
            $('.postimg.youtube').addClass('fancybox-media').fancybox({
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
        // Hotkeys
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
        // Look and feel
        // Fluid #main layout
        if (options.option_fluid_layout == true) {
            $('#main').css({
                'width': '95%',
                'max-width': '95%'
            });
        }
        // Image resizing
        if (options.option_images_load_original == true) {
            // Setting new image source
            $('.postimg:not(.youtube) img').each(function(){
                console.log($(this).parent('.postimg').attr('href'));
                $(this).attr('src', $(this).parent('.postimg').attr('href'));
            });
            // Resizing
            $('.postimg:not(.youtube), .postimg:not(.youtube) img').css({
                'width': 'auto',
                'height': 'auto',
                'max-width': '100%',
                'max-height': '100%'
            });
        }
    });

    // Showing page action
    chrome.extension.sendMessage({type: 'showPageAction'});
});