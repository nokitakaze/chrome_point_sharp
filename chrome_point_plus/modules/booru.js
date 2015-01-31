/**
 * Подгружает картинки через сервер Никиты
 * @constructor
 * @param {jQuery} $links Коллекция ссылок
 * @param {OptionsManager} options Опции
 */
function Booru($links, options) {
    this.count = 0;

    this.loadAllImages($links, options.is('option_embedding_remove_original_link'));
}

/**
 * Откуда тянуть картинки
 * @type {String}
 */
Booru.baseUrl = 'https://api.kanaria.ru/point/get_booru_picture.php';

Booru.services = {
    danbooru: {
        mask: new RegExp('^https?://danbooru\\.donmai\\.us/posts/([0-9]+)', 'i'),
        matchNumber: 1
    },
    gelbooru: {
        mask: new RegExp('^https?\\://(www\\.)?gelbooru\\.com\\/index\\.php\\?page\\=post&s\\=view&id=([0-9]+)', 'i'),
        matchNumber: 2
    },
    safebooru: {
        mask: new RegExp('^https?\\://(www\\.)?safebooru\\.org\\/index\\.php\\?page\\=post&s\\=view&id=([0-9]+)', 'i'),
        matchNumber: 2
    },
    deviantart: {
        mask: new RegExp('^https?\\://(www\\.)?([a-z0-9-]+\\.)?deviantart\\.com\\/art/[0-9a-z-]+?\\-([0-9]+)(\\?.+)?$', 'i'),
        matchNumber: 3
    },
    e621: {
        mask: new RegExp('^https?\\://(www\\.)?e621\\.net\\/post\\/show\\/([0-9]+)\\/', 'i'),
        matchNumber: 2
    },
    derpibooru: {
        mask: new RegExp('^https?\\://derpiboo\\.ru\\/([0-9]+)', 'i'),
        matchNumber: 1
    },
    tumblr: {
        mask: new RegExp('^https?\\://([0-9a-z-]+)\\.tumblr\\.com\\/post\\/([0-9]+)', 'i'),
        matchNumber: 2,
        params: {
            add_username: 1
        }
    },
    pixiv: {
        mask: new RegExp('^https?://(www\\.)?pixiv\\.net\\/member_illust\\.php\\?mode\\=medium\\&illust_id\\=([0-9]+)', 'i'),
        matchNumber: 2,
    },
    animepicturesnet: {
        mask: new RegExp('^http\\:\\/\\/anime\\-pictures\\.net\\/pictures\\/view_post\\/([0-9]+)', 'i'),
        matchNumber: 1
    }
};

/**
 * Обрабатывает все картинки
 * @param {jQuery} $links Коллекция ссылок
 * @param {Boolean} removeOriginal Удалять ли оригинальную ссылку
 */
Booru.prototype.loadAllImages = function($links, removeOriginal) {
    var booru = this;

    $links.each(function(index, link) {
        var $link = $(link);
        var href = link.href;
        var $image;

        if ($link.hasClass('booru_pic')) {
            return;
        }

        Object.keys(booru.constructor.services).some(function(service) {
            $image = booru.createImageFromService(service, href);

            return $image;
        });

        if ($image) {
            $link.before($image);
            this.count++;

            if (removeOriginal) {
               $link.remove();
            }
        }
    });
};

/**
 * Создаёт картинку исходя из сервиса, если адрес картинки матчится
 * @param {String} service Идентификатор сервиса
 * @param {String} href URL картинки (который вставлен в пост)
 */
Booru.prototype.createImageFromService = function(service, href) {
    var serviceInfo = this.constructor.services[service];
    var matches = href.match(serviceInfo.mask);
    var imageArgs;
    var params = {};
    var key;

    if (matches) {
        imageArgs = [ service, matches[serviceInfo.matchNumber] ];

        if (serviceInfo.params) {
            for (key in serviceInfo.params) {
                if (serviceInfo.params.hasOwnProperty(key)) {
                    params[key] = mathes[serviceInfo.params[key]];
                }
            }

            imageArgs.push(params);
        }

        return this.createImage.apply(this, imageArgs);
    }
};

/**
 * Создаёт ссылку с картикной
 * @param {String} service Ключевое имя сервиса для Никиты
 * @param {String} id Идентификатор картинки
 * @param {Object} [params] Дополнительные параметры, которые надо добавить в url
 * @returns {jQuery} Элемент ссылки
 */
Booru.prototype.createImage = function(service, id, params) {
    var $link = $('<a>');
    var $img = $('<img>');
    var title = service + ' image #' + id;
    var imageSource = this.getImageLink(service, id, params);

    $link
        .addClass('booru_pic')
        .addClass('booru-' + service + '-' + id)
        .addClass('postimg')
        .attr({
            href: imageSource,
            id: 'booru_pic_' + this.count,
            title: title,
            target: '_blank'
        });

    $img.attr({
        alt: title,
        src: imageSource
    });

    $link.append($img);

    return $link;
};

/**
 * Генерирует ссылку на картинку
 * @param {String} service Ключевое имя сервиса для Никиты
 * @param {String} id Идентификатор картинки
 * @param {Object} [params] Дополнительные параметры, которые надо добавить в url
 * @returns {String} Ссылка на картинку
 */
Booru.prototype.getImageLink = function(service, id, params) {
    return this.constructor.baseUrl + '?' + $.param($.extend({
        domain: service,
        id: id,
    }, params));
};

