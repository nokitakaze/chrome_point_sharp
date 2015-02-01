/**
 * Список опций в виде дерева. Core Options Engine
 *
 * ПЛАТФОРМОНЕЗАВИСИМЫЙ ФАЙЛ
 */

// @todo Не забыть про платформозависимые опции
var point_sharp_options_tree = {
    "tree_media": {
        "type": "tree",
        "description": "Медиа",
        "children": {
            "option_fancybox": {
                "type": "boolean",
                "default_value": true,
                "description": "Включить Fancybox ▼",
                "children": {
                    "option_fancybox_images": {
                        "type": "boolean",
                        "default_value": true,
                        "description": "Использовать для картинок"
                    },
                    "option_fancybox_videos": {
                        "type": "boolean",
                        "default_value": false,
                        "description": "Использовать для видео (YouTube и т.п.)"
                    },
                    "option_fancybox_posts": {
                        "type": "boolean",
                        "default_value": false,
                        "description": "Использовать для ссылок на посты"
                    },
                    "option_fancybox_bind_images_to_one_flow": {
                        "type": "boolean",
                        "default_value": true,
                        "description": "Связать все картинки в одну галерею Fancybox"
                    },
                    "option_fancybox_smart_hints": {
                        "type": "boolean",
                        "default_value": true,
                        "description": "Генерировать подписи к картинкам из тегов"
                    }
                }
            },
            "option_images_load_original": {
                "type": "boolean",
                "default_value": false,
                "description": "Загружать оригиналы вместо миниатюр"
            },
            "option_embedding": {
                "type": "boolean",
                "default_value": true,
                "description": "Включить встраивание ▼",
                "children": {
                    "option_images_load_booru": {
                        "type": "boolean",
                        "default_value": true,
                        "description": "Загружать картинки с Booru, Tumblr и т.п.",
                        "children": {
                            "option_images_load_booru_remove_original_link": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Удалять ссылку"
                            }
                        }
                    },
                    "option_videos_parse_links": {
                        "type": "boolean",
                        "default_value": true,
                        "description": "Превращать ссылку на видео в видео",
                        "children": {
                            "option_videos_parse_links_type": {
                                "type": "enum",
                                "default_value": "all",
                                "radio_values": [
                                    {
                                        "text": "Только webm",
                                        "value": "webm"
                                    },
                                    {
                                        "text": "Все",
                                        "value": "all"
                                    }
                                ],
                                "description": ""
                            },
                            "option_videos_parse_leave_links": {
                                "type": "boolean",
                                "default_value": true,
                                "description": "Оставлять ссылку на видео"
                            }
                        }
                    },
                    "option_audios_parse_links": {
                        "type": "boolean",
                        "default_value": true,
                        "description": "Превращать ссылку на аудио в тег audio",
                        "children": {
                            "option_audios_parse_leave_links": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Оставлять ссылку на аудио"
                            }
                        }
                    },
                    "option_embedding_soundcloud": {
                        "type": "boolean",
                        "default_value": true,
                        "description": "Soundcloud ▼",
                        "children": {
                            "option_embedding_soundcloud_orig_link": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Не убирать ссылку"
                            }
                        }
                    },
                    "option_embedding_pleercom": {
                        "type": "boolean",
                        "default_value": true,
                        "description": "Pleer.com ▼",
                        "children": {
                            "option_embedding_pleercom_nokita_server": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Использовать сервер @NokitaKaze (deprecated)"
                            },
                            "option_embedding_pleercom_orig_link": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Не убирать ссылку"
                            }
                        }
                    },
                    "option_embedding_coubcom": {
                        "type": "boolean",
                        "default_value": true,
                        "description": "Coub.com ▼",
                        "children": {
                            "option_embedding_coubcom_orig_link": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Не убирать ссылку"
                            }
                        }
                    },
                    "option_embedding_twitter_tweets": {
                        "type": "boolean",
                        "default_value": true,
                        "description": "Twitter"
                    },
                    "option_embedding_instagram_posts": {
                        "type": "boolean",
                        "default_value": true,
                        "description": "Встраиваем посты из Instagram"
                    }
                }
            }
        }
    },
    "tree_other": {
        "type": "tree",
        "description": "Другое",
        "children": {
            /*
             "option_fluid_layout": {
             "type": "boolean",
             "default_value": false,
             "description": "\"Резиновая\" вёрстка (растянуть сайт по горизонтали)"
             },
             */
            "option_visual_editor_post": {
                "type": "boolean",
                "default_value": false,
                "description": "Визуальный редактор постов"
            },
            /*
             "option_search_with_google": {
             "type": "boolean",
             "default_value": false,
             "description": "Поиск по сайту с помощью Google"
             },
             */
            "option_enlarge_font": {
                "type": "boolean",
                "default_value": false,
                "description": "Увеличить шрифт ▼",
                "children": {
                    "option_enlarge_font_size": {
                        "type": "enum",
                        "default_value": "85",
                        "radio_values": [
                            {
                                "text": "На 13%",
                                "value": "85"
                            },
                            {
                                "text": "На 33%",
                                "value": "100"
                            },
                            {
                                "text": "На 46%",
                                "value": "110"
                            }
                        ],
                        "description": ""
                    }
                }
            },
            "option_at_before_username": {
                "type": "boolean",
                "default_value": false,
                "description": "Пёс перед юзернеймом"
            },
            "option_other_hightlight_post_comments": {
                "type": "boolean",
                "default_value": true,
                "description": "Подсвечивать посты с новыми комментариями"
            },
            "option_other_hightlight_post_unviewed": {
                "type": "boolean",
                "default_value": true,
                "description": "Подсвечивать новые посты"
            },
            "option_other_hightlight_comment_topic_starter": {
                "type": "boolean",
                "default_value": true,
                "description": "Подсвечивать комментарии топик стартера"
            },
            "option_other_show_recommendation_count": {
                "type": "boolean",
                "default_value": true,
                "description": "Показывать количество рекомендаций и уникальных комментаторов в посте"
            },
            "option_other_scroll_space_key": {
                "type": "boolean",
                "default_value": true,
                "description": "Скроллинг постов пробелом"
            },
            "option_other_comments_nesting_level": {
                "type": "boolean",
                "default_value": true,
                "description": "Индикатор уровня вложенности коммнентариев"
            },
            "option_other_comments_count_refresh": {
                "type": "boolean",
                "default_value": true,
                "description": "Обновляем количество непрочитанных комментариев и постов в ленте",
                "children": {
                    "option_other_comments_count_refresh_title": {
                        "type": "boolean",
                        "default_value": true,
                        "description": "Указываем кол-во комментариев и сообщений в заголовке страницы"
                    }
                }
            },
            "option_other_comments_user_system": {
                "type": "boolean",
                "default_value": true,
                "description": "Заметки о пользователях на полях"
            },
            "option_other_post_draft_save": {
                "type": "boolean",
                "default_value": true,
                "description": "Сохранение и восстановление черновиков постов"
            },
            "option_wrap_long_posts": {
                "type": "boolean",
                "default_value": true,
                "description": "Сворачивать огромные простыни"
            }
        }
    },
    "tree_websocket": {
        "type": "tree",
        "description": "Интерактивность",
        "children": {
            "option_ws": {
                "type": "boolean",
                "default_value": false,
                "description": "Получать комментарии через Вебсокеты",
                "children": {
                    "option_ws_comments_notifications": {
                        "type": "boolean",
                        "default_value": false,
                        "description": "Включить уведомления на рабочем столе"
                    }
                }
                /*
                 ,"option_ws_feeds": {
                 "type": "boolean",
                 "default_value": false,
                 "description": "Обрабатывать ленты ▼",
                 "children": {
                 "option_ws_feeds_subscriptions": {
                 "type": "boolean",
                 "default_value": false,
                 "description": "Подписки"
                 },
                 "option_ws_feeds_blogs": {
                 "type": "boolean",
                 "default_value": false,
                 "description": "Блоги пользователей (только при подписке)"
                 }
                 }
                 }*/

            },
            'option_send_comments_ajax': {
                "type": "boolean",
                "default_value": true,
                "description": "Отправлять комментарии через Аякс",
                "children": {}
            },
            "option_ws_posts_notifications": {
                "type": "boolean",
                "default_value": false,
                "description": "Включить уведомления о новых постах на рабочем столе"
            }
        }
    },
    "tree_nsfw": {
        "type": "tree",
        "description": "NSFW",
        "children": {

            "option_nsfw1": {
                "type": "boolean",
                "default_value": false,
                "description": "Фильтрация NSFW-контента (Набор 1)",
                "children": {
                    "option_nsfw1_tags_set": {
                        "type": "text",
                        "default_value": "сиськи,nsfw,18+,эротика",
                        "description": "Теги, разделённые запятыми"
                    },
                    "option_nsfw1_hide_posts": {
                        "type": "boolean",
                        "default_value": false,
                        "description": "Скрывать посты из ленты"
                    },
                    "option_nsfw1_blur_posts_images": {
                        "type": "boolean",
                        "default_value": false,
                        "description": "Размытие картинок в постах",
                        "children": {
                            "option_nsfw1_blur_posts_entire": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Размытие постов полностью"
                            },
                            "option_nsfw1_black_ant": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Превращать картинки в муравьёв"
                            }
                        }
                    },
                    "option_nsfw1_blur_comments_images": {
                        "type": "boolean",
                        "default_value": false,
                        "description": "Размытие картинок в комментариях",
                        "children": {
                            "option_nsfw1_blur_comments_entire": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Размытие комментариев целиком"
                            },
                            "option_nsfw1_blur_comments_black_ant": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Превращать картинки комментариев в муравьёв"
                            }
                        }
                    }


                }
            },

            "option_nsfw2": {
                "type": "boolean",
                "default_value": false,
                "description": "Фильтрация NSFW-контента (Набор 2)",
                "children": {
                    "option_nsfw2_tags_set": {
                        "type": "text",
                        "default_value": "anime_art",
                        "description": "Теги, разделённые запятыми"
                    },
                    "option_nsfw2_hide_posts": {
                        "type": "boolean",
                        "default_value": false,
                        "description": "Скрывать посты из ленты"
                    },
                    "option_nsfw2_blur_posts_images": {
                        "type": "boolean",
                        "default_value": false,
                        "description": "Размытие картинок в постах",
                        "children": {
                            "option_nsfw2_blur_posts_entire": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Размытие постов полностью"
                            },
                            "option_nsfw2_black_ant": {
                                "type": "boolean",
                                "default_value": true,
                                "description": "Превращать картинки в муравьёв"
                            }
                        }
                    },
                    "option_nsfw2_blur_comments_images": {
                        "type": "boolean",
                        "default_value": false,
                        "description": "Размытие картинок в комментариях",
                        "children": {
                            "option_nsfw2_blur_comments_entire": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Размытие комментариев целиком"
                            },
                            "option_nsfw2_blur_comments_black_ant": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Превращать картинки комментариев в муравьёв"
                            }
                        }
                    }


                }
            },

            "option_nsfw3": {
                "type": "boolean",
                "default_value": false,
                "description": "Фильтрация NSFW-контента (Набор 3)",
                "children": {
                    "option_nsfw3_tags_set": {
                        "type": "text",
                        "default_value": "",
                        "description": "Теги, разделённые запятыми"
                    },
                    "option_nsfw3_hide_posts": {
                        "type": "boolean",
                        "default_value": false,
                        "description": "Скрывать посты из ленты"
                    },
                    "option_nsfw3_blur_posts_images": {
                        "type": "boolean",
                        "default_value": false,
                        "description": "Размытие картинок в постах",
                        "children": {
                            "option_nsfw3_blur_posts_entire": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Размытие постов полностью"
                            },
                            "option_nsfw3_black_ant": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Превращать картинки в муравьёв"
                            }
                        }
                    },
                    "option_nsfw3_blur_comments_images": {
                        "type": "boolean",
                        "default_value": false,
                        "description": "Размытие картинок в комментариях",
                        "children": {
                            "option_nsfw3_blur_comments_entire": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Размытие комментариев целиком"
                            },
                            "option_nsfw3_blur_comments_black_ant": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Превращать картинки комментариев в муравьёв"
                            }
                        }
                    }


                }
            },

            "option_nsfw4": {
                "type": "boolean",
                "default_value": false,
                "description": "Фильтрация NSFW-контента (Набор 4)",
                "children": {
                    "option_nsfw4_tags_set": {
                        "type": "text",
                        "default_value": "",
                        "description": "Теги, разделённые запятыми"
                    },
                    "option_nsfw4_hide_posts": {
                        "type": "boolean",
                        "default_value": false,
                        "description": "Скрывать посты из ленты"
                    },
                    "option_nsfw4_blur_posts_images": {
                        "type": "boolean",
                        "default_value": false,
                        "description": "Размытие картинок в постах",
                        "children": {
                            "option_nsfw4_blur_posts_entire": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Размытие постов полностью"
                            },
                            "option_nsfw4_black_ant": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Превращать картинки в муравьёв"
                            }
                        }
                    },
                    "option_nsfw4_blur_comments_images": {
                        "type": "boolean",
                        "default_value": false,
                        "description": "Размытие картинок в комментариях",
                        "children": {
                            "option_nsfw4_blur_comments_entire": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Размытие комментариев целиком"
                            },
                            "option_nsfw4_blur_comments_black_ant": {
                                "type": "boolean",
                                "default_value": false,
                                "description": "Превращать картинки комментариев в муравьёв"
                            }
                        }
                    }


                }
            }


        }
    }
};


/**
 * Рекурсивный обход всех веток бранча через children
 *
 * @param branch
 * @param callback
 */
function point_sharp_options_branch_view(branch, callback) {
    if (typeof(branch.children) == 'undefined') {
        return;
    }

    for (var index in branch.children) {
        var item = branch.children[index];
        callback(index, item);
        point_sharp_options_branch_view(branch.children[index], callback);
    }
}

/**
 * Инициализатор опций, дёргается первым из кода, потом запускает всё остальное
 *
 * @param callback callback, который должен быть дёрнут, когда опции создадутся
 */
function point_sharp_options_init(callback) {
    // Перебор всех веток в point_sharp_options_tree, превращаем их в список с default value
    /**
     * @type {object} Неструктурированный сырой список опций
     */
    var options_plain_list = {};
    for (var index in point_sharp_options_tree) {
        point_sharp_options_branch_view(point_sharp_options_tree[index], function(name, item) {
            options_plain_list[name] = item;
        });
    }

    // Берём версию и Local Storage
    point_sharp_get_version(function(point_sharp_version) {
        local_storage_get('options', function(raw_options) {
            console.info("Version: ", point_sharp_version, "Options from storage: ", raw_options);
            if (raw_options == null) {
                // Мы загрузились в первый раз... для чего... для кого
                console.info('raw_options is null. First loading?');
                raw_options = {};
            }

            raw_options['version'] = point_sharp_version;

            // Перебираем все опции и задаём им default значения, если надо
            var need_save_options = false;
            var changed_options = [];
            for (var index in options_plain_list) {
                if (typeof(raw_options[index]) == 'undefined') {
                    raw_options[index] = options_plain_list[index].default_value;
                    changed_options[index] = options_plain_list[index].default_value;
                    need_save_options = true;
                }
            }

            // @todo Не забыть про платформозависимые опции

            // Если есть хотя бы одно сменённое значение, сохраняем опции
            if (need_save_options) {
                console.info('There is some new options', changed_options);
                local_options_set(changed_options, function() {
                });
            }

            // Дёргаем callback
            var options = new OptionsManager(raw_options);
            callback(options);
        });
    });

}


/**
 * @type {boolean} Флаг мьютекс сохранения опций в данный момент
 */
var point_sharp_options_set_save = false;

/**
 * Сохраняем набор опций
 *
 * @param data object из значений
 * @param success_callback Функция, которую дёрнем, когда сохраним значение
 */
function local_options_set(data, success_callback) {
    if (point_sharp_options_set_save) {
        // Кекекекекекекекекеке
        setTimeout(function() {
            local_options_set(data, success_callback);
        }, 50);
    }

    console.log("Content code. local_options_set", data);
    point_sharp_options_set_save = true;

    // Из-за проблемы двух окон мы сначала берём опции, а потом сохраняем их
    local_storage_get('options', function(current_options) {
        if ((typeof(current_options) != 'object') || (current_options === null)) {
            current_options = {};
        }

        for (var key in data) {
            current_options[key] = data[key];
        }

        local_storage_set({'options': current_options}, function() {
            point_sharp_options_set_save = false;
            success_callback();
        });
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
OptionsManager.prototype.get = function(optionName) {
    if (this._options.hasOwnProperty(optionName)) {
        return this._options[optionName];
    } else {
        console.warn("Options does not have key `", optionName, '`');
        return null;
    }
};

/**
 * Сохраняем набор опций. Враппер для local_options_set
 *
 * @param {String} data Набор из имени опций и её значения
 * @param {function} success_callback Имя опции
 */
OptionsManager.prototype.set = function(data, success_callback) {
    for (var index in data) {
        this._options[index] = data[index];
    }

    local_options_set(data, success_callback);
};

/**
 * Проверяет, равна ли опция значению value. Если value не переданно, проверяет задана ли она и не равна ли false/''
 *
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
 * Геттер для сырых опций
 *
 * @returns {Object} Кеш опций
 */
OptionsManager.prototype.getOptions = function() {
    return this._options;
};

/**
 * @returns {Object} Версия расширения
 */
OptionsManager.prototype.version = function() {
    return this._options.version;
};

/**
 * Получаем тип опции по её имени
 *
 * @param optionName
 * @returns {null|string}
 */
OptionsManager.prototype.getType = function(optionName) {
    var ret = null;
    for (var index in point_sharp_options_tree) {
        point_sharp_options_branch_view(point_sharp_options_tree[index], function(name, item) {
            if (name == optionName) {
                ret = item.type;
            }
        });
    }

    return ret;
};
