/**
 * Функции для включения в основную страницу
 *
 * ПЛАТФОРМОНЕЗАВИСИМЫЙ ФАЙЛ
 */


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
        } else if (n =
                   href.match(new RegExp('^https?\\://(www\\.)?gelbooru\\.com\\/index\\.php\\?page\\=post&s\\=view&id=([0-9]+)',
                       'i'))) {
            var image = create_image('gelbooru', n[2]);
            obj.parentElement.insertBefore(image, obj);
            booru_picture_count++;
        } else if (n =
                   href.match(new RegExp('^https?\\://(www\\.)?safebooru\\.org\\/index\\.php\\?page\\=post&s\\=view&id=([0-9]+)',
                       'i'))) {
            var image = create_image('safebooru', n[2]);
            obj.parentElement.insertBefore(image, obj);
            booru_picture_count++;
        } else if (n =
                   href.match(new RegExp('^https?\\://(www\\.)?([a-z0-9-]+\\.)?deviantart\\.com\\/art/[0-9a-z-]+?\\-([0-9]+)(\\?.+)?$',
                       'i'))) {
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
        } else if (n =
                   href.match(new RegExp('^https?://(www\\.)?pixiv\\.net\\/member_illust\\.php\\?mode\\=medium\\&illust_id\\=([0-9]+)',
                       'i'))) {
            var image = create_image('pixiv', n[2]);
            obj.parentElement.insertBefore(image, obj);
            booru_picture_count++;
        } else if (n = href.match(new RegExp('^http\\:\\/\\/anime\\-pictures\\.net\\/pictures\\/view_post\\/([0-9]+)', 'i'))) {
            var image = create_image('animepicturesnet', n[1]);
            obj.parentElement.insertBefore(image, obj);
            booru_picture_count++;
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
        'id':    'booru_pic_' + booru_picture_count,
        'title': domain + ' image #' + id,
        'target': '_blank'
    });

    var image = document.createElement('img');
    image.alt = a.title;
    image.src = a.href;
    a.appendChild(image);

    return a;
}

/**
 * Помечаем непрочитанные посты более видимо чем каким-то баджем
 */
function mark_unread_post() {
    // Эта часть написана @RainbowSpike
    var divs = $(".content-wrap > .post").css({'padding-left': '2px'}); // массив постов
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

        if (obj.href.match(new RegExp('^https?:\\/\\/([a-z0-9.-]+)\\/[a-z0-9_\\/.%-]+\\.webm(\\?.+)?$', 'i'))) {
            var player = document.createElement('video');
            // Там может быть не vp8+vorbis, но мы этого никак не узнаем
            $(player).html('<source src="" type=\'video/webm; codecs="vp8, vorbis"\' />').
                attr('controls', 'controls').css({
                    'display': 'block',
                    'max-width': '95%'
                }).addClass('parsed-webm-link').find('source').attr('src', obj.href);

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
        var n;

        if (n =
            href.match(new RegExp('^https?:\\/\\/([a-z0-9.-]+)\\/[a-z0-9_\\/.%-]+\\.(webm|avi|mp4|mpg|mpeg)(\\?.+)?$', 'i'))) {
            var player = document.createElement('video');
            var mime = video_extension_to_mime(n[2]);
            $(player).html('<source src="" type="" />').attr('controls', 'controls').css({
                'display': 'block',
                'max-width': '95%'
            }).addClass('parsed-webm-link').find('source').attr({
                'src': href,
                'type': mime
            });

            obj.parentElement.insertBefore(player, obj);

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
        if ($(obj).hasClass('booru_pic')) {
            return;
        }

        var href = obj.href;
        var n = null;

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
                $(e1).addClass('authors_unique_count').text(answer.list[id].count_comment_unique).attr('title',
                    'Количество комментаторов');
                postid.appendChild(e1);

                var e2 = document.createElement('span');
                $(e2).addClass('recommendation_count').text('~' + answer.list[id].count_recommendation).attr('title',
                    'Количество рекомендаций. Работает криво, спасибо @arts\'у за это');
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
            $(obj).addClass('pleercom_original_link_' + n[1]);
            obj.parentElement.insertBefore(player_div, obj);
            create_pleercom_ajax(n[1], current_options);
        }
    });
}

function create_pleercom_ajax(id, current_options) {
    $ajax({
        'url': '//pleer.com/site_api/files/get_url',
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

            if (current_options.is('option_embedding_pleercom_orig_link', false)) {
                $('.pleercom_original_link_' + this.settings.pleer_id).hide();
            }
        },
        'error': function() {
            console.log('Can not get pleer.com url for ', id);
            var current_pleer_id = this.settings.pleer_id;
            setTimeout(function() {
                create_pleercom_ajax(current_pleer_id, current_options);
            }, 1000);
        }

    });

}

/**
 * Проставляем теги и имена пользователей у постов
 */
function create_tag_system() {
    $('.content-wrap > .post').each(function() {
        var tags = $(this).find('div.tags a.tag');
        for (var i = 0; i < tags.length; i++) {
            var tag_name = $(tags[i]).html().toLowerCase();
            $(this).addClass('post-tag-' + tag_name);
        }

        // @todo Имена пользователей

        // @todo Свои посты
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
        var this_top_px = Math.floor($(posts[i]).offset().top);
        if (this_top_px > scroll_current) {
            $('body').animate({
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
            }).addClass('embeded_video').addClass('embeded_video_' + n[1]);

            obj.parentElement.insertBefore(player, obj);

            if (current_options.is('option_embedding_coubcom_orig_link', false)) {
                $(obj).hide();
            }
        }
    });
}

// Правим хинт в FancyBox
function fancybox_set_smart_hints() {
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
    $('.aside .aside-content #counters')[0].parentElement.
        insertBefore(current_user_hint_block, $('.aside .aside-content #counters')[0]);
    $(current_user_hint_block).addClass('current-user-hint');

    // Рисуем кнопки управления
    var buttons_block = document.createElement('div');
    $(buttons_block).addClass('buttons').
        html('<a class="edit" href="javascript:" title="Редактировать"></a>');
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

// Сохраняем новый хинт
function hints_save_new_hint(username, new_hint) {
    local_storage_get('point_user_hints', function(point_user_hints) {
        point_user_hints[username] = new_hint;
        local_storage_set({'point_user_hints': point_user_hints});
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
        var count_recent = (a.length == 0) ? 0 : parseInt(a.text());
        var count_comments = (b.length == 0) ? 0 : parseInt(b.text());

        console.log('Comments: ', count_comments, ', Recent: ', count_recent);
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
 *
 * Workaround для Google Chrome. В Fx этот workaround ничего не ломает, поэтому оставил так
 */
function twitter_tweet_embedding_init() {
    // Чёрная магия. Выбираемся из манямирка, прихватив с собой пару сраных функций
    // https://developer.chrome.com/extensions/content_scripts Isolated World
    var e = document.createElement("script");
    e.appendChild(document.createTextNode(twitter_tweet_embedding_wait_for_ready_injected.toString() +
                                          twitter_tweet_embedding_parse_links.toString() +
                                          'twitter_tweet_embedding_wait_for_ready_injected();'));
    document.head.appendChild(e);

    // Встраиваем скрипт так, как описано в best twitter practice https://dev.twitter.com/web/javascript/loading
    window.twttr = (function(d, s, id) {
        var t, js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
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
 * Посты из Инстаграма
 */
function instagram_posts_embedding_init(current_options) {
    var insagram_post_count = 0;
    $('.post-content a').each(function(num, obj) {
        if ($(obj).hasClass('booru_pic')) {
            return;
        }

        var href = obj.href;
        var n;

        if (n = href.match(new RegExp('^https?://(www\\.)?instagram\\.com/p/([a-z0-9]+)/?', 'i'))) {
            $ajax({
                'url': 'https://api.instagram.com/oembed?url=' + urlencode('http://instagram.com/p/' + n[2] + '/'),
                'success': function(text) {
                    var answer = JSON.parse(text);
                    var new_post = document.createElement('a');
                    $(new_post).attr({
                        'id': 'instagram-' + insagram_post_count,
                        'href': answer.thumbnail_url,
                        'title': answer.title,
                        'target': '_blank',
                        'data-fancybox-group': (current_options.is('option_fancybox_bind_images_to_one_flow'))
                            ? 'one_flow_gallery' : '',
                        'data-fancybox-title': (current_options.is('option_fancybox_smart_hints'))
                            ? answer.title : ' '
                    }).addClass('instagram-post-embedded').addClass('postimg');

                    var image = document.createElement('img');
                    image.alt = new_post.title;
                    image.src = new_post.href;
                    new_post.appendChild(image);

                    obj.parentElement.insertBefore(new_post, obj);
                    insagram_post_count++;
                }
            });

        }
    });
}

/**
 * Инициализация MarkDown Editor
 */
function visual_editor_init() {
    // Init MarkItUp
    $('#new-post-form #text-input, .post-content .reply-form textarea, #post-edit-form .post-content #text-input').markdown({
        'language': 'ru'
    });
    $('#new-post-form, .post-content .reply-form, #post-edit-form .post-content .text').addClass('bootstrapped');
    $('.post-content .reply-form textarea').css({'height': '10em'});

    /*
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
     */

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
            ar[i] = ar[i].replace(new RegExp('^ *(.*) *$'), '$1');
            tag_selector += (ar[i].length > 0) ? ',.post-tag-' + ar[i] : '';
            top_post_selector += (ar[i].length > 0) ? ',#top-post.post-tag-' + ar[i] : '';
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
            var len = $(tag_selector).each(function() {
                $(this).addClass('black-ant');
            }).length;
            console.log('Add black ants to posts. ', len, ' anted');
        } else if (options.is('option_nsfw' + set_id + '_blur_posts_entire')) {
            // Размываем посты полностью
            var len = $(tag_selector).each(function() {
                $(this).addClass('blur-nsfw-entire');
            }).length;
            console.log('Bluring NSFW posts. ', len, ' blurred');
        } else if (options.is('option_nsfw' + set_id + '_blur_posts_images')) {
            // Размываем изображения
            var len = $(tag_selector).each(function() {
                $(this).addClass('blur-nsfw-images');
            }).length;
            console.log('Bluring images in NSFW posts. ', len, ' posts blurred');
        }

        if ($('#comments').length > 0) {
            // Размываем каменты
            if ($(top_post_selector).length == 0) {
                continue;
            }

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