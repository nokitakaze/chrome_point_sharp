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
    // Load original images
    'option_images_load_original',
    // Embedding
    'option_embedding',
        // Load images from Gelbooru, Danbooru, etc
        'option_images_load_booru',
        // Wrap WEBM videos into the <video> tag
        'option_videos_parse_webm',
        // SoundCloud
        'option_embedding_soundcloud',
            'option_embedding_soundcloud_orig_link',
        // Pleer.com
        'option_embedding_pleercom',
            'option_embedding_pleercom_nokita_server',
    // NSFW filtering
    'option_nsfw',
        // Blured pictures
        'option_nsfw_blur',
            // Blur comments too
            'option_nsfw_blur_comments',
    // CTRL+Enter
    'option_ctrl_enter',
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
    ppOptions.option_ctrl_enter = $('#option-ctrl-enter').prop('checked');
    ppOptions.option_fancybox = $('#option-fancybox').prop('checked');
    ppOptions.option_fancybox_images = $('#option-fancybox-images').prop('checked');
    ppOptions.option_fancybox_videos = $('#option-fancybox-videos').prop('checked');
    ppOptions.option_fancybox_posts = $('#option-fancybox-posts').prop('checked');
    ppOptions.option_fancybox_bind_images_to_one_flow = $('#option-fancybox-bind-images-to-one-flow').prop('checked');
    ppOptions.option_fluid_layout = $('#option-fluid-layout').prop('checked');
    ppOptions.option_images_load_original = $('#option-images-load-original').prop('checked');
    ppOptions.option_embedding = $('#option-embedding').prop('checked');
    ppOptions.option_images_load_booru = $('#option-images-load-booru').prop('checked');
    ppOptions.option_videos_parse_webm = $('#option-videos-parse-webm').prop('checked');
    ppOptions.option_embedding_soundcloud = $('#option-embedding-soundcloud').prop('checked');
    ppOptions.option_embedding_soundcloud_orig_link = $('#option-embedding-soundcloud-orig-link').prop('checked');
    ppOptions.option_embedding_pleercom = $('#option-embedding-pleercom').prop('checked');
    ppOptions.option_embedding_pleercom_nokita_server = $('#option-embedding-pleercom-nokita-server').prop('checked');
    ppOptions.option_nsfw = $('#option-nsfw').prop('checked');
    ppOptions.option_nsfw_blur = $('#option-nsfw-blur').prop('checked');
    ppOptions.option_nsfw_blur_comments = $('#option-nsfw-blur-comments').prop('checked');
    ppOptions.option_visual_editor_post = $('#option-visual-editor-post').prop('checked');
    ppOptions.checkbox_search_with_google = $('#option-search-with-google').prop('checked');
    ppOptions.option_ws = $('#option-ws').prop('checked');
    ppOptions.option_ws_comments = $('#option-ws-comments').prop('checked');
    ppOptions.option_ws_comments_color_fadeout = $('#option-ws-comments-color-fadeout').prop('checked');
    ppOptions.option_ws_comments_notifications = $('#option-ws-comments-notifications').prop('checked');
    ppOptions.option_ws_feeds = $('#option-ws-feeds').prop('checked');
    ppOptions.option_ws_feeds_subscriptions = $('#option-ws-feeds-subscriptions').prop('checked');
    ppOptions.option_ws_feeds_blogs = $('#option-ws-feeds-blogs').prop('checked');
    ppOptions.option_enlarge_font = $('#option-enlarge-font').prop('checked');
    ppOptions.option_enlarge_font_size = document.querySelector('input[name="pp-font-size"]:checked').value;
    ppOptions.option_at_before_username = $('#option-at-before-username').prop('checked');
    ppOptions.option_other_hightlight_post_comments = $('#option-other-hightlight-post-comments').prop('checked');
    ppOptions.option_other_show_recommendation_count = $('#option-other-show-recommendation-count').prop('checked');

    // Saving parameters
    chrome.storage.sync.set(ppOptions, function() {
        // Update status to let user know options were saved.
        $('#status').html(chrome.i18n.getMessage('options_text_saved'));
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
                if (value === true) {
                    optionId = '#' + key.replace(/_/g, '-');
                    $(optionId).first().prop('checked', true);
                }
            } else if (typeof(value) == 'number') {
                // Radio select
                optionId = '#' + key.replace(/_/g, '-') + '-' + value;
                $(optionId).first().prop('checked', true);
            }
        });
        
        // Showing version
        $('#pp-version').html('Point+ ' + getVersion() 
                + ' by <a href="https://skobkin-ru.point.im/" target="_blank">@skobkin-ru</a><br>\n\
                     & <a href="https://nokitakaze.point.im/" target="_blank">@NokitaKaze</a>'
        );
    });
    

}
document.addEventListener('DOMContentLoaded', pp_restore_options);
var point_plus_options_save_button = document.querySelector('#save');
if (point_plus_options_save_button !== null) {
    point_plus_options_save_button.addEventListener('click', pp_save_options);
}

// Binding event listeners
$(function() {
    // Delegating events
    $('#tabs-content').on('click', 'input', function() {
        pp_save_options();
    });
});

// Getting version from manifest.json
function getVersion() { 
    var xhr = new XMLHttpRequest(); 
    xhr.open('GET', chrome.extension.getURL('manifest.json'), false); 
    xhr.send(null); 
    var manifest = JSON.parse(xhr.responseText); 
    return manifest.version; 
} 