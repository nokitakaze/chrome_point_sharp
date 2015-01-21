/**
 * Выносим WebSocket в отдельный файл, там слишком много говнокода
 *
 * ПЛАТФОРМОНЕЗАВИСИМЫЙ ГОВНОКОД
 */

/**
 * Инициализация приёма сообщений через Вебсоккеты
 *
 * @param options Опции, полученные из основной функции
 */
function skobkin_websocket_init(options) {
    // SSL or plain
    var ws = new WebSocket(((location.protocol == 'https:') ? 'wss' : 'ws') + '://point.im/ws');
    console.log('WebSocket created: ', ws);

    // Detecting post id if presented
    var postId = $('#top-post').attr('data-id');
    console.log('Current post id detected as #', postId);
    // Detecting view mode
    var treeSwitch = $('#tree-switch a.active').attr('href');
    console.log('Comments view mode: ', treeSwitch);

    // Error handler
    ws.onerror = function(err) {
        console.error('WebSocket error: ', err);
    };

    // Message handler
    ws.onmessage = function(evt) {
        try {
            // ping :)
            if (evt.data == 'ping') {
                console.info('ws-ping');
            } else {
                var wsMessage = JSON.parse(evt.data);
                console.log('WS Message: ', evt, wsMessage);

                if (wsMessage.hasOwnProperty('a') && wsMessage.a != '') {
                    switch (wsMessage.a) {
                        // Comments
                        case 'comment':
                            console_group_collapsed('ws-comment' + wsMessage.post_id + '/' + wsMessage.comment_id);
                            console.log(wsMessage);

                            // Check option
                            if (!options.is('option_ws_comments')) {
                                console.log('Comments processing disabled');
                                console_group_end();
                                break;
                            }

                            // Check we are in the post
                            if ($('#top-post').length < 1) {
                                console.log('Not in the post, skipping');
                                console_group_end();
                                break;
                            }

                            // Check we are in specified post
                            if (wsMessage.post_id != postId) {
                                console.log('The comment is not for this post');
                                console_group_end();
                                break;
                            }

                            // Generating comment from websocket message
                            ajax_get_comments_create_comment_elements({
                                id: wsMessage.comment_id,
                                toId: wsMessage.to_comment_id,
                                postId: wsMessage.post_id,
                                author: wsMessage.author,
                                text: wsMessage.text,
                                options: options,
                                fadeOut: options.is('option_ws_comments_color_fadeout')
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

                                // Desktop notifications
                                if (options.is('option_ws_comments_notifications')) {
                                    // @todo Переписать под Mozilla Firefox
                                    console.warn('Option `option_ws_comments_notifications` does not ready for production use');
                                    /*
                                     console.log('Showing desktop notification');
                                     chrome.runtime.sendMessage({
                                     type: 'showNotification',
                                     notificationId: 'comment_' + wsMessage.post_id + '#' + wsMessage.comment_id,
                                     avatarUrl: getProtocol() + '//point.im/avatar/' + wsMessage.author + '/80',
                                     title: '@' + wsMessage.author + ' #' + wsMessage.post_id + '/' + wsMessage.comment_id,
                                     text: wsMessage.text
                                     }, function(response) {});
                                     */
                                }

                                console_group_end();
                                again_callback();
                            });


                            break;

                        // Posts
                        case 'post':
                            console_group_collapsed('ws-post #' + wsMessage.post_id);

                            console.log(wsMessage);
                            if (options.is('option_ws_posts')) {
                                console.warn('Option `option_ws_posts` does not ready for production use');
                                // @todo Переписать под Mozilla Firefox
                                /*
                                 if (options.is('option_ws_posts_notifications')) {
                                 console.log('Showing desktop notification');
                                 chrome.runtime.sendMessage({
                                 type: 'showNotification',
                                 notificationId: 'post_' + wsMessage.post_id,
                                 avatarUrl: getProtocol() + '//point.im/avatar/' + wsMessage.author + '/80',
                                 title: 'Post by @' + wsMessage.author + ' #' + wsMessage.post_id,
                                 text: wsMessage.text
                                 }, function(response) {});
                                 }
                                 */
                            }

                            console_group_end();
                            break;

                        // Recommendation
                        case 'ok':
                            console_group_collapsed('ws-recommendation #' + wsMessage.post_id + '/' + wsMessage.comment_id);

                            console.log(wsMessage);

                            console_group_end();
                            break;

                        default:
                            console_group_collapsed('ws-other');

                            console.log(wsMessage);

                            console_group_end();
                            break;

                    }
                }


            }
        } catch (e) {
            console.error('WebSocket handler exception: ', e.name, e.message, e.fileName || null, e.lineNumber || null);
        }

    };
}

// Monts for Date.getMonth()
var months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

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

    // Binding new
    $('#comments').on('keypress.pp', '.reply-form textarea', function(evt) {
        if ((evt.keyCode === 10 || evt.keyCode === 13) && (evt.ctrlKey || evt.metaKey)) {
            evt.stopPropagation();
            evt.preventDefault();

            var $post = $(this).parents('.post').first();
            var csRf = $(this).siblings('input[name="csrf_token"]').val();

            ajax_get_comments_post_comment($post, csRf, this, options);
        }
    });
}

/**
 * Реакция-обработчик, тут мы как бы посылаем каменты
 *
 * @param $post Родительский элемент
 * @param csRf csrf-токен
 * @param event_parent Элемент-формочка
 * @param options Опции
 */
function ajax_get_comments_post_comment($post, csRf, event_parent, options) {
    var current_options = options;

    $ajax({
        type: 'POST',
        url:      '/api/post/' + $post.data('id'),
        postdata: 'text=' + urlencode($(event_parent).val()) + '&comment_id=' + urlencode($post.data('comment-id')),
        headers: [['X-CSRF', csRf]],
        error: function() {
            console.error('AJAX request error while sending the comment');

            // @todo Обработчик
//            alert(chrome.i18n.getMessage('msg_comment_send_failed') + '\n' + error);
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

            // Hiding form
            $('#reply-' + $post.data('id') + '_' + $post.data('comment-id')).prop('checked', false);

            // Creating the comment HTML
            ajax_get_comments_create_comment_elements({
                    id: data.comment_id,
                    toId: $post.data('comment-id') || null,
                    postId: $post.data('id'),
                    author: $('#name h1').text(),
                    text: $(event_parent).val(),
                    options: current_options,
                    fadeOut: false
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

                        // @fixme Find a bug with lost indentation of new comment
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

            // Cleaning textarea
            $(event_parent).val('');
        }.bind(event_parent)
    });
}


/**
 * @type {string} Шаблон комментария
 */
const ajax_get_comments_comment_template =
    '<div class="pp-highlight"></div>' + "\n" +
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
    '            <input type="submit" value="Ответить"/>' + "\n" +
    '        </div>' + "\n" +
    '    </form>' + "\n" +
    '</div>';

/**
 * Creating new comment elements for dynamic injection into the DOM
 *
 * @param {object} commentData Comment data
 * @param {string|number} commentData.id ID of the created comment
 * @param {string|number} commentData.toId ID of the comment replying to
 * @param {string} commentData.postId ID of the post
 * @param {string} commentData.author Author of the comment
 * @param {string} commentData.text Text of the comment
 * @param {boolean} commentData.fadeOut Is fadeout enabled or not
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
    }).html(ajax_get_comments_comment_template);

    // Date and time of comment
    var date = new Date();

    // Data for template
    var userLink = '//' + commentData.author + '.point.im/';
    var csRfToken = $('.reply-form input[name="csrf_token"]').first().val();

    // Filling template
    // Date and time
    $commentTemplate.find('.info .created')
        .append($('<span>').html(((date.getDate().toString.length < 2) ? ('0' + date.getDate().toString())
            : (date.getDate().toString())) + '&nbsp;' + months[date.getMonth()]))
        // Crutchy fix
        .append($('<br>'))
        ///Crutchy fix
        .append($('<span>').html(
            // @todo блядьпоменять http://blog.stevenlevithan.com/archives/date-time-format
            date.getHours() + ':' + ((date.getMinutes().toString().length < 2)
                ? ('0' + date.getMinutes().toString())
                : (date.getMinutes().toString()))));
    // Author
    $commentTemplate.find('.author a.user').attr('href', userLink).text(commentData.author);
    // Avatar and link
    $commentTemplate.find('.info a').attr('href', userLink).children('img.avatar').attr('src',
        '//point.im/avatar/' + commentData.author + '/24');
    // Post and comment ID's link
    $commentTemplate.find('.clearfix .post-id a').attr('href',
        '//point.im/' + commentData.postId + '#' + commentData.id).text('#' + commentData.postId + '/' + commentData.id)
        // Adding answer label
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
    $commentTemplate.find('.post-content form.reply-form').attr('action', '/' + commentData.postId);
    $commentTemplate.find('.post-content form.reply-form textarea[name="text"]').html('@' + commentData.author + ', ');
    $commentTemplate.find('.post-content form.reply-form input[name="comment_id"]').val(commentData.id);
    $commentTemplate.find('.post-content form.reply-form input[name="csrf_token"]').val(csRfToken);

    // И самое главное: Текст комментария
    // @todo Поправить переходы строки
    $commentTemplate.find('.text').append($('<p>').text(commentData.text));
    // /Filling template

    // Fading out highlight if needed
    if (commentData.fadeOut) {
        console.log('Fading out the highlight');
        $commentTemplate.children('.pp-highlight').delay(250).fadeOut(20000);
    }

    // Fade in
    $commentTemplate.hide().delay(250).fadeIn(2000);

    // Triggering callback
    onCommentCreated($anchor.add($commentTemplate), function() {
        // Сюда код возвращается вновь, наш элемент уже внутри DOM!
        // Едет callback через callback
        // @todo Сюда встают все обработчкики post factum, используя options
        console.log('Callback again ', commentData.options);

    });
}
