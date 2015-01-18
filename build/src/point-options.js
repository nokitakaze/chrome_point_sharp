/**
 * Рисуем вкладку
 *
 * @param tree Дерево опций
 */
function draw_option_tree(tree) {
    $('.point-options-wrapper .tabs-list').html('');
    $('.point-options-wrapper .tabs-content').html('');

    for (var index in tree) {
        // Нав
        var nav = document.createElement('a');
        $(nav).attr({
            'href': '#',
            'data-i18n': index.replace(/_/g, '-'),
            'data-tab-name': index
        }).addClass('tabs-item').text(tree[index].description);
        $('.point-options-wrapper .tabs-list').append(nav);

        // Секция
        var section = document.createElement('section');
        $(section).attr({
            'id': index
        }).addClass('tabs-content-item');

        // Добавляем опций
        for (var child_index in tree[index].children) {
            draw_option_branch(section, child_index, tree[index].children[child_index]);
        }

        $('.point-options-wrapper .tabs-content').append(section);
    }

    // Ставим первые табы выбранными
    $('.point-options-wrapper .tabs-list > .tabs-item').first().addClass('selected');
    $('.point-options-wrapper .tabs-content > .tabs-content-item').first().addClass('selected');

    // Переключение табов
    $('.point-options-wrapper .tabs-list > .tabs-item').on('click', function () {
        $('.point-options-wrapper .tabs-list > .tabs-item').removeClass('selected');
        $('.point-options-wrapper .tabs-content > .tabs-content-item').removeClass('selected');

        $(this).addClass('selected');
        var index = $(this).attr('data-tab-name');
        $('.point-options-wrapper .tabs-content > .tabs-content-item[id="' + index + '"]').addClass('selected');
    });

    // Нажатие галок на чекбоксах
    $('.point-options-wrapper .tab-content .option-node > input[type="checkbox"]').on('click', function () {
        // @todo Сделать Нажатие галок на чекбоксах
    });

    // @todo Нажатие галок на радиобатонах


}

/**
 * Создаём ветку опций
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
        // @todo Создание радио-батонов не сделано
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
 * Обновляем текущие галки и радио-батоны. Обновляем значения из сторожа
 **/
function redraw_current_options_value() {
    point_sharp_options_init(function (options) {
        console.log("point_sharp_options_init: ", options);

        // Выставляем галки
        $('.point-options-wrapper .option-node > input[type="checkbox"]').first().val(0);
        var raw_options = options.getOptions();
        for (var index in raw_options) {
            if (options.is(index)) {
                $('.point-options-wrapper [name="' + (index.replace(/_/g, '-')) + '"]').
                    first().prop('checked', true);
            }
        }

        // @todo Выставляем радио-батоны
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
    } else {
        // Google Chrome
        // @todo Узнать что мы не в маленьком окне и удалить класс кастрации
        // $('body').removeClass('point-options-castrate');
    }

    draw_option_tree(point_sharp_options_tree);
    redraw_current_options_value();
});
