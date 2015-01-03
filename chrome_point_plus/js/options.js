/**
 * Получает версию настроек из манифеста
 * @returns {String} Версия настроек
 */
function getVersion() {
    var xhr = new XMLHttpRequest(),
        manifest;

    xhr.open('GET', chrome.extension.getURL('manifest.json'), false);
    xhr.send(null);

    manifest = JSON.parse(xhr.responseText);

    return manifest.version;
}

/**
 * Объект, управляющий сохранением настроек на странице настроек
 *
 * При создании сохраняет версию, восстанавливает настройки, слушает изменения на инпутах.
 * @constructor
 */
function Options() {
    this.version = getVersion();

    this.restore();

    $('#tabs-content').on('click', 'input', this._onChange.bind(this));
}

/**
 * Получает версию настроек. Если она не равна версии приложения, записывает в сторедж плагина настройки из инпутов
 * и версию приложения.
 */
Options.prototype.init = function() {
    chrome.storage.sync.get('options_version', function(data) {
        this.logVersion(data.options_version);

        if (data.options_version !== this.version) {
            console.log('Initializing options...');

            chrome.storage.sync.set({
                options: this.getValues(),
                options_version: this.version
            }, function() {
                console.log('Default options initialized. Version upgraded to %s.', this.version);

                alert(chrome.i18n.getMessage('options_text_new_version'));
            });
        }
    }.bind(this));
};

/**
 * Сохраняет настройки
 */
Options.prototype.save = function() {
    var ppOptions = this.getValues();

    console.log('Saving options: %O', ppOptions);

    // Saving parameters
    chrome.storage.sync.set({ options: ppOptions }, function() {
        // Update status to let user know options were saved.
        $('#status').html(chrome.i18n.getMessage('options_text_saved'));
    });
};

/**
 * Получает настройки из стореджа плагина, устанавливает соответствующим инпутам соответствующие значения.
 */
Options.prototype.restore = function() {
    this.checkOldStyle();

    chrome.storage.sync.get('options', function(data) {
        this._options = data.options;

        try {
            // Setting options in DOM
            $.each(data.options, function(key, data) {
                switch (data.type) {
                    case 'boolean':
                        if (data.value) {
                            $('#' + this.getOptionName(key)).prop('checked', true);
                        }
                        break;

                    case 'enum':
                        $('.option-node .option-enum[name="' + this.getOptionName(key) + '"][value="' + data.value + '"]').prop('checked', true);
                        break;

                    default:
                        console.warn('Invalid option "%s" type: %O', key, data);
                        break;
                }
            }.bind(this));
        } catch (ex) {
            console.log('Error while loading extension options: %O', ex);
        }

        this.showCopyright();
        this.init();
    }.bind(this));
};

/**
 * @returns {Object} Хеш настроек вида { имя_настроки: значение_настройки }
 */
Options.prototype.getValues = function() {
    return this._options;
};

Options.prototype._onChange = function(event) {
    var $input = $(event.target);

    console.log(arguments);

    if (this.isBoolean($input)) {
        this._options[this.getOptionKey($input.prop('id'))] = {
            type: 'boolean',
            value: $input.prop('checked')
        };
    } else if (this.isEnum($input)) {
        this._options[this.getOptionKey($input.prop('name'))] = {
            type: 'enum',
            value: $input.val()
        };
    }

    this.save();
};

/**
 * @param {jQuery} $option Элемент опции
 * @returns {Boolean} Является ли настройка булевой
 */
Options.prototype.isBoolean = function($option) {
    return $option.hasClass('option-boolean');
};

/**
 *
 * @param {jQuery} $option Элемент опции
 * @returns {Boolean} Является ли настройка енумом
 */
Options.prototype.isEnum = function($option) {
    return $option.hasClass('option-enum');
};

/**
 * @param {String} name Имя инпута
 * @returns {String} Ключ для хеша настроек
 */
Options.prototype.getOptionKey = function(name) {
    return name.replace(/-/g, '_');
};

/**
 * @param {String} Ключ хеша настроек
 * @returns {String} Имя инпута
 */
Options.prototype.getOptionName = function(key) {
    return key.replace(/_/g, '-');
};

/**
 * Выводит в консоль версию настроек и версию плагина
 * @param {String} optionsVersion
 */
Options.prototype.logVersion = function(optionsVersion) {
    console.info('Point+ %s, local options are for %s', this.version, optionsVersion);
};

/**
 * Добавляет копирайт в подвал
 */
Options.prototype.showCopyright = function() {
    $('#pp-version').html('Point+ ' + this.version
        + ' by <a href="https://skobkin-ru.point.im/" target="_blank">@skobkin-ru</a><br>\n'
        + '& <a href="https://nokitakaze.point.im/" target="_blank">@NokitaKaze</a>'
    );
};

/**
 * Проверяет, не старого ли формата настройки. И если старого, то удаляет их.
 */
Options.prototype.checkOldStyle = function() {
    chrome.storage.sync.get('option_fancybox', function(data) {
        if ((data.option_fancybox === true) || (data.option_fancybox === false)) {
            console.log('Found old-style options. Cleaning...');

            chrome.storage.sync.get(null, function(data) {

                console.log('Old data: %O', data);

                for (option in data) {
                    chrome.storage.sync.remove(option);
                }

                console.log('All old data removed');
            });
        }
    });
};

new Options();
