// Ставим хандлер
function set_links_preview_handler() {
    // Создаём контент-блок
    var content_block = document.createElement('div');
    document.body.appendChild(content_block);
    $(content_block).hide().addClass('preview_content_block').
        on('mouseenter', preview_contentblock_on_mouse_in).
        on('mouseleave', preview_contentblock_on_mouse_out);

    var links_count = 0;
    // Вешаем хандлер
    $('.post-content a:not(.no-links-preview):not(.booru_pic):not(.postimg)').each(function (num, obj) {
        var href = obj.href;
        if (n = href.match(new RegExp('^(https?):\\/\\/([a-z0-9.-]+)\\/([a-z0-9_\\/.%-]+)(\\?.*)?$', 'i'))) {
            var domain = n[2];
            var path = n[3];
            var params = n[4];
            if (domain.match(new RegExp('^(.+\\.)?point\\.im', 'i'))) {
                return;
            }

            $(obj).attr('data-preview-content-id', links_count).
                on('mouseenter', preview_link_on_mouse_in).
                on('mouseleave', preview_link_on_mouse_out);
            links_count++;
        }
    });

    // Вешаем проверку на потеряный фокус
    setInterval(check_lost_focus, 100);
}

// Ссылка получила фокус
var preview_link_current_id = null;// Номер ссылки
var preview_lost_focus_time = null;// Время потери фокуса
var preview_content_data = [];
var preview_link_mouse_in_count = 0;// Номер ивента наведения мыши
function preview_link_on_mouse_in() {
    var this_id = parseInt($(event.currentTarget).attr('data-preview-content-id'));

    if (preview_link_current_id == this_id) {
        // Вернули фокус
        preview_lost_focus_time = null;
        return;
    }

    preview_link_current_id = this_id;
    setTimeout(new Function('preview_show_link(' + preview_link_mouse_in_count + ');'), 2000);
    preview_link_mouse_in_count++;
}

// Можно пробовать проверять и показывать контент
function preview_show_link(mouse_event_id) {
    if (preview_lost_focus_time !== null) {
        // Фокус потерян
        return;
    }
    if (preview_link_mouse_in_count !== mouse_event_id) {
        // Навели мышь на другой элемент
        return;
    }

    var url = $('post-content a[data-preview-content-id=' + preview_link_current_id + ']').attr('href');

    // Пытаемся найти в data существующий элемент
    for (var i = 0; i < preview_content_data.length; i++) {
        if (preview_content_data[i].url == url) {
            preview_show_content_in_block(i);
            return;
        }
    }

    // Дёргаем Аякс с данными по элементу
    $ajax({
        'url': 'https://api.kanaria.ru/point/link_preview.php?url=' + urlencode(url),
        'get_url': url,
        'link_id': preview_link_current_id,
        'mouse_event_id': mouse_event_id,
        'success': function (data) {
            // Сохраняем данные
            preview_content_data.push({
                'url': this.settings.url,
                'title': data.title,
                'view1280': data.view1280,
                'view375': data.view375
            });

            // Показываем
            preview_show_content_in_block(preview_content_data.length - 1);
        },
        'error': function () {
            preview_show_link(this.settings.mouse_event_id);
        }
    });
}

function preview_show_content_in_block(datum_id) {
    // @todo Выбираем положение
    // @todo Заполняем контентом
    // @todo Показываем
}

// Ссылка потеряла фокус
function preview_link_on_mouse_out() {
    preview_lost_focus_time = new Date();
}

// Всплывающее окно получило фокус
function preview_contentblock_on_mouse_in() {
    preview_lost_focus_time = null;
}

// Всплывающее окно потеряло фокус
function preview_contentblock_on_mouse_out() {
    preview_lost_focus_time = new Date();
}

// Интервальные тики для проверки потери фокуса и закрытия окна
function check_lost_focus() {
    if (preview_lost_focus_time == null) {
        return;
    }

    // Проверять и скрывать потеряный фокус
    var now = new Date();
    if (now.getTime() - preview_lost_focus_time.getTime() > 2000) {
        preview_lost_focus_time = null;
        preview_link_current_id = null;
        $('.preview_content_block').fadeOut(750);
    }
}