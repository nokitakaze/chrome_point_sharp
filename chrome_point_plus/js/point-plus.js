// Showing page action
chrome.runtime.sendMessage({
    type: 'showPageAction'
}, null, function(response) {
    console.debug('showPageAction response: %O', response);
});

// @todo Move OptionsManager to the separate file
/**
 * Объект для получения опций
 * @param {Object} options Хеш настроек
 * @constructor
 */
function OptionsManager(options) {
    this._options = options || {};
}

/**
 * @param {String} optionName Имя опции
 * @returns {Boolean|String|Null} Значение опции
 */
OptionsManager.prototype.get = function(optionName) {
    return this._options.hasOwnProperty(optionName) ? this._options[optionName].value : null;
};

/**
 * Проверяет, равна ли опция значению value. Если value не переданно, проверяет задана ли она и не равна ли false/''
 * @param {String} optionName Имя опции
 * @param {Boolean|String} [value=true] Значение опции
 * @returns {Boolean}
 */
OptionsManager.prototype.is = function(optionName, value) {
    if (typeof value !== 'undefined') {
        return this.get(optionName) === value;
    } else {
        return Boolean(this.get(optionName));
    }
};

/**
 * @returns {Object} Хеш опций
 */
OptionsManager.prototype.getOptions = function() {
    return this._options;
};

var ppVersion;

chrome.runtime.sendMessage(null, {
    type: 'getManifestVersion'
}, null, function(response) {
    ppVersion = response.version || 'undefined';
});

$(document).ready(function() {
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

    // Черновики. Ставим хандлер и восстанавливаем предыдущее состояние
    draft_set_save_handler();
    draft_restore();

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
                chrome.runtime.sendMessage({
                    type: 'executeJSFiles',
                    files: [{
                        file: 'vendor/soundcloud/soundcloud.player.api.js',
                        runAt: 'document_end'
                    }]
                }, null, function(response) {
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
            chrome.runtime.sendMessage({
                type: 'injectCSSFile',
                file: 'vendor/fancybox/source/jquery.fancybox.css'
            });
            // @todo message response callback processing
            chrome.runtime.sendMessage({
                type: 'injectCSSFile',
                file: 'css/fancybox/style.css'
            });
            // JS
            chrome.runtime.sendMessage(null, {
                type: 'executeJSFiles',
                files: [{
                    file: 'vendor/fancybox/source/jquery.fancybox.pack.js',
                    runAt: 'document_end'
                }, {
                    // @todo Move to the option_fancybox_videos section
                    file: 'vendor/fancybox/source/helpers/jquery.fancybox-media.js',
                    runAt: 'document_end'
                }]
            }, null, function(response) {
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
            chrome.runtime.sendMessage({
                type: 'injectCSSFile',
                file: 'vendor/markitup/markitup/skins/markitup/style.css'
            });
            // Fixes for extension
            // @todo message response callback processing
            chrome.runtime.sendMessage({
                type: 'injectCSSFile',
                file: 'css/markitup/skins/markitup/style.css'
            });
            // @todo message response callback processing
            chrome.runtime.sendMessage({
                type: 'injectCSSFile',
                file: 'css/markitup/sets/markdown/style.css'
            });
            // JS
            chrome.runtime.sendMessage({
                type: 'executeJSFiles',
                files: [{
                    file: 'vendor/markitup/markitup/jquery.markitup.js',
                    runAt: 'document_end'
                }, {
                    file: 'js/markitup/sets/markdown/set.js',
                    runAt: 'document_end'
                }]
            }, null, function(response) {
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

            // @todo: унести в опцию
            // Adding event listener for notification click
            chrome.runtime.sendMessage({
                type: 'listenNotificationClicks',
                protocol: getProtocol()
            });

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
                        console.info('ws-ping');
                    } else {
                        var wsMessage = JSON.parse(evt.data);

                        if (wsMessage.hasOwnProperty('a') && wsMessage.a != '') {
                            switch (wsMessage.a) {
                                // Comments
                                case 'comment':
                                    console.groupCollapsed('ws-comment #%s/%s', wsMessage.post_id, wsMessage.comment_id);
                                    console.debug(wsMessage);

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

                                    // @todo: Вынести в отдельную функцию
                                    // Loading HTML template
                                    $commentTemplate.load(chrome.extension.getURL('includes/comment.html'), function() {
                                        // Load complete
                                        console.info('comment.html loaded');

                                        // Date and time of comment
                                        var date = new Date();

                                        // @todo: унести наверх
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
                                        if (options.is('option_ws_comments_color_fadeout')) {
                                            console.log('Fading out the highlight');
                                            $commentTemplate.children('.pp-highlight').fadeOut(20000);
                                        }

                                        // Desktop notifications
                                        if (options.is('option_ws_comments_notifications')) {
                                            console.log('Showing desktop notification');
                                            chrome.runtime.sendMessage({
                                                type: 'showNotification',
                                                notificationId: 'comment_' + wsMessage.post_id + '#' + wsMessage.comment_id,
                                                avatarUrl: getProtocol() + userAvatar + '/80',
                                                title: '@' + wsMessage.author + ' #' + wsMessage.post_id + '(/' + wsMessage.comment_id + ')',
                                                text: wsMessage.text
                                            });
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
        // Font size
        if ((options.is('option_enlarge_font')) && (options.get('option_enlarge_font_size'))) {
            $('body').css('font-size', (options.get('option_enlarge_font_size') / 100) + 'em');
        }
        // @ before username
        if (options.is('option_at_before_username')) {
            // @todo message response callback processing
            chrome.runtime.sendMessage({
                type: 'injectCSSFile',
                file: 'css/modules/at_before_username.css'
            });
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

        $('#point-plus-debug').fadeOut(1000);
    });
});

function getProtocol() {
    return ((location.protocol == 'http:') ? 'http:' : 'https:');
}

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

// Картинки с бурятников
var booru_picture_count = 0;
function load_all_booru_images() {
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('booru_pic')) {
            return;
        }

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
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('booru_pic')) {
            return;
        }

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
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('booru_pic')) {
            return;
        }

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

// Плашки с кол-вом уникальных пользователей и рекомендаций у постов
function set_posts_count_label() {
    var ids = [];
    $('.content-wrap > .post .post-id a .cn').addClass('changed_background');

    $('.content-wrap > .post').each(function(num, obj) {
        var t = $(obj).attr('data-comment-id');
        if (typeof(t) !== 'undefined') {
            return;
        }
        var id = $(obj).attr('data-id');
        ids.push(id);
    });

    $ajax({
        'url': 'https://api.kanaria.ru/point/get_post_info.php?list=' + urlencode(ids.join(',')),
        'success': function(a) {
            var answer = JSON.parse(a);

            $('.content-wrap > .post').each(function(num, obj) {
                var id = $(obj).attr('data-id');
                var postid = $(obj).find('.post-id a')[0];
                var t = $(obj).attr('data-comment-id');
                if (typeof(t) !== 'undefined') {
                    return;
                }

                var e1 = document.createElement('span');
                if (typeof(answer.list[id]) == 'undefined') {
                    return;
                }
                $(e1).addClass('authors_unique_count').text(answer.list[id].count_comment_unique).attr('title', 'Количество комментаторов');
                postid.appendChild(e1);

                var e2 = document.createElement('span');
                $(e2).addClass('recommendation_count').text('~' + answer.list[id].count_recommendation).attr('title', 'Количество рекомендаций. Работает криво, спасибо @arts\'у за это');
                postid.appendChild(e2);
            });
        }

    })

}

function parse_pleercom_links(current_options) {
    if (current_options.is('option_embedding_pleercom_nokita_server')) {
        parse_pleercom_links_nokita();
    } else {
        parse_pleercom_links_ajax(current_options);
    }
}
/**
 * @deprecated since 1.19
 */
function parse_pleercom_links_nokita() {
    $('.post-content a').each(function(num, obj) {
        var href = obj.href;
        var n = null;

        if (n = href.match(new RegExp('^https?:\\/\\/pleer\\.com\\/tracks\\/([0-9a-z]+)', 'i'))) {
            var player = document.createElement('audio');
            $(player).attr({
                'src': 'https://api.kanaria.ru/point/get_pleer_file.php?id=' + n[1],
                'controls': 'controls',
                'preload': 'none'
            });

            var player_div = document.createElement('div');
            $(player_div).addClass('embeded_audio').addClass('embeded_audio_' + n[1]);
            player_div.appendChild(player);

            obj.parentElement.insertBefore(player_div, obj);
        }
    });
}

function parse_pleercom_links_ajax(current_options) {
    $('.post-content a').each(function(num, obj) {
        var href = obj.href;
        var n = null;

        if (n = href.match(new RegExp('^https?:\\/\\/pleer\\.com\\/tracks\\/([0-9a-z]+)', 'i'))) {
            var player_div = document.createElement('div');
            $(player_div).addClass('embeded_audio').addClass('embeded_audio_' + n[1]);
            $(obj).addClass('pleercom_original_link_'+n[1]);
            obj.parentElement.insertBefore(player_div, obj);
            create_pleercom_ajax(n[1], current_options);
        }
    });
}

function create_pleercom_ajax(id, current_options) {
    $ajax({
        'url': 'https://pleer.com/site_api/files/get_url',
        'type': 'post',
        'postdata': 'action=download&id=' + id,
        'dont_set_content_type': true,
        'pleer_id': id,
        'headers': [['Accept', '*'], ['Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8']],
        'success': function(a) {
            var answer = JSON.parse(a);
            var player = document.createElement('audio');
            // @todo Проверять существование track_link
            $(player).attr({
                'src': answer.track_link,
                'controls': 'controls',
                'preload': 'auto'
            });
            $('.embeded_audio_' + this.settings.pleer_id)[0].appendChild(player);

            if (current_options.is('option_embedding_pleercom_orig_link', false)){
                $('.pleercom_original_link_'+this.settings.pleer_id).hide();
            }
        },
        'error': function() {
            console.log('Can not get pleer.com url');
            setTimeout(new Function('create_pleercom_ajax("' + this.settings.pleer_id + '");'), 1000);
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
    var scroll_current = $('body').scrollTop();
    var scroll_step_size = 0;
    var scroll_real = Math.max(scroll_current - scroll_step_size, 0);

    var posts = $('.content-wrap > .post');
    for (var i = 0; i < posts.length; i++) {
        var this_top_px = $(posts[i]).offset().top;
        if (this_top_px > scroll_real) {
            $('body').animate({
                'scrollTop': this_top_px
            }, 200);
            return;
        }
    }
}

/* Автосохранение черновиков */
var draft_last_text = ''; // Последний зафиксированный текст
// Восстанавливаем черновик
function draft_restore() {
    chrome.storage.local.get('point_draft_text', function(items) {
        if ($('#new-post-form #text-input').val() == '') {
            $('#new-post-form #text-input').val(items.point_draft_text);
            draft_last_text = items.point_draft_text;
        }
    });
}

// Установка хандлера
function draft_set_save_handler() {
    // Господи, прости меня грешного за эту строку. Меня вынудили
    $('#text-input').on('keyup', function(){
        draft_save_check();
    });
    $('#new-post-wrap .footnote').append($('<span id="draft-save-status">'));
}

var draft_save_busy = false;
// Фукнция, дёргающаяся по крону, проверяющая надо ли сохранять черновик
function draft_save_check() {
    if (draft_save_busy) {
        return;
    }
    draft_save_busy = true;

    var current_text = $('#new-post-form #text-input').val();
    if (draft_last_text == current_text) {
        draft_save_busy = false;
        return;
    }
    // @todo i18n
    $('#draft-save-status').text('Сохраняем черновик...').show();

    // Сохраняем
    draft_last_text = current_text;
    // Save it using the Chrome extension storage API.
    chrome.storage.local.set({'point_draft_text': draft_last_text}, function() {
        // Notify that we saved.
        draft_save_busy = false;
        $('#draft-save-status').text('Черновик сохранён...');
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
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('booru_pic')) {
            return;
        }

        var href = obj.href;
        var n;

        if (n = href.match(new RegExp('^https?://(www\\.)?twitter\\.com/[^/]+/status/([0-9]+)', 'i'))) {
            var image = document.createElement('div');
            $(image).attr({
                'id': 'tweet-' + twitter_tweet_count,
                'data-tweet-id': n[2]
            }).addClass('twitter-tweet-embedded');
            obj.parentElement.insertBefore(image, obj);

            window.twttr.widgets.createTweet(
                n[2],
                image,
                {
                    'lang': 'ru'
                }
            );
            twitter_tweet_count++;
        }
    });
}
