// Saves options to localStorage.
function save_options() {
    // CTRL+Enter
    var checkbox_ctrl_enter = document.getElementById('option-ctrl-enter');
    // Fancybox
    var checkbox_fancybox = document.getElementById('option-fancybox');

    // Saving parameters
    chrome.storage.sync.set({
        'option_ctrl_enter': checkbox_ctrl_enter.checked,
        'option_fancybox': checkbox_fancybox.checked
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
    chrome.storage.sync.get(['option_ctrl_enter', 'option_fancybox'], function(options) {
        // CTRL+Enter
        if (options.option_ctrl_enter == true) {
            document.getElementById('option-ctrl-enter').checked = true;
        }
        ;
        // Fancybox
        if (options.option_fancybox == true) {
            document.getElementById('option-fancybox').checked = true;
        }
        ;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);