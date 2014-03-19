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
    // Fluid layout
    var checkbox_layout_fluid = document.getElementById('option-layout-fluid');
    // Load original images
    var checkbox_images_load_original = document.getElementById('option-images-load-original');
    
    // Saving parameters
    chrome.storage.sync.set({
        'option_ctrl_enter': checkbox_ctrl_enter.checked,
        'option_fancybox_images': checkbox_fancybox_images.checked,
        'option_fancybox_videos': checkbox_fancybox_videos.checked,
        'option_fancybox_posts': checkbox_fancybox_posts.checked,
        'option_fluid_layout': checkbox_layout_fluid.checked,
        'option_images_load_original': checkbox_images_load_original.checked
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
    chrome.storage.sync.get(['option_fancybox_images', 'option_fancybox_videos', 'option_fancybox_posts', 'option_ctrl_enter', 'option_images_load_original', 'option_fluid_layout'], function(options) {
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
        // Fluid layout
        if (options.option_fluid_layout == true) {
            document.getElementById('option-layout-fluid').checked = true;
        }
        // Load original images
        if (options.option_images_load_original == true) {
            document.getElementById('option-images-load-original').checked = true;
        }
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);