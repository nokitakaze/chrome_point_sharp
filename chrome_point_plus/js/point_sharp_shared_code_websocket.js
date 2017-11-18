/**
 * Выносим WebSocket в отдельный файл, там слишком много говнокода
 *
 * ПЛАТФОРМОНЕЗАВИСИМЫЙ ГОВНОКОД
 */

/**
 *
 * @param {Object} wsMessage
 * @param {String} wsMessage.post_id
 * @param {String} wsMessage.comment_id
 * @param {String} wsMessage.author
 * @param {String} wsMessage.text
 * @param {String} wsMessage.a
 * @param {String} wsMessage.to_comment_id
 * @param {String} wsMessage.rcid
 * @param {String} wsMessage.html
 * @param {String} my_nick_lower
 * @param {String} postId
 * @param {OptionsManager} options
 */
function ws_message_comment(wsMessage, my_nick_lower, postId, options) {
    console_group_collapsed('ws-comment' + wsMessage.post_id + '/' + wsMessage.comment_id);

    // Desktop notifications
    if (options.is('option_ws_comments_notifications') &&
        (wsMessage.author.toLowerCase() != my_nick_lower)) {
        html5_notification({
            notificationId: 'comment_' + wsMessage.post_id + '#' + wsMessage.comment_id,
            avatarUrl: getProtocol() + '//point.im/avatar/' + wsMessage.author + '/80',
            title: '@' + wsMessage.author + ' #' + wsMessage.post_id + '/' +
                   wsMessage.comment_id,
            text: wsMessage.text,
            url: 'https://' + wsMessage.author.toLowerCase() + '.point.im/' +
                 wsMessage.post_id + '#' + wsMessage.comment_id
        }, function(response) {}, true);
    }

    // Check we are in the post
    // Check we are in specified post
    if (($('#top-post').length < 1) || (wsMessage.post_id != postId)) {
        var unread_count = parseInt($('#main #left-menu #menu-comments .unread').text(), 10);
        // Обновляем баджи
        $('#main #left-menu #menu-comments .unread').text(unread_count + 1).show();

        // Обновляем кол-во каментов на стене
        var new_comment_post = $('div.post[data-id="' + wsMessage.post_id + '"]');
        if (new_comment_post.length > 0) {
            var post_id_block = new_comment_post.find('.post-id');
            var unread_block = post_id_block.find('.unread');
            if (unread_block.length == 0) {
                post_id_block.find('a').first().append(
                    '<span class="unread" style="margin-left: 3px;">1</span>');
            } else {
                unread_block.text(parseInt(unread_block.text(), 10) + 1).show();
            }

            if (options.is('option_other_hightlight_post_comments')) {
                $(new_comment_post).addClass('new_comments');
            }
        }

        console_group_end();
        return;
    }

    if (my_nick_lower == wsMessage.author.toLowerCase()) {
        // Это мы сами и есть
        $('#top-post .action-buttons .subscribe').each(function(num, obj) {
            var new_href = $(obj).attr('href');
            new_href = new_href.replace(new RegExp('/s\\?csrf_token='), '/u?csrf_token=');
            $(obj).text('отписаться').attr({
                'href': new_href
            });
        }).addClass('active');
    }

    if (!options.is('option_ws')) {
        console_group_end();
        return;
    }

    // Generating comment from websocket message
    ajax_get_comments_create_comment_elements({
        id: (wsMessage.a == 'comment') ? wsMessage.comment_id : wsMessage.rcid,
        toId: (wsMessage.a == 'comment') ? wsMessage.to_comment_id : wsMessage.comment_id,
        postId: wsMessage.post_id,
        author: wsMessage.author,
        text: wsMessage.text,
        html: wsMessage.html,
        options: options,
        fadeOut: options.is('option_ws_comments_color_fadeout'),
        commentType: (wsMessage.a == 'comment') ? 'comment' : 'recommendation'
    }, function($comment, again_callback) {
        // It's time to DOM
        console.info('Inserting comment');

        // Search for parent comment
        var $parentComment =
            (wsMessage.to_comment_id) ? ($('.post[data-comment-id="' + wsMessage.to_comment_id + '"]'))
                : [];
        console.log('Parent comment: ', $parentComment || null);

        // If list mode or not addressed to other comment
        if ($('#comments #tree-switch a').eq(0).hasClass('active') ||
            (wsMessage.to_comment_id === null) || (!$parentComment.length)) {
            // Adding to the end of the list
            $('.content-wrap #comments #post-reply').before($comment);
        } else {
            // Check for children
            var $parentCommentChildren = $parentComment.next('.comments');
            // If child comment already exist
            if ($parentCommentChildren.length > 0) {
                console.log('Child comments found. Appending...');
                $parentCommentChildren.append($comment);
            } else {
                console.log('No child comments found. Creating...');
                $parentComment.after($('<div>').addClass('comments').append($comment));
            }
        }

        console_group_end();
        again_callback();
    });
}

/**
 *
 * @param {Object} wsMessage
 * @param {String} wsMessage.post_id
 * @param {String} wsMessage.comment_id
 * @param {String} wsMessage.author
 * @param {String} wsMessage.text
 * @param {String} wsMessage.a
 * @param {String} wsMessage.to_comment_id
 * @param {String} wsMessage.rcid
 * @param {String} wsMessage.html
 * @param {String} wsMessage.from
 * @param {String[]} wsMessage.tags
 * @param {String} my_nick_lower
 * @param {OptionsManager} options
 */
function ws_message_post(wsMessage, my_nick_lower, options) {
    console_group_collapsed('ws-post #' + wsMessage.post_id);

    if (options.is('option_ws_posts_notifications') &&
        (wsMessage.author.toLowerCase() != my_nick_lower)) {
        var tags_text = '';
        for (var i = 0; i < wsMessage.tags.length; i++) {
            tags_text += ' ' + wsMessage.tags[i];
        }
        if (tags_text != '') {
            tags_text = tags_text.substr(1) + "\r\n";
        }

        html5_notification({
            notificationId: 'post_' + wsMessage.post_id,
            avatarUrl: getProtocol() + '//point.im/avatar/' + wsMessage.author + '/80',
            title: 'Post by @' + wsMessage.author + ' #' + wsMessage.post_id,
            text: tags_text + wsMessage.text,
            url: 'https://' + wsMessage.author.toLowerCase() + '.point.im/' + wsMessage.post_id
        }, function(response) {}, true);
    }

    var unread_count = parseInt($('#main #left-menu #menu-recent .unread').text(), 10);
    $('#main #left-menu #menu-recent .unread').text(unread_count + 1).show();

    console_group_end();
}


/**
 *
 * @param {Object} wsMessage
 * @param {String} wsMessage.post_id
 * @param {String} wsMessage.comment_id
 * @param {String} wsMessage.author
 * @param {String} wsMessage.text
 * @param {String} wsMessage.a
 * @param {String} wsMessage.to_comment_id
 * @param {String} wsMessage.rcid
 * @param {String} wsMessage.html
 * @param {String} wsMessage.from
 * @param {String[]} wsMessage.tags
 * @param {OptionsManager} options
 */
function ws_message_sub(wsMessage, options) {
    console_group_collapsed('ws-subscription ' + wsMessage.from + '/' + wsMessage.comment_id);
    var subscription_user_name = wsMessage.from.toLowerCase();

    // Desktop notifications
    if (options.is('option_ws_subscription')) {
        html5_notification({
            notificationId: 'subscription_' + subscription_user_name,
            avatarUrl: getProtocol() + '//point.im/avatar/' + subscription_user_name + '/80',
            title: '@' + wsMessage.from + ' подписался на вас',
            text: '',
            url: 'https://' + subscription_user_name + '.point.im/'
        }, function(response) {}, true);
    }
}

function getProtocol() {
    return ((location.protocol == 'http:') ? 'http:' : 'https:');
}

/**
 * Пишем комментарии через AJAX
 *
 * Дальшейший код отвечает за посыл каментов через AJAX
 */

/**
 * Инициируем систему посылки комментариев через AJAX
 * Вешаем обработчики
 *
 * @param options Опции, переданные из скрипта
 */
function ajax_get_comments_init(options) {
    // Removing old bindings
    // Dirty hack for page context
    $('#comments').replaceWith($('#comments').clone());

    // on submit
    $('#content')[0].addEventListener('keydown', function(evt) {
        console.log('#content addEventListener keydown true', evt);
        var form = $(evt.target).parents('form').first();
        if (form.length == 0) {
            return;
        } else if (!form.hasClass('reply-form')) {
            return;
        }

        if ((evt.keyCode === 10 || evt.keyCode === 13) && (evt.ctrlKey || evt.metaKey)) {
            // Выключаем встроенный Event Listener Point'а
            evt.stopPropagation();
            evt.preventDefault();
            form.submit();
        }
    }, true);
    $('#comments form.reply-form, .post-content form.reply-form').on('submit', function(evt) {
        comments_reply_form_submit(evt, options);
    }).find('textarea').off('keydown');
}

function comments_reply_form_submit(evt, options) {
    var attach = $(evt.target).find('input[name="attach"]');
    if (attach.val() == '') {
        evt.stopPropagation();
        evt.preventDefault();

        var $post = $(evt.target).parents('.post').first();
        var csRf = $('#new-post-wrap input[name="csrf_token"]').val();
        ajax_get_comments_post_comment($post, csRf, options);
    }

}

/**
 * Реакция-обработчик, тут мы как бы посылаем каменты
 *
 * @param $post Родительский элемент
 * @param csRf csrf-токен
 * @param options Опции
 */
function ajax_get_comments_post_comment($post, csRf, options) {
    var current_options = options;
    var textarea = null;
    $post.find('textarea[name="text"]').each(function() {
        if ($(this).parents('form').first().attr('action').match(new RegExp('^/[a-z0-9]+$'))) {
            textarea = $(this);
        }
    });
    if (textarea === null) {
        console.error('Can not textarea');
        return;
    }
    var raw_text = textarea.val();
    var comment_id = (typeof($post.data('comment-id')) == 'undefined') ? 0 : $post.data('comment-id');
    if (raw_text == '') {
        console.error('raw_text is null');
        return;
    }

    $ajax({
        type: 'POST',
        url: '/api/post/' + $post.data('id'),
        postdata: 'text=' + urlencode(raw_text) + ((comment_id > 0) ? '&comment_id=' + urlencode(comment_id) : ''),
        headers: [['X-CSRF', csRf]],
        error: function() {
            console.error('AJAX request HTTP error while sending the comment', this);

            smart_form_post('/' + $('#top-post').attr('data-id'), {
                'text': raw_text,
                'csrf_token': $('#new-post-wrap input[name="csrf_token"]').val(),
                'comment_id': $post.data('comment-id')
            });
        },
        /**
         * @param {string} json Response data
         * @param {string} textStatus Text of request status
         */
        success: function(json) {
            /**
             * @var {object} data Response data
             * @var {number} data.comment_id ID of the created comment
             * @var {string} data.id ID of the post
             */
            var data = JSON.parse(json);

            //noinspection JSUnresolvedVariable
            if (typeof(data.error) !== 'undefined') {
                //noinspection JSUnresolvedVariable
                console.error('AJAX request HTTP error while sending the comment', data.error);

                smart_form_post('/' + $('#top-post').attr('data-id'), {
                    'text': raw_text,
                    'csrf_token': $('#new-post-wrap input[name="csrf_token"]').val(),
                    'comment_id': $post.data('comment-id')
                });

                return;
            }

            // Hiding form
            if (typeof($post.data('comment-id')) == 'undefined') {
                $('#top-post .reply-form').val('');
            } else {
                $('#reply-' + $post.data('id') + '_' + $post.data('comment-id')).prop('checked', false);
            }

            if (!options.is('option_ws')) {
                // Creating the comment HTML
                //noinspection JSUnresolvedVariable
                ajax_get_comments_create_comment_elements({
                        id: data.comment_id,
                        toId: $post.data('comment-id') || null,
                        postId: $post.data('id'),
                        author: $('#name h1').text(),
                        text: raw_text,
                        html: parse_markdown(raw_text),
                        options: current_options,
                        commentType: 'comment'
                    },
                    function($comment, callback_again) {
                        // Эта функция добавляет элемент $comment в DOM

                        // If list mode or not addressed to other comment
                        if ($('#comments #tree-switch a').eq(0).hasClass('active') ||
                            ($post.data('comment-id') === undefined)) {
                            // Adding to the end of the list
                            $('.content-wrap #comments #post-reply').before($comment);
                        } else {
                            // Check for children
                            var $parentCommentChildren = $post.next('.comments');

                            // If child comment already exist
                            if ($parentCommentChildren.length) {
                                $parentCommentChildren.append($comment);
                            } else {
                                $post.after($('<div>').addClass('comments').append($comment));
                            }
                        }

                        callback_again();
                    }
                );
            }

            // Cleaning textarea
            textarea.val('');
        }.bind(textarea)
    });
}


/**
 * @type {string} Шаблон комментария
 */
const ajax_get_comments_comment_template =
    '<div class="info">' + "\n" +
    '    <a href="#"><img class="avatar" src="#author-avatar" alt=""/></a>' + "\n" +
    '    <div class="created">' + "\n\n" +
    '    </div>' + "\n" +
    '</div>' + "\n" +
    '<div class="post-content">' + "\n" +
    '    <div class="author">' + "\n" +
    '        <a href="#" class="user"><!-- %author% --></a>' + "\n" +
    '    </div>' + "\n" +
    '    <div class="text">' + "\n" +
    '        <!-- <p>Comment text</p> -->' + "\n" +
    '    </div>' + "\n" +
    '    <div class="clearfix">' + "\n" +
    '        <div class="post-id">' + "\n" +
    '            <a href="#"><!-- #%post-id%/%comment-id% --></a>' + "\n" +
    '        </div>' + "\n" +
    '        <div class="action-labels">' + "\n" +
    '            <label class="reply-label">ответить</label>' + "\n" +
    '            <label class="more-label">ещё &#9662;</label>' + "\n" +
    '        </div>' + "\n" +
    '    </div>' + "\n" +
    '    <input type="checkbox" class="action-cb" name="action-radio"/>' + "\n" +
    '    <div class="action-buttons">' + "\n" +
    '        <a class="bookmark" href="#">в закладки</a>' + "\n" +
    '    </div>' + "\n" +
    '    <!-- Reply form -->' + "\n" +
    '    <input type="radio" class="reply-radio" name="reply-radio"/>' + "\n" +
    '    <form class="reply-form" action="#" method="post">' + "\n" +
    '        <textarea name="text"></textarea>' + "\n" +
    '        <input type="hidden" name="comment_id" value="">' + "\n" +
    '        <input type="hidden" name="csrf_token" value="">' + "\n" +
    '        <div class="clearfix">' + "\n" +
    '            <div class="attach">' + "\n" +
    '                <input type="file" name="attach" multiple="">' + "\n" +
    '                <div class="descr">Вы можете выбрать до 10 файлов общим размером не более 10 МБ.</div>' + "\n" +
    '            </div>' + "\n" +
    '            <div class="buttons">' + "\n" +
    '                <input type="submit" value="Ответить">' + "\n" +
    '            </div>' +
    '        </div>' + "\n" +
    '    </form>' + "\n" +
    '</div>';

/**
 * Создаём новый камент на странице поста
 *
 * Эта функция вызывается из кода вебсоккетов и из Ajax-создания каментов
 *
 * @param {object} commentData Comment data
 * @param {string|number} commentData.id ID of the created comment
 * @param {string|number|null} commentData.toId ID of the comment replying to
 * @param {string} commentData.postId ID of the post
 * @param {string} commentData.author Author of the comment
 * @param {string} commentData.text Text of the comment
 * @param {string} commentData.html Parsed html of the comment
 * @param {string} commentData.commentType
 * @param {OptionsManager} commentData.options Опции OptionManager
 * @param {function} onCommentCreated Callback which is called when comment is ready.
 * Этот коллбэк добавляет элемент в дом, а потом дёргает коллбэк опять
 *
 */
function ajax_get_comments_create_comment_elements(commentData, onCommentCreated) {
    var $anchor = $('<a>').attr('name', commentData.id);

    // Initializing comment element
    var $commentTemplate = $('<div>').attr({
        'class': 'post',
        'data-id': commentData.postId,
        'data-comment-id': commentData.id,
        'data-to-comment-id': commentData.id || ''
    }).addClass('unread').html(ajax_get_comments_comment_template).on('mouseover', function() {
        var current_post = $(this);
        if (current_post.hasClass('readed')) { return; }
        // @todo Снимать лисенер

        current_post.addClass('readed');
        setTimeout(function() {
            current_post.removeClass('unread');
        }, 1000);
    });

    if (commentData.commentType == 'recommendation') {
        $commentTemplate.addClass('recommendation');
    }

    // Date and time of comment
    var date = new Date();

    // Data for template
    var userLink = '//' + commentData.author + '.point.im/';
    var csRfToken = $('.reply-form input[name="csrf_token"]').first().val();

    // Filling template
    // Date and time
    $commentTemplate.find('.info .created')
        .append($('<span>').text(dateFormat(date, 'dd mmm')))
        .append($('<br>'))
        .append($('<span>').text(dateFormat(date, 'HH:MM')))
        .find('span').css('white-space', 'nowrap');
    // Author
    $commentTemplate.find('.author a.user').attr('href', userLink).text(commentData.author);
    // Avatar and link
    $commentTemplate.find('.info a').attr('href', userLink).children('img.avatar').attr('src',
        '//point.im/avatar/' + commentData.author + '/24');
    // Post and comment ID's link
    $commentTemplate.find('.clearfix .post-id a').attr('href',
        '//point.im/' + commentData.postId + '#' + commentData.id).text('#' + commentData.postId + '/' + commentData.id)
        .after((commentData.toId !== null) ? (' в ответ на <a href="#' + commentData.toId + '">/' + commentData.toId + '</a>')
            : (''));

    // Setting action labels and other attributes
    $commentTemplate.find('.action-labels .reply-label').attr('for', 'reply-' + commentData.postId + '_' + commentData.id);
    $commentTemplate.find('.action-labels .more-label').attr('for', 'action-' + commentData.postId + '_' + commentData.id);
    $commentTemplate.find('.post-content input[name="action-radio"]').attr('id',
        'action-' + commentData.postId + '_' + commentData.id);

    // Bookmark link
    $commentTemplate.find('.action-buttons a.bookmark').attr('href',
        $('#top-post .info a').attr('href') + commentData.postId + '/b?comment_id=' + commentData.id + '&csrf_token=' +
        csRfToken);

    // Reply form
    $commentTemplate.find('.post-content input.reply-radio').attr('id', 'reply-' + commentData.postId + '_' + commentData.id);
    $commentTemplate.find('.post-content form.reply-form').attr('action', '/' + commentData.postId).on('submit', function(evt) {
        comments_reply_form_submit(evt, commentData.options);
    }).find('textarea').off('keydown');
    $commentTemplate.find('.post-content form.reply-form textarea[name="text"]').text('@' + commentData.author + ', ');
    if (commentData.options.is('option_visual_editor_post')) {
        $commentTemplate.find('.post-content form.reply-form').addClass('bootstrapped');
        $commentTemplate.find('.post-content form.reply-form textarea[name="text"]').markdown(get_markdown_init_settings()).css(
            {'height': '15em'});
    }
    $commentTemplate.find('.post-content form.reply-form input[name="comment_id"]').val(commentData.id);
    $commentTemplate.find('.post-content form.reply-form input[name="csrf_token"]').val(csRfToken);

    // И самое главное: Текст комментария
    set_comment_text_to_dom(commentData, $commentTemplate.find('.text'));
    // /Filling template

    // Fade in
    $commentTemplate.hide().delay(250).fadeIn(2000);

    // Triggering callback
    onCommentCreated($anchor.add($commentTemplate), function() {
        // Сюда код возвращается вновь, наш элемент уже внутри DOM!
        // Едет callback через callback
        remark_entire_page(commentData.options);
    });
}
