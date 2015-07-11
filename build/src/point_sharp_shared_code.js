/**
 * Основной файл для включения в страницу
 *
 * ПЛАТФОРМОНЕЗАВИСИМЫЙ ФАЙЛ
 */

console_group('point-sharp');
console.info("shared_code.js", new Date());

$(document).ready(function() {
    // Проверяем, был ли уже загружен Point# или Point+
    console.info('Document ready', new Date());
    var point_plus_debug = $('#point-plus-debug');
    if (point_plus_debug.length > 0) {
        console.info('Point+', point_plus_debug.data('point-plus-version'), 'already loaded');
        urlbar_icon_hide();
        console_group_end();
        return;
    }

    $('<div id="point-plus-debug">').attr({
        'data-point-plus-version': 'undefined'
    }).text('Point# loading...')
        .insertBefore('#user-menu-cb');

    // Защита от долгой загрузки. Скрываем все изображения
    $('a.postimg').addClass('sharp-preblur');

    // Эпический костыль
    if (location.protocol == 'https:') {
        var point_i_image_http = 0;
        $('img').each(function() {
            var src = $(this).attr('src');
            if ((typeof(src) !== 'undefined') && src.match(new RegExp('^http://i\\.point\\.im/'))) {
                point_i_image_http++;
                $(this).attr('src', src.replace(new RegExp('^http://i\\.point\\.im/'), 'https://i.point.im/'));
            }
        });

        if (point_i_image_http > 0) {
            console.log(point_i_image_http, ' images should be loaded via secure version of i.point.im');
        }
    }

    // Дёргаем все опции и версию заодно
    point_sharp_options_init(pimp_my_page);
});// document.ready

/**
 * Основная функция, в неё приходят уже ухоженные несырые опции
 *
 * @param options Опции из OptionManager
 */
function pimp_my_page(options) {
    console.log("pimp_my_page start", new Date());
    $('#point-plus-debug').attr({
        'data-point-plus-version': options.version()
    }).text('Point# ' + options.version() + ' loading...');

    // Выполняем первые платформозависимые функции
    point_loaded_first(options);

    // Показываем иконку приложения в адресной строке
    urlbar_icon_show();

    // Проставляем теги у постов
    create_tag_system();

    // Parse webp-images. Viva la Google Chrome
    if (OptionsManager.getPlatform() == 'chrome') {
        parse_webp(options);
    }

    // Embedding
    if (options.is('option_embedding')) {
        // Load pictures from Booru, Tumblr and some other sites
        if (options.is('option_images_load_booru')) {
            new Booru($('.post-content .text a:not(.booru_pic)'), options);
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
            // Processing links
            $('div.post .post-content a[href*="\\:\\/\\/soundcloud\\.com\\/"]').each(function(index) {
                // @todo: переписать это дерьмо на нормальный HTML5 плеер
                var $player = $('<div class="pp-soundcloud">\
                                            <object height="81" width="100%" id="pp-soundcloud-' + index + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">\
                                              <param name="movie" value="//player.soundcloud.com/player.swf?url=' +
                                encodeURIComponent($(this).prop('href'))
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

        // Посты из Tumblr
        if (options.is('option_embedding_instagram_posts')) {
            tumblr_posts_embedding_init(options);
        }
    }

    // Fancybox
    if (options.is('option_fancybox')) {
        if (options.is('option_fancybox_bind_images_to_one_flow')) {
            // Linking images in posts to the galleries
            $('.post-content .text a.postimg:not(.youtube),.post-content .files a.postimg:not(.youtube)').
                attr('data-fancybox-group', 'one_flow_gallery');
        } else {
            $('.post-content .text, .post-content .files').each(function() {
                var post_id = $(this).parent('div.post').attr('data-id');
                $(this).find('a.postimg:not(.youtube)').attr('data-fancybox-group', 'post' + post_id);
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
            $('div.post .postimg').attr('data-fancybox-title', ' ');
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

    // NSFW Filtering
    $('a.sharp-preblur').removeClass('sharp-preblur');
    smart_nsfw_init(options);

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
        visual_editor_init();
    }

    // Google search
    if (options.is('option_search_with_google')) {
        $('#search-form input[type="text"]').attr('placeholder', 'Google').keydown(function(e) {
            if (e.keyCode == 10 || e.keyCode == 13) {
                e.preventDefault();
                document.location.href = 'https://www.google.ru/search?q=site%3Apoint.im+' + urlencode($(this).val());
            }
        });
    }

    // WebSocket
    if (options.is('option_ws')) {
        skobkin_websocket_init(options);
    }

    // Отправлять каменты через Ajax
    if (options.is('option_send_comments_ajax')) {
        ajax_get_comments_init(options);
    }

    // Font size
    if ((options.is('option_enlarge_font')) && (options.get('option_enlarge_font_size'))) {
        $('body').css('font-size', (options.get('option_enlarge_font_size') / 100) + 'em');
    }

    // @ before username
    if (options.is('option_at_before_username')) {
        if (window.location.pathname.match(new RegExp('^/(subscribers|subscriptions)', 'i')) === null) {
            $('body').addClass('at_before_username');
        }
    }

    // Hightlight post with new comments
    if (options.is('option_other_hightlight_post_comments')) {
        setTimeout(mark_unread_post, 0);
    }

    // Подсвечиваем каменты топик-стартера
    if (options.is('option_other_hightlight_comment_topic_starter')) {
        setTimeout(comments_mark_topic_starter, 0);
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
        setTimeout(hints_init_user_system, 0);
    }

    // Nesting level indicator
    if (options.is('option_other_comments_nesting_level')) {
        $('#comments').addClass('nesting_level');
    }

    // Обновляем кол-во постов и непрочитанных комментариев
    create_left_menu_badges();
    if (options.is('option_other_comments_count_refresh')) {
        set_comments_refresh_tick(options);
    }

    // Черновики. Ставим хандлер и восстанавливаем предыдущее состояние
    if (options.is('option_other_post_draft_save')) {
        draft_set_save_handler();
        draft_restore();
    }

    // Сворачивание постов. Как длинных, так и любых
    wrap_posts_init(options);

    // Сохраняем список просмотренных постов
    viewed_post_system_save(options);

    // Левое меню по умолчанию отправляет на новые
    if (options.is('option_other_left_menu_default_new')) {
        set_left_menu_default_new();
    }

    if (options.is('option_embedding_youtube')) {
        youtube_video_emedding(options);
    }

    // Выполняем последние платформозависимые функции
    point_loaded_last(options);

    // All external links
    external_links_target_blank();

    // Закрываем значок
    $('#point-plus-debug').fadeOut(500);
    console.log("pimp_my_page stop");
}
