/**
 * Выносим WebSocket в отдельный файл, там слишком много говнокода
 *
 * ПЛАТФОРМОНЕЗАВИСИМЫЙ ГОВНОКОД
 */

function skobkin_websocket_init(options){
    // SSL or plain
    ws = new WebSocket(((location.protocol == 'https:') ? 'wss' : 'ws') + '://point.im/ws');
    console.log('WebSocket created: %O', ws);

    // @todo: унести в опцию
    // Adding event listener for notification click
    chrome.runtime.sendMessage({
        type: 'listenNotificationClicks',
        protocol: getProtocol()
    });

    // Detecting post id if presented
    var postId = $('#top-post').attr('data-id');
    console.debug('Current post id detected as #%s', postId);
    // Detecting view mode
    treeSwitch = $('#tree-switch a.active').attr('href');
    console.debug('Comments view mode: %s', treeSwitch);

    // Error handler
    ws.onerror = function (err) {
        console.error('WebSocket error: %O', err);
    };

    // Message handler
    ws.onmessage = function (evt) {
        try {
            // ping :)
            if (evt.data == 'ping') {
                console.info('ws-ping');
            } else {
                var wsMessage = JSON.parse(evt.data);

                if (wsMessage.hasOwnProperty('a') && wsMessage.a != '') {
                    switch (wsMessage.a) {
                        // Comments
                        case 'comment':
                            console.groupCollapsed('ws-comment #%s/%s', wsMessage.post_id, wsMessage.comment_id);
                            console.debug(wsMessage);

                            // Check option
                            if (!options.is('option_ws_comments')) {
                                console.log('Comments processing disabled');
                                console.groupEnd();
                                break;
                            }

                            // Check we are in the post
                            if ($('#top-post').length < 1) {
                                console.log('Not in the post, skipping');
                                console.groupEnd();
                                break;
                            }

                            // Check we are in specified post
                            if (wsMessage.post_id != postId) {
                                console.log('The comment is for #%s but current page is for #%s', wsMessage.post_id, postId);
                                console.groupEnd();
                                break;
                            }

                            var $anchor = $('<a>').attr('name', wsMessage.comment_id);

                            // Initializing comment element
                            var $commentTemplate = $('<div>').attr({
                                'class': 'post',
                                'data-id': postId,
                                'data-comment-id': wsMessage.comment_id,
                                'data-to-comment-id': (wsMessage.to_comment_id != null) ? wsMessage.to_comment_id : ''
                            });

                            // @todo: Вынести в отдельную функцию
                            // Loading HTML template
                            $commentTemplate.load(chrome.extension.getURL('includes/comment.html'), function () {
                                // Load complete
                                console.info('comment.html loaded');

                                // Date and time of comment
                                var date = new Date();

                                // @todo: унести наверх
                                // Data for template
                                var userLink = '//' + wsMessage.author + '.point.im/';
                                var postAuthorLink = $('#top-post .info a').attr('href');
                                var postLink = postAuthorLink + wsMessage.post_id;
                                var userAvatar = '//point.im/avatar/' + wsMessage.author;
                                var commentLink = '//point.im/' + wsMessage.post_id + '#' + wsMessage.comment_id;
                                var csRfToken = $('.reply-form input[name="csrf_token"').val();

                                // Filling template
                                console.info('Changing data in the comment element');
                                // Date and time
                                $commentTemplate.find('.info .created')
                                    .append($('<span>').html(((date.getDate().toString.length < 2) ? ('0' + date.getDate().toString()) : (date.getDate().toString())) + '&nbsp;' + months[date.getMonth()]))
                                    // Crutchy fix
                                    .append($('<br>'))
                                    ///Crutchy fix
                                    .append($('<span>').html(date.getHours() + ':' + ((date.getMinutes().toString().length < 2) ? ('0' + date.getMinutes().toString()) : (date.getMinutes().toString()))));
                                // Comment text
                                $commentTemplate.find('.text').append($('<p>').html(escapeHtml(wsMessage.text)));
                                // Author
                                $commentTemplate.find('.author a.user').attr('href', userLink).html(wsMessage.author);
                                // Avatar and link
                                $commentTemplate.find('.info a').attr('href', userLink).children('img.avatar').attr('src', userAvatar + '/24');
                                // Post and comment ID's link
                                $commentTemplate.find('.clearfix .post-id a').attr('href', commentLink).html('#' + wsMessage.post_id + '/' + wsMessage.comment_id)
                                    // Adding answer label
                                    .after((wsMessage.to_comment_id !== null) ? (' в ответ на <a href="#' + wsMessage.to_comment_id + '">/' + wsMessage.to_comment_id + '</a>') : (''));
                                // Setting action labels and other attributes
                                $commentTemplate.find('.action-labels .reply-label').attr('for', 'reply-' + wsMessage.post_id + '_' + wsMessage.comment_id);
                                $commentTemplate.find('.action-labels .more-label').attr('for', 'action-' + wsMessage.post_id + '_' + wsMessage.comment_id);
                                $commentTemplate.find('.post-content input[name="action-radio"]').attr('id', 'action-' + wsMessage.post_id + '_' + wsMessage.comment_id);
                                // Bookmark link
                                $commentTemplate.find('.action-buttons a.bookmark').attr('href', postLink + '/b?comment_id=' + wsMessage.comment_id + '&csrf_token=' + csRfToken);
                                // Reply form
                                $commentTemplate.find('.post-content input.reply-radio').attr('id', 'reply-' + wsMessage.post_id + '_' + wsMessage.comment_id);
                                $commentTemplate.find('.post-content form.reply-form').attr('action', '/' + wsMessage.post_id);
                                $commentTemplate.find('.post-content form.reply-form textarea[name="text"]').html('@' + wsMessage.author + ', ');
                                $commentTemplate.find('.post-content form.reply-form input[name="comment_id"]').val(wsMessage.comment_id);
                                $commentTemplate.find('.post-content form.reply-form input[name="csrf_token"]').val(csRfToken);
                                ///Filling template

                                // It's time to DOM
                                console.info('Inserting comment');
                                // If list mode or not addressed to other comment
                                if ((treeSwitch == '?tree=0') || (wsMessage.to_comment_id == null)) {
                                    // List mode
                                    $('.content-wrap #comments #post-reply').before($commentTemplate.hide().fadeIn(2000));
                                } else {
                                    // Tree mode
                                    // Search parent comment
                                    $parentComment = $('.post[data-comment-id="' + wsMessage.to_comment_id + '"]');
                                    if ($parentComment.length > 0) {
                                        console.log('Parent comment: %O', $parentComment);
                                        // Check for children
                                        $parentCommentChildren = $parentComment.next('.comments');
                                        // If child comment already exist
                                        if ($parentCommentChildren.length > 0) {
                                            console.log('Child comments found. Appending...');
                                            $parentCommentChildren.append($commentTemplate.hide().fadeIn(2000));
                                        } else {
                                            console.log('No child comments found. Creating...');
                                            $parentComment.after($('<div>').addClass('comments').append($commentTemplate.hide().fadeIn(2000)));
                                        }
                                    } else {
                                        console.log('Parent comment not found');
                                        // FIXME: Double code
                                        $('.content-wrap #comments #post-reply').before($commentTemplate.hide().fadeIn(2000));
                                    }
                                }

                                // Adding anchor
                                $commentTemplate.before($anchor);

                                // Fading out highlight if needed
                                if (options.is('option_ws_comments_color_fadeout')) {
                                    console.log('Fading out the highlight');
                                    $commentTemplate.children('.pp-highlight').fadeOut(20000);
                                }

                                // Desktop notifications
                                if (options.is('option_ws_comments_notifications')) {
                                    console.log('Showing desktop notification');
                                    chrome.runtime.sendMessage({
                                        type: 'showNotification',
                                        notificationId: 'comment_' + wsMessage.post_id + '#' + wsMessage.comment_id,
                                        avatarUrl: getProtocol() + userAvatar + '/80',
                                        title: '@' + wsMessage.author + ' #' + wsMessage.post_id + '(/' + wsMessage.comment_id + ')',
                                        text: wsMessage.text
                                    });
                                }

                                console.groupEnd();
                            });

                            break;

                        // Posts
                        case 'post':
                            console.group('ws-post #%s', wsMessage.post_id);

                            console.debug(wsMessage);

                            console.groupEnd();
                            break;

                        // Recommendation
                        case 'ok':
                            console.group('ws-recommendation #%s/%s', wsMessage.post_id, wsMessage.comment_id);

                            console.debug(wsMessage);

                            console.groupEnd();
                            break;

                        default:
                            console.group('ws-other');

                            console.log(wsMessage);

                            console.groupEnd();
                            break;

                    }
                }


            }
        } catch (e) {
            console.log('WebSocket exception:')
            console.log(e);
            console.log(evt.data);
        }
        ;
    };

}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        //.replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "<br>");
}

// Monts for Date.getMonth()
var months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

