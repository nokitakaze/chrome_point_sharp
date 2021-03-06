/**
 * Подгружает картинки через сервер Никиты
 * @constructor
 * @param {jQuery} $links Коллекция ссылок
 * @param {OptionsManager} options Опции
 */
function Booru($links, options) {
    this.count = 0;

    if (options.is('option_embedding_tumblr')) {
        delete(Booru.services.tumblr);
    }

    this.loadAllImages($links, options.is('option_images_load_booru_remove_original_link'));
}

/**
 * Откуда тянуть картинки
 * @type {String}
 */
Booru.baseUrl = 'https://evidell.xyz/get_booru_picture.php';

/* jshint maxlen:false */
Booru.services = {
    danbooru: {
        mask: new RegExp('^https?://danbooru\\.donmai\\.us/posts/([0-9]+)', 'i'),
        template: 'https://danbooru.donmai.us/posts/%s',
        matchNumber: 1
    },
    gelbooru: {
        mask: new RegExp('^https?\\://(www\\.)?gelbooru\\.com\\/index\\.php', 'i'),
        template: 'https://gelbooru.com/index.php?page=post&s=view&id=%s',
    },
    safebooru: {
        mask: new RegExp('^https?\\://(www\\.)?safebooru\\.org\\/index\\.php', 'i'),
        template: 'https://safebooru.org/index.php?page=post&s=view&id=%s',
    },
    deviantart: {
        mask: new RegExp('^https?\\://(www\\.)?([a-z0-9-]+\\.)?deviantart\\.com\\/art/[0-9a-z-]+?\\-([0-9]+)(\\?.+)?$', 'i'),
        matchNumber: 3
    },
    e621: {
        mask: new RegExp('^https?\\://(www\\.)?e621\\.net\\/post\\/show\\/([0-9]+)\\/?', 'i'),
        template: 'https://e621.net/post/show/%s/',
        matchNumber: 2
    },
    derpibooru: {
        mask: new RegExp('^https?\\://derpibooru\\.org\\/([0-9]+)', 'i'),
        template: 'https://derpibooru.org/%s',
        matchNumber: 1
    },
    derpibooruOld: {
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
        mask: new RegExp('^https?://(www\\.)?pixiv\\.net\\/member_illust\\.php', 'i'),
        template: 'https://www.pixiv.net/member_illust.php?mode=medium&illust_id=%s',
        get_params: {
            'id': 'illust_id'
        }
    },
    animepicturesnet: {
        mask: new RegExp('^https?\\:\\/\\/anime\\-pictures\\.net\\/pictures\\/view_post\\/([0-9]+)', 'i'),
        matchNumber: 1
    },
    yandere: {
        mask: new RegExp('^https?\\:\\/\\/yande\\.re\\/post\\/show\\/([0-9]+)', 'i'),
        template: 'https://yande.re/post/show/%s',
        matchNumber: 1
    },
    sankakucomplex: {
        mask: new RegExp('^https?\\:\\/\\/chan\\.sankakucomplex\\.com\\/post\\/show\\/([0-9]+)', 'i'),
        template: 'https://chan.sankakucomplex.com/post/show/%s',
        matchNumber: 1
    },
    konachan: {
        mask: new RegExp('https?://konachan\\.(net|com)\\/post\\/show\\/([0-9]+)', 'i'),
        template: 'https://konachan.net/post/show/%s',
        matchNumber: 2,
        params: {
            'add_domain_extension': 1
        }
    },
    rule34: {
        mask: new RegExp('^https?\\://(www\\.)?rule34\\.xxx\\/index\\.php', 'i')
    },
    xbooru: {
        mask: new RegExp('^https?\\://(www\\.)?xbooru\\.com\\/index\\.php', 'i')
    },
    booruorg: {
        mask: new RegExp('^https?\\://([a-z0-9-]+)\\.booru\\.org\\/index\\.php', 'i'),
        params: {
            'add_domain': 1
        }
    },
    '500px': {
        mask: new RegExp('^https?://500px\\.com/photo/([0-9]+)', 'i'),
        matchNumber: 1
    }
};
/* jshint maxlen:120 */

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

        if ($link.hasClass('point-sharp-processed') || $link.hasClass('point-sharp-added')) {
            return;
        }

        Object.keys(booru.constructor.services).some(function(service) {
            $image = booru.createImageFromService(service, href);

            return $image;
        });

        if ($image) {
            $image.addClass('point-sharp-added');
            $link.addClass('point-sharp-processed').before($image);

            if (removeOriginal) {
                $link.hide();
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
    /**
     * @type {Object} serviceInfo.get_params
     * @type {Number} serviceInfo.matchNumber
     * @type {String} serviceInfo.mask
     */
    /**
     * @type {Object} serviceInfo
     */
    var serviceInfo = this.constructor.services[service];
    var matches = href.match(serviceInfo.mask);

    if (matches) {
        var params = {};

        if (typeof(serviceInfo.matchNumber) === 'number') {
            params.id = matches[serviceInfo.matchNumber];
        }

        if (typeof(serviceInfo.params) === 'object') {
            for (var key in serviceInfo.params) {
                if (serviceInfo.params.hasOwnProperty(key)) {
                    params[key] = matches[serviceInfo.params[key]];
                }
            }
        }

        // Разбираем http get
        var get_params = Booru.getGetParamsFromUrl(href);

        if (typeof(serviceInfo.get_params) === 'object') {
            for (key in serviceInfo.get_params) {
                if (serviceInfo.get_params.hasOwnProperty(key)) {
                    params[key] = get_params[serviceInfo.get_params[key]];
                }
            }
        }
        if (typeof(params.id) === 'undefined') {
            params.id = get_params.id;
        }


        return this.createImage(service, params);
    }
};

/**
 * Создаёт ссылку с картикной
 * @param {String} service Ключевое имя сервиса для Никиты
 * @param {Object} [params] Дополнительные параметры, которые надо добавить в url
 * @returns {jQuery|null} Элемент ссылки
 */
Booru.prototype.createImage = function(service, params) {
    if (typeof(params.id) === 'undefined') {
        console.error('Booru set ', service, params, ' does not contain id');
        return null;
    }

    var link = document.createElement('a');
    var img = document.createElement('img');
    var title = service + ' image #' + params.id;

    $(img).attr({
        alt: title,
        src: this.getImageLink(service, params.id, params, 'thumb')
    }).on('error', function() {
        var this_image = $(this);
        var link = this_image.parents('.booru_pic').first();
        $ajax({
            'url': link.attr('data-booru-mime-url'),
            'success': function(ans) {
                /**
                 * @var {String} json.content_type
                 */
                var json = JSON.parse(ans);
                if (json.content_type.match(new RegExp('^video/'))) {
                    var player = document.createElement('video');
                    $(player).html('<source src="" type="" />').attr('controls', 'controls').css({
                        'display': 'block',
                        'max-width': '95%'
                    }).addClass('parsed-webm-link').addClass('point-sharp-added').find('source').attr({
                        'src': Booru.prototype.getImageLink(
                            link.attr('data-booru-service'),
                            link.attr('data-booru-id'),
                            JSON.parse(link.attr('data-booru-params'))
                        ),
                        'type': json.content_type
                    });

                    link.html('').append(player);
                }
            }
        });
    });

    $(link).addClass('booru_pic')
        .addClass('booru-' + service + '-' + params.id)
        .addClass('postimg')
        .attr({
            href: this.getImageLink(service, params.id, params, 'normal'),
            id: 'booru_pic_' + this.count,
            title: title,
            target: '_blank',
            'data-booru-service': service,
            'data-booru-id': params.id,
            'data-booru-params': JSON.stringify(params),
            'data-booru-mime-url': this.getImageLink(service, params.id, params, 'mime')
        }).append(img);
    this.count++;

    return $(link);
};

/**
 * Генерирует ссылку на картинку
 * @param {String} service Ключевое имя сервиса для Никиты
 * @param {String} id Идентификатор картинки
 * @param {Object} params Дополнительные параметры, которые надо добавить в url
 * @param {String} [mode=normal] Это Thumbnail или полноценная картинка?
 * @returns {String} Ссылка на картинку
 */
Booru.prototype.getImageLink = function(service, id, params, mode) {
    mode = (typeof(mode) == 'undefined') ? 'normal' : mode;
    return this.constructor.baseUrl + '?' + $.param($.extend({
            domain: service,
            id: id
        }, params)) + '&mode=' + mode;
};

/**
 * Парсим URL
 *
 * @param {String} href
 * @returns {Object}
 */
Booru.getGetParamsFromUrl = function(href) {
    var n1 = href.match(new RegExp('\\?(.+?)(#.*)?$'));
    if ((n1 === null) || (typeof n1[1] !== 'string')) {
        return {};
    }

    var get_params = {};
    var n2 = n1[1].split("&");
    for (var i = 0; i < n2.length; i++) {
        var n3 = n2[i].split('=');
        get_params[n3[0]] = (typeof n3[1] !== 'undefined') ? n3[1] : '';
    }

    return get_params;
};