/**
 * Рисуем вкладку
 *
 * @param tree Дерево опций
 */
function draw_option_tree(tree) {
    $('.tabs-list').html('');
    $('.tabs-content').html('');

    for (var index in tree) {
        // Нав
        var nav = document.createElement('a');
        $(nav).attr({
            'href': '#',
            'data-i18n': index.replace(/_/g, '-'),
            'data-tab-name': index
        }).addClass('tabs-item').text(tree[index].description);
        $('.tabs-list').append(nav);

        // Секция
        var section = document.createElement('section');
        $(section).attr({
            'id': index
        }).addClass('tabs-content-item');

        // Добавляем опций
        for (var child_index in tree[index].children) {
            draw_option_branch(section, child_index, tree[index].children[child_index]);
        }

        $('.tabs-content').append(section);
    }

    // Ставим первую
    $('.tabs-list > .tabs-item').first().addClass('selected');
    $('.tabs-content > .tabs-content-item').first().addClass('selected');

    // Лисенер
    $('.tabs-list > .tabs-item').on('click', function () {
        $('.tabs-list > .tabs-item').removeClass('selected');
        $('.tabs-content > .tabs-content-item').removeClass('selected');

        $(this).addClass('selected');
        var index = $(this).attr('data-tab-name');
        $('.tabs-content > .tabs-content-item[id="' + index + '"]').addClass('selected');
    });
}

/**
 * Рисуем ветку у объекта
 *
 * @param branch Ветка
 */
function draw_option_branch(parent_obj, index, branch) {
    var children_length = 0;
    if (typeof(branch.children) == 'undefined') {
        branch.children = {};
    } else {
        for (var child_index in branch.children) {
            children_length++;
        }
    }

    if (branch.type == 'radio') {
        // Радио
        // @todo Не сделано
        console.warn('radio is not realized');

    } else if (children_length == 0) {
        // Одиночный
        var item = document.createElement('label');
        $(item).addClass('option-node').
            html('<input type="checkbox"><span></span>').
            find('input').attr('name', index.replace(/_/g, '-'));
        $(item).find('span').attr('data-i18n', index).text(branch.description);

        $(parent_obj).append(item);
    } else {
        // Зависимые опции
        var item = document.createElement('div');
        $(item).addClass('option-node').
            html('<input type="checkbox"><label></label>').
            find('input').attr({
                'name': index.replace(/_/g, '-'),
                'id': index.replace(/_/g, '-')
            });
        $(item).find('label').attr({
            'for': index.replace(/_/g, '-'),
            'data-i18n': index
        }).text(branch.description);

        // Добавляем детей
        for (var child_index in branch.children) {
            draw_option_branch(item, child_index, branch.children[child_index]);
        }

        // Добавляем в parent object
        $(parent_obj).append(item);
    }
}

/**
 * Обновляем текущие галки
 */
function redraw_current_options_value() {
    point_sharp_options_init(function (options) {
        console.log("point_sharp_options_init: ", options);
        // @todo Выставляем галки

    });

}


$(document).ready(function () {
    // Я не буду пользоваться паттерном стратегия. Если наговнокодить на одной странице, плохо не будет
    if (navigator.appVersion.match(/.*chrome.*/i) == null) {
        // Mozilla Firefox
        $('.content-wrap').addClass('point-options-wrapper').
            html('<nav class="tabs-list"></nav><form class="tabs-content"></form>' +
            '<p class="saved hidden" data-i18n="options_text_saved"></p><div>' +
            '<p>Point# <span id="version"></span> by' +
            '<a href="https://skobkin-ru.point.im/" target="_blank">@skobkin-ru</a>,' +
            '<a href="https://isqua.point.im/" target="_blank">@isqua</a>,' +
            '<a href="https://nokitakaze.point.im/" target="_blank">@NokitaKaze</a>' +
            '</p></div>');
    }

    draw_option_tree(point_sharp_options_tree);
    redraw_current_options_value();
});
