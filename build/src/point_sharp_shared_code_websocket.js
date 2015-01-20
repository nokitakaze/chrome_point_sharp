/**
 * Выносим WebSocket в отдельный файл, там слишком много говнокода
 *
 * ПЛАТФОРМОНЕЗАВИСИМЫЙ ГОВНОКОД
 */

function skobkin_websocket_init(options) {
    // SSL or plain
    ws = new WebSocket(((location.protocol == 'https:') ? 'wss' : 'ws') + '://point.im/ws');
    console.log('WebSocket created: %O', ws);

    // Detecting post id if presented
    var postId = $('#top-post').attr('data-id');
    console.debug('Current post id detected as #%s', postId);
    // Detecting view mode
    treeSwitch = $('#tree-switch a.active').attr('href');
    console.debug('Comments view mode: %s', treeSwitch);

    // Error handler
    ws.onerror = function(err) {
        console.error('WebSocket error: %O', err);
    };

    // Message handler
    ws.onmessage = function(evt) {
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
                            if ( ! options.is('option_ws_comments')) {
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
                                console.log('The comment is not for this post');
                                console.groupEnd();
                                break;
                            }

                            // Generating comment from websocket message
                            create_comment_elements({
                                id: wsMessage.comment_id,
                                toId: wsMessage.to_comment_id,
                                postId: wsMessage.post_id,
                                author: wsMessage.author,
                                text: wsMessage.text,
                                fadeOut: options.is('option_ws_comments_color_fadeout')
                            }, function($comment) {
                                // It's time to DOM
                                console.info('Inserting comment');

                                // Search for parent comment
                                $parentComment = (wsMessage.to_comment_id) ? ($('.post[data-comment-id="' + wsMessage.to_comment_id + '"]')) : [];
                                console.log('Parent comment: %O', $parentComment || null);

                                // If list mode or not addressed to other comment
                                if ($('#comments #tree-switch a').eq(0).hasClass('active') || (wsMessage.to_comment_id === null) || (!$parentComment.length)) {
                                    // Adding to the end of the list
                                    $('.content-wrap #comments #post-reply').before($comment);
                                } else {
                                    // Check for children
                                    $parentCommentChildren = $parentComment.next('.comments');
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
                                    console.log('Showing desktop notification');
                                    chrome.runtime.sendMessage({
                                        type: 'showNotification',
                                        notificationId: 'comment_' + wsMessage.post_id + '#' + wsMessage.comment_id,
                                        avatarUrl: getProtocol() + '//point.im/avatar/' + wsMessage.author + '/80',
                                        title: '@' + wsMessage.author + ' #' + wsMessage.post_id + '/' + wsMessage.comment_id,
                                        text: wsMessage.text
                                    }, function(response) {});
                                }

                                console.groupEnd();
                            });


                            break;

                        // Posts
                        case 'post':
                            console.groupCollapsed('ws-post #%s', wsMessage.post_id);

                            console.debug(wsMessage);
                            if (options.is('option_ws_posts')) {
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
                            }

                            console.groupEnd();
                            break;

                        // Recommendation
                        case 'ok':
                            console.groupCollapsed('ws-recommendation #%s/%s', wsMessage.post_id, wsMessage.comment_id);

                            console.debug(wsMessage);

                            console.groupEnd();
                            break;

                        default:
                            console.groupCollapsed('ws-other');

                            console.log(wsMessage);

                            console.groupEnd();
                            break;

                    }
                }


            }
        } catch (e) {
            console.log('WebSocket exception:');
            console.log(e);
            console.log(evt.data);
        }
        ;
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

function option_ajax_init(){
    // Comments
    if (options.is('option_ajax_comments')) {
        // Removing old bindings
        // Dirty hack for page context
        $('#comments').replaceWith($('#comments').clone());

        // Binding new
        $('#comments').on('keypress.pp', '.reply-form textarea', function (evt) {
            if ((evt.keyCode === 10 || evt.keyCode === 13) && (evt.ctrlKey || evt.metaKey)) {
                evt.stopPropagation();
                evt.preventDefault();

                var $post = $(this).parents('.post').first();
                var csRf = $(this).siblings('input[name="csrf_token"]').val();

                $.ajax({
                    type: 'POST',
                    url: '/api/post/' + $post.data('id'),
                    data: {
                        text: $(this).val(),
                        comment_id: $post.data('comment-id')
                    },
                    error: function(req, status, error) {
                        console.error('AJAX request error while sending the comment: %s', error);
                        console.log('Status: %s', status);

                        alert(chrome.i18n.getMessage('msg_comment_send_failed') + '\n' + error);
                    },
                    /**
                     * @param {object} data Response data
                     * @param {number} data.comment_id ID of the created comment
                     * @param {string} data.id ID of the post
                     * @param {string} textStatus Text of request status
                     */
                    success: function(data, textStatus) {
                        console.log('data %O', data);
                        console.log('status %O', textStatus);

                        if (textStatus === 'success') {
                            // Hiding form
                            $('#reply-' + $post.data('id') + '_' + $post.data('comment-id')).prop('checked', false);

                            // Creating the comment HTML
                            create_comment_elements({
                                id: data.comment_id,
                                toId: $post.data('comment-id') || null,
                                postId: $post.data('id'),
                                author: $('#name h1').text(),
                                text: $(this).val(),
                                fadeOut: false
                            }, function($comment) {
                                // If list mode or not addressed to other comment
                                if ($('#comments #tree-switch a').eq(0).hasClass('active') || ($post.data('comment-id') === undefined)) {
                                    // Adding to the end of the list
                                    $('.content-wrap #comments #post-reply').before($comment);
                                } else {
                                    // Check for children
                                    $parentCommentChildren = $post.next('.comments');

                                    // @fixme Find a bug with lost indentation of new comment
                                    // If child comment already exist
                                    if ($parentCommentChildren.length) {
                                        console.log('Child comments found. Appending...');
                                        $parentCommentChildren.append($comment);
                                    } else {
                                        console.log('No child comments found. Creating...');
                                        $post.after($('<div>').addClass('comments').append($comment));
                                    }
                                }
                            });

                            // Cleaning textarea
                            $(this).val('');

                        }
                    }.bind(this),
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('X-CSRF', csRf);
                    }
                });
            }
        });
    }
}

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
 * @param {function} onCommentCreated Callback which is called when comment is ready
 *
 */
function create_comment_elements(commentData, onCommentCreated) {
    var $anchor = $('<a>').attr('name', commentData.id);

    // Initializing comment element
    var $commentTemplate = $('<div>').attr({
        'class': 'post',
        'data-id': commentData.postId,
        'data-comment-id': commentData.id,
        'data-to-comment-id': commentData.id || ''
    });

    // Loading HTML template
    $commentTemplate.load(chrome.extension.getURL('includes/comment.html'), function() {
        // Load complete
        console.info('comment.html loaded');

        // Date and time of comment
        var date = new Date();

        // Data for template
        var userLink = '//' + commentData.author + '.point.im/';
        var csRfToken = $('.reply-form input[name="csrf_token"]').first().val();

        // Filling template
        // Date and time
        $commentTemplate.find('.info .created')
            .append($('<span>').html(((date.getDate().toString.length < 2) ? ('0' + date.getDate().toString()) : (date.getDate().toString())) + '&nbsp;' + months[date.getMonth()]))
            // Crutchy fix
            .append($('<br>'))
            ///Crutchy fix
            .append($('<span>').html(date.getHours() + ':' + ((date.getMinutes().toString().length < 2) ? ('0' + date.getMinutes().toString()) : (date.getMinutes().toString()))));
        // Comment text
        $commentTemplate.find('.text').append($('<p>').text(commentData.text));
        // Author
        $commentTemplate.find('.author a.user').attr('href', userLink).text(commentData.author);
        // Avatar and link
        $commentTemplate.find('.info a').attr('href', userLink).children('img.avatar').attr('src', '//point.im/avatar/' + commentData.author + '/24');
        // Post and comment ID's link
        $commentTemplate.find('.clearfix .post-id a').attr('href', '//point.im/' + commentData.postId + '#' + commentData.id).text('#' + commentData.postId + '/' + commentData.id)
            // Adding answer label
            .after((commentData.toId !== null) ? (' в ответ на <a href="#' + commentData.toId + '">/' + commentData.toId + '</a>') : (''));
        // Setting action labels and other attributes
        $commentTemplate.find('.action-labels .reply-label').attr('for', 'reply-' + commentData.postId + '_' + commentData.id);
        $commentTemplate.find('.action-labels .more-label').attr('for', 'action-' + commentData.postId + '_' + commentData.id);
        $commentTemplate.find('.post-content input[name="action-radio"]').attr('id', 'action-' + commentData.postId + '_' + commentData.id);
        // Bookmark link
        $commentTemplate.find('.action-buttons a.bookmark').attr('href', $('#top-post .info a').attr('href') + commentData.postId + '/b?comment_id=' + commentData.id + '&csrf_token=' + csRfToken);
        // Reply form
        $commentTemplate.find('.post-content input.reply-radio').attr('id', 'reply-' + commentData.postId + '_' + commentData.id);
        $commentTemplate.find('.post-content form.reply-form').attr('action', '/' + commentData.postId);
        $commentTemplate.find('.post-content form.reply-form textarea[name="text"]').html('@' + commentData.author + ', ');
        $commentTemplate.find('.post-content form.reply-form input[name="comment_id"]').val(commentData.id);
        $commentTemplate.find('.post-content form.reply-form input[name="csrf_token"]').val(csRfToken);
        ///Filling template

        // Fading out highlight if needed
        if (commentData.fadeOut) {
            console.log('Fading out the highlight');
            $commentTemplate.children('.pp-highlight').delay(250).fadeOut(20000);
        }

        // @todo add indentation indicator support

        // Hiding
        $commentTemplate.hide().delay(250).fadeIn(2000);

        // Triggering callback
        onCommentCreated($anchor.add($commentTemplate));
    });
}
