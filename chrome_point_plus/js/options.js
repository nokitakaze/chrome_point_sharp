var ppOptions = [
    // Fancybox
    'option_fancybox',
        // Open images in Fancybox
        'option_fancybox_images',
        // Open videos in Fancybox
        'option_fancybox_videos',
        // Open posts in Fancybox
        'option_fancybox_posts',
        // Bind all images from fancybox to one flow
        'option_fancybox_bind_images_to_one_flow',
    // CTRL+Enter
    'option_ctrl_enter',
    // Load original images
    'option_images_load_original',
    // Embedding
    'option_embedding',
        // Load images from Gelbooru, Danbooru, etc
        'option_images_load_booru',
        // Wrap WEBM videos into the <video> tag
        'option_videos_parse_webm',
    // Fluid layout
    'option_fluid_layout', 
    // Visual editor for posts
    'option_visual_editor_post', 
    // Google search
    'option_search_with_google', 
    // WebSocket
    'option_ws', 
        // Comments
        'option_ws_comments', 'option_ws_comments_color_fadeout', 'option_ws_comments_notifications',
        // Feeds
        'option_ws_feeds', 'option_ws_feeds_subscriptions', 'option_ws_feeds_blogs',
    // Font size
    'option_enlarge_font', 'option_enlarge_font_size',
    // @ before username
    'option_at_before_username',
    // Highlight posts with new comments
    'option_other_hightlight_post_comments',
    // Show recommendations and unique comments count
    'option_other_show_recommendation_count',
];

// Saves options to localStorage.
function pp_save_options() {
    ppOptions = {};
    ppOptions.option_ctrl_enter = document.getElementById('option-ctrl-enter').checked;
    ppOptions.option_fancybox = document.getElementById('option-fancybox').checked;
    ppOptions.option_fancybox_images = document.getElementById('option-fancybox-images').checked;
    ppOptions.option_fancybox_videos = document.getElementById('option-fancybox-videos').checked;
    ppOptions.option_fancybox_posts = document.getElementById('option-fancybox-posts').checked;
    ppOptions.option_fancybox_bind_images_to_one_flow = document.getElementById('option-fancybox-bind-images-to-one-flow').checked;
    ppOptions.option_fluid_layout = document.getElementById('option-fluid-layout').checked;
    ppOptions.option_images_load_original = document.getElementById('option-images-load-original').checked;
    ppOptions.option_embedding = document.getElementById('option-embedding').checked;
    ppOptions.option_images_load_booru = document.getElementById('option-images-load-booru').checked;
    ppOptions.option_videos_parse_webm = document.getElementById('option-videos-parse-webm').checked;
    ppOptions.option_visual_editor_post = document.getElementById('option-visual-editor-post').checked;
    ppOptions.checkbox_search_with_google = document.getElementById('option-search-with-google').checked;
    ppOptions.option_ws = document.getElementById('option-ws').checked;
    ppOptions.option_ws_comments = document.getElementById('option-ws-comments').checked;
    ppOptions.option_ws_comments_color_fadeout = document.getElementById('option-ws-comments-color-fadeout').checked;
    ppOptions.option_ws_comments_notifications = document.getElementById('option-ws-comments-notifications').checked;
    ppOptions.option_ws_feeds = document.getElementById('option-ws-feeds').checked;
    ppOptions.option_ws_feeds_subscriptions = document.getElementById('option-ws-feeds-subscriptions').checked;
    ppOptions.option_ws_feeds_blogs = document.getElementById('option-ws-feeds-blogs').checked;
    ppOptions.option_enlarge_font = document.getElementById('option-enlarge-font').checked;
    ppOptions.option_enlarge_font_size = document.querySelector('input[name="pp-font-size"]:checked').value;
    ppOptions.option_at_before_username = document.getElementById('option-at-before-username').checked;
    ppOptions.option_other_hightlight_post_comments = document.getElementById('option-other-hightlight-post-comments').checked;
    ppOptions.option_other_show_recommendation_count = document.getElementById('option-other-show-recommendation-count').checked;


    // Saving parameters
    chrome.storage.sync.set(ppOptions, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.innerHTML = 'Options Saved.';
        setTimeout(function() {
            window.close();
        }, 1500);
    });
}

// Restores select box state to saved value from localStorage.
function pp_restore_options() {
    // Loading options
    chrome.storage.sync.get(ppOptions, function(options) {
        // Setting options in DOM
        $.each(options, function(key, value) {
            var optionId = null;
            
            // Detecting option type
            if (typeof(value) == 'boolean') {
                // Checkbox
                optionId = '#' + key.replace(/_/g, '-');
                if (value === true) {
                    $(optionId).first().prop('checked', true);
                }
            } else if (typeof(value) == 'number') {
                // Radio select
                optionId = '#' + key.replace(/_/g, '-') + '-' + value;
                $(optionId).first().prop('checked', true);
            }
        });
        
        // Showing version
        document.getElementById('pp-version').innerHTML = 'Point+ ' + getVersion() 
                + ' by <a href="https://skobkin-ru.point.im/" target="_blank">@skobkin-ru</a><br>\n\
                     & <a href="https://nokitakaze.point.im/" target="_blank">@NokitaKaze</a>';
    });
    

}
document.addEventListener('DOMContentLoaded', pp_restore_options);
var point_plus_options_save_button = document.querySelector('#save');
if (point_plus_options_save_button !== null) {
    point_plus_options_save_button.addEventListener('click', pp_save_options);
}

// Getting version from manifest.json
function getVersion() { 
    var xhr = new XMLHttpRequest(); 
    xhr.open('GET', chrome.extension.getURL('manifest.json'), false); 
    xhr.send(null); 
    var manifest = JSON.parse(xhr.responseText); 
    return manifest.version; 
} 