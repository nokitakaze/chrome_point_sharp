// Saves options to localStorage.
function save_options() {
    // CTRL+Enter
    var checkbox_ctrl_enter = document.getElementById('option-ctrl-enter');
    // Fancybox
    // Images
    var checkbox_fancybox_images = document.getElementById('option-fancybox-images');
    // Videos
    var checkbox_fancybox_videos = document.getElementById('option-fancybox-videos');
    // Posts
    var checkbox_fancybox_posts = document.getElementById('option-fancybox-posts');

    // Saving parameters
    chrome.storage.sync.set({
        'option_ctrl_enter': checkbox_ctrl_enter.checked,
        'option_fancybox_images': checkbox_fancybox_images.checked,
        'option_fancybox_videos': checkbox_fancybox_videos.checked,
        'option_fancybox_posts': checkbox_fancybox_posts.checked,
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
function restore_options() {
    // Loading options
    chrome.storage.sync.get(['option_fancybox_images', 'option_fancybox_videos', 'option_fancybox_posts', 'option_ctrl_enter'], function(options) {
        // CTRL+Enter
        if (options.option_ctrl_enter == true) {
            document.getElementById('option-ctrl-enter').checked = true;
        }
        // Fancybox
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
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);