function chrome_option_menu_wrapper() {
    var index = 'status_page';

    // Нав
    var fast_nav = document.createElement('a');
    $(fast_nav).attr({
        'href': '#',
        'data-i18n': index.replace(/_/g, '-'),
        'data-tab-name': index
    }).addClass('tabs-item').text('Статус');
    var first_tab = $('.point-options-wrapper .tabs-list .selected').removeClass('selected')[0];
    console.log(first_tab);
    first_tab.parentElement.insertBefore(fast_nav, first_tab);

    // Секция
    var section = document.createElement('section');
    $(section).attr({
        'id': index
    }).addClass('tabs-content-item');

    var first_tab = $('.point-options-wrapper .tabs-content .selected').removeClass('selected')[0];
    first_tab.parentElement.insertBefore(section, first_tab);

    set_option_elements_behavior();
    setInterval(draw_current_popup_point_sharp_status, 10000);
    draw_current_popup_point_sharp_status();
}

function draw_current_popup_point_sharp_status() {
    chrome.runtime.sendMessage({
        'type': 'get_status'
    }, function(message) {
        console.log(message);
        var section = $('#status_page');
        // message.recent_count, message.comments_count, message.messages_count
        section.html(
            '<button class="websocket-temporary-disable"></button><hr />' +
            '<p><a href="https://' + message.current_login +
            '.point.im/recent/unread?utm_source=pointsharp" class="unread-recent" target="_blank">?</a></p>' +
            '<p><a href="https://' + message.current_login +
            '.point.im/comments/unread?utm_source=pointsharp" class="unread-comment" target="_blank">?</a></p>' +
            '<p><a href="https://' + message.current_login +
            '.point.im/messages?utm_source=pointsharp" class="unread-messages" target="_blank">?</a></p>');
        section.find('.unread-recent').text('Записей в ленте: ' + message.recent_count);
        section.find('.unread-comment').text('Комментариев: ' + message.comments_count);
        section.find('.unread-messages').text('Личных сообщений: ' + message.messages_count);
        $('.websocket-temporary-disable').css({
            'padding': '10px',
            'width': '100%',
            'max-width': '300px',
            'cursor': 'pointer',
            'margin-top': '15px'
        });

        if (message.temporary_disabled_notification) {
            $('.websocket-temporary-disable').text('Временно выключены (включить)').css({
                'color': 'white',
                'background-color': '#d9534f',
                'border': '1px solid #d43f3a'
            }).off('click').on('click', function() {
                chrome.runtime.sendMessage({
                    'type': 'notifacation_temporary_enable'
                }, function() {
                    draw_current_popup_point_sharp_status();
                });
            });
        } else {
            $('.websocket-temporary-disable').text('Включены (временно выключить)').css({
                'color': 'white',
                'background-color': '#449d44',
                'border': '1px solid #4cae4c'
            }).off('click').on('click', function() {
                chrome.runtime.sendMessage({
                    'type': 'notifacation_temporary_disable'
                }, function() {
                    draw_current_popup_point_sharp_status();
                });
            });
        }
    });
}