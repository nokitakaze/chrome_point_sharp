var ppOptions = {};

// Initializing full options structure
// Saves options to localStorage.
function pp_init_options() {
    $('.option-node').find('input').each(function(idx, $input) {
        console.log($(this));
        
        // Using option types
        if ($(this).hasClass('option-boolean')) {
            ppOptions[$(this).prop('id').replace(/-/g, '_')] = {
                'type': 'boolean',
                'value': $(this).prop('checked')
            };
        } else if ($(this).hasClass('option-enum')) {
            if ($(this).prop('checked')) {
                ppOptions[$(this).prop('name').replace(/-/g, '_')] = {
                    'type': 'enum',
                    'value': $(this).val()
                }
            }
        }
    });
    
    console.log('Saving options: %O', ppOptions);

    // Saving parameters
    chrome.storage.sync.set({'options': ppOptions}, function() {
        console.log('Default options initialized');
    });
}

// Saves options to localStorage.
// @todo: optimize it!
function pp_save_options() {
    $('.option-node').find('input').each(function(idx, $input) {
        console.log($(this));
        
        // Using option types
        if ($(this).hasClass('option-boolean')) {
            ppOptions[$(this).prop('id').replace(/-/g, '_')] = {
                'type': 'boolean',
                'value': $(this).prop('checked')
            };
        } else if ($(this).hasClass('option-enum')) {
            if ($(this).prop('checked')) {
                ppOptions[$(this).prop('name').replace(/-/g, '_')] = {
                    'type': 'enum',
                    'value': $(this).val()
                }
            }
        }
    });
    
    console.log('Saving options: %O', ppOptions);

    // Saving parameters
    chrome.storage.sync.set({'options': ppOptions}, function() {
        // Update status to let user know options were saved.
        $('#status').html(chrome.i18n.getMessage('options_text_saved'));
    });
}

// Restores select box state to saved value from localStorage.
function pp_restore_options() {
    // Cleaning old style options
    // Delete after some time
    chrome.storage.sync.get('option_fancybox', function(value) {
        if (value === true || value === false) {
            console.log('Found old-style options. Cleaning...');
            chrome.storage.sync.get(null, function(old_options) {
                console.log('Old data: %O', old_options);
                for (option in old_options) {
                    chrome.storage.sync.remove(option);
                }
                console.log('All old data removed');
            });
        }
    });
    
    // Loading options
    chrome.storage.sync.get('options', function(options) {
        // Initializing clean options
        // @todo: rewrite for all options
        if (options.option_embedding === undefined) {
            console.warn('Clean options detected. Initializing...');
            pp_init_options();
        }
        
        // Setting options in DOM
        $.each(options.options, function(key, data) {
            switch (data.type) {
                case 'boolean':
                    if (data.value) {
                        $('#' + key.replace(/_/g, '-')).prop('checked', true);
                    }
                    break;
                    
                case 'enum':
                    $('.option-node .option-enum[name="' + key.replace(/_/g, '-') + '"][value="' + data.value + '"]').prop('checked', true);
                    break;
                    
                default:
                    console.warn('Invalid option "'+key+'" type: '+data);
                    break;
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