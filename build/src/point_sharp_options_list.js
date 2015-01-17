/**
 * Список опций в виде дерева. Core Options Engine
 *
 * ПЛАТФОРМОНЕЗАВИСИМЫЙ ФАЙЛ
 */

// @todo Скопировать все опции
// @todo Не забыть про платформозависимые опции
var point_sharp_options_tree = {
    "tree_media":{
        "type":"tree",
        "description":"",
        "children":{
            "option_fancybox":{
                "type":"checkbox",
                "default_value":false,
                "description":"Включить Fancybox ▼",
                "children":{
                    "option_fancybox_images":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Использовать для картинок"
                    },
                    "option_fancybox_videos":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Использовать для видео (YouTube и т.п.)"
                    },
                    "option_fancybox_posts":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Использовать для ссылок на посты"
                    },
                    "option_fancybox_bind_images_to_one_flow":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Связать все картинки в одну галерею Fancybox"
                    },
                    "option_fancybox_smart_hints":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Генерировать подписи к картинкам из тегов"
                    }
                }
            },
            "option_images_load_original":{
                "type":"checkbox",
                "default_value":false,
                "description":"Загружать оригиналы вместо миниатюр"
            },
            "option_embedding":{
                "type":"checkbox",
                "default_value":false,
                "description":"Включить встраивание ▼",
                "children":{
                    "option_images_load_booru":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Загружать картинки с Booru, Tumblr и т.п."
                    },
                    "option_videos_parse_links":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Видео по прямой ссылке",
                        "children":{
                            "option_videos_parse_links_type":{
                                "type":"radio",
                                "default_value":"webm",
                                "radio_values":[
                                    {
                                        "text":"Только webm",
                                        "value":"webm"
                                    },
                                    {
                                        "text":"Все",
                                        "value":"all"
                                    }
                                ],
                                "description":""
                            },
                            "option_videos_parse_leave_links":{
                                "type":"checkbox",
                                "default_value":false,
                                "description":"Оставлять ссылку на видео"
                            }
                        }
                    },
                    "option_audios_parse_links":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Аудио по прямой ссылке",
                        "children":{
                            "option_audios_parse_leave_links":{
                                "type":"checkbox",
                                "default_value":false,
                                "description":""
                            }
                        }
                    },
                    "option_embedding_soundcloud":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Soundcloud ▼",
                        "children":{
                            "option_embedding_soundcloud_orig_link":{
                                "type":"checkbox",
                                "default_value":false,
                                "description":"Не убирать ссылку"
                            }
                        }
                    },
                    "option_embedding_pleercom":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Pleer.com ▼",
                        "children":{
                            "option_embedding_pleercom_nokita_server":{
                                "type":"checkbox",
                                "default_value":false,
                                "description":"Использовать сервер @NokitaKaze (deprecated)"
                            },
                            "option_embedding_pleercom_orig_link":{
                                "type":"checkbox",
                                "default_value":false,
                                "description":""
                            }
                        }
                    },
                    "option_embedding_coubcom":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Coub.com ▼",
                        "children":{
                            "option_embedding_coubcom_orig_link":{
                                "type":"checkbox",
                                "default_value":false,
                                "description":"Не убирать ссылку"
                            }
                        }
                    },
                    "option_embedding_twitter_tweets":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Twitter"
                    },
                    "option_embedding_instagram_posts":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Встраиваем посты из Instagram"
                    }
                }
            },
            "option_nsfw":{
                "type":"checkbox",
                "default_value":false,
                "description":"Фильтрация NSFW-контента",
                "children":{
                    "option_nsfw_hide_posts":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Скрывать посты из ленты"
                    },
                    "option_nsfw_blur_posts_images":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Размытие картинок в постах",
                        "children":{
                            "option_nsfw_blur_posts_entire":{
                                "type":"checkbox",
                                "default_value":false,
                                "description":"Размытие постов полностью"
                            }
                        }
                    },
                    "option_nsfw_blur_comments_images":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Размытие картинок в комментариях",
                        "children":{
                            "option_nsfw_blur_comments_entire":{
                                "type":"checkbox",
                                "default_value":false,
                                "description":"Размытие комментариев целиком"
                            }
                        }
                    }
                }
            }
        }
    },
    "tree_other":{
        "type":"tree",
        "description":"",
        "children":{
            "option_ctrl_enter":{
                "type":"checkbox",
                "default_value":false,
                "description":"Отправлять текст по CTRL+Enter (устарело)"
            },
            "option_fluid_layout":{
                "type":"checkbox",
                "default_value":false,
                "description":"\"Резиновая\" вёрстка (растянуть сайт по горизонтали)"
            },
            "option_visual_editor_post":{
                "type":"checkbox",
                "default_value":false,
                "description":"Визуальный редактор постов"
            },
            "option_search_with_google":{
                "type":"checkbox",
                "default_value":false,
                "description":"Поиск по сайту с помощью Google"
            },
            "option_enlarge_font":{
                "type":"checkbox",
                "default_value":false,
                "description":"Увеличить шрифт ▼",
                "children":{
                    "option_enlarge_font_size":{
                        "type":"radio",
                        "default_value":"85",
                        "radio_values":[
                            {
                                "text":"\n 0.85 em\n ",
                                "value":"85"
                            },
                            {
                                "text":"\n 1 em\n ",
                                "value":"100"
                            },
                            {
                                "text":"\n 1.1 em\n ",
                                "value":"110"
                            }
                        ],
                        "description":""
                    }
                }
            },
            "option_at_before_username":{
                "type":"checkbox",
                "default_value":false,
                "description":"Пёс перед юзернеймом"
            },
            "option_other_hightlight_post_comments":{
                "type":"checkbox",
                "default_value":false,
                "description":"Подсвечивать посты с новыми комментариями"
            },
            "option_other_show_recommendation_count":{
                "type":"checkbox",
                "default_value":false,
                "description":"Показывать количество рекомендаций и уникальных комментаторов в посте (используя сервер @NokitaKaze)"
            },
            "option_other_scroll_space_key":{
                "type":"checkbox",
                "default_value":false,
                "description":"Скроллинг постов пробелом"
            },
            "option_other_comments_nesting_level":{
                "type":"checkbox",
                "default_value":false,
                "description":"Индикатор уровня вложенности коммнентариев"
            },
            "option_other_comments_count_refresh":{
                "type":"checkbox",
                "default_value":false,
                "description":"Обновляем количество непрочитанных комментариев и постов в ленте",
                "children":{
                    "option_other_comments_count_refresh_title":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Указываем кол-во комментариев и сообщений в заголовке страницы"
                    }
                }
            },
            "option_other_comments_user_system":{
                "type":"checkbox",
                "default_value":false,
                "description":"Заметки о пользователях на полях"
            },
            "option_other_post_draft_save":{
                "type":"checkbox",
                "default_value":false,
                "description":"Сохранение и восстановление черновиков постов"
            }
        }
    },
    "tree_websocket":{
        "type":"tree",
        "description":"",
        "children":{
            "option_ws":{
                "type":"checkbox",
                "default_value":false,
                "description":"Включить вебсокеты ▼",
                "children":{
                    "option_ws_comments":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Получать комментарии ▼",
                        "children":{
                            "option_ws_comments_color_fadeout":{
                                "type":"checkbox",
                                "default_value":false,
                                "description":"Затухание подсветки через 20 секунд"
                            },
                            "option_ws_comments_notifications":{
                                "type":"checkbox",
                                "default_value":false,
                                "description":"Включить уведомления на рабочем столе"
                            }
                        }
                    },
                    "option_ws_feeds":{
                        "type":"checkbox",
                        "default_value":false,
                        "description":"Обрабатывать ленты ▼",
                        "children":{
                            "option_ws_feeds_subscriptions":{
                                "type":"checkbox",
                                "default_value":false,
                                "description":"Подписки"
                            },
                            "option_ws_feeds_blogs":{
                                "type":"checkbox",
                                "default_value":false,
                                "description":"Блоги пользователей (только при подписке)"
                            }
                        }
                    }
                }
            }
        }
    }
};

/**
 * Инициализатор опций, дёргается первым из кода, потом запускает всё остальное
 *
 * @param callback callback, который должен быть дёрнут, когда опции создадутся
 */
function point_sharp_options_init(callback) {
    // @todo перебрать все значения point_sharp_options_tree, превратить их в список с default value

    // Берём версию и Local Storage
    point_sharp_get_version(function (point_sharp_version) {
        local_storage_get('options', function (raw_options) {
            console.info("Version: ", point_sharp_version, "Options from storage: ", raw_options);
            if (raw_options == null) {
                // Мы загрузились в первый раз... для чего... для кого
                console.info('raw_options is null. First loading?');
                raw_options = {};
            }

            raw_options['version'] = point_sharp_version;
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
 * Сохраняем набор опций
 *
 * @param data object из значений
 * @param success_callback Функция, которую дёрнем, когда сохраним значение
 */
function local_options_set(data, success_callback) {
    console.log("Content code. local_options_set %O", data);
    // Из-за проблемы двух окон мы сначала берём опции, а потом сохраняем их
    local_storage_get('options', function (current_options) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                current_options[key] = data[key];
            }
        }

        local_storage_set({'options': current_options}, success_callback);
    });

    console.log("Content code. local_options_set end");
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

