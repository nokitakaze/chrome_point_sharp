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
            'href': '#' + index,
            'data-i18n': index.replace(/_/g, '-')
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
    // Создаём DOM
    console.log("Options Tree: ", point_sharp_options_tree);
    draw_option_tree(point_sharp_options_tree);
    redraw_current_options_value();
});
