// @todo Переписать и выкинуть на хер

/**
 * Объект, управляющий сохранением настроек на странице настроек
 *
 * При создании сохраняет версию, восстанавливает настройки, слушает изменения на инпутах.
 * @constructor
 */
function Options() {
    this.form = document.querySelector('form');

    this.listenTabs();
    
    chrome.runtime.sendMessage(null, {
        type: 'getManifestVersion'
    }, null, function(response) {
        this.version = response.version || 'undefined';
        
        this.showVersion();
        this.restore();
        
        this.form.addEventListener('change', this._onChange.bind(this));
    }.bind(this));
}

/**
 * Получает версию настроек. Если она не равна версии приложения, записывает в сторедж плагина настройки из инпутов
 * и версию приложения.
 */
Options.prototype.updateOptionsFromFrom = function() {
    chrome.storage.sync.get('options_version', function(data) {
        this.logVersion(data.options_version);

        if (data.options_version !== this.version) {
            console.log('Initializing options...');

            Array.prototype.forEach.call(this.form.elements, this.updateOptionFromInput.bind(this));

            chrome.storage.sync.set({
                options: this.getValues(),
                options_version: this.version
            }, function() {
                console.log('Default options initialized. Version upgraded to %s.', this.version);

                if ( ! confirm(chrome.i18n.getMessage('options_text_new_version'))) {
                    window.close();
                }
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

    chrome.storage.sync.set({ options: ppOptions }, this.updateStatus.bind(this));
};

/**
 * Получает настройки из стореджа плагина, устанавливает соответствующим инпутам соответствующие значения.
 */
Options.prototype.restore = function() {
    this.checkOldStyle();

    chrome.storage.sync.get('options', function(data) {
        this._options = data.options || {};

        // Setting options in DOM
        Object.keys(this._options).forEach(function(key) {
            var data = this._options[key],
                input = this.form.elements[this.getOptionName(key)];

            if (input) {
                switch (data.type) {
                    case 'boolean':
                        input.checked = data.value;
                        break;

                    case 'enum':
                        input.value = data.value;
                        break;

                    default:
                        console.warn('Invalid option "%s" type: %O', key, data);
                        break;
                }
            }
        }.bind(this));

        this.updateOptionsFromFrom();
    }.bind(this));
};

/**
 * @returns {Object} Хеш настроек вида { имя_настроки: значение_настройки }
 */
Options.prototype.getValues = function() {
    return this._options;
};

/**
 * @param {Event} event Событие изменения
 */
Options.prototype._onChange = function(event) {
    this.updateOptionFromInput(event.target);
    this.save();
};

Options.prototype.updateOptionFromInput = function(input) {
    var key = this.getOptionKey(input.name);

    if (this.isBoolean(input)) {
        this._options[key] = {
            type: 'boolean',
            value: input.checked
        };
    } else if (this.isEnum(input)) {
        this._options[key] = {
            type: 'enum',
            value: input.value
        };
    }
};

/**
 * @param {HTMLElement} option Элемент опции
 * @returns {Boolean} Является ли настройка булевой
 */
Options.prototype.isBoolean = function(option) {
    return option.getAttribute('type') === 'checkbox';
};

/**
 *
 * @param {HTMLElement} option Элемент опции
 * @returns {Boolean} Является ли настройка енумом
 */
Options.prototype.isEnum = function(option) {
    return option.getAttribute('type') === 'radio';
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
 * Добавляет номер версии в подвал
 */
Options.prototype.showVersion = function() {
    var version_block = document.querySelector('#version');
    if (version_block !== null) {
        version_block.innerHTML = this.version;
    }
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

/**
 * Показывает плашку про то, что настройки сохранились и надо обновить страницу
 */
Options.prototype.updateStatus = function() {
    this.status = this.status || document.querySelector('.saved');

    this.status.classList.remove('hidden');
};

/**
 * Слушает события на табах
 */
Options.prototype.listenTabs = function() {
    var options = this;

    options._selectedItem = document.querySelector('.tabs-item.selected');
    options._selectedContent = document.querySelector('.tabs-content-item.selected');

    Array.prototype.forEach.call(document.querySelectorAll('.tabs-item'), function(tabItem) {
        var tabContent = document.querySelector(tabItem.getAttribute('href'));

        tabItem.addEventListener('click', function() {
            options._selectedItem.classList.remove('selected');
            options._selectedContent.classList.remove('selected');

            this.classList.add('selected');
            tabContent.classList.add('selected');

            options._selectedItem = this;
            options._selectedContent = tabContent;
        }, false);
    });
};

new Options();
