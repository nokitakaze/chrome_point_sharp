/**
 * Основной файл для включения в страницу
 */

console_group('point-sharp');
console.info("shared_code.js", new Date());

$(document).on('ready', function() {
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
 * @param {OptionsManager} options Опции из OptionManager
 */
function pimp_my_page(options) {
    console.log("pimp_my_page start", new Date());
    $('#point-plus-debug').attr({
        'data-point-plus-version': options.version()
    }).text('Point# ' + options.version() + ' loading...');

    // Показываем иконку приложения в адресной строке
    urlbar_icon_show();

    // Set Message Listener
    set_message_listener(options);

    // Проставляем теги у постов
    create_tag_system();

    // Основное встраивание контента
    remark_entire_page(options);

    // Visual editor
    if (options.is('option_visual_editor_post')) {
        visual_editor_init(options);
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
        smart_websocket_init(options);
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

    // Highlight post with new comments
    if (options.is('option_other_hightlight_post_comments')) {
        setTimeout(mark_unread_post, 0);
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

    // Левое меню по умолчанию отправляет на новые
    if (options.is('option_other_left_menu_default_new')) {
        set_left_menu_default_new();
    }

    // Каменты
    if (($('#comments').length > 0) && (options.is('option_set_post_comments_read'))) {
        set_post_comments_read();
    }

    // Выполняем последние платформозависимые функции
    disconnected_status_init();

    // Закрываем значок
    $('#point-plus-debug').fadeOut(500);
    console.log("pimp_my_page stop");
}
