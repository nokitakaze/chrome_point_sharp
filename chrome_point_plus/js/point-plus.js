$(document).ready(function() {
    // Grouping console log
    console.group('point-plus');

    console.info('Point+ %s', getVersion());

    // Loading options
    chrome.storage.sync.get(ppOptions, function(options) {
        // Options debug
        console.debug('Options loaded: %O', options);
        
        // Fancybox
        if (options.option_fancybox == true) {
            // Images
            if (options.option_fancybox_images == true) {
                // Linking images in posts to the galleries
                $('.post-content .text').each(function(idxPost) {
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
        }

        // Hotkeys
        // Send by CTRL+Enter
        if (options.option_ctrl_enter == true) {
            // Reply
            // Delegated event for all comments
            $('.content-wrap #comments').on('keydown.point_plus', '.reply-form textarea', function(e) {
                if (e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13)) {
                    e.preventDefault();
                    $(this).parent('.reply-form').submit();
                }
            });
            // New post
            $('#new-post-form #text-input,#new-post-form #tags-input').on('keydown.point_plus', function(e) {
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
            $('.postimg:not(.youtube) img').each(function() {
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
        // WebSocket
        if (options.option_ws == true) {
            // SSL or plain
            ws = new WebSocket(((location.protocol == 'https:') ? 'wss' : 'ws') + '://point.im/ws');
            console.log('WebSocket created: %O', ws);
            
            // Detecting post id if presented
            var postId = $('#top-post').attr('data-id');
            console.debug('Current post id detected as #%s', postId);
            // Detecting view mode
            treeSwitch = $('#tree-switch a.active').attr('href');
            console.debug('Comments view mode: %s', treeSwitch);
            
            // Error handler
            ws.onerror = function(err) {
                console.error('WebSocket error: %O', err);
            };
            
            // Message handler
            ws.onmessage = function(evt) {
                try {
                    // ping :)
                    if (evt.data == 'ping') {
                        console.debug('ws-ping');
                    } else {
                        var wsMessage = JSON.parse(evt.data);

                        if (wsMessage.hasOwnProperty('a') && wsMessage.a != '') {
                            switch (wsMessage.a) {
                                // Comments
                                case 'comment':
                                    console.groupCollapsed('ws-comment #%s/%s', wsMessage.post_id, wsMessage.comment_id);
                                    console.debug(wsMessage);

                                    // Check option
                                    if (options.option_ws_comments != true) {
                                        console.log('Comments processing disabled');
                                        console.groupEnd();
                                        break;
                                    }

                                    // Check we are in the post
                                    if ($('#top-post').length < 1) {
                                        console.log('Not in the post, skipping');
                                        console.groupEnd();
                                        break;
                                    }
                                    
                                    // Check we are in specified post
                                    if (wsMessage.post_id != postId) {
                                        console.log('The comment is for #%s but current page is for #%s', wsMessage.post_id, postId);
                                        console.groupEnd();
                                        break;
                                    }
                                    
                                    var $anchor = $('<a>').attr('name', wsMessage.comment_id);

                                    // Initializing comment element
                                    var $commentTemplate = $('<div>').attr({
                                        'class': 'post',
                                        'data-id': postId,
                                        'data-comment-id': wsMessage.comment_id,
                                        'data-to-comment-id': (wsMessage.to_comment_id != null) ? wsMessage.to_comment_id : ''
                                    });

                                    // Loading HTML template
                                    $commentTemplate.load(chrome.extension.getURL('includes/comment.html'), function() {
                                        // Load complete
                                        console.info('comment.html loaded');

                                        // Date and time of comment
                                        var date = new Date();

                                        // Data for template
                                        var userLink = '//' + wsMessage.author + '.point.im/';
                                        var postAuthorLink = $('#top-post .info a').attr('href');
                                        var postLink = postAuthorLink + wsMessage.post_id;
                                        var userAvatar = '//point.im/avatar/' + wsMessage.author;
                                        var commentLink = '//point.im/' + wsMessage.post_id + '#' + wsMessage.comment_id;
                                        var csRfToken = $('.reply-form input[name="csrf_token"').val();

                                        // Filling template
                                        console.info('Changing data in the comment element');
                                        // Date and time
                                        $commentTemplate.find('.info .created')
                                                .append($('<span>').html(((date.getDate().toString.length < 2) ? ('0' + date.getDate().toString()) : (date.getDate().toString())) + '&nbsp;' + months[date.getMonth()]))
                                                // Crutchy fix
                                                .append($('<br>'))
                                                ///Crutchy fix
                                                .append($('<span>').html(date.getHours() + ':' + ((date.getMinutes().toString().length < 2) ? ('0' + date.getMinutes().toString()) : (date.getMinutes().toString()))));
                                        // Comment text
                                        $commentTemplate.find('.text').append($('<p>').html(escapeHtml(wsMessage.text)));
                                        // Author
                                        $commentTemplate.find('.author a.user').attr('href', userLink).html(wsMessage.author);
                                        // Avatar and link
                                        $commentTemplate.find('.info a').attr('href', userLink).children('img.avatar').attr('src', userAvatar + '/24');
                                        // Post and comment ID's link
                                        $commentTemplate.find('.clearfix .post-id a').attr('href', commentLink).html('#' + wsMessage.post_id + '/' + wsMessage.comment_id)
                                                // Adding answer label
                                                .after((wsMessage.to_comment_id !== null) ? (' в ответ на <a href="#' + wsMessage.to_comment_id + '">/' + wsMessage.to_comment_id + '</a>') : (''));
                                        // Setting action labels and other attributes
                                        $commentTemplate.find('.action-labels .reply-label').attr('for', 'reply-' + wsMessage.post_id + '_' + wsMessage.comment_id);
                                        $commentTemplate.find('.action-labels .more-label').attr('for', 'action-' + wsMessage.post_id + '_' + wsMessage.comment_id);
                                        $commentTemplate.find('.post-content input[name="action-radio"]').attr('id', 'action-' + wsMessage.post_id + '_' + wsMessage.comment_id);
                                        // Bookmark link
                                        $commentTemplate.find('.action-buttons a.bookmark').attr('href', postLink + '/b?comment_id=' + wsMessage.comment_id + '&csrf_token=' + csRfToken);
                                        // Reply form
                                        $commentTemplate.find('.post-content input.reply-radio').attr('id', 'reply-' + wsMessage.post_id + '_' + wsMessage.comment_id);
                                        $commentTemplate.find('.post-content form.reply-form').attr('action', '/' + wsMessage.post_id);
                                        $commentTemplate.find('.post-content form.reply-form textarea[name="text"]').html('@' + wsMessage.author + ', ');
                                        $commentTemplate.find('.post-content form.reply-form input[name="comment_id"]').val(wsMessage.comment_id);
                                        $commentTemplate.find('.post-content form.reply-form input[name="csrf_token"]').val(csRfToken);
                                        ///Filling template

                                        // It's time to DOM
                                        console.info('Inserting comment');
                                        // If list mode or not addressed to other comment
                                        if ((treeSwitch == '?tree=0') || (wsMessage.to_comment_id == null)) {
                                            // List mode
                                            $('.content-wrap #comments #post-reply').before($commentTemplate.hide().fadeIn(2000));
                                        } else {
                                            // Tree mode
                                            // Search parent comment
                                            $parentComment = $('.post[data-comment-id="' + wsMessage.to_comment_id + '"]');
                                            if ($parentComment.length > 0) {
                                                console.log('Parent comment: %O', $parentComment);
                                                // Check for children
                                                $parentCommentChildren = $parentComment.next('.comments');
                                                // If child comment already exist
                                                if ($parentCommentChildren.length > 0) {
                                                    console.log('Child comments found. Appending...');
                                                    $parentCommentChildren.append($commentTemplate.hide().fadeIn(2000));
                                                } else {
                                                    console.log('No child comments found. Creating...');
                                                    $parentComment.after($('<div>').addClass('comments').append($commentTemplate.hide().fadeIn(2000)));
                                                }
                                            } else {
                                                console.log('Parent comment not found');
                                                // FIXME: Double code
                                                $('.content-wrap #comments #post-reply').before($commentTemplate.hide().fadeIn(2000));
                                            }
                                        }

                                        // Adding anchor
                                        $commentTemplate.before($anchor);
                                        
                                        // Fading out highlight if needed
                                        if (options.option_ws_comments_color_fadeout == true) {
                                            console.log('Fading out the highlight');
                                            $commentTemplate.children('.pp-highlight').fadeOut(20000);
                                        }
                                        
                                        console.groupEnd();
                                    });
                                    
                                    break;

                                    // Posts
                                    case 'post':
                                        console.group('ws-post #%s', wsMessage.post_id);
                                        
                                        console.debug(wsMessage);
                                        
                                        console.groupEnd();
                                        break;
                                        
                                    // Recommendation
                                    case 'ok':
                                        console.group('ws-recommendation #%s/%s', wsMessage.post_id, wsMessage.comment_id);
                                        
                                        console.debug(wsMessage);
                                        
                                        console.groupEnd();
                                        break;
                                        
                                    default:
                                        console.group('ws-other');
                                        
                                        console.log(wsMessage);
                                        
                                        console.groupEnd();
                                        break;
                                        
                            }
                        }


                    }
                } catch (e) {
                    console.log('WebSocket exception:')
                    console.log(e);
                    console.log(evt.data);
                }
                ;
            };
        }

    });

    // Showing page action
    chrome.extension.sendMessage({type: 'showPageAction'});
});

function escapeHtml(text) {
    return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            //.replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\n/g, "<br>");
}

// Monts for Date.getMonth()
var months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];