var messenger = new MessageSender();

// Showing page action
messenger.sendMessage({
    type: 'showPageAction'
}, function(response) {
    console.debug('showPageAction response: %O', response);
});

messenger.sendMessage({
    type: 'getManifestVersion'
}, function(response) {
    $(document).ready(function() {
        PointPlus(response.version || 'undefined')
    });
});


function PointPlus(ppVersion) {

    // Grouping console log
    console.group('point-plus');
    console.info('Point+ %s', ppVersion);

    // Проверяем, загрузились ли мы
    var point_plus_debug = $('#point-plus-debug');
    if (point_plus_debug.length > 0) {
        console.error('Point+ %s already loaded.', point_plus_debug.data('point-plus-version'));
        return;
    }
    $('<div id="point-plus-debug">').attr({
        'data-point-plus-version': ppVersion
    }).text('Point+ ' + ppVersion + ' loading...')
            .insertBefore('#user-menu-cb');

    // Loading options
    chrome.storage.sync.get('options', function(sync_data) {
        var options = new OptionsManager(sync_data.options);

        // Options debug
        try {
            console.debug('Options loaded: %O', options.getOptions());
        } catch(e){}
        create_tag_system();

        // Embedding
        if (options.is('option_embedding')) {
            // Load pictures from Booru, Tumblr and some other sites
            if (options.is('option_images_load_booru')) {
                load_all_booru_images();
            }
            
            // Instagram
            if (options.is('option_embedding_instagram_posts')){
                instagram_posts_embedding_init(options);
            }

            // Parse webm-links and create video instead
            if (options.is('option_videos_parse_links')) {
                if (options.is('option_videos_parse_links_type', 'all')) {
                    parse_all_videos(options);
                } else {
                    parse_webm(options);
                }
            }

            // Parse audio links
            if (options.is('option_audios_parse_links')) {
                parse_all_audios(options);
            }

            // Soundcloud
            if (options.is('option_embedding_soundcloud')) {
                // Executing Soundcloud player JS API
                messenger.js({
                    file: 'vendor/soundcloud/soundcloud.player.api.js',
                    runAt: 'document_end'
                }, function(response) {
                    console.debug('Soundcloud injection response: %O', response);
                    // If scripts are executed
                    if (response) {
                        // Processing links
                        $('.post .post-content a[href*="\\:\\/\\/soundcloud\\.com\\/"]').each(function(index) {
                            console.log($(this));

                            // @todo: вынести в отдельный шаблон
                            $player = $('<div class="pp-soundcloud">\
                                            <object height="81" width="100%" id="pp-soundcloud-' + index + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">\
                                              <param name="movie" value="//player.soundcloud.com/player.swf?url=' + encodeURIComponent($(this).prop('href'))
                                            + '&enable_api=true&object_id=pp-soundcloud-' + index + '">\
                                              <param name="allowscriptaccess" value="always">\
                                              <embed allowscriptaccess="always" height="81" src="//player.soundcloud.com/player.swf?url='
                                            + encodeURIComponent($(this).prop('href')) + '&enable_api=true&object_id=pp-soundcloud-' + index
                                            + '" type="application/x-shockwave-flash" width="100%" name="pp-soundcloud-' + index + '"></embed>\
                                            </object>\
                                        </div>');

                            // Replace or prepend
                            if (options.is('option_embedding_soundcloud_orig_link')) {
                                // Before
                                $(this).before($player);
                            } else {
                                // Replace
                                $(this).replaceWith($player);
                            }
                        });
                    }
                });
            }

            // Parse pleer.com links and create audio instead
            if (options.is('option_embedding_pleercom')) {
                parse_pleercom_links(options);
            }

            // Parse coub.com links and create iframe instead
            if (options.is('option_embedding_coubcom')) {
                parse_coub_links(options);
            }
        }

        // Fancybox
        if (options.is('option_fancybox')) {
            // Injecting Fancybox to the page
            // CSS
            // @todo message response callback processing
            messenger.css([
                'vendor/fancybox/source/jquery.fancybox.css',
                'css/fancybox/style.css'
            ]);

            // JS
            messenger.js([
                {
                    file: 'vendor/fancybox/source/jquery.fancybox.pack.js',
                    runAt: 'document_end'
                },
                {
                    // @todo Move to the option_fancybox_videos section
                    file: 'vendor/fancybox/source/helpers/jquery.fancybox-media.js',
                    runAt: 'document_end'
                }
            ], function(response) {
                // If all JS are executed

                console.debug('Fancybox injection response: %O', response);
                if (response) {
                    console.log('Fancybox executed. Processing...');

                    if (options.is('option_fancybox_bind_images_to_one_flow')) {
                        // Linking images in posts to the galleries
                        $('.post-content .text').each(function() {
                            $(this).find('a.postimg:not(.youtube)').attr('data-fancybox-group', 'one_flow_gallery');
                        });
                    } else {
                        $('.post-content .text').each(function(idxPost) {
                            $(this).find('a.postimg:not(.youtube)').attr('data-fancybox-group', 'post' + idxPost);
                        });
                    }

                    // Images
                    if (options.is('option_fancybox_images')) {
                        // Init fancybox
                        $('.postimg:not(.youtube)').fancybox({
                            type: 'image'
                        });
                    }

                    // Правим хинты у фансибокса
                    if (options.is('option_fancybox_smart_hints')) {
                        fancybox_set_smart_hints();
                    } else {
                        $('.post .postimg').attr('data-fancybox-title', ' ');
                    }

                    // Videos
                    if (options.is('option_fancybox_videos')) {
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
                    if (options.is('option_fancybox_posts')) {
                        // Excluding some sort of piece-of-shit makeup
                        $('.post-id a').not('#comments .post-id a, #top-post .post-id a').attr('data-fancybox-type', 'iframe').fancybox({
                            maxWidth: 780
                        });
                    }
                }
            });
        }

        // NSFW Filtering
        if (options.is('option_nsfw')) {
            $('.post-tag-nsfw,.post-tag-сиськи').find('a.postimg:not(.youtube)').attr('data-fancybox-group', 'hidden-images');

            if (options.is('option_nsfw_hide_posts')) {
                if ($('#comments').length == 0) {
                    console.log('Hide NSFW posts in feed, %i hidden', $('.post').length);
                    $('.post').addClass('hide-nsfw-posts');
                }
            }

            // Blurred posts
            if (options.is('option_nsfw_blur_posts_entire')) {
                console.log('Bluring NSFW posts');
                $('.post').addClass('blur-nsfw-entire');
            } else if (options.is('option_nsfw_blur_posts_images')) {
                console.log('Bluring images in NSFW posts');
                $('.post').addClass('blur-nsfw-images');
            }

            // Blurred comments
            if ($('.post').hasClass('post-tag-nsfw') || $('.post').hasClass('post-tag-сиськи')) {
                if (options.is('option_nsfw_blur_comments_entire')) {
                    console.log('Bluring comments');
                    $('#comments').addClass('blur-nsfw-entire');
                } else if (options.is('option_nsfw_blur_comments_images')) {
                    // @hint Никита Ветров официально складывает с себя все претензии, если у кого-то от этого говна упадёт драйвер видео-карты
                    console.log('Bluring images in comments');
                    $('#comments').addClass('blur-nsfw-images');
                }
            }
        }

        // Hotkeys
        // Send by CTRL+Enter
        if (options.is('option_ctrl_enter')) {
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
        if (options.is('option_fluid_layout')) {
            $('#main, #header, #subheader, #footer').css({
                'width': '95%',
                'max-width': '95%'
            });
            // TODO: fix #main #left-menu #top-link position
        }
        // Image resizing
        if (options.is('option_images_load_original')) {
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
        if (options.is('option_visual_editor_post')) {
            // Add classes
            $('#new-post-form #text-input, .post-content #text-input').addClass('markitup').css('height', '20em');

            // CSS
            // @todo message response callback processing
            messenger.css([
                'vendor/markitup/markitup/skins/markitup/style.css',
                'css/markitup/skins/markitup/style.css',
                'css/markitup/sets/markdown/style.css'
            ]);

            // JS
            messenger.js([
                {
                    file: 'vendor/markitup/markitup/jquery.markitup.js',
                    runAt: 'document_end'
                },
                {
                    file: 'js/markitup/sets/markdown/set.js',
                    runAt: 'document_end'
                }
            ], function(response) {
                console.debug('MarkItUp injection response: %O', response);
                // If scripts are executed
                if (response) {
                    // Init MarkItUp
                    $('.markitup').markItUp(mySettings);

                    // Send by CTRL+Enter
                    if (options.is('option_ctrl_enter')) {
                        // New post
                        $('#new-post-form #text-input, .post-content #text-input').on('keydown.point_plus', function(e) {
                            if (e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13)) {
                                e.preventDefault();
                                $(this).parents('#new-post-form,#post-edit-form').submit();
                            }
                        });
                    }
                }
            });
        }
        // Google search
        if (options.is('option_search_with_google')) {
            $('#search-form input[type="text"]').attr('placeholder', 'Google').keydown(function(e) {
                if (e.keyCode == 10 || e.keyCode == 13) {
                    e.preventDefault();
                    document.location.href = '//www.google.ru/search?q=site%3Apoint.im+' + $(this).val();
                }
            });
        }
        // WebSocket
        if (options.is('option_ws')) {
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
                    if (evt.data === 'ping') {
                        console.info('ws-ping');
                    } else {
                        var wsMessage = JSON.parse(evt.data);

                        if (wsMessage.hasOwnProperty('a') && wsMessage.a !== '') {
                            console.log(wsMessage);
                            
                            switch (wsMessage.a) {
                                // Recommendation comment
                                case 'ok':
                                   // Do not break here. Using next case for this message
                                
                                // Comments
                                case 'comment':
                                    if (wsMessage.a === 'comment') {
                                        console.groupCollapsed('WS comment #%s/%s', wsMessage.post_id, wsMessage.comment_id);
                                    } else if (wsMessage.a === 'ok') {
                                        console.groupCollapsed('WS comment rec #%s/%s', wsMessage.post_id, wsMessage.comment_id);
                                    }

                                    // Check option
                                    if ( ! options.is('option_ws_comments')) {
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
                                        console.log('The comment is not for this post');
                                        console.groupEnd();
                                        break;
                                    }
                                    
                                    // Generating comment from websocket message
                                    create_comment_elements({
                                        id: (wsMessage.a === 'ok') ? wsMessage.rcid : wsMessage.comment_id,
                                        toId: wsMessage.to_comment_id,
                                        postId: wsMessage.post_id,
                                        author: wsMessage.author,
                                        text: wsMessage.text,
                                        fadeOut: options.is('option_ws_comments_color_fadeout'),
                                        isRec: (wsMessage.a === 'ok') ? true : false
                                    }, function($comment) {
                                        // It's time to DOM
                                        console.info('Inserting comment');
                                        
                                        // Search for parent comment
                                        $parentComment = (wsMessage.to_comment_id) ? ($('.post[data-comment-id="' + wsMessage.to_comment_id + '"]')) : [];
                                        console.log('Parent comment: %O', $parentComment || null);
                                        
                                        // If list mode or not addressed to other comment
                                        if ($('#comments #tree-switch a').eq(0).hasClass('active') || (wsMessage.to_comment_id === null) || (!$parentComment.length)) {
                                            // Adding to the end of the list
                                            $('.content-wrap #comments #post-reply').before($comment);
                                        } else {
                                            // Check for children
                                            $parentCommentChildren = $parentComment.next('.comments');
                                            // If child comment already exist
                                            if ($parentCommentChildren.length > 0) {
                                                console.log('Child comments found. Appending...');
                                                $parentCommentChildren.append($comment);
                                            } else {
                                                console.log('No child comments found. Creating...');
                                                $parentComment.after($('<div>').addClass('comments').append($comment));
                                            }
                                        }

                                        // Desktop notifications
                                        if (options.is('option_ws_comments_notifications')) {
                                            console.log('Showing desktop notification');
                                            messenger.sendMessage({
                                                type: 'showNotification',
                                                notificationId: 'comment_' + wsMessage.post_id + '#' + wsMessage.comment_id,
                                                avatarUrl: getProtocol() + '//point.im/avatar/' + wsMessage.author + '/80',
                                                title: '@' + wsMessage.author + ' #' + wsMessage.post_id + '/' + wsMessage.comment_id,
                                                text: wsMessage.text
                                            }, function(response) {});
                                        }

                                        console.groupEnd();
                                    });


                                    break;

                                // Posts
                                case 'post':
                                    console.groupCollapsed('WS post #%s', wsMessage.post_id);
                                    
                                    if (options.is('option_ws_posts')) {
                                        if (options.is('option_ws_posts_notifications')) {
                                            console.log('Showing desktop notification');
                                            chrome.runtime.sendMessage({
                                                type: 'showNotification',
                                                notificationId: 'post_' + wsMessage.post_id,
                                                avatarUrl: getProtocol() + '//point.im/avatar/' + wsMessage.author + '/80',
                                                title: 'Post by @' + wsMessage.author + ' #' + wsMessage.post_id,
                                                text: wsMessage.text
                                            }, function(response) {});
                                        }
                                    }

                                    console.groupEnd();
                                    break;
                                    
                                // Recommendation
                                case 'rec':
                                    console.groupCollapsed('WS recommendation');

                                    console.groupEnd();
                                    break;

                                default:
                                    console.groupCollapsed('WS other');

                                    console.groupEnd();
                                    break;

                            }
                        }


                    }
                } catch (e) {
                    console.log('WebSocket exception:');
                    console.log(e);
                    console.log(evt.data);
                }
                ;
            };
        }
        // Font size
        if ((options.is('option_enlarge_font')) && (options.get('option_enlarge_font_size'))) {
            $('body').css('font-size', (options.get('option_enlarge_font_size') / 100) + 'em');
        }
        // @ before username
        if (options.is('option_at_before_username')) {
            // @todo message response callback processing
            messenger.css('css/modules/at_before_username.css');
        }
        
        if (options.is('option_ajax')) {
            // Comments
            if (options.is('option_ajax_comments')) {
                // Removing old bindings
                // Dirty hack for page context
                $('#comments').replaceWith($('#comments').clone());

                // Binding new
                $('#comments').on('keypress.pp', '.reply-form textarea', function (evt) {
                    if ((evt.keyCode === 10 || evt.keyCode === 13) && (evt.ctrlKey || evt.metaKey)) {
                        evt.stopPropagation();
                        evt.preventDefault();

                        var $post = $(this).parents('.post').first();
                        var csRf = $(this).siblings('input[name="csrf_token"]').val();

                        $.ajax({
                            type: 'POST',
                            url: '/api/post/' + $post.data('id'),
                            data: {
                                text: $(this).val(),
                                comment_id: $post.data('comment-id')
                            },
                            error: function(req, status, error) {
                                console.error('AJAX request error while sending the comment: %s', error);
                                console.log('Status: %s', status);

                                alert(chrome.i18n.getMessage('msg_comment_send_failed') + '\n' + error);
                            }, 
                            /**
                             * @param {object} data Response data
                             * @param {number} data.comment_id ID of the created comment
                             * @param {string} data.id ID of the post
                             * @param {string} textStatus Text of request status
                             */
                            success: function(data, textStatus) {
                                console.log('data %O', data);
                                console.log('status %O', textStatus);

                                if (textStatus === 'success') {
                                    // Hiding form
                                    $('#reply-' + $post.data('id') + '_' + $post.data('comment-id')).prop('checked', false);

                                    // Creating the comment HTML
                                    create_comment_elements({
                                        id: data.comment_id,
                                        toId: $post.data('comment-id') || null,
                                        postId: $post.data('id'),
                                        author: $('#name h1').text(),
                                        text: $(this).val(),
                                        fadeOut: true
                                    }, function($comment) {
                                        // If list mode or not addressed to other comment
                                        if ($('#comments #tree-switch a').eq(0).hasClass('active') || ($post.data('comment-id') === undefined)) {
                                            // Adding to the end of the list
                                            $('.content-wrap #comments #post-reply').before($comment);
                                        } else {
                                            // Check for children
                                            $parentCommentChildren = $post.next('.comments');

                                            // @fixme Find a bug with lost indentation of new comment
                                            // If child comment already exist
                                            if ($parentCommentChildren.length) {
                                                console.log('Child comments found. Appending...');
                                                $parentCommentChildren.append($comment);
                                            } else {
                                                console.log('No child comments found. Creating...');
                                                $post.after($('<div>').addClass('comments').append($comment));
                                            }
                                        }
                                    });

                                    // Cleaning textarea
                                    $(this).val('');

                                }
                            }.bind(this),
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('X-CSRF', csRf);
                            }
                        });
                    }
                });
            }
        }

        // Hightlight post with new comments
        if (options.is('option_other_hightlight_post_comments')) {
            mark_unread_post();
        }
        // Show recommendation count and unique commentators count
        if (options.is('option_other_show_recommendation_count')) {
            set_posts_count_label();
        }
        // `Space` key scroll handler
        if (options.is('option_other_scroll_space_key')){
            set_space_key_skip_handler();
        }

        // Система комментариев у пользователей
        if (options.is('option_other_comments_user_system')) {
            hints_init_user_system();
        }

        // Nesting level indicator
        if (options.is('option_other_comments_nesting_level')) {
            $('#comments').addClass('nesting_level');
        }

        // Обновляем кол-во постов и непрочитанных комментариев
        if (options.is('option_other_comments_count_refresh')) {
            set_comments_refresh_tick(options);
        }

        // Твиты из Твиттера
        if (options.is('option_embedding_twitter_tweets')) {
            twitter_tweet_embedding_init();
        }
        
        // Post drafts
        if (options.is('option_other_post_draft_save')) {
            draft_set_save_handler();
            draft_restore();
        }

        $('#point-plus-debug').fadeOut(1000);
    });
}

function getProtocol() {
    return ((location.protocol == 'http:') ? 'http:' : 'https:');
}

// Monts for Date.getMonth()
var months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Creating new comment elements for dynamic injection into the DOM
 * 
 * @param {object} commentData Comment data
 * @param {string|number} commentData.id ID of the created comment
 * @param {string|number} commentData.toId ID of the comment replying to
 * @param {string} commentData.postId ID of the post
 * @param {string} commentData.author Author of the comment
 * @param {string} commentData.text Text of the comment
 * @param {boolean} commentData.fadeOut Is fadeout enabled or not
 * @param {boolean|null} commentData.isRec Is comment also a recommendation
 * @param {function} onCommentCreated Callback which is called when comment is ready
 * 
 */
function create_comment_elements(commentData, onCommentCreated) {
    var $anchor = $('<a>').attr('name', commentData.id);

    // Initializing comment element
    var $commentTemplate = $('<div>').attr({
        'class': 'post',
        'data-id': commentData.postId,
        'data-comment-id': commentData.id,
        'data-to-comment-id': commentData.id || ''
    });
    
    // If comment is also a recommendation
    if (commentData.isRec || false) {
        $commentTemplate.addClass('recommendation');
    }

    // Loading HTML template
    $commentTemplate.load(chrome.extension.getURL('includes/comment.html'), function() {
        // Load complete
        console.info('comment.html loaded');

        // Date and time of comment
        var date = new Date();

        // Data for template
        var userLink = '//' + commentData.author + '.point.im/';
        var csRfToken = $('.reply-form input[name="csrf_token"]').first().val();

        // Filling template
        // Date and time
        $commentTemplate.find('.info .created')
            .append($('<span>').html((date.getDate().toString()) + '&nbsp;' + months[date.getMonth()]))
            // Crutchy fix
            .append($('<br>'))
            ///Crutchy fix
            .append($('<span>').html(date.getHours() + ':' + ((date.getMinutes().toString().length < 2) ? ('0' + date.getMinutes().toString()) : (date.getMinutes().toString()))));
        // Comment text
        $commentTemplate.find('.text').append($('<p>').text(commentData.text));
        // Author
        $commentTemplate.find('.author a.user').attr('href', userLink).text(commentData.author);
        // Avatar and link
        $commentTemplate.find('.info a').attr('href', userLink).children('img.avatar').attr('src', '//point.im/avatar/' + commentData.author + '/24');
        // Post and comment ID's link
        $commentTemplate.find('.clearfix .post-id a').attr('href', '//point.im/' + commentData.postId + '#' + commentData.id).text('#' + commentData.postId + '/' + commentData.id)
            // Adding answer label
            // @todo i18n
            .after((commentData.toId != null) ? (' в ответ на <a href="#' + commentData.toId + '">/' + commentData.toId + '</a>') : '');
        // Setting action labels and other attributes
        $commentTemplate.find('.action-labels .reply-label').attr('for', 'reply-' + commentData.postId + '_' + commentData.id);
        $commentTemplate.find('.action-labels .more-label').attr('for', 'action-' + commentData.postId + '_' + commentData.id);
        $commentTemplate.find('.post-content input[name="action-radio"]').attr('id', 'action-' + commentData.postId + '_' + commentData.id);
        // Bookmark link
        $commentTemplate.find('.action-buttons a.bookmark').attr('href', $('#top-post .info a').attr('href') + commentData.postId + '/b?comment_id=' + commentData.id + '&csrf_token=' + csRfToken);
        // Reply form
        $commentTemplate.find('.post-content input.reply-radio').attr('id', 'reply-' + commentData.postId + '_' + commentData.id);
        $commentTemplate.find('.post-content form.reply-form').attr('action', '/' + commentData.postId);
        $commentTemplate.find('.post-content form.reply-form textarea[name="text"]').html('@' + commentData.author + ', ');
        $commentTemplate.find('.post-content form.reply-form input[name="comment_id"]').val(commentData.id);
        $commentTemplate.find('.post-content form.reply-form input[name="csrf_token"]').val(csRfToken);
        ///Filling template
        
        // Fading out highlight if needed
        if (commentData.fadeOut) {
            console.log('Fading out the highlight');
            $commentTemplate.children('.pp-highlight').delay(250).fadeOut(20000);
        }
        
        // @todo add indentation indicator support
        
        // Hiding
        $commentTemplate.hide().delay(250).fadeIn(2000);
        
        // Triggering callback
        onCommentCreated($anchor.add($commentTemplate));
    });
}

// Картинки с бурятников
var booru_picture_count = 0;
function load_all_booru_images() {
    $('.post-content a:not(.booru_pic)').each(function(num, obj) {

        var href = obj.href;
        var n = null;

        if (n = href.match(new RegExp('^https?://danbooru\\.donmai\\.us/posts/([0-9]+)', 'i'))) {
            var image = create_image('danbooru', n[1]);
            obj.parentElement.insertBefore(image, obj);
            booru_picture_count++;
        } else if (n = href.match(new RegExp('^https?\\://(www\\.)?gelbooru\\.com\\/index\\.php\\?page\\=post&s\\=view&id=([0-9]+)', 'i'))) {
            var image = create_image('gelbooru', n[2]);
            obj.parentElement.insertBefore(image, obj);
            booru_picture_count++;
        } else if (n = href.match(new RegExp('^https?\\://(www\\.)?safebooru\\.org\\/index\\.php\\?page\\=post&s\\=view&id=([0-9]+)', 'i'))) {
            var image = create_image('safebooru', n[2]);
            obj.parentElement.insertBefore(image, obj);
            booru_picture_count++;
        } else if (n = href.match(new RegExp('^https?\\://(www\\.)?([a-z0-9-]+\\.)?deviantart\\.com\\/art/[0-9a-z-]+?\\-([0-9]+)(\\?.+)?$', 'i'))) {
            var image = create_image('deviantart', n[3]);
            obj.parentElement.insertBefore(image, obj);
            booru_picture_count++;
        } else if (n = href.match(new RegExp('^https?\\://(www\\.)?e621\\.net\\/post\\/show\\/([0-9]+)\\/', 'i'))) {
            var image = create_image('e621', n[2]);
            obj.parentElement.insertBefore(image, obj);
            booru_picture_count++;
        } else if (n = href.match(new RegExp('^https?\\://derpiboo\\.ru\\/([0-9]+)', 'i'))) {
            var image = create_image('derpibooru', n[1]);
            obj.parentElement.insertBefore(image, obj);
            booru_picture_count++;
        } else if (n = href.match(new RegExp('^https?\\://([0-9a-z-]+)\\.tumblr\\.com\\/post\\/([0-9]+)', 'i'))) {
            var image = create_image('tumblr', n[2], {'username': n[1]});
            obj.parentElement.insertBefore(image, obj);
            booru_picture_count++;
            /*
             } else if (n = href.match(new RegExp('^https?\\://(www\\.)?konachan\\.net\\/post\\/show\\/([0-9]+)\\/', 'i'))) {
             var image = create_image('konachannet', n[2]);
             obj.parentElement.insertBefore(image, obj);
             booru_picture_count++;
             } else if (n = href.match(new RegExp('^https?\\://(www\\.)?konachan\\.com\\/post\\/show\\/([0-9]+)\\/', 'i'))) {
             var image=create_image('konachancom', n[2]);
             obj.parentElement.insertBefore(image, obj);
             booru_picture_count++;
             */
        } else if (n = href.match(new RegExp('^https?://(www\\.)?pixiv\\.net\\/member_illust\\.php\\?mode\\=medium\\&illust_id\\=([0-9]+)', 'i'))) {
            var image = create_image('pixiv', n[2]);
            obj.parentElement.insertBefore(image, obj);
            booru_picture_count++;
        } else if (n = href.match(new RegExp('^http\\:\\/\\/anime\\-pictures\\.net\\/pictures\\/view_post\\/([0-9]+)', 'i'))) {
            var image = create_image('animepicturesnet', n[1]);
            obj.parentElement.insertBefore(image, obj);
            booru_picture_count++;
        } else if (false) {


        }

    });

}

function create_image(domain, id, additional) {
    var a = document.createElement('a');
    a.href = 'https://api.kanaria.ru/point/get_booru_picture.php?domain=' + domain + '&id=' + id;
    if (typeof(additional) != 'undefined') {
        for (var index in additional) {
            a.href += '&add_' + encodeURIComponent(index) + '=' + encodeURIComponent(additional[index]);
        }
    }
    $(a).addClass('booru_pic').addClass('booru-' + domain + '-' + id).addClass('postimg').attr({
        'id': 'booru_pic_' + booru_picture_count,
        'title': domain + ' image #' + id,
        'target': '_blank'
    });

    var image = document.createElement('img');
    image.alt = a.title;
    image.src = a.href;
    a.appendChild(image);

    return a;
}

// Помечаем непрочитанные посты более видимо чем каким-то баджем
// Эта часть написана @RainbowSpike
function mark_unread_post() {
    var divs = $(".content-wrap > .post").css({'padding-left':'2px'}); // массив постов
    for (var i = 0; i < divs.length; i++) { // обыск постов
        var spans = $(divs[i]).find(".unread"); // поиск метки непрочитанных комментов
        if (spans.length > 0) { // если в посте есть непрочитанные комменты...
            $(divs[i]).css({//...залить пост зеленоватым и скруглить
                'background-color': '#EEFFEE',
                'border-radius': '10px'
            });
        }
    }

}

// Webm
function parse_webm(current_options) {
    $('.post-content a:not(.booru_pic)').each(function(num, obj) {

        var href = obj.href;
        var n = null;

        if (n = href.match(new RegExp('\\.webm(\\?.+)?$', 'i'))) {
            var player = document.createElement('video');
            // Там может быть не vp8+vorbis, но мы этого никак не узнаем
            $(player).html('<source src="' + href + '" type=\'video/webm; codecs="vp8, vorbis"\' />').attr('controls', 'controls').css({
                'display': 'block',
                'max-width': '95%'
            }).addClass('parsed-webm-link');

            obj.parentElement.insertBefore(player, obj);

            if (current_options.is('option_videos_parse_leave_links', false)) {
                $(obj).hide();
            }
        }
    });
}

// Видео
function parse_all_videos(current_options) {
    $('.post-content a:not(.booru_pic)').each(function(num, obj) {

        var href = obj.href;
        var n = null;

        if (n = href.match(new RegExp('\\.(webm|avi|mp4|mpg|mpeg)(\\?.+)?$', 'i'))) {
            var player = document.createElement('video');
            var mime = video_extension_to_mime(n[1]);
            $(player).html('<source src="' + href + '" type=\'' + mime + '\' />').attr('controls', 'controls').css({
                'display': 'block',
                'max-width': '95%'
            }).addClass('parsed-webm-link');

            obj.parentElement.insertBefore(player, obj);

            if (current_options.is('option_videos_parse_leave_links', false)) {
                $(obj).hide();
            }
        }
    });
}

function video_extension_to_mime(extension) {
    switch (extension) {
        case 'webm':return 'video/webm; codecs="vp8, vorbis';
        case 'avi' :return 'video/avi;';
        case 'mp4' :return 'video/mp4;';
        case 'mpg' :return 'video/mp4;';
        case 'mpeg':return 'video/mp4;';
    }
}

// Аудио
function parse_all_audios(current_options){
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('booru_pic')) {
            return;
        }

        var href = obj.href;
        var n = null;

        if (n = href.match(new RegExp('^https?:\\/\\/([a-z0-9.-]+)\\/[a-z0-9_\\/.%-]+\\.(mp3|ogg|wav)(\\?.+)?$', 'i'))) {
            var domain = n[1];
            // Проверяем откуда мы грузимся
            if (domain.match(new RegExp('\\.vk\\.me$', 'i'))){
                // Так то ж Контакт!
                if (typeof(n[3])=='undefined'){
                    return;
                }
                if (!n[3].match('extra\\=', 'i')){
                    return;
                }
            }

            var player = document.createElement('audio');
            var mime = audio_extension_to_mime(n[2]);
            $(player).html('<source src="' + href + '" type=\'' + mime + '\' />').attr('controls', 'controls').css({
                'display': 'block',
                'max-width': '350px'
            }).addClass('parsed-audio-link');

            obj.parentElement.insertBefore(player, obj);

            if (current_options.is('option_audios_parse_leave_links', false)) {
                $(obj).hide();
            }
        }
    });
}

function audio_extension_to_mime(extension) {
    switch (extension) {
        case 'mp3': return 'audio/mpeg';
        case 'ogg': return 'audio/ogg; codecs=vorbis';
        case 'wav': return 'audio/vnd.wave';
    }
}

/**
 * Показывает количество рекомендаций и комментаторов у постов
 */
function set_posts_count_label() {
    var posts = {};
    var ids;
    
    $('.content-wrap > .post').each(function(n, post) {
        var $post = $(post);
        var postId = $post.data('id');

        posts[postId] = $post;
    });

    ids = Object.keys(posts);

    $('.content-wrap > .post .post-id a .cn').addClass('changed_background');

    $.ajax('https://api.kanaria.ru/point/get_post_info.php?list=' + encodeURIComponent(ids.join(',')), {
        dataType: 'json',
        success: function(data) {
            ids.forEach(function(id) {
                var postInfo = data.list[id];

                if (postInfo) {
                    posts[id].find('.post-id').after(
                        '<div class="pp-post-counters">' +
                        '<span class="pp-unique-comments">' + postInfo.count_comment_unique + '</span> ' +
                        '<span class="pp-recommendation-count">' + postInfo.count_recommendation + '</span> ' +
                        '</div>'
                    )
                }
            });
        }
    });
}

function parse_pleercom_links(current_options) {
    $('.post-content a').each(function(num, link) {
        var $link = $(link);
        var href = link.href;
        var matches = href.match(new RegExp('^https?:\\/\\/pleer\\.com\\/tracks\\/([0-9a-z]+)', 'i'));

        if (matches) {
            trackHref = 'http://embed.pleer.com/normal/track?id=' + matches[1] + '&t=grey';

            $link.before('<object width="578" height="60"><param name="movie" value="' + trackHref + '"></param>' +
            '<embed src="' + trackHref + '" type="application/x-shockwave-flash" width="578" height="60">' +
            '</embed></object>');

            if ( ! current_options.is('option_embedding_pleercom_orig_link')) {
                $link.remove();
            }
        }
    });
}

// Проставляем теги у постов
// @hint В данный момент эта фича используются для NSFW, потом выборку по тегам можно будет использовать много где
function create_tag_system() {
    $('.content-wrap > .post').each(function() {
        var tags = $(this).find('div.tags a.tag');
        for (var i = 0; i < tags.length; i++) {
            var tag_name = $(tags[i]).html().toLowerCase();
            $(this).addClass('post-tag-' + tag_name);
        }
    });
}

// Скролл по пробелу
function set_space_key_skip_handler() {
    if ($('#comments').length > 0) {
        return;
    }

    // @todo Свериться с Best-practice биндинга функций. Мб там on или bind
    $(document.body).keydown(function(e) {
        // @todo Я хотел по отпусканию кнопки, но там уже скролл срабатывает
        // проверяем фокус
        if ($(':focus').length > 0) {
            return;
        }

        var k = event.keyCode;
        if (k == 32) {
            space_key_event();
            return false;
        }
    });
}

function space_key_event() {
    var scroll_current = Math.floor($('body').scrollTop());

    var posts = $('.content-wrap > .post');
    for (var i = 0; i < posts.length; i++) {
        var this_top_px = Math.floor(posts.eq(i).offset().top);
        if (this_top_px > scroll_current) {
            $('body').animate({
                'scrollTop': this_top_px
            }, 200);
            return;
        }
    }
}

/**
 * Last draft text
 * @type {string}
 */
var draft_last_text = '';

/**
 * Last draft tags
 * @type {string}
 */
var draft_last_tags = '';

/**
 * Is extension now saving draft
 * @type {boolean}
 */
var draft_save_busy = false;

/**
 * Last draft saving time
 * @type {Date|null}
 */
var draft_save_last_time = null;

/**
 * Is there any setTimeout'ed handlers
 * @type {boolean}
 */
var draft_waiting = false;

/**
 * Restore draft from localStorage
 */
function draft_restore() {
    chrome.storage.local.get(['point_draft_text', 'point_draft_tags'], function(items) {
        if ($('#new-post-form #text-input').val() === '') {
            $('#new-post-form #text-input').val(items.point_draft_text);
            draft_last_text = items.point_draft_text;
        }
        if ($('#new-post-form #tags-input').val() === '') {
            $('#new-post-form #tags-input').val(items.point_draft_tags);
            draft_last_tags = items.point_draft_tags;
        }
    });
}

/**
 * Set draft save handler
 */
function draft_set_save_handler() {
    $('#text-input, #tags-input').on('keyup', function() {
        draft_save_check();
        // For last keyup
        if (!draft_waiting) {
            setTimeout(draft_save_check, 3000);
            draft_waiting = true;
        }
    });
    // Adding span indicator
    $('#new-post-wrap .footnote').append($('<span id="draft-save-status">'));
}

/**
 * Check if we can save the draft now
 */
function draft_save_check() {
    if (draft_save_busy) {
        return;
    }
    
    if (draft_save_last_time !== null) {
        if ((new Date()).getTime() < draft_save_last_time.getTime() + 3000) {
            return;
        }
    }

    var current_text = $('#new-post-form #text-input').val();
    var current_tags = $('#new-post-form #tags-input').val();
    
    if ((draft_last_text === current_text) && (draft_last_tags === current_tags)) {
        draft_save_busy = false;
        return;
    }
    
    draft_save_busy = true;
    draft_save_last_time = new Date();
    
    // @todo i18n
    $('#draft-save-status').text(chrome.i18n.getMessage('msg_saving_post_draft')).show();

    // Saving current data
    draft_last_text = current_text;
    draft_last_tags = current_tags;
    
    // Save it using the Chrome extension storage API.
    chrome.storage.local.set({
        point_draft_text: draft_last_text,
        point_draft_tags: draft_last_tags
    }, function() {
        // Notify that we saved.
        draft_save_busy = false;
        draft_waiting = false;
        
        setTimeout(function() {
            $('#draft-save-status').fadeOut(1000);
        }, 1000);
    });
}


// Парсим ссылки на coub
function parse_coub_links(current_options) {
    $('.post-content a').each(function(num, obj) {
        var href = obj.href;
        var n = null;

        if (n = href.match(new RegExp('^https?:\\/\\/coub\\.com\\/view\\/([0-9a-z]+)', 'i'))) {
            var player = document.createElement('iframe');
            var parent_width = $(obj.parentElement).width();
            $(player).attr({
                'src': 'https://coub.com/embed/' + n[1] + '?muted=false&autostart=false&originalSize=false&hideTopBar=false&startWithHD=true',
                'allowfullscreen': 'true'
            }).css({
                'max-width': '640px',
                'border': 'none',
                'width': Math.floor(parent_width * 0.9),
                'height': Math.ceil(parent_width * 0.9 * 480 / 640)
            }).addClass('embeded_video').addClass('embeded_video_' + n[1]);

            obj.parentElement.insertBefore(player, obj);

            if (current_options.is('option_embedding_coubcom_orig_link', false)) {
                $(obj).hide();
            }
        }
    });
}

// Правим хинт в FancyBox
function fancybox_set_smart_hints(){
    $('.post').each(function() {
        var all_post_images = $(this).find('.postimg');
        if (all_post_images.length == 0) {
            return;
        }

        var tags = $(this).find('div.tags a.tag');
        var default_hint_text = '';// Дефолтный текст для хинта в FancyBox, если не нашлость другого
        // Сначала теги
        for (var i = 0; i < tags.length; i++) {
            var tag_name = $(tags[i]).html().toLowerCase();
            default_hint_text += ' ' + tag_name;
        }

        // Потом текст
        var textcontent = $(this).find('.text-content');
        if (textcontent.length > 0) {
            textcontent = textcontent[0];
            for (var i = 0; i < textcontent.childNodes.length; i++) {
                var current_child_node = textcontent.childNodes[i];
                if ((current_child_node.nodeName !== 'P') && (current_child_node.nodeName !== '#text')) {
                    continue;
                }
                var a = $(current_child_node).find('a.postimg');
                if (a.length > 0) {
                    continue;
                }

                var tmp_str = current_child_node.textContent.replace(/(\n(\r)?)/g, ' ');
                tmp_str = tmp_str.replace("\t", " ");
                default_hint_text += ' ' + tmp_str;
            }
        }

        // Режем текст
        default_hint_text = default_hint_text.replace(new RegExp(' {2,}'), ' ').replace(new RegExp(' +$'), '').substr(1);
        if (default_hint_text.length > 140) {
            default_hint_text = default_hint_text.substr(0, 140 - 3) + '...';
        }

        // Выставляем дефолтный
        all_post_images.attr('data-fancybox-title', default_hint_text);

        // А теперь перебираем по одному все картинки
        var paragraphs = $(this).find('.post-content > .text > p, .post-content > .text, .text-content > p, .text-content');

        paragraphs.each(function() {
            var nodes = this.childNodes;
            for (var i = 0; i < nodes.length - 2; i++) {
                if ($(nodes[i]).hasClass('booru_pic')) {
                    if (nodes[i + 2].nodeName == '#text') {
                        $(nodes[i]).attr('data-fancybox-title', nodes[i + 2].textContent);
                        i += 2;
                        continue;
                    }
                }
            }
        });
    });
}

/**
 * Система заметок о пользователях
 * https://bitbucket.org/skobkin/chrome_point_plus/issue/50/---------------------------
 */
// Инициализируем
function hints_init_user_system() {
    chrome.storage.sync.get('point_user_hints', function(items) {
        if (typeof(items.point_user_hints) == 'undefined') {
            // Первый запуск системы
            chrome.storage.sync.set({'point_user_hints': {}}, function() {
                hints_draw_main_user_hint({});
                hints_set_titles_on_users({});
            });
        } else {
            // Второй+ запуск системы
            hints_draw_main_user_hint(items.point_user_hints);
            hints_set_titles_on_users(items.point_user_hints);
        }
    });
}

// Рисуем хинт и кнопку под текущим пользователем
function hints_draw_main_user_hint(items) {
    var current_user_name = $('.aside .info h1').text().toLowerCase();
    if (current_user_name.length == 0) {
        return;
    }

    var current_user_hint_block = document.createElement('div');
    $('.aside .aside-content #counters')[0].parentElement.
        insertBefore(current_user_hint_block, $('.aside .aside-content #counters')[0]);
    $(current_user_hint_block).addClass('current-user-hint');

    // Рисуем кнопки управления
    var buttons_block = document.createElement('div');
    $(buttons_block).addClass('buttons').
        html('<a class="edit" href="javascript:" title="Редактировать"></a>');
    current_user_hint_block.appendChild(buttons_block);
    $(buttons_block).find('.edit').on('click', function() {
        chrome.storage.sync.get('point_user_hints', function(items) {
            var current_text = '';
            if (typeof(items.point_user_hints[current_user_name]) !== 'undefined') {
                current_text = items.point_user_hints[current_user_name];
            }

            $('.current-user-hint .change_hint_block').slideDown(500);
            $('.current-user-hint .change_hint_block textarea').val(current_text);
        });
    });

    // Рисуем текст
    var current_text = '';
    if (typeof(items[current_user_name]) !== 'undefined') {
        current_text = items[current_user_name];
    }
    var text_block = document.createElement('div');
    $(text_block).addClass('text');
    safe_saned_text(current_text, $(text_block));
    current_user_hint_block.appendChild(text_block);

    // Рисуем невидимый блок для управления
    var change_hint_block = document.createElement('div');
    $(change_hint_block).addClass('change_hint_block').hide().
        html('<textarea></textarea><input class="button_save" type="submit" value="Сохранить">' +
        '<a href="javascript:" class="button_cancel">Отмена</a>');
    $(change_hint_block).find('.button_save').on('click', function() {
        $('.current-user-hint .change_hint_block').slideUp(500);
        var new_text = $('.current-user-hint .change_hint_block textarea').val();
        safe_saned_text(new_text, $('.current-user-hint > .text').hide().fadeIn(750));
        hints_save_new_hint(current_user_name, new_text);
    });
    $(change_hint_block).find('.button_cancel').on('click', function() {
        $('.current-user-hint .change_hint_block').slideUp(500);
    });
    current_user_hint_block.appendChild(change_hint_block);
}

// Nokita Kaze снимает с себя все претензии по этому коду, обращайтесь к фаундеру проекта
function safe_saned_text(text, object) {
    var n = text.split(/\r?\n/);
    object.text('');
    for (var i = 0; i < n.length; i++) {
        var d = document.createElement('p');
        $(d).text(n[i]);
        object[0].appendChild(d);
    }
}

// Рисуем title'ы на всех доступных пользователях, точнее на их аватарках
function hints_set_titles_on_users(items) {
    $('a').each(function() {
        var href = $(this).attr('href');
        if (typeof(href) == 'undefined') {
            return;
        }

        var n = href.match(new RegExp('^https?\\://([0-9a-z-]+)\\.point\\.im/$', 'i'));
        if (n == null) {
            return;
        }
        var this_user_name = n[1].toLowerCase();
        if (typeof(items[this_user_name]) == 'undefined') {
            return;
        }

        $(this).attr({
            'title': items[this_user_name]
        });
    });
}

// Сохраняем новый хинт
function hints_save_new_hint(username, new_hint) {
    chrome.storage.sync.get('point_user_hints', function(items) {
        items.point_user_hints[username] = new_hint;
        chrome.storage.sync.set({'point_user_hints': items.point_user_hints});
    });
}

/**
 * Обновляем кол-во комментариев и непрочитанных новых постов в ленте
 */
function set_comments_refresh_tick(current_options) {
    // Проверяем, чтобы были баджи
    if ($('#main #left-menu #menu-recent .unread').length == 0) {
        $('#main #left-menu #menu-recent').append('<span class="unread" style="display: none;">0</span>');
    }
    if ($('#main #left-menu #menu-comments .unread').length == 0) {
        $('#main #left-menu #menu-comments').append('<span class="unread" style="display: none;">0</span>');
    }

    // Ставим тик
    setInterval(function() {
        comments_count_refresh_tick(current_options);
    }, 60000);

    // Ставим слежение за позицией мыши
    if (current_options.is('option_other_comments_count_refresh_title')) {
        $(document).
            on('mouseenter', function() {
                set_comments_refresh_clear_title_marks();
            }).on('mouseleave', function() {
                window_focused = false;
            });

        $(window).
            on('focus', function() {
                set_comments_refresh_clear_title_marks();
            }).on('blur', function() {
                window_focused = false;
            });
    }
}

var window_focused = true;

// Очищаем [0; 0]
function set_comments_refresh_clear_title_marks() {
    var new_title = document.title.replace(new RegExp('^\\[[0-9]+\\; [0-9]+\\] '), '');
    document.title = new_title;
    window_focused = true;
}

// Проверка обновления комментариев, обновляется по крону
function comments_count_refresh_tick(current_options) {
    $('#debug_iframe').remove();
    var iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    $(iframe).on('load', function() {
        var a = $(iframe.contentDocument.body).find('#main #left-menu #menu-recent .unread');
        var b = $(iframe.contentDocument.body).find('#main #left-menu #menu-comments .unread');
        var count_recent = (a.length == 0) ? 0 : parseInt(a.text());
        var count_comments = (b.length == 0) ? 0 : parseInt(b.text());

        console.log('Comments: %d, Recent: %d', count_comments, count_recent);
        if (count_recent > 0) {
            if (parseInt($('#main #left-menu #menu-recent .unread').text()) != count_recent) {
                $('#main #left-menu #menu-recent .unread').text(count_recent).show().css({
                    'background-color': '#f2ebee',
                    'color': '#7c3558'
                });
                setTimeout(function() {
                    $('#main #left-menu #menu-recent .unread').css({
                        'background-color': '',
                        'color': ''
                    });
                }, 15000);
            }
        } else {
            $('#main #left-menu #menu-recent .unread').text('0').hide();
        }

        if (count_comments > 0) {
            if (parseInt($('#main #left-menu #menu-comments .unread').text()) != count_comments) {
                $('#main #left-menu #menu-comments .unread').text(count_comments).show().css({
                    'background-color': '#f2ebee',
                    'color': '#7c3558'
                });
                setTimeout(function() {
                    $('#main #left-menu #menu-comments .unread').css({
                        'background-color': '',
                        'color': ''
                    });
                }, 15000);
            }
        } else {
            $('#main #left-menu #menu-comments .unread').text('0').hide();
        }

        if ((current_options.is('option_other_comments_count_refresh_title')) &&
            (!window_focused)) {
            var new_title = document.title.replace(new RegExp('^\\[[0-9]+\\; [0-9]+\\] '), '');
            if ((count_recent > 0) || (count_comments > 0)) {
                new_title = '[' + count_recent + '; ' + count_comments + '] ' + new_title;
            }
            document.title = new_title;
        }

        $('#debug_iframe').remove();
    }).attr({
        // Из-за Same Origin'а я дёргаю несуществующую страницу на том же домене, чтобы получить баджи и,
        // в то же время не прочитать новые сообщения в ленте, которые могли появиться, если их написал
        // этот пользователь
        'src': '//' + document.domain + '/?tag=' + Math.random(),
        'id': 'debug_iframe'
    }).css({
        'width': '600px',
        'height': '300px'
    }).hide();
}

/**
 * Встраиваем твиты из Твиттера
 */
function twitter_tweet_embedding_init() {
    // Чёрная магия. Выбираемся из манямирка, прихватив с собой пару сраных функций
    // https://developer.chrome.com/extensions/content_scripts Isolated World
    var e = document.createElement("script");
    e.appendChild(document.createTextNode(twitter_tweet_embedding_wait_for_ready_injected.toString() +
    twitter_tweet_embedding_parse_links.toString() + 'twitter_tweet_embedding_wait_for_ready_injected();'));
    document.head.appendChild(e);

    // Встраиваем скрипт так, как описано в best twitter practice https://dev.twitter.com/web/javascript/loading
    window.twttr = (function(d, s, id) {
        var t, js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "https://platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js, fjs);
        return window.twttr || (t = {
                _e: [], ready: function(f) {
                    t._e.push(f);
                }
            });
    }(document, "script", "twitter-wjs"));
}

/**
 * Проверяем загрузились ли мы. Эта функция запускается из page scope
 */
function twitter_tweet_embedding_wait_for_ready_injected() {
    if (typeof(window.twttr) == 'undefined') {
        setTimeout(twitter_tweet_embedding_wait_for_ready_injected, 100);
        return;
    }
    if (typeof(window.twttr.widgets) == 'undefined') {
        setTimeout(twitter_tweet_embedding_wait_for_ready_injected, 100);
        return;
    }
    twitter_tweet_embedding_parse_links();
}

/**
 * Парсим все ссылки. Эта функция запускается из page scope
 */
function twitter_tweet_embedding_parse_links() {
    // Обрабатываем все твиты
    var twitter_tweet_count = 0;
    $('.post-content a:not(.booru_pic)').each(function(num, obj) {
        var href = obj.href;
        var n;

        if (n = href.match(new RegExp('^https?://(www\\.)?twitter\\.com/[^/]+/status/([0-9]+)', 'i'))) {
            var tweet = document.createElement('div');
            $(tweet).attr({
                'id': 'tweet-' + twitter_tweet_count,
                'data-tweet-id': n[2]
            }).addClass('twitter-tweet-embedded');
            obj.parentElement.insertBefore(tweet, obj);

            window.twttr.widgets.createTweet(
                n[2],
                tweet,
                {
                    'lang': 'ru'
                }
            );
            twitter_tweet_count++;
        }
    });
}

/**
 * Instagram posts
 * 
 * @param {OptionsManager} options OptionsManager with current options
 */
function instagram_posts_embedding_init(options) {
    var regex = new RegExp('^https?://(www\\.)?instagram\\.com/p/([\\w-]+)/?', 'i');
    
    $('.post-content a:not(.booru_pic)').each(function(num, link) {
        var $link = $(link);
        var href = link.href;
        var matches = href.match(regex);

        if (matches) {
            $.ajax('https://api.instagram.com/oembed?url=' + 'http://instagr.am/p/' + matches[2] + '/', {
                dataType: 'json',
                success: function(response) {
                    var $imgLink = $('<a><img src="' + response.thumbnail_url +
                        '" + alt="' + response.title + '"></a>');

                    $imgLink
                        .addClass('postimg instagram-post-embedded')
                        .attr({
                            id: 'instagram-' + num,
                            href: 'http://instagram.com/p/' + matches[2] + '/media/?size=l',
                            title: response.title,
                            traget: '_blank',
                            'data-fancybox-group': (options.is('option_fancybox_bind_images_to_one_flow')) ? 'one_flow_gallery' : '',
                            'data-fancybox-title': (options.is('option_fancybox_smart_hints')) ? response.title : ''
                        });

                    $link.before($imgLink);

                    if (options.is('option_embedding_remove_original_link')) {
                       $link.remove();
                    }
                }
            });
        }
    });
}
