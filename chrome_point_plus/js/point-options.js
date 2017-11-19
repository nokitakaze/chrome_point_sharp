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

    set_option_elements_behavior();
}

function set_option_elements_behavior() {
    // Ставим первые табы выбранными
    $('.point-options-wrapper .tabs-list > .tabs-item').first().addClass('selected');
    $('.point-options-wrapper .tabs-content > .tabs-content-item').first().addClass('selected');

    // Переключение табов
    $('.point-options-wrapper .tabs-list > .tabs-item').off('click').on('click', function() {
        $('.point-options-wrapper .tabs-list > .tabs-item').removeClass('selected');
        $('.point-options-wrapper .tabs-content > .tabs-content-item').removeClass('selected');

        $(this).addClass('selected');
        var index = $(this).attr('data-tab-name');
        $('.point-options-wrapper .tabs-content > .tabs-content-item[id="' + index + '"]').addClass('selected');
    });

    // Нажатие галок на чекбоксах
    $('.point-options-wrapper .tabs-content .option-node input[type="checkbox"]').off('change').on('change', function() {
        var name = $(this).prop('name').replace(new RegExp('\\-', 'g'), '_');
        this_page_change_keyvalue(name, $(this).prop('checked'));
    });

    //  Нажатие галок на радиобатонах
    $('.point-options-wrapper .tabs-content .option-node input[type="radio"]').off('change').on('change', function() {
        var name = $(this).prop('name').replace(new RegExp('\\-', 'g'), '_');
        var new_value = null;
        $('.point-options-wrapper .tabs-content .option-node input[type="radio"][name="' + $(this).prop('name') + '"]').each(
            function() {
                if ((new_value == null) || $(this).prop('checked')) {
                    new_value = $(this).val();
                }
            });
        this_page_change_keyvalue(name, new_value);
    });

    // Смена текста в text-боксах
    $('.point-options-wrapper .tabs-content .option-node input[type="text"]').off('change').on('change', function() {
        var name = $(this).prop('name').replace(new RegExp('\\-', 'g'), '_');
        this_page_change_keyvalue(name, $(this).val());
    });
}

function this_page_change_keyvalue(key, value) {
    var tmp = {};
    tmp[key] = value;

    $('.point-options-wrapper .saved').text('Опции сохраняются...').removeClass('hidden');
    local_options_set(tmp, function() {
        $('.point-options-wrapper .saved').text('Опции сохранены').addClass('hidden');
        if (navigator.appVersion.match(/.*chrome.*/i) !== null) {
            // Мы под Google Chrome
            chrome.runtime.sendMessage({
                'type': 'update_options'
            }, function() {});
        }
        redraw_current_options_value();
    });
}

/**
 * Создаём ветку опций
 *
 * @param {Object} parent_obj
 * @param {String} index
 * @param {Object} branch Ветка
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
    // @todo Сделать платформо-зависимые опции

    var item;
    if (branch.type == 'enum') {
        // Создание радио-батонов
        item = document.createElement('div');
        $(item).addClass('option-node');
        for (var i = 0; i < branch.radio_values.length; i++) {
            var radio_item = document.createElement('label');
            $(radio_item).html('<input type="radio"><span></span>').find('input').attr({
                'name': index.replace(/_/g, '-'),
                'value': branch.radio_values[i].value
            });
            $(radio_item).find('span').attr({
                'data-i18n': index
            }).text(branch.radio_values[i].text);
            $(item).append(radio_item);
        }

        // Добавляем детей
        for (child_index in branch.children) {
            draw_option_branch(item, child_index, branch.children[child_index]);
        }
    } else if (branch.type == "text") {
        // Text-input
        item = document.createElement('label');
        $(item).addClass('option-node').html('<span></span><br/><input type="text">').find('input').attr('name',
            index.replace(/_/g, '-'));
        $(item).find('span').attr('data-i18n', index).text(branch.description);
    } else if ((branch.type == "boolean") && (children_length == 0)) {
        // Одиночная галка
        item = document.createElement('label');
        $(item).addClass('option-node').html('<input type="checkbox"><span></span>').find('input').attr('name',
            index.replace(/_/g, '-'));
        $(item).find('span').attr('data-i18n', index).text(branch.description);
    } else if ((branch.type == "boolean") && (children_length > 0)) {
        // Зависимые опции
        item = document.createElement('div');
        $(item).addClass('option-node').html('<input type="checkbox"><label></label>').find('input').attr({
            'name': index.replace(/_/g, '-'),
            'id': index.replace(/_/g, '-')
        });
        $(item).find('label').attr({
            'for': index.replace(/_/g, '-'),
            'data-i18n': index
        }).text(branch.description);

        // Добавляем детей
        for (child_index in branch.children) {
            draw_option_branch(item, child_index, branch.children[child_index]);
        }
    } else {
        console.error('option ', index, ' is not defined');
    }

    // Добавляем в parent object
    $(parent_obj).append(item);
}

/**
 * Обновляем текущие галки и радио-батоны. Обновляем значения из сторожа
 **/
function redraw_current_options_value() {
    point_sharp_options_init(function(options) {
        $('.point-options-wrapper .tabs-list').fadeIn(500);
        $('.point-options-wrapper .tabs-content').fadeIn(500);

        var raw_options = options.getOptions();

        // Выставляем галки
        $('.point-options-wrapper .option-node > input[type="checkbox"]').prop('checked', false);
        for (var index in raw_options) {
            if (options.getType(index) != 'boolean') {
                continue;
            }

            if (options.is(index)) {
                $('.point-options-wrapper input[type="checkbox"][name="' + (index.replace(/_/g, '-')) + '"]').first().prop(
                    'checked', true);
            }
        }

        // Выставляем текстовые поля
        $('.point-options-wrapper .option-node > input[type="text"]').val('');
        for (index in raw_options) {
            if (options.getType(index) != 'text') {
                continue;
            }

            $('.point-options-wrapper input[type="text"][name="' + (index.replace(/_/g, '-')) + '"]').first().val(
                options.get(index));
        }

        // Выставляем радио-батоны
        $('.point-options-wrapper .option-node input[type="radio"]').prop('checked', false);
        for (index in raw_options) {
            if (options.getType(index) != 'enum') {
                continue;
            }

            $('.point-options-wrapper .option-node input[type="radio"][name="' + (index.replace(/_/g, '-')) + '"]').each(
                function() {
                    if ($(this).val() == options.get(index)) {
                        $(this).prop('checked', true);
                    }
                });
        }

    });
}


$(document).on('ready', function() {
    if (navigator.appVersion.match(/.*chrome.*/i) == null) {
        // Mozilla Firefox

        $('body').addClass('point-firefox');
    }

    draw_option_tree(point_sharp_options_tree);
    redraw_current_options_value();
    general_option_menu_wrapper();
});
