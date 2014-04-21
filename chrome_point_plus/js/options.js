var ppOptions = [
    // Fancybox
    'option_fancybox', 'option_fancybox_images', 'option_fancybox_videos', 'option_fancybox_posts',
    // CTRL+Enter
    'option_ctrl_enter',
    // Load original images
    'option_images_load_original', 
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
    'option_at_before_username'
];

// Saves options to localStorage.
function pp_save_options() {
    // CTRL+Enter
    var option_ctrl_enter = document.getElementById('option-ctrl-enter');
    // Fancybox
    // 
    var option_fancybox = document.getElementById('option-fancybox');
    // Images
    var option_fancybox_images = document.getElementById('option-fancybox-images');
    // Videos
    var option_fancybox_videos = document.getElementById('option-fancybox-videos');
    // Posts
    var option_fancybox_posts = document.getElementById('option-fancybox-posts');
    // Fluid layout
    var option_fluid_layout = document.getElementById('option-layout-fluid');
    // Load original images
    var option_images_load_original = document.getElementById('option-images-load-original');
    // Visual editor for posts
    var option_visual_editor_post = document.getElementById('option-visual-editor-post');
    // Google search
    var checkbox_search_with_google = document.getElementById('option-search-with-google');
    // WebSocket
    // 
    var option_ws = document.getElementById('option-ws');
    // Comments
    var option_ws_comments = document.getElementById('option-ws-comments');
    // Fade out highlight comments
    var option_ws_comments_color_fadeout = document.getElementById('option-ws-comments-color-fadeout');
    // Comments desktop notifications
    var option_ws_comments_notifications = document.getElementById('option-ws-comments-notifications');
    // Feeds
    var option_ws_feeds = document.getElementById('option-ws-feeds');
    // Subscriptions
    var option_ws_feeds_subscriptions = document.getElementById('option-ws-feeds-subscriptions');
    // Blogs
    var option_ws_feeds_blogs = document.getElementById('option-ws-feeds-blogs');
    // Font size
    var option_enlarge_font = document.getElementById('option-enlarge-font');
    // Size ratio
    var option_enlarge_font_size = document.querySelector('input[name="pp-font-size"]:checked');
    // @ before username
    var option_at_before_username = document.getElementById('option-at-before-username');
    
    // Saving parameters
    chrome.storage.sync.set({
        'option_ctrl_enter': option_ctrl_enter.checked,
        'option_fancybox': option_fancybox.checked,
            'option_fancybox_images': option_fancybox_images.checked,
            'option_fancybox_videos': option_fancybox_videos.checked,
            'option_fancybox_posts': option_fancybox_posts.checked,
        'option_fluid_layout': option_fluid_layout.checked,
        'option_images_load_original': option_images_load_original.checked,
        'option_visual_editor_post': option_visual_editor_post.checked,
        'option_search_with_google': checkbox_search_with_google.checked,
        'option_ws': option_ws.checked,
            'option_ws_comments': option_ws_comments.checked,
                'option_ws_comments_color_fadeout': option_ws_comments_color_fadeout.checked,
                'option_ws_comments_notifications': option_ws_comments_notifications.checked,
            'option_ws_feeds': option_ws_feeds.checked,
                'option_ws_feeds_subscriptions': option_ws_feeds_subscriptions.checked,
                'option_ws_feeds_blogs': option_ws_feeds_blogs.checked,
        'option_enlarge_font': option_enlarge_font.checked,
            'option_enlarge_font_size': option_enlarge_font_size.value,
        'option_at_before_username': option_at_before_username.checked
    }, function() {
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
        // CTRL+Enter
        if (options.option_ctrl_enter == true) {
            document.getElementById('option-ctrl-enter').checked = true;
        }
        // Fancybox
        //
        if (options.option_fancybox == true) {
            document.getElementById('option-fancybox').checked = true;
        }
        // Images
        if (options.option_fancybox_images == true) {
            document.getElementById('option-fancybox-images').checked = true;
        }
        // Videos
        if (options.option_fancybox_videos == true) {
            document.getElementById('option-fancybox-videos').checked = true;
        }
        // Posts
        if (options.option_fancybox_posts == true) {
            document.getElementById('option-fancybox-posts').checked = true;
        }
        // Fluid layout
        if (options.option_fluid_layout == true) {
            document.getElementById('option-layout-fluid').checked = true;
        }
        // Load original images
        if (options.option_images_load_original == true) {
            document.getElementById('option-images-load-original').checked = true;
        }
        // Visual editor for posts
        if (options.option_visual_editor_post == true) {
            document.getElementById('option-visual-editor-post').checked = true;
        }
        // Google search
        if (options.option_search_with_google == true) {
            document.getElementById('option-search-with-google').checked = true;
        }
        // WebSocket
        //
        if (options.option_ws == true) {
            document.getElementById('option-ws').checked = true;
        }
        // Comments
        if (options.option_ws_comments == true) {
            document.getElementById('option-ws-comments').checked = true;
        }
        // Fade out highlight comments
        if (options.option_ws_comments_color_fadeout == true) {
            document.getElementById('option-ws-comments-color-fadeout').checked = true;
        }
        // Comments desktop notifications
        // Disabling for Opera
        if (/OPR/.test(navigator.userAgent)) {
            document.getElementById('option-ws-comments-notifications').setAttribute('disabled', 'disabled');
        }
        if (options.option_ws_comments_notifications == true) {
            document.getElementById('option-ws-comments-notifications').checked = true;
        }
        // Feeds
        if (options.option_ws_feeds == true) {
            document.getElementById('option-ws-feeds').checked = true;
        }
        // Subscriptions
        if (options.option_ws_feeds_subscriptions == true) {
            document.getElementById('option-ws-feeds-subscriptions').checked = true;
        }
        // Blogs
        if (options.option_ws_feeds_blogs == true) {
            document.getElementById('option-ws-feeds-blogs').checked = true;
        }
        // Font size
        if (options.option_enlarge_font == true) {
            document.getElementById('option-enlarge-font').checked = true;
        }
        // Size ratio
        if (options.option_enlarge_font_size !== undefined) {
            document.getElementById('option-enlarge-font-' + options.option_enlarge_font_size).checked = true;
        }
        // @ before username
        if (options.option_at_before_username == true) {
            document.getElementById('option-at-before-username').checked = true;
        }
        
        // Showing version
        document.getElementById('pp-version').innerHTML = 'Point+ ' + getVersion() + ' by <a href="http://skobkin-ru.point.im/" target="_blank">@skobkin-ru</a>';
    });
    

}
document.addEventListener('DOMContentLoaded', pp_restore_options);
document.querySelector('#save').addEventListener('click', pp_save_options);

// Getting version from manifest.json
function getVersion() { 
    var xhr = new XMLHttpRequest(); 
    xhr.open('GET', chrome.extension.getURL('manifest.json'), false); 
    xhr.send(null); 
    var manifest = JSON.parse(xhr.responseText); 
    return manifest.version; 
} 