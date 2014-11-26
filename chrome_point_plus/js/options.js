var ppOptions = {};

// Binding event listeners
$(function() {
    pp_restore_options();
    
    // Delegating events
    $('#tabs-content').on('click', 'input', function() {
        pp_save_options();
    });
});

// Initializing full options structure
function pp_init_options() {
    var pp_version = getVersion();
    
    chrome.storage.sync.get('options_version', function(data) {
        console.info('Point+ %s, local options are for %s', pp_version, data.options_version);
        
        // Checking last options version
        if (data.options_version != getVersion()) {
            console.log('Initializing options...');
            
            $('.option-node').find('input').each(function(idx, $input) {
                console.debug($(this));
                
                // Using option types
                if ($(this).hasClass('option-boolean')) {
                    ppOptions[$(this).prop('id').replace(/-/g, '_')] = {
                        type: 'boolean',
                        value: $(this).prop('checked')
                    };
                } else if ($(this).hasClass('option-enum')) {
                    if ($(this).prop('checked')) {
                        ppOptions[$(this).prop('name').replace(/-/g, '_')] = {
                            type: 'enum',
                            value: $(this).val()
                        };
                    }
                }
            });
            
            // Updating options
            chrome.storage.sync.set({
                    options: ppOptions,
                    options_version: getVersion()
                }, function() {
                console.log('Default options initialized. Version upgraded to %s.', pp_version);
                
                if (!confirm(chrome.i18n.getMessage('options_text_new_version'))) {
                    window.close();
                }
            });
        }
    });
}

// Saves options to sync storage.
// @todo: optimize it! (merge)
function pp_save_options() {
    $('.option-node').find('input').each(function(idx, $input) {
        console.log($(this));
        
        // Using option types
        if ($(this).hasClass('option-boolean')) {
            ppOptions[$(this).prop('id').replace(/-/g, '_')] = {
                type: 'boolean',
                value: $(this).prop('checked')
            };
        } else if ($(this).hasClass('option-enum')) {
            if ($(this).prop('checked')) {
                ppOptions[$(this).prop('name').replace(/-/g, '_')] = {
                    type: 'enum',
                    value: $(this).val()
                };
            }
        }
    });
    
    console.log('Saving options: %O', ppOptions);

    // Saving parameters
    chrome.storage.sync.set({options: ppOptions}, function() {
        // Update status to let user know options were saved.
        $('#status').html(chrome.i18n.getMessage('options_text_saved'));
    });
}

// Restores select box state to saved value from localStorage.
function pp_restore_options() {
    // Cleaning old style options
    // Delete after some time
    chrome.storage.sync.get('option_fancybox', function(data) {
        if ((data.option_fancybox === true) || (data.option_fancybox === false)) {
            console.log('Found old-style options. Cleaning...');
            chrome.storage.sync.get(null, function(data) {
                console.log('Old data: %O', data);
                for (option in data) {
                    chrome.storage.sync.remove(option);
                }
                console.log('All old data removed');
            });
        }
    });
    
        // Loading options
        chrome.storage.sync.get('options', function(options) {
            
            try {
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
                            console.warn('Invalid option "%s" type: %O', key, data);
                            break;
                    }
                });
            } catch (ex) {
                console.error('Error while loading extension options: %O', ex);
            }

        
        // Showing version
        $('#pp-version').html('Point+ ' + getVersion() 
                + ' by <a href="https://skobkin-ru.point.im/" target="_blank">@skobkin-ru</a><br>\n\
                     & <a href="https://nokitakaze.point.im/" target="_blank">@NokitaKaze</a>'
        );

        // Initializing new options
        pp_init_options();
    });
}

// Getting version from manifest.json
function getVersion() { 
    var xhr = new XMLHttpRequest(); 
    xhr.open('GET', chrome.extension.getURL('manifest.json'), false); 
    xhr.send(null); 
    var manifest = JSON.parse(xhr.responseText); 
    return manifest.version; 
} 