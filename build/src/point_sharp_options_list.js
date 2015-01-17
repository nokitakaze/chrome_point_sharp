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

    // Берём версию и Local Storage
    point_sharp_get_version(function () {
        local_storage_get('options', function (raw_options) {
            console.info("Options: ", point_sharp_version, raw_options);
            raw_options.version = point_sharp_version;
            // @todo Перебираем все опции и задаём им default значения, если надо

            // @todo Не забыть про платформозависимые опции

            // @todo Если есть хотя бы одно сменённое значение, сохраняем опции

            // Дёргаем callback
            var options = new OptionsManager(raw_options);
            callback(options);
        });
    });

}


/**
 * Объект для преобразования сырых опций в объект
 *
 * @param {Object} raw_options Хеш настроек
 * @constructor
 */
function OptionsManager(raw_options) {
    this._options = raw_options;
}

/**
 * Берём значений опции ИЗ КЕША (может быть не реальным)
 *
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
 * Сохраняем набор опций. Враппер для local_options_set
 *
 * @param {String} data Имя опции
 * @param {function} success_callback Имя опции
 */
OptionsManager.prototype.set = function (data, success_callback) {
    local_options_set(data, success_callback);
};

/**
 * Проверяет, равна ли опция значению value. Если value не переданно, проверяет задана ли она и не равна ли false/''
 *
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
 * Геттер для сырых опций
 *
 * @returns {Object} Кеш опций
 */
OptionsManager.prototype.getOptions = function () {
    return this._options;
};

/**
 * @returns {Object} Версия расширения
 */
OptionsManager.prototype.version = function () {
    return this._options.version;
};

