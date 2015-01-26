/**
 * Объект для получения опций
 * @param {Object} options Хеш настроек
 * @constructor
 */
function OptionsManager(options) {
    this._options = options || {};
}

/**
 * @param {String} optionName Имя опции
 * @returns {Boolean|String|Null} Значение опции
 */
OptionsManager.prototype.get = function(optionName) {
    return this._options.hasOwnProperty(optionName) ? this._options[optionName].value : null;
};

/**
 * Проверяет, равна ли опция значению value. Если value не переданно, проверяет задана ли она и не равна ли false/''
 * @param {String} optionName Имя опции
 * @param {Boolean|String} [value=true] Значение опции
 * @returns {Boolean}
 */
OptionsManager.prototype.is = function(optionName, value) {
    if (typeof value !== 'undefined') {
        return this.get(optionName) === value;
    } else {
        return Boolean(this.get(optionName));
    }
};

/**
 * @returns {Object} Хеш опций
 */
OptionsManager.prototype.getOptions = function() {
    return this._options;
};
