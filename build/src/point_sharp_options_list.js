/**
 * Список опций в виде дерева. Core Options Engine
 *
 * ПЛАТФОРМОНЕЗАВИСИМЫЙ ФАЙЛ
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

    local_storage_get('options', function (raw_options) {
        console.info("Options: ", raw_options);
        // @todo Перебираем все опции и задаём им default значения, если надо

        // @todo Не забыть про платформозависимые опции

        // @todo Если есть хотя бы одно сменённое значение, сохраняем опции

        // @todo Дёргаем callback

    });
}


/**
 * Объект для преобразования сырых опций в объект
 *
 * @param {Object} raw_options Хеш настроек
 * @constructor
 */
function OptionsManager(raw_options) {
    this._options = raw_options || {};
}

/**
 * @param {String} optionName Имя опции
 * @returns {Boolean|String|Null} Значение опции
 */
OptionsManager.prototype.get = function (optionName) {
    if (this._options.hasOwnProperty(optionName)) {
        return this._options[optionName].value;
    } else {
        console.warn("Options does not have key `%s`", optionName);
        return null;
    }
};

/**
 * Проверяет, равна ли опция значению value. Если value не переданно, проверяет задана ли она и не равна ли false/''
 * @param {String} optionName Имя опции
 * @param {Boolean|String} [value=true] Значение опции
 * @returns {Boolean}
 */
OptionsManager.prototype.is = function (optionName, value) {
    if (typeof value !== 'undefined') {
        return this.get(optionName) === value;
    } else {
        return Boolean(this.get(optionName));
    }
};

/**
 * @returns {Object} Кеш опций
 */
OptionsManager.prototype.getOptions = function () {
    return this._options;
};