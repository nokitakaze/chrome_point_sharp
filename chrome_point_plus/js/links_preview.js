// Ставим хандлер
function set_links_preview_handler() {
    // Создаём контент-блок
    var content_block = document.createElement('div');
    document.body.appendChild(content_block);
    $(content_block).hide().addClass('preview_content_block').
        on('mouseenter', preview_contentblock_on_mouse_in).
        on('mouseleave', preview_contentblock_on_mouse_out).html(
        '<h2></h2><div class="collector collector-1280"><img alt="Превью обычных экранов"></div>' +
        '<div class="collector collector-375"><img alt="Превью телефонов"></div>'
    );

    var links_count = 0;
    // Вешаем хандлер
    $('.post-content a:not(.no-links-preview):not(.booru_pic):not(.postimg)').each(function (num, obj) {
        var href = obj.href;
        var n;
        if (n = href.match(new RegExp('^(https?):\\/\\/([a-z0-9.-]+)\\/([a-z0-9_\\/.%-]+)(\\?.*)?$', 'i'))) {
            var domain = n[2];
//            var path = n[3];
//            var params = n[4];
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
    console.debug('preview_link_on_mouse_in, this_link_id=%d, old_link_id=%d', this_id, preview_link_current_id);
    preview_lost_focus_time = null;

    if (preview_link_current_id === this_id) {
        // Вернули фокус
        return;
    }

    preview_link_current_id = this_id;
    preview_link_mouse_in_count++;
    setTimeout(new Function('preview_show_link(' + preview_link_mouse_in_count + ');'), 1000);
}

// Можно пробовать проверять и показывать контент
function preview_show_link(mouse_event_id) {
    console.debug('preview_show_link mouse_event=%d, last_mouse_event=%d, time=%O',
        mouse_event_id, preview_link_mouse_in_count, preview_lost_focus_time);
    if (preview_lost_focus_time !== null) {
        // Фокус потерян
        return;
    }
    if (preview_link_mouse_in_count !== mouse_event_id) {
        // Навели мышь на другой элемент
        return;
    }

    var url = $('.post-content a[data-preview-content-id=' + preview_link_current_id + ']').attr('href');
    if (typeof(url) == 'undefined') {
        console.debug("Link #" + preview_link_current_id + ' does not exist. It is impossible');
        return;
    }

    // Пытаемся найти в data существующий элемент
    for (var i = 0; i < preview_content_data.length; i++) {
        if (preview_content_data[i].url == url) {
            preview_show_content_in_block(i);
            return;
        }
    }

    // Дёргаем Аякс с данными по элементу
    console.debug('Get preview for link ' + url);
    $ajax({
        'url': 'https://api.kanaria.ru/point/link_preview.php?url=' + urlencode(url),
        'get_url': url,
        'link_id': preview_link_current_id,
        'mouse_event_id': mouse_event_id,
        'success': function (datum) {
            var data = JSON.parse(datum);
            if (data.status !== 0) {
                console.error("Can not get preview for link " + this.settings.get_url);
                return;
            }

            // Сохраняем данные
            preview_content_data.push({
                'url': this.settings.get_url,
                'title': data.title,
                'view1280': data.image1280,
                'view375': data.image375
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
    console.debug('preview_show_content_in_block datum_id=%d, link_id=%d', datum_id, preview_link_current_id);
    // Выбираем положение и размер
    var link = $('.post-content a[data-preview-content-id=' + preview_link_current_id + ']');
    var position_link = link.offset();
    var left, width;
    // @todo Это бы переписать!
    if (position_link.left - 5 - 20 > $(document).width() - (position_link.left + link.width() + 50) - 100) {
        left = 5;
        width = position_link.left - 5 - 20;
    } else {
        left = position_link.left + link.width() + 50;
        width = $(document).width() - left - 100;
    }

    var content_block = $('.preview_content_block').stop(true, true).show().css({
        'top': window.scrollY + 20,
        'left': left,
        'width': width,
        'height': $(window).height() - 100
    });

    // Заполняем контентом
    content_block.find('.collector-1280 img')[0].src = '';
    content_block.find('.collector-1280 img')[0].src = preview_content_data[datum_id].view1280;
//    content_block.find('.collector-375 img')[0].src = preview_content_data[datum_id].view375;
    content_block.find('h2').text(preview_content_data[datum_id].title);
}

// Ссылка потеряла фокус
function preview_link_on_mouse_out() {
    console.debug('preview_link_on_mouse_out, link_id=%d', preview_link_current_id);
    preview_lost_focus_time = new Date();
}

// Всплывающее окно получило фокус
function preview_contentblock_on_mouse_in() {
    console.debug('preview_contentblock_on_mouse_in, link_id=%d', preview_link_current_id);
    preview_lost_focus_time = null;
}

// Всплывающее окно потеряло фокус
function preview_contentblock_on_mouse_out() {
    console.debug('preview_contentblock_on_mouse_out, link_id=%d', preview_link_current_id);
    preview_lost_focus_time = new Date();
}

// Интервальные тики для проверки потери фокуса и закрытия окна
function check_lost_focus() {
    if (preview_lost_focus_time === null) {
        return;
    }

    // Проверять и скрывать потеряный фокус
    var now = new Date();
    if (now.getTime() - preview_lost_focus_time.getTime() > 2000) {
        console.debug('hide preview_content_block, %O', preview_lost_focus_time);
        preview_lost_focus_time = null;
        $('.preview_content_block').stop(true, true).fadeOut(750);
    }
}