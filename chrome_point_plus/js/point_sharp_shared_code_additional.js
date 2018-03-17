/**
 * Функции для включения в основную страницу
 *
 * ПЛАТФОРМОНЕЗАВИСИМЫЙ ФАЙЛ
 */

/**
 * @param {OptionsManager} options Опции из OptionsManager
 */
function remark_entire_page(options) {
    // Parse webp-images. Viva la Google Chrome
    if (OptionsManager.getPlatform() == 'chrome') {
        parse_webp(options);
    }

    // Schema fixes
    if (options.is('option_booru_schema_fixes')) {
        fix_meta_schema_in_links(options);
    }

    if (options.is('option_https_everywhere_point')) {
        links_https_everywhere_point();
    }

    if (options.is('option_https_everywhere_external')) {
        links_https_everywhere_external();
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

        // Parse coub.com links and create iframe instead
        if (options.is('option_embedding_coubcom')) {
            parse_coub_links(options);
        }

        // Твиты из Твиттера
        if (options.is('option_embedding_twitter_tweets')) {
            twitter_tweet_embedding_init();
        }

        // Посты из Tumblr
        if (options.is('option_embedding_tumblr') && !navigator.userAgent.match(new RegExp('firefox', 'i'))) {
            tumblr_posts_embedding_init(options);
        }

        // Фото из 500px
        if (options.is('option_embedding_500px')) {
            parse_500px(options);
        }

        // Google Drive
        if (options.is('option_embedding_gdrive')) {
            parse_gdrive(options);
        }

        // JSFiddle
        if (options.is('option_embedding_jsfiddle') && !navigator.userAgent.match(new RegExp('firefox', 'i'))) {
            parse_jsfiddle(options);
            parse_jsfiddle_set_interval();
        }
    }

    // Fancybox
    if (options.is('option_fancybox')) {
        disable_native_fancybox();
        if (options.is('option_fancybox_bind_images_to_one_flow')) {
            // Linking images in posts to the galleries
            $('.post-content .text a.postimg:not(.youtube),.post-content .files a.postimg:not(.youtube)').attr(
                'data-fancybox-group', 'one_flow_gallery');
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

    } else if (options.is('option_disable_native_fancybox')) {
        disable_native_fancybox();
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

    // Подсвечиваем каменты топик-стартера
    if (options.is('option_other_hightlight_comment_topic_starter')) {
        setTimeout(comments_mark_topic_starter, 0);
    }

    if (options.is('option_embedding_youtube')) {
        youtube_video_embedding(options);
    }

    if (options.is('option_vimeo_width')) {
        update_block_vimeo_width();
    }

    // All external links
    external_links_target_blank();
}

/**
 * Помечаем непрочитанные посты более видимо чем каким-то баджем
 *
 * Первая версия написана @RainbowSpike
 */
function mark_unread_post() {
    if ($('#comments').length > 0) {return;}

    $(".content-wrap > div.post").css({'padding-left': '2px'}).each(function() {
        if ($(this).find(".unread").length > 0) {
            $(this).addClass('new_comments');
        }
    });
}

// Webm
function parse_webm(current_options) {
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('point-sharp-processed') || $(obj).hasClass('point-sharp-added')) {
            return;
        }

        if (obj.href.match(new RegExp('^https?:\\/\\/([a-z0-9.-]+)\\/[a-z0-9_\\/.%-]+\\.webm(\\?.+)?$', 'i'))) {
            var player = document.createElement('video');
            // Там может быть не vp8+vorbis, но мы этого никак не узнаем
            $(player).html('<source src="" type=\'video/webm; codecs="vp8, vorbis"\' />').attr('controls', 'controls').css({
                'display': 'block',
                'max-width': '95%'
            }).addClass('parsed-webm-link').addClass('point-sharp-added').addClass('embedded_video').find('source').attr('src',
                obj.href);

            obj.parentElement.insertBefore(player, obj);
            $(obj).addClass('point-sharp-processed');

            if (current_options.is('option_videos_parse_leave_links', false)) {
                $(obj).hide();
            }
        }
    });
}

// noinspection JSUnusedLocalSymbols
/**
 * Webp-изображение. Только для Хромо-господ
 *
 * @param {Object} current_options
 */
function parse_webp(current_options) {
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('point-sharp-processed') || $(obj).hasClass('point-sharp-added')) {
            return;
        }

        if (obj.href.match(new RegExp('^https?:\\/\\/([a-z0-9.-]+)\\/[a-z0-9_\\/.%-]+\\.webp(\\?.+)?$', 'i'))) {
            var img = document.createElement('img');
            $(img).attr({
                'src': obj.href
            }).addClass('point-sharp-added');
            $(obj).attr({
                'target': '_blank'
            }).css({
                'display': 'block',
                'clear': 'both',
                'float': 'none'
            }).addClass('postimg').html('').append(img).addClass('parsed-webp-link').addClass('point-sharp-processed');

            // @todo Картинки в ряд
        }
    });
}

// noinspection JSUnusedLocalSymbols
/**
 * @param {Object} current_options
 */
function parse_500px(current_options) {
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('point-sharp-processed') || $(obj).hasClass('point-sharp-added')) {
            return;
        }

        if (obj.href.match(new RegExp('^(https?://drscdn.500px.org/photo/.+)', 'i'))) {
            var img = document.createElement('img');
            $(img).attr({
                'src': obj.href
            }).addClass('point-sharp-added');
            $(obj).attr({
                'target': '_blank'
            }).css({
                'display': 'block',
                'clear': 'both',
                'float': 'none'
            }).addClass('postimg').html('').append(img).addClass('parsed-500px-link').addClass('point-sharp-processed');

            // @todo Картинки в ряд
        }
    });
}

// Видео
function parse_all_videos(current_options) {
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('point-sharp-processed') || $(obj).hasClass('point-sharp-added')) {
            return;
        }

        var href = obj.href;
        var n;

        if (n =
                href.match(new RegExp('^https?:\\/\\/([a-z0-9.-]+)\\/[a-z0-9_\\/.%-]+\\.(webm|avi|mp4|mpg|mpeg)(\\?.+)?$',
                    'i'))) {
            var player = document.createElement('video');
            var mime = video_extension_to_mime(n[2]);
            $(player).html('<source src="" type="" />').attr('controls', 'controls').css({
                'display': 'block',
                'max-width': '95%'
            }).addClass('parsed-webm-link').addClass('point-sharp-added').addClass('embedded_video').find('source').attr({
                'src': href,
                'type': mime
            });

            obj.parentElement.insertBefore(player, obj);
            $(obj).addClass('point-sharp-processed');

            if (current_options.is('option_videos_parse_leave_links', false)) {
                $(obj).hide();
            }
        }
    });
}

function video_extension_to_mime(extension) {
    switch (extension) {
        case 'webm':
            return 'video/webm; codecs="vp8, vorbis';
        case 'avi' :
            return 'video/avi;';
        case 'mp4' :
            return 'video/mp4;';
        case 'mpg' :
            return 'video/mp4;';
        case 'mpeg':
            return 'video/mp4;';
    }
}

// Аудио
function parse_all_audios(current_options) {
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('point-sharp-processed') || $(obj).hasClass('point-sharp-added')) {
            return;
        }

        var href = obj.href;
        var n;

        if (n = href.match(new RegExp('^https?:\\/\\/([a-z0-9.-]+)\\/[a-z0-9_\\/.%-]+\\.(mp3|ogg|wav)(\\?.+)?$', 'i'))) {
            var domain = n[1];
            // Проверяем откуда мы грузимся
            if (domain.match(new RegExp('\\.vk\\.me$', 'i'))) {
                // Так то ж Контакт!
                if (typeof(n[3]) == 'undefined') {
                    return;
                }
                if (!n[3].match('extra\\=', 'i')) {
                    return;
                }
            }

            var player = document.createElement('audio');
            var mime = audio_extension_to_mime(n[2]);
            $(player).html('<source src="" type="" />').attr('controls', 'controls').css({
                'display': 'block',
                'max-width': '350px'
            }).addClass('parsed-audio-link').find('source').attr({
                'src': href,
                'type': mime
            });

            obj.parentElement.insertBefore(player, obj);
            $(obj).addClass('point-sharp-processed');

            if (current_options.is('option_audios_parse_leave_links', false)) {
                $(obj).hide();
            }
        }
    });
}

function audio_extension_to_mime(extension) {
    switch (extension) {
        case 'mp3':
            return 'audio/mpeg';
        case 'ogg':
            return 'audio/ogg; codecs=vorbis';
        case 'wav':
            return 'audio/vnd.wave';
    }
}

// Плашки с кол-вом уникальных пользователей и рекомендаций у постов
function set_posts_count_label() {
    var ids = [];
    $('.content-wrap > div.post .post-id a .cn').addClass('changed_background');

    $('.content-wrap > div.post').each(function(num, obj) {
        if ((typeof($(obj).attr('data-comment-id')) !== 'undefined') ||
            ($(obj).attr('data-inner-comment-id') !== '0')) {
            return;
        }
        var id = $(obj).attr('data-id');
        ids.push(id);
    });

    $ajax({
        'url': 'https://api.kanaria.ru/point/get_post_info.php?list=' + urlencode(ids.join(',')),
        'success': function(a) {
            var answer = JSON.parse(a);

            $('.content-wrap > div.post').each(function(num, obj) {
                var id = $(obj).attr('data-id');
                var postid = $(obj).find('.post-id a')[0];
                if ((typeof($(obj).attr('data-comment-id')) !== 'undefined') ||
                    ($(obj).attr('data-inner-comment-id') !== '0')) {
                    return;
                }

                var e1 = document.createElement('span');
                if (typeof(answer.list[id]) == 'undefined') {
                    return;
                }
                $(e1).addClass('authors_unique_count').text(answer.list[id].count_comment_unique).attr('title',
                    'Количество комментаторов');
                postid.appendChild(e1);

                var e2 = document.createElement('span');
                $(e2).addClass('recommendation_count').text('~' + answer.list[id].count_recommendation).attr('title',
                    'Количество рекомендаций. Работает криво, спасибо @arts\'у за это');
                postid.appendChild(e2);
            });
        },
        'error': function(a) {
            console.error('Can not get post info', a);
        }

    })

}

/**
 * Проставляем теги и имена пользователей у постов
 */
function create_tag_system() {
    var my_nick = get_my_nick();

    $('.content-wrap > div.post, #comments div.post').each(function() {
        var tags = $(this).find('div.tags a.tag');
        for (var i = 0; i < tags.length; i++) {
            var tag_name = tags.eq(i).html().toLowerCase();
            $(this).addClass('post-tag-' + tag_sanation(tag_name));
        }

        // Имена пользователей
        var this_href = $(this).find('.post-id a').attr('href');
        if (typeof(this_href) == 'undefined') {
            return;
        }
        var a = this_href.match(new RegExp('^(https?://([a-z0-9-]+\\.)?point\\.im)?/[a-z0-9]+(#([0-9]+))?$'));
        var comment_id = 0;
        if ((a !== null) && (typeof(a[4]) !== 'undefined')) {
            comment_id = a[4];
        }
        var nick = $(this).find('.post-content a.user').first().text().toLowerCase();
        $(this).attr({
            'data-author-id': nick,
            'data-inner-comment-id': comment_id
        }).addClass('post-author-' + nick);
        if ($(this).find('.post-content > .rec').length > 0) {
            $(this).addClass('is-recommendation');
        }

        // Свои посты
        if (nick == my_nick) {
            $(this).addClass('is-my-post');
        }
    });
}

// Скролл по пробелу
function set_space_key_skip_handler() {
    if ($('#comments').length > 0) {
        return;
    }

    $(document.body).on('keydown', function(e) {
        // @hint Я хотел по отпусканию кнопки, но там уже скролл срабатывает
        // проверяем фокус
        if ($(':focus').length > 0) {
            return;
        }

        var k = e.keyCode;
        if (k == 32) {
            space_key_event();
            return false;
        }
    });
}

function space_key_event() {
    var body_selector = (navigator.appVersion.match(/.*chrome.*/i) == null) ? 'html' : 'body';
    var scroll_current = Math.floor($(body_selector).scrollTop());

    var posts = $('.content-wrap > div.post');
    for (var i = 0; i < posts.length; i++) {
        var this_top_px = Math.floor(posts.eq(i).offset().top);
        if (this_top_px > scroll_current) {
            $(body_selector).animate({
                'scrollTop': this_top_px
            }, 200);
            return;
        }
    }
}

/**
 * Автосохранение черновиков
 **/
var draft_last_text = ''; // Последний зафиксированный текст
var draft_last_tags = ''; // Последние зафиксированные теги
var draft_save_busy = false;// Флаг занятости функции сохранения
var draft_save_last_time = null;// Время последнего сохранения
// Восстанавливаем черновик
function draft_restore() {
    console.info('draft_restore');
    local_storage_get(['point_draft_text', 'point_draft_tags'], function(items) {
        console.info('draft_restore callback', items);
        if ($('#new-post-form #text-input').val() == '') {
            $('#new-post-form #text-input').val(items.point_draft_text);
            draft_last_text = items.point_draft_text;
        }
        if ($('#new-post-form #tags-input').val() == '') {
            $('#new-post-form #tags-input').val(items.point_draft_tags);
            draft_last_tags = items.point_draft_tags;
        }
    });
}

// Установка хандлера
function draft_set_save_handler() {
    // Господи, прости меня грешного за эту строку. Меня вынудили
    $('#text-input, #tags-input').on('keyup', function() {
        draft_save_check();
        setTimeout(draft_save_check, 3000);// Второй раз мы дёргаем для последнего нажатия
    });
    $('#new-post-wrap .footnote').append($('<span id="draft-save-status">'));
}

// Фукнция, дёргающаяся по нажатию клавиши, проверяющая надо ли сохранять черновик
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
    if ((draft_last_text == current_text) && (draft_last_tags == current_tags)) {
        return;
    }
    draft_save_busy = true;
    draft_save_last_time = new Date();

    $('#draft-save-status').text('Сохраняем черновик...').show();

    // Сохраняем
    draft_last_text = current_text;
    draft_last_tags = current_tags;

    local_storage_set({
        'point_draft_text': draft_last_text,
        'point_draft_tags': draft_last_tags
    }, function() {
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
        if ($(obj).hasClass('point-sharp-processed') || $(obj).hasClass('point-sharp-added')) {
            return;
        }

        var href = obj.href;
        var n;

        if (n = href.match(new RegExp('^https?:\\/\\/coub\\.com\\/view\\/([0-9a-z]+)', 'i'))) {
            var player = document.createElement('iframe');
            var parent_width = $(obj.parentElement).width();
            $(player).attr({
                'src': 'https://coub.com/embed/' + n[1] +
                       '?muted=false&autostart=false&originalSize=false&hideTopBar=false&startWithHD=true',
                'allowfullscreen': 'true'
            }).css({
                'max-width': '640px',
                'border': 'none',
                'width': Math.floor(parent_width * 0.9),
                'height': Math.ceil(parent_width * 0.9 * 480 / 640)
            }).addClass('embedded_video').addClass('embedded_coub').addClass('embedded_coub_' + n[1])
                .addClass('point-sharp-added');

            obj.parentElement.insertBefore(player, obj);
            $(obj).addClass('point-sharp-processed');

            if (current_options.is('option_embedding_coubcom_orig_link', false)) {
                $(obj).hide();
            }
        }
    });
}

// Правим хинт в FancyBox
function fancybox_set_smart_hints() {
    $('div.post').each(function() {
        var all_post_images = $(this).find('.postimg');
        if (all_post_images.length == 0) {
            return;
        }

        var tags = $(this).find('div.tags a.tag');
        var default_hint_text = '';// Дефолтный текст для хинта в FancyBox, если не нашлость другого
        // Сначала теги
        for (var i = 0; i < tags.length; i++) {
            var tag_name = tags.eq(i).html().toLowerCase();
            default_hint_text += ' ' + tag_name;
        }

        // Потом текст
        var textcontent = $(this).find('.text-content');
        if (textcontent.length > 0) {
            textcontent = textcontent[0];
            for (i = 0; i < textcontent.childNodes.length; i++) {
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
    local_storage_get('point_user_hints', function(point_user_hints) {
        if ((typeof(point_user_hints) == 'undefined') || (point_user_hints === null)) {
            // Первый запуск системы
            console.info('Storage key `point_user_hints` is not defined. First exec?');
            local_storage_set({'point_user_hints': {}}, function() {
                hints_draw_main_user_hint({});
                hints_set_titles_on_users({});
            });
        } else {
            // Второй+ запуск системы
            hints_draw_main_user_hint(point_user_hints);
            hints_set_titles_on_users(point_user_hints);
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
    $('.aside .aside-content #counters')[0].parentElement.insertBefore(current_user_hint_block,
        $('.aside .aside-content #counters')[0]);
    $(current_user_hint_block).addClass('current-user-hint');

    // Рисуем кнопки управления
    var buttons_block = document.createElement('div');
    $(buttons_block).addClass('buttons').html('<a class="edit" href="javascript:" title="Редактировать"></a>');
    current_user_hint_block.appendChild(buttons_block);
    $(buttons_block).find('.edit').on('click', function() {
        local_storage_get('point_user_hints', function(point_user_hints) {
            var current_text = '';
            if (typeof(point_user_hints[current_user_name]) !== 'undefined') {
                current_text = point_user_hints[current_user_name];
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
    $(change_hint_block).addClass('change_hint_block').hide().html(
        '<textarea></textarea><input class="button_save" type="submit" value="Сохранить">' +
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

/**
 * Превращаем текст в параграфы и добавляем в jquery-объект
 * Safe code, херли
 *
 * @param {string} text
 * @param {object} object
 */
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

/**
 * Сохраняем новый хинт
 *
 * @param {string} username Имя пользователя
 * @param {string} new_hint Новый текст с хинтом
 */
function hints_save_new_hint(username, new_hint) {
    local_storage_get('point_user_hints', function(point_user_hints) {
        point_user_hints[username] = new_hint;
        local_storage_set({'point_user_hints': point_user_hints});
    });
}

/**
 * Проверяем, чтобы были баджи в левом меню
 */
function create_left_menu_badges() {
    var count_recent, count_comments, count_messages;
    var a = $('#main #left-menu #menu-recent .unread');
    var b = $('#main #left-menu #menu-comments .unread');
    var c = $('#main #left-menu #menu-messages .unread');
    if (a.length == 0) {
        $('#main #left-menu #menu-recent').append('<span class="unread" style="display: none;">0</span>');
        count_recent = 0;
    } else {
        count_recent = parseInt(a.text(), 10);
    }
    if (b.length == 0) {
        $('#main #left-menu #menu-comments').append('<span class="unread" style="display: none;">0</span>');
        count_comments = 0;
    } else {
        count_comments = parseInt(b.text(), 10);
    }
    if (c.length == 0) {
        $('#main #left-menu #menu-messages').append('<span class="unread" style="display: none;">0</span>');
        count_messages = 0;
    } else {
        count_messages = parseInt(c.text(), 10);
    }
    set_new_unread_count_status(count_recent, count_comments, count_messages);
    set_new_unread_count_listener();
}

/**
 * Обновляем кол-во комментариев и непрочитанных новых постов в ленте
 */
function set_comments_refresh_tick(current_options) {
    // Ставим тик
    setInterval(function() {
        comments_count_refresh_tick(current_options);
    }, 60000);

    // Ставим слежение за позицией мыши
    if (current_options.is('option_other_comments_count_refresh_title')) {
        $(document).on('mouseenter', function() {
            set_comments_refresh_clear_title_marks();
        }).on('mouseleave', function() {
            window_focused = false;
        });

        $(window).on('focus', function() {
            set_comments_refresh_clear_title_marks();
        }).on('blur', function() {
            window_focused = false;
        });
    }
}

/**
 * @type {boolean} Мышь внутри окна или нет
 */
var window_focused = true;

// Очищаем [0; 0]
function set_comments_refresh_clear_title_marks() {
    document.title = document.title.replace(new RegExp('^\\[[0-9]+\\; [0-9]+\\] '), '');
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
        var c = $(iframe.contentDocument.body).find('#main #left-menu #menu-messages .unread');
        var count_recent = (a.length == 0) ? 0 : parseInt(a.text(), 10);
        var count_comments = (b.length == 0) ? 0 : parseInt(b.text(), 10);
        var count_messages = (c.length == 0) ? 0 : parseInt(c.text(), 10);
        update_left_menu_unread_budges(count_recent, count_comments, count_messages, current_options);
        set_new_unread_count_status(count_recent, count_comments, count_messages);

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
 *
 * @param {Number} count_recent
 * @param {Number} count_comments
 * @param {Number} count_messages
 * @param {OptionsManager} options
 **/
function update_left_menu_unread_budges(count_recent, count_comments, count_messages, options) {
    console.log('Comments: ', count_comments, ', Recent: ', count_recent, ', Messages: ', count_messages);
    if (count_recent > 0) {
        if (parseInt($('#main #left-menu #menu-recent .unread').text(), 10) != count_recent) {
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
        if (parseInt($('#main #left-menu #menu-comments .unread').text(), 10) != count_comments) {
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

    if (count_messages > 0) {
        if (parseInt($('#main #left-menu #menu-messages .unread').text(), 10) != count_messages) {
            $('#main #left-menu #menu-messages .unread').text(count_messages).show().css({
                'background-color': '#f2ebee',
                'color': '#7c3558'
            });
            setTimeout(function() {
                $('#main #left-menu #menu-messages .unread').css({
                    'background-color': '',
                    'color': ''
                });
            }, 15000);
        }
    } else {
        $('#main #left-menu #menu-messages .unread').text('0').hide();
    }

    if ((options.is('option_other_comments_count_refresh_title')) &&
        (!window_focused)) {
        var new_title = document.title.replace(new RegExp('^\\[[0-9]+\\; [0-9]+\\; [0-9]+\\] '), '');
        if ((count_recent > 0) || (count_comments > 0)) {
            new_title = '[' + count_recent + '; ' + count_comments + '; ' + count_messages + '] ' + new_title;
        }
        document.title = new_title;
    }
}

/**
 * Встраиваем посты из Tumblr
 *
 * @param {Object} options
 */
function tumblr_posts_embedding_init(options) {
    if (navigator.userAgent.match(new RegExp('firefox', 'i'))) {
        return;
    }
    const open_tumblr_key = 'fuiKNFp9vQFvjLNvx4sUwti4Yb5yGutBN4Xh10LXZhhRKjWlV4';

    var tumblr_post_count = 0;
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('point-sharp-processed') || $(obj).hasClass('point-sharp-added')
            || ($(obj).parents('.point-sharp-added').length > 0)) {
            return;
        }

        var n;
        if (n = obj.href.match(new RegExp('^https?://([a-z0-9_-]+)\\.tumblr\\.com/post/([0-9]+)', 'i'))) {
            var tweet = document.createElement('div');
            $(tweet).attr({
                'id': 'tumblr-' + tumblr_post_count,
                'data-tumblr-url': obj.href,
                'data-tumblr-login': n[1],
                'data-tumblr-post-id': parseInt(n[2], 10)
            }).addClass('tumblr-embedded').addClass('point-sharp-added').html(
                '<div class="head"><a href="" class="blog_link"></a><div class="blog_title"></div></div>' +
                '<div class="body"></div><div class="tumblr-timestamp"></div>'
            ).hide();
            obj.parentElement.insertBefore(tweet, obj);
            $(obj).addClass('point-sharp-processed');

            $ajax({
                'url': 'https://api.tumblr.com/v2/blog/' + n[1] + '.tumblr.com/posts?id=' +
                       n[2] + '&api_key=' + open_tumblr_key,
                'tumblr_post_count': tumblr_post_count,
                'success': function(ans) {
                    var json = JSON.parse(ans);
                    // Kumashocking костыль
                    var tweet = $('#tumblr-' + this.settings.tumblr_post_count).show()[0];
                    var body = $(tweet).find('.body');

                    if (options.is('option_embedding_tumblr_remove_original_link')) {
                        obj.remove();
                    }

                    $(tweet).find('.head .blog_link').attr({
                        'href': external_url_sanation(json.response.blog.url),
                        'target': '_blank'
                    }).text(json.response.blog.name);
                    $(tweet).find('.head .blog_title').text(json.response.blog.title);

                    var post = json.response.posts[0];
                    $(tweet).find('.tumblr-timestamp').html(
                        '<a href="" target="_blank"></a>'
                    ).find('a').attr('href', obj.href).text((new Date(post.timestamp * 1000)).toLocaleString());
                    if (post.title !== '') {
                        $(tweet).find('.head').append('<h2></h2>').find('h2').text(post.title);
                    }

                    if (post.type == 'quote') {
                        body.append('<div class="quote"></div><div class="quote_source"></div>');
                        body.find('.quote').text(post.text);
                        body.find('.quote_source').text(post.source);
                    } else if (post.type == 'photo') {
                        body.append('<div class="tumblr-text"></div>').find('.tumblr-text').html(post.caption);
                        for (var i = 0; i < post.photos.length; i++) {
                            var photo = post.photos[i];
                            var a = document.createElement('a');
                            var image_link = external_url_sanation(photo.original_size.url)
                                .replace(new RegExp('^http://'), 'https://');
                            $(a).html('<img>').attr({
                                'href': image_link,
                                'data-fancybox-group': 'one_flow_gallery',
                                'target': '_blank'
                            }).addClass('tumblr-image').addClass('postimg').find('img').attr({
                                'src': image_link,
                                'max-width': photo.original_size.width
                            });
                            if (photo.caption.length > 0) {
                                $(a).attr({
                                    'title': photo.caption
                                }).find('img').attr({
                                    'alt': photo.caption
                                });
                            }

                            body.append(a);
                        }
                    } else if (post.type == 'audio') {
                        body.append('<div class="tumblr-text"></div>').find('.tumblr-text').html(post.caption);
                        body.append('<img class="postimg album-art">').find('.album-art').attr({
                            'src': post.album_art,
                            'alt': 'Обложка альбома ' + post.album
                        });
                        body.append('<div class="track-name"></div>').find('.track_name').text(
                            post.artist + ' — ' + post.track_name);
                        body.append('<div class="tumblr-player"></div>').find('.tumblr-player').html(post.player);
                    } else if (post.type == 'text') {
                        body.append('<div class="tumblr-text"></div>').find('.tumblr-text').html(post.body);
                    }

                }
            });

            tumblr_post_count++;
        }
    });
}

/**
 * Посты из Инстаграма
 */
function instagram_posts_embedding_init(current_options) {
    // @todo Поправить insagram_post_count с учётом нового контента
    var insagram_post_count = 0;
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('point-sharp-processed') || $(obj).hasClass('point-sharp-added')) {
            return;
        }

        var n = obj.href.match(new RegExp('^https?://(www\\.)?instagram\\.com/p/([a-z0-9_-]+)/?', 'i'));
        if (!n) {
            return;
        }
        $(obj).addClass('embed-instagram-here').attr({
            'data-instagram-id': n[2]
        });

        $ajax({
            'url': 'https://api.instagram.com/oembed/?url=' + urlencode('http://instagram.com/p/' + n[2] + '/'),
            'success': function(text) {
                var answer = JSON.parse(text);
                var n = this.settings.n;
                $('.post-content a.embed-instagram-here[data-instagram-id]').each(function(num, obj) {
                    var data_instagram_id = $(obj).attr('data-instagram-id');
                    if (data_instagram_id != n[2]) {
                        return;
                    }

                    var new_post = document.createElement('a');
                    $(new_post).attr({
                        'id': 'instagram-' + insagram_post_count,
                        'href': 'http://instagram.com/p/' + n[2] + '/media/?size=l',
                        'title': answer.title,
                        'target': '_blank',
                        'data-fancybox-group': (current_options.is('option_fancybox_bind_images_to_one_flow'))
                            ? 'one_flow_gallery' : '',
                        'data-fancybox-title': (current_options.is('option_fancybox_smart_hints'))
                            ? answer.title : ' ',
                        'data-instagram-id': n[2]
                    }).addClass('instagram-post-embedded').addClass('point-sharp-added').addClass('postimg');

                    var image = document.createElement('img');
                    image.alt = new_post.title;
                    image.src = new_post.href.replace(new RegExp('^http'), 'https');
                    new_post.appendChild(image);

                    obj.parentElement.insertBefore(new_post, obj);
                    $(obj).addClass('point-sharp-processed').removeClass('embed-instagram-here');
                    insagram_post_count++;
                });
            },
            'n': n
        });
    });
}

// noinspection JSUnusedLocalSymbols
/**
 * Парсим все ссылки. Эта функция запускается из page scope
 *
 * @param {Object} options
 */
function youtube_video_embedding(options) {
    var youtube_video_count = 0;
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('point-sharp-processed') || $(obj).hasClass('point-sharp-added')) {
            return;
        }

        var href = obj.href;
        var n;

        if (href.match(new RegExp('^https?://(www\\.)?youtube\\.com/watch', 'i'))) {
            let params = Booru.getGetParamsFromUrl(href);
            let timecode = (typeof params.t !== 'undefined') ? params.t : "0";
            {
                let a;
                if (a = timecode.match(new RegExp('^([0-9]+)m([0-9]+)s$'))) {
                    timecode = parseInt(a[1], 10) * 60 + parseInt(a[2], 10);
                } else {
                    timecode = parseInt(timecode, 10);
                }
            }

            var video = document.createElement('iframe');
            $(video).attr({
                'id': 'tweet-' + youtube_video_count,
                'src': 'https://www.youtube.com/embed/' + params.v + ((timecode > 0) ? '?start=' + timecode : ''),
                'data-youtube-id': params.v,
                'data-fancybox-type': 'youtube'
            }).css({
                'width': 400,
                'height': 300
            }).addClass('youtube-video-embedded');
            obj.parentElement.insertBefore(video, obj);
            $(this).addClass('point-sharp-processed').hide();

            youtube_video_count++;
        } else if (n = href.match(new RegExp('^https?://(www\\.)?youtu\\.be/([0-9a-z_-]+)', 'i'))) {
            let params = Booru.getGetParamsFromUrl(href);
            let timecode = (typeof params.t !== 'undefined') ? params.t : "0";
            {
                let a;
                if (a = timecode.match(new RegExp('^([0-9]+)m([0-9]+)s$'))) {
                    timecode = parseInt(a[1], 10) * 60 + parseInt(a[2], 10);
                } else {
                    timecode = parseInt(timecode, 10);
                }
            }

            video = document.createElement('iframe');
            $(video).attr({
                'id': 'tweet-' + youtube_video_count,
                'src': 'https://www.youtube.com/embed/' + n[2] + ((timecode > 0) ? '?start=' + timecode : ''),
                'data-youtube-id': n[2],
                'data-fancybox-type': 'youtube'
            }).css({
                'width': 400,
                'height': 300
            }).addClass('youtube-video-embedded');
            obj.parentElement.insertBefore(video, obj);
            $(this).addClass('point-sharp-processed').hide();

            youtube_video_count++;
        }
    });
}

/**
 * @param {OptionsManager} current_options
 *
 * Инициализация Bootstrap Markdown
 * https://github.com/toopay/bootstrap-markdown
 */
function visual_editor_init(current_options) {
    $('#new-post-form, .post-content .reply-form, #post-edit-form .post-content .text').addClass('bootstrapped');
    // Init Bootstrap Markdown
    $('#new-post-form #text-input, .post-content .reply-form textarea, #post-edit-form .post-content #text-input').markdown(
        get_markdown_init_settings(current_options));
    $('.post-content .reply-form textarea').css({'height': '15em'});
}

/**
 * @param {OptionsManager} current_options
 * @return {{language: string, footer: string, onPreview: onPreview, onChange: onChange}}
 */
function get_markdown_init_settings(current_options) {
    let MarkDownSettings = {
        'language': 'ru',
        'footer': '...',
        'onPreview': function(e) {
            return parse_markdown(e.getContent());
        },
        'onChange': function(e) {
            var text = 'Длина: ' + e.getContent().length + ' сим';
            let btn_meta_schemas
                = e.$editor.find('[data-handler="bootstrap-markdown-cmdSetBooruMetaSchema"]').parents('.btn-group').first();

            // Бурятники
            var booru_pictures_count = 0;
            var booru_pictures_repeat_count = 0;
            let booru_pictures_count_could_be_meta = 0;
            var links = [];
            var strings = e.getContent().split("\n");
            for (var i = 0; i < strings.length; i++) {
                for (var key in Booru.services) {
                    var n = strings[i].replace(new RegExp('^[ \\t]+'), '').match(Booru.services[key].mask);
                    if (n === null) {continue;}

                    booru_pictures_count++;
                    var u = true;
                    for (var j = 0; j < links.length; j++) {
                        if (links[j] == n[0]) {
                            booru_pictures_repeat_count++;
                            u = false;
                            break;
                        }
                    }
                    if (u) {links.push(n[0]);}

                    if (typeof Booru.services[key].template !== 'undefined') {
                        booru_pictures_count_could_be_meta++;
                    }
                }
            }
            if (booru_pictures_count > 0) {
                text += '; Количество booru-картинок: ' + booru_pictures_count;
                if (booru_pictures_repeat_count > 0) {
                    text += '; Количество повторов картинок: ' + booru_pictures_repeat_count;
                }
            }
            if (booru_pictures_count_could_be_meta > 0) {
                btn_meta_schemas.show();
            } else {
                btn_meta_schemas.hide();
            }

            e.$editor.find('.md-footer').text(text);
        }
    };
    if (current_options.is('option_booru_schema_fixes')) {
        //
        MarkDownSettings.additionalButtons = [{
            name: "groupCustom",
            data: [{
                name: "cmdSetBooruMetaSchema",
                title: "Меняем прямые ссылки на Booru на мета-схемы",
                icon: "glyphicon glyphicon-eye-open",
                callback: function(e) {
                    let content = e.getContent();
                    if (content.match(new RegExp('https?://[a-z0-9.]+/\\S+', 'ig')).length == 0) {
                        return;
                    }

                    // Replace selection with some drinks
                    let selected = e.getSelection();
                    let text_before = '';
                    let text_in;
                    let text_after = '';
                    if (selected.length == 0) {
                        text_in = content;
                    } else {
                        text_before = content.substr(0, selected.start);
                        text_in = content.substr(selected.start, selected.length);
                        text_after = content.substr(selected.start + selected.length);
                    }
                    // Заменяем ссылки
                    {
                        let raw_links = text_in.match(new RegExp('https?://[a-z0-9.]+/\\S+', 'ig'));
                        if (raw_links.length == 0) {
                            return;
                        }

                        for (let original_url of raw_links) {
                            for (var key in Booru.services) {
                                if (typeof Booru.services[key].template === 'undefined') {
                                    continue;
                                }
                                let service = Booru.services[key];

                                let n = original_url.match(service.mask);
                                if (n === null) {continue;}

                                let id;
                                if (typeof(service.matchNumber) === 'number') {
                                    id = n[service.matchNumber];
                                } else {
                                    let url_params = Booru.getGetParamsFromUrl(original_url);
                                    if ((typeof service.get_params !== 'undefined') &&
                                        (typeof service.get_params.id !== 'undefined')) {
                                        id = url_params[service.get_params.id];
                                    } else {
                                        id = url_params.id;
                                    }
                                }

                                let new_url = key + '://' + id;
                                text_in = text_in.replace(original_url, new_url);
                                break;
                            }
                        }
                    }

                    // Меняем контент
                    e.setContent(text_before + text_in + text_after);
                }
            }]
        }];
    }

    return MarkDownSettings;
}

/**
 * Создаём форму на страницу и кидаем её
 *
 * @param url Урл, на который мы кидаем запрос
 * @param data
 * @param method Метод запроса
 */
function smart_form_post(url, data, method) {
    if (typeof(method) == 'undefined') {
        method = 'post';
    }

    console.log('Smart Form Post:', url, data, method);
    var form = document.createElement('form');
    $(form).attr({
        'action': url,
        'method': method
    }).hide();
    for (var key in data) {
        var input = document.createElement('input');
        $(input).attr({
            'name': key,
            'value': data[key]
        });
        form.appendChild(input);
    }

    document.body.appendChild(form);
    $(form).submit();
}


/**
 * Улучшенная система NSFW
 */
function smart_nsfw_init(options) {
    for (var set_id = 1; set_id <= 4; set_id++) {
        if (!options.is('option_nsfw' + set_id)) {
            continue;
        }

        var ar = options.get('option_nsfw' + set_id + '_tags_set').split(',');
        var tag_selector = '';
        var top_post_selector = '';
        for (var i = 0; i < ar.length; i++) {
            var n;
            if (n = ar[i].match(new RegExp('^ *(@([a-z0-9_-]+):?)?(.+)? *$', 'i'))) {
                if ((typeof(n[3]) == 'undefined') && (typeof(n[2]) == 'undefined')) {continue;}
                var author_id = n[2];
                var tag_id = n[3];

                var inner_selector =
                    ((typeof(tag_id) !== 'undefined') ? '.post-tag-' + tag_sanation(tag_id) : '') +
                    ((typeof(author_id) !== 'undefined') ? '[data-author-id="' + author_id.toLowerCase() + '"]' : '');
                tag_selector += ',.content-wrap > div.post' + inner_selector;
                top_post_selector += ',#top-post' + inner_selector;
            }
        }
        tag_selector = tag_selector.substr(1);
        top_post_selector = top_post_selector.substr(1);

        if (tag_selector == '') {
            console.info('NSFW set #', set_id, '. Tag selector is null');
            continue;
        }

        if (options.is('option_nsfw' + set_id + '_hide_posts')) {
            // Просто прячем посты
            var len = $(tag_selector).each(function() {
                $(this).addClass('hide-nsfw-posts');
            }).length;
            console.log('Hide NSFW posts. ', len, ' hided');
        } else if (options.is('option_nsfw' + set_id + '_black_ant')) {
            len = $(tag_selector).each(function() {
                $(this).addClass('black-ant');
            }).length;
            console.log('Add black ants to posts. ', len, ' anted');
        } else if (options.is('option_nsfw' + set_id + '_blur_posts_entire')) {
            // Размываем посты полностью
            len = $(tag_selector).each(function() {
                $(this).addClass('blur-nsfw-entire');
            }).length;
            console.log('Bluring NSFW posts. ', len, ' blurred');
        } else if (options.is('option_nsfw' + set_id + '_blur_posts_images')) {
            // Размываем изображения
            len = $(tag_selector).each(function() {
                $(this).addClass('blur-nsfw-images');
            }).length;
            console.log('Bluring images in NSFW posts. ', len, ' posts blurred');
        }

        if ($('#comments').length > 0) {
            // Мы внутри поста
            if ($(top_post_selector).length == 0) {
                continue;
            }

            // Размываем каменты
            if (options.is('option_nsfw' + set_id + '_blur_comments_entire')) {
                // Блюрим каменты полностью
                console.log('Bluring comments');
                $('#comments').addClass('blur-nsfw-entire');
            } else if (options.is('option_nsfw' + set_id + '_blur_comments_black_ant')) {
                // Превращаем картинки комментариев в муравьёв
                console.log('Black anted comments');
                $('#comments').addClass('black-ant');
            } else if (options.is('option_nsfw' + set_id + '_blur_comments_images')) {
                // Блюрим картинки в каментах полностью
                console.log('Bluring images in comments');
                $('#comments').addClass('blur-nsfw-images');
            }
        } else {
            $(tag_selector).find('a.postimg:not(.youtube)').attr('data-fancybox-group', 'hidden-images');
        }

    }

}

/**
 * Сворачивание постов. Инициализация
 */
function wrap_posts_init(options) {
    if ($('#comments').length > 0) {
        return;
    }

    var body_selector = (navigator.appVersion.match(/.*chrome.*/i) == null) ? 'html' : 'body';

    // Сворачивание всех длинных простыней
    if (options.is('option_wrap_long_posts')) {
        $('.content-wrap').addClass('wrap-long-posts').find('div.post').each(function() {
            var div = document.createElement('div');
            $(div).addClass('wrap-splitter').on('click', function() {
                var this_post = $(this).parents('.post').first();
                if (this_post.hasClass('post-manual-unwrapped')) {
                    this_post.removeClass('post-manual-unwrapped');
                    $(body_selector).animate({
                        'scrollTop': Math.min(this_post.offset().top + 900, $(body_selector).prop('scrollTop'))
                    }, 500);
                } else {
                    this_post.addClass('post-manual-unwrapped');
                }
            });

            var tags_element = $(this).find('.tags')[0];
            if (typeof(tags_element) == 'undefined') {
                tags_element = $(this).find('.clearfix')[0];
            }
            try {
                tags_element.parentElement.insertBefore(div, tags_element);
            } catch (e) {
                console.error('Error in tags_element: ', e);
            }
        });

        // Удаляем wrap-splitter на странице редактирования поста
        $('#post-edit-form .wrap-splitter').remove();

        // @todo Переписать это!
        setInterval(wrap_posts_remove_unused_wrap_splitters, 3000);
        wrap_posts_remove_unused_wrap_splitters();
    }

    // Скрытие постов руками
    if ($('#comments').length > 0) {return;}

    // Добавляем кнопки
    $('.content-wrap > div.post').each(function() {
        var hide_button = document.createElement('a');
        // Вешаем лисенеры
        $(hide_button).addClass('post-manual-hide-button').on('click', function() {
            var this_post = $(this).parents('.post').first();
            var post_id = this_post.attr('data-id');

            local_storage_get('post_manual_hidden_list', function(list) {
                if ((typeof(list) == 'undefined') || (list === null)) {
                    list = [];
                } else {
                    var index = list.indexOf(post_id);
                    if (index > -1) {
                        list.splice(index, 1);
                    }
                }

                if (!this_post.hasClass('post-manual-hidden')) {
                    list.push(post_id);
                }

                // Сохраняем
                local_storage_set({'post_manual_hidden_list': list}, function() {});
                this_post.toggleClass('post-manual-hidden');
            });
        }).attr({'href': 'javascript:'});

        // Добавляем кнопку
        $(this).find('.post-content a.user').first().after(hide_button);
    });

    // Скрываем посты, список коих взят из Локал Сторожа
    local_storage_get('post_manual_hidden_list', function(list) {
        if ((typeof(list) == 'undefined') || (list === null)) {
            local_storage_set({'post_manual_hidden_list': []});
            return;
        }

        for (var index in list) {
            $('.content-wrap > .post[data-id="' + list[index] + '"]').addClass('post-manual-hidden');
        }
    });
}

/**
 * Скрываем неиспользующися Wrap Splitter'ы у постов
 */
function wrap_posts_remove_unused_wrap_splitters() {
    $('.content-wrap > div.post').each(function() {
        if (parseInt($(this).find('.text-content').prop('scrollHeight'), 10) < 1000) {
            $(this).find('.wrap-splitter').hide();
        } else {
            $(this).find('.wrap-splitter').show();
        }
    });
}


/**
 * Маркируем каменты от топик-стартера
 */
function comments_mark_topic_starter() {
    if ($('#comments').length == 0) {return;}

    var topic_starter_nick = $('.content-wrap > div.post a.author').first().text().toLowerCase();
    $('#comments .post[data-author-id="' + topic_starter_nick + '"]').addClass('comment-topic-starter');
}

/**
 * Мой ник
 *
 * @returns {string}
 */
function get_my_nick() {
    return $('#name h1').text().toLowerCase();
}

/**
 * Все исходящие ссылки должны быть с target=_blank
 */
function external_links_target_blank() {
    $('.post-content a').each(function(num, obj) {
        var n;
        if (n = obj.href.match(new RegExp('^https?://(.+?)/', 'i'))) {
            if (n[1].match(new RegExp('^(.+?\\.)?point\\.im$'))) {
                return;
            }

            obj.target = '_blank';
        }
    });
}

/**
 * Санация урлов перед вставкой
 *
 * @param {String} url
 *
 * @returns {String}
 */
function external_url_sanation(url) {
    if (!url.match(new RegExp('^(http|https|ftp)://'))) {
        return '';
    }

    return url;
}

/**
 * Parse markdown code
 *
 * @param text
 * @returns {string}
 */
function parse_markdown(text) {
    var html = '';
    var a = text.split("\n");
    for (var i = 0; i < a.length; i++) {
        html += window.markdown.toHTML(a[i]);
    }

    return html;
}

function set_left_menu_default_new() {
    var my_nick = get_my_nick();
    // @arts, я ебал тебя в рот. Делать несколько одинаковых id...
    $('#left-menu #menu-recent')[0].href = 'https://' + my_nick + '.point.im/recent/unread';
    $('#left-menu #menu-comments')[0].href = 'https://' + my_nick + '.point.im/comments/unread';

    if (document.location.pathname.toLowerCase() == '/recent/unread') {
        $('#subheader-wrap #subheader a').first().attr({
            'href': 'https://' + my_nick + '.point.im/recent'
        });
    }
}

function tag_sanation(tag_name) {
    return tag_name.split(' ').join('_');
}

var gdrive_id = 0;

function parse_gdrive_import(current_options, obj, num) {
    var parent_width = $(obj.parentElement).width();
    if (parent_width === 0) {
        if (num < 5) {
            setTimeout(function() {
                parse_gdrive_import(current_options, obj, num + 1);
            }, 500);
            return;
        }
    }

    var n;
    if (n = obj.href.match(new RegExp('^https?://(docs|drive)\\.google\\.com/file/d/([a-z0-9_-]+)', 'i'))) {
        // Просто файлы
        var iframe = document.createElement('iframe');
        $(iframe).attr({
            'src': 'https://drive.google.com/file/d/' + n[2] + '/preview',
            'allowfullscreen': 'true',
            'data-drive-id': n[2],
            'data-drive-type': 'file'
        }).css({
            'max-width': '640px',
            'border': 'none',
            'width': Math.floor(parent_width * 0.9),
            'height': Math.ceil(parent_width * 0.9 * 480 / 640)
        }).addClass('embedded_gdrive').addClass('embedded_gdrive_' + gdrive_id).addClass('point-sharp-added');
        gdrive_id++;

        obj.parentElement.insertBefore(iframe, obj);
        $(obj).addClass('point-sharp-processed');

        if (current_options.is('option_embedding_gdrive_remove_original_link', false)) {
            $(obj).hide();
        }

        return;
    }

    if (obj.href.match(new RegExp('^https?://(docs|drive)\\.google\\.com/(folderview|embeddedfolderview)', 'i'))) {
        iframe = document.createElement('iframe');
        var parsed_url = Booru.getGetParamsFromUrl(obj.href);

        $(iframe).attr({
            'src': 'https://drive.google.com/embeddedfolderview?id=' + parsed_url.id + '#grid',
            'allowfullscreen': 'true',
            'data-drive-id': parsed_url.id,
            'data-drive-type': 'folder'
        }).css({
            'max-width': '640px',
            'border': 'none',
            'width': Math.floor(parent_width * 0.9),
            'height': Math.ceil(parent_width * 0.9 * 480 / 640)
        }).addClass('embedded_gdrive').addClass('embedded_gdrive_' + gdrive_id).addClass('point-sharp-added');
        gdrive_id++;

        obj.parentElement.insertBefore(iframe, obj);
        $(obj).addClass('point-sharp-processed');

        if (current_options.is('option_embedding_gdrive_remove_original_link', false)) {
            $(obj).hide();
        }
    }
}

function parse_gdrive(current_options) {
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('point-sharp-processed') || $(obj).hasClass('point-sharp-added')) {
            return;
        }

        if (!obj.href.match(new RegExp('^https?://(docs|drive)\\.google\\.com/', 'i'))) {
            return;
        }

        parse_gdrive_import(current_options, obj, 0);
    });
}

function set_post_comments_read() {
    setInterval(function() {
        $ajax({
            'url': '//' + window.location.host + window.location.pathname + '?setread' + Math.random()
        });
    }, 60000);
}

/**
 * Растягиваем Vimeo на всю ширину
 */
function update_block_vimeo_width() {
    $('.post-content iframe').each(function(num, obj) {
        if (obj.src.match(new RegExp('^https?://player\\.vimeo\\.com/', 'i'))) {
            $(obj).css({'width': '95%'}).height(
                Math.ceil($(obj).width() * 9 / 16)
            );
        }
    });
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
        if ($(obj).hasClass('point-sharp-processed') || $(obj).hasClass('point-sharp-added')) {
            return;
        }

        var href = obj.href;
        var n;

        if (n = href.match(new RegExp('^https?://(www\\.)?twitter\\.com/[^/]+/status/([0-9]+)', 'i'))) {
            var tweet = document.createElement('div');
            $(tweet).attr({
                'id': 'tweet-' + twitter_tweet_count,
                'data-tweet-id': n[2]
            }).addClass('twitter-tweet-embedded');
            obj.parentElement.insertBefore(tweet, obj);
            $(obj).addClass('point-sharp-processed');

            window.twttr.widgets.createTweet(
                n[2],
                tweet, {
                    'lang': 'ru'
                }
            );
            twitter_tweet_count++;
        }
    });
}

function parse_jsfiddle_set_interval() {
    setInterval(function() {
        $('.content-wrap iframe').each(function(num, obj) {
            if (!obj.src.match(new RegExp('^https://(www\\.)?jsfiddle\\.net/.+?/embedded/$'))) {
                return;
            }

            var new_height = Math.max(Math.min(400, $(obj).height()), 200);
            $(obj).height(new_height).addClass('point-sharp-added');
        });
    }, 100);
}

/**
 * Встраиваем JSFiddle
 *
 * @param {OptionsManager} current_options
 */
function parse_jsfiddle(current_options) {
    if (navigator.userAgent.match(new RegExp('firefox', 'i'))) {
        return;
    }
    var reg = new RegExp('^https?://(www\\.)?jsfiddle\\.net/([a-z0-9]+)/(([0-9]+)/)?', 'i');
    var used_keys = [];
    $('script[data-jsfiddle-full-id]').each(function(num, obj) {
        used_keys.push($(obj).attr('data-jsfiddle-full-id'));
    });

    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('point-sharp-processed') || $(obj).hasClass('point-sharp-added')) {
            return;
        }

        var n = obj.href.match(reg);
        if (n === null) {
            return;
        }
        var key = n[2] + ((typeof n[4] != 'undefined') ? '/' + n[4] : '');
        // @hint Мы храним использованные ключи и не вставляем тот же контент второй раз из-за ошибки в JSFiddle
        for (var i = 0; i < used_keys.length; i++) {
            if (used_keys[i] == key) {
                return;
            }
        }
        used_keys.push(key);

        var embedding_script_url = 'https://jsfiddle.net/' + key + '/embed/';
        var script = document.createElement('script');
        $(script).attr({
            'async': 'async',
            'src': embedding_script_url,
            'data-jsfiddle-id': n[2],
            'data-jsfiddle-revision': ((typeof n[4] != 'undefined') ? n[4] : ''),
            'data-jsfiddle-full-id': key
        }).addClass('embedded_jsfiddle').addClass('point-sharp-added');

        obj.parentElement.insertBefore(script, obj);
        $(obj).addClass('point-sharp-processed');

        if (current_options.is('option_embedding_jsfiddle_remove_original_link', false)) {
            $(obj).hide();
        }
    });
}

/**
 * Исправляем схему
 */
function fix_meta_schema_in_links() {
    let protocols = [];
    for (let schema in Booru.services) {
        if (typeof Booru.services[schema].template !== 'undefined') {
            protocols.push(schema + ':');
        }
    }

    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('point-sharp-processed') || $(obj).hasClass('point-sharp-added')) {
            return;
        }

        if (protocols.indexOf(obj.protocol) == -1) {
            return;
        }
        let protocol = obj.protocol.substr(0, obj.protocol.length - 1);
        let outer_site_id = obj.href.substr(obj.href.indexOf('//') + 2);
        $(obj).attr({
            'data-schema': protocol,
            'data-outer-site-id': outer_site_id,
        });
        // noinspection JSUndefinedPropertyAssignment
        obj.href = Booru.services[protocol].template.replace('%s', outer_site_id);
    });
}

function links_https_everywhere_point() {
    $('a').each(function(num, obj) {
        if ((obj.protocol == 'https:') || !obj.host.match(new RegExp('^([0-9a-z]+\\.)?point\\.im$'))) {
            return;
        }

        let postfix = obj.href.substr(obj.href.indexOf('//') + 2);
        obj.href = 'https://' + postfix;
    });
}

function links_https_everywhere_external() {
    let full_domains = [];
    {
        let domains = ['danbooru.donmai.us', 'yandex.ru', 'google.com', 'gelbooru.com', 'e621.net', 'youtube.com',
                       'chan.sankakucomplex.com', 'safebooru.org'];
        let r = new RegExp('\\.', 'g');
        for (let domain of domains) {
            full_domains.push(domain);
            if (domain.match(r).length == 1) {
                full_domains.push('www.' + domain);
            }
        }
    }

    $('a').each(function(num, obj) {
        if ((obj.protocol == 'https:') || (full_domains.indexOf(obj.host) == -1)) {
            return;
        }

        let postfix = obj.href.substr(obj.href.indexOf('//') + 2);
        obj.href = 'https://' + postfix;
    });
}

function disable_native_fancybox() {
    // @hint Это не работает в Fx, там другая система
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('point-sharp-processed') || $(obj).hasClass('point-sharp-added')) {
            return;
        }

        $(obj).find('.postimg').off('click');
    });
}
