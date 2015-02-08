/**
 * Находит элемент #comments, и если он есть, начинает слушать на нём события
 * @constructor
 */
function AjaxComments() {
    var comments = document.querySelector('#comments');

    if (comments) {
        this._comments = comments;
        this.listen(comments);

        this.listenFirstComments();
    }
}

/**
 * Вешает обработчики. Магия в последнем параметре addEventListener
 */
AjaxComments.prototype.listen = function(elem) {
    elem.addEventListener('submit', this.onSubmit.bind(this), true);
    elem.addEventListener('keypress', this.onKeypress.bind(this), true);
};

/**
 * Слушает отправки первых комментариев
 */
AjaxComments.prototype.listenFirstComments = function() {
    var posts = document.querySelectorAll('.post-content');

    // Чтобы не ловить события на чём попало и мочь использовать useCapture, приходится
    // получать все post-content и на каждый вешать обработчики.
    Array.prototype.forEach.call(posts, this.listen.bind(this));
};

/**
 * Обрабатывает событие отправки формы
 * @param  {Event} event Событие отправки
 */
AjaxComments.prototype.onSubmit = function(event) {
    var $form = $(event.target);

    event.preventDefault();
    event.stopPropagation();

    if ($form.hasClass('reply-form')) {
        this.submit($form);
    }
};

/**
 * Проверяет, выбран ли файл. Если да — отправляет форму с перезагрузкой, иначе — аяксом
 * @param  {jQuery} $form Элемент формы
 */
AjaxComments.prototype.submit = function($form) {
    var proc;

    if (this.isFileSelected($form)) {
        $form.submit();
    } else {
        proc = new AjaxCommentProcessor($form);
    }
};

/**
 * Обрабатывает нажатия кнопок. Если это сочетание Ctrl|⌘+Enter, отправляет коммент
 * @param {Event} event Событие нажатия кнопки
 */
AjaxComments.prototype.onKeypress = function(event) {
    var $form;
    
    if (this.isProperKeys(event)) {
        event.preventDefault();
        event.stopPropagation();

        $form = $(event.target).closest('.reply-form');
        
        if ($form.length) {
            this.submit($form);
        }
    }
};

/**
 * Проверяет, что нажато нужное сочетание клавишь
 * @param  {Event} event Событие нажатия
 * @return {Boolean}
 */
AjaxComments.prototype.isProperKeys = function(event) {
    return (event.keyCode === 10 || event.keyCode === 13) && (event.ctrlKey || event.metaKey);
};

/**
 * @param  {jQuery} $form
 * @return {Boolean} Выбран ли файл
 */
AjaxComments.prototype.isFileSelected = function($form) {
    var attach = $form.get(0).elements.attach;

    if (attach) {
        return Boolean(attach.files && attach.files.length);
    } else {
        return false;
    }
};

/**
 * Создаётся при каждой отправке комментария
 * @param {jQuery} $form Элемент формы, на которой это произошло
 */
function AjaxCommentProcessor($form) {
    this._$form = $form;
    this._$post = $form.closest('.post');
    this._$textarea = $form.find('textarea');

    this._text = this._$textarea.val();
    this._CSRF = $form.get(0).elements.csrf_token.value;

    this._actionUrl = this._$form.attr('action');
    this._postId = this._$post.data('id');
    this._commentId = this._$post.data('comment-id');

    this.sendComment();
}

/**
 * Регулярка для урла, проверяюшая, не рекомендация ли это
 * @type {RegExp}
 */
AjaxCommentProcessor.recommendationReg = /^\/[^/]*\/r$/;

/**
 * Отправляет комментарий
 */
AjaxCommentProcessor.prototype.sendComment = function() {
    this.setProgress(true);

    $.ajax({
        type: 'POST',
        url: this.getUrl(),
        data: {
            text: this._text,
            comment_id: this._commentId
        },
        beforeSend: this.beforeSend.bind(this),
        error: this.onError.bind(this),
        success: this.onSuccess.bind(this)
    });
};

/**
 * @return {Boolean} true — это коммент-рекомендация, fasle — обычный коммент
 */
AjaxCommentProcessor.prototype.isRecommendation = function() {
    return this._isRec || (this._isRec = this.constructor.recommendationReg.test(this._actionUrl));
};

/**
 * @return {String} Адрес, на который слать запрос
 */
AjaxCommentProcessor.prototype.getUrl = function() {
    // Если это рекомендация комментария
    if (this.isRecommendation() && this._commentId) {
        return '/api/post/' + this._postId + '/' + this._commentId + '/r';
    } else {
        return '/api/post' + this._actionUrl;
    }
};

/**
 * Подкладывает CSRF-токен в заголовки запроса
 * @param  {XMLHttpRequest} xhr Объект запроса
 */
AjaxCommentProcessor.prototype.beforeSend = function(xhr) {
    xhr.setRequestHeader('X-CSRF', this._CSRF);
};

/**
 * Скрывает форму отправки комментария
 * @return {[type]} [description]
 */
AjaxCommentProcessor.prototype.hideForm = function() {
    this._$form.prev().prop('checked', false);
};

/**
 * Создаёт новый комментарий, скрывает форму, снимает прогресс.
 * @param  {Object} data Ответ сервера
 * @param  {String} textStatus Статус ответа
 */
AjaxCommentProcessor.prototype.onSuccess = function(data, textStatus) {
    var $textarea = this._$textarea;

    if (textStatus === 'success') {
        if (data.error) {
            this.onError(null, null, data.error);
        } else {
            this.createComment(data);

            this.hideForm();

            // Cleaning textarea
            $textarea.val('');
            this.setProgress(false);
        }
    }
};

AjaxCommentProcessor.prototype.createComment = function(data) {
    /* global create_comment_elements */
    create_comment_elements({
        id: data.comment_id,
        toId: this._commentId || null,
        postId: this._postId,
        author: $('#name h1').text(),
        text: this._text,
        fadeOut: true
    }, this.insertComment.bind(this));
};

/**
 * Вставляет комментарий в DOM
 * @param  {jQuery} $comment
 */
AjaxCommentProcessor.prototype.insertComment = function($comment) {
    var $parentCommentChildren;

    if ($('#comments #tree-switch a').eq(0).hasClass('active') || (this._commentId === undefined)) {
        // Adding to the end of the list
        $('.content-wrap #comments #post-reply').before($comment);
    } else {
        // Check for children
        $parentCommentChildren = this._$post.next('.comments');

        // @fixme Find a bug with lost indentation of new comment
        // If child comment already exist
        if ($parentCommentChildren.length) {
            console.log('Child comments found. Appending...');
            $parentCommentChildren.append($comment);
        } else {
            console.log('No child comments found. Creating...');
            this._$post.after(
                $('<div>')
                    .addClass('comments')
                    .append($comment)
            );
        }
    }

    this.showComment($comment);
};

AjaxCommentProcessor.prototype.showComment = function($comment) {
    $('body').animate({
        scrollTop: $comment.offset().top
    }, 500);
};

/**
 * Показывает алерт с ошибкой и снимает прогресс, если коммент не отправился
 * @param  {*} req
 * @param  {*} status
 * @param  {String} error
 */
AjaxCommentProcessor.prototype.onError = function(req, status, error) {
    /* global alert */
    alert(chrome.i18n.getMessage('msg_comment_send_failed') + '\n' + error);

    this.setProgress(false);
};

/**
 * Устанавливает прогресс
 * @param {Boolean} isProgress true — включить прогресс, false — отключить
 */
AjaxCommentProcessor.prototype.setProgress = function(isProgress) {
    this._$textarea.prop('disabled', isProgress);
    this._$form.toggleClass('pp-progress', isProgress);
};
