$(document).ready(function() {
    // Loading options
    chrome.storage.sync.get(['option_fancybox_images', 'option_fancybox_videos', 'option_fancybox_posts', 'option_ctrl_enter', 'option_fluid_layout', 
        'option_images_load_original', 'option_visual_editor_post', 'option_search_with_google'], function(options) {
        // Fancybox
        // Images
        if (options.option_fancybox_images == true) {
            // Linking images in posts to the galleries
            $('.post-content .text').each(function(idxPost){
                $(this).find('a.postimg:not(.youtube)').attr('rel', 'post' + idxPost);
            });
            // Init fancybox
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
            // Reply
            $('.reply-form textarea').keydown(function(e) {
                if (e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13)) {
                    e.preventDefault();
                    $(this).parent('.reply-form').submit();
                }
            });
            // New post
            $('#new-post-form #text-input,#new-post-form #tags-input').keydown(function(e) {
                if (e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13)) {
                    e.preventDefault();
                    $(this).parent('#new-post-form').submit();
                }
            });
        }
        // Look and feel
        // Fluid #main layout
        if (options.option_fluid_layout == true) {
            $('#main, #header, #subheader, #footer').css({
                'width': '95%',
                'max-width': '95%'
            });
            // TODO: fix #main #left-menu #top-link position
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
        // Visual editor
        if (options.option_visual_editor_post == true) {
            // Add classes
            $('#new-post-form #text-input, .post-content #text-input').addClass('markitup').css('height', '20em');
            // Init
            $('.markitup').markItUp(mySettings);
            
            // Send by CTRL+Enter
            if (options.option_ctrl_enter == true) {
                // New post
                $('#new-post-form #text-input, .post-content #text-input').on('keydown.point_plus', function(e) {
                    if (e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13)) {
                        e.preventDefault();
                        $(this).parents('#new-post-form,#post-edit-form').submit();
                    }
                });
            }
        }
        // Google search
        if (options.option_search_with_google == true) {
            $('#search-form input[type="text"]').attr('placeholder', 'Google').keydown(function(e) {
                if (e.keyCode == 10 || e.keyCode == 13) {
                    e.preventDefault();
                    document.location.href = '//www.google.ru/search?q=site%3Apoint.im+' + $(this).val();
                }
            });
        }
    });

    // Showing page action
    chrome.extension.sendMessage({type: 'showPageAction'});
});