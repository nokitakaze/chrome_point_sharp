/**
 * Основной файл для включения в страницу
 *
 * ПЛАТФОРМОНЕЗАВИСИМЫЙ ФАЙЛ
 */

if (typeof(console.group) !== 'undefined') {
    console.group('point-sharp');
}
console.info("shared_code.js");

$(document).ready(function () {
    // Проверяем, загрузились ли мы
    var point_plus_debug = $('#point-plus-debug');
    if (point_plus_debug.length > 0) {
        console.info('Point+', point_plus_debug.data('point-plus-version'), 'already loaded');
        urlbar_icon_hide();
        return;
    }
    $('<div id="point-plus-debug">').attr({
        'data-point-plus-version': 'undefined'
    }).text('Point# loading...')
        .insertBefore('#user-menu-cb');

    // Дёргаем все опции и версию заодно
    point_sharp_options_init(function (options) {
        // Основная функция
        // У нас уже есть все Опции, обёрнутые в OptionsManager
        console.log("All options and code loaded");
        $('#point-plus-debug').attr({
            'data-point-plus-version': options.version()
        }).text('Point# ' + options.version() + ' loading...');

        // Показываем иконку приложения в адресной строке
        urlbar_icon_show();


        // Закрываем значок
        $('#point-plus-debug').fadeOut(500);
    });// point_sharp_options_init
});// document.ready

// Старый код
// Старый код
// Старый код
// Старый код
// Старый код
// Старый код
// Старый код


$(document).ready(function () {
    // @todo Потом открыть
    return;
    // Grouping console log
    console.info('Point+ %s', ppVersion);

    // Проверяем, загрузились ли мы
    var point_plus_debug = $('#point-plus-debug');
    if (point_plus_debug.length > 0) {
        console.info('Point+ %s already loaded.', point_plus_debug.data('point-plus-version'));
        urlbar_icon_hide();
        return;
    }
    $('<div id="point-plus-debug">').attr({
        'data-point-plus-version': ppVersion
    }).text('Point+ ' + ppVersion + ' loading...')
        .insertBefore('#user-menu-cb');

    // Loading options
    chrome.storage.sync.get('options', function (sync_data) {
        var options = new OptionsManager(sync_data.options);

        // Options debug
        try {
            console.debug('Options loaded: %O', options.getOptions());
        } catch (e) {
        }
        create_tag_system();

        // Embedding
        if (options.is('option_embedding')) {
            // Load pictures from Booru, Tumblr and some other sites
            if (options.is('option_images_load_booru')) {
                load_all_booru_images();
            }

            // Посты из Инстаграма
            if (options.is('option_embedding_instagram_posts')) {
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
                // @todo Протестировать Soundcloud
                // Executing Soundcloud player JS API
                chrome.runtime.sendMessage({
                    type: 'executeJSFiles',
                    files: [{
                        file: 'vendor/soundcloud/soundcloud.player.api.js',
                        runAt: 'document_end'
                    }]
                }, null, function (response) {
                    console.debug('Soundcloud injection response: %O', response);
                    // If scripts are executed
                    if (response) {
                        // Processing links
                        $('.post .post-content a[href*="\\:\\/\\/soundcloud\\.com\\/"]').each(function (index) {
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

            // Твиты из Твиттера
            if (options.is('option_embedding_twitter_tweets')) {
                twitter_tweet_embedding_init();
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
            }, null, function (response) {
                // If all JS are executed
                console.debug('Fancybox injection response: %O', response);
                if (response) {
                    console.log('Fancybox executed. Processing...');

                    if (options.is('option_fancybox_bind_images_to_one_flow')) {
                        // Linking images in posts to the galleries
                        $('.post-content .text').each(function () {
                            $(this).find('a.postimg:not(.youtube)').attr('data-fancybox-group', 'one_flow_gallery');
                        });
                    } else {
                        $('.post-content .text').each(function (idxPost) {
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
            $('.content-wrap #comments').on('keydown.point_plus', '.reply-form textarea', function (e) {
                if (e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13)) {
                    e.preventDefault();
                    $(this).parent('.reply-form').submit();
                }
            });
            // New post
            $('#new-post-form #text-input,#new-post-form #tags-input').on('keydown.point_plus', function (e) {
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
            $('.postimg:not(.youtube) img').each(function () {
                console.log($(this).parent('.postimg').attr('href'));
                $(this).attr('src', $(this).parent('.postimg').attr('href'));
            });
            // Resizing
            // @todo WAT?! Это не сделано по умолчанию? Проверить
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
            }, null, function (response) {
                console.debug('MarkItUp injection response: %O', response);
                // If scripts are executed
                if (response) {
                    // Init MarkItUp
                    $('.markitup').markItUp(mySettings);

                    // Send by CTRL+Enter
                    if (options.is('option_ctrl_enter')) {
                        // New post
                        $('#new-post-form #text-input, .post-content #text-input').on('keydown.point_plus', function (e) {
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
            $('#search-form input[type="text"]').attr('placeholder', 'Google').keydown(function (e) {
                if (e.keyCode == 10 || e.keyCode == 13) {
                    e.preventDefault();
                    document.location.href = '//www.google.ru/search?q=site%3Apoint.im+' + $(this).val();
                }
            });
        }
        /*
         // @todo Оттестировать
         // WebSocket
         if (options.is('option_ws')) {
         skobkin_websocket_init(options);
         }
         */
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
        if (options.is('option_other_scroll_space_key')) {
            set_space_key_skip_handler();
        }

        // Система комментариев у пользователей
        if (options.is('option_other_comments_user_system')) {
            hints_init_user_system();
        }

        // Nesting level indicator
        if (options.is('option_other_comments_nesting_level')) {
            draw_nesting_level_indicator();
        }

        // Обновляем кол-во постов и непрочитанных комментариев
        if (options.is('option_other_comments_count_refresh')) {
            set_comments_refresh_tick(options);
        }

        // Черновики. Ставим хандлер и восстанавливаем предыдущее состояние
        if (options.is('option_other_post_draft_save')) {
            draft_set_save_handler();
            draft_restore();
        }

        $('#point-plus-debug').fadeOut(1000);
    });
});

function getProtocol() {
    return ((location.protocol == 'http:') ? 'http:' : 'https:');
}

