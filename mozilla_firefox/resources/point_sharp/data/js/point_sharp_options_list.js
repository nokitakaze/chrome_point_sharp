/**
 * Список опций в виде дерева
 *
 * Платформонезависимый файл
 */

// @todo Скопировать все опции
// @todo Не забыть про платформозависимые опции
var point_sharp_options_tree = {
    'tab1': {
        'type': 'tree',
        'default_value': null,
        'description': '?',
        'children': {
            'option1': {
                'type': 'option',
                'default_value': null,
                'description': '?'
            }

        }
    },
    'tab2': {}


};

// @todo Решить нужно ли?
var point_sharp_options_current = null;

/**
 * Инициализатор опций, дёргается первым из кода, потом запускает всё остальное
 *
 * @param callback callback, который должен быть дёрнут, когда опции создадутся
 */
function point_sharp_options_init(callback) {
    // @todo перебрать все значения point_sharp_options_tree, превратить их в список с default value

    local_storage_get('options', function (options) {
        console.info("Options: ", options);
        // @todo Перебираем все опции и задаём им default значения, если надо

        // @todo Если есть хотя бы одно сменённое значение, сохраняем опции
    });
}