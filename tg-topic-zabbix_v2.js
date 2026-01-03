var Telegram = {
    token: null,
    chat_id: null,
    thread_id: null,
    message: null,
    proxy: null,
    parse_mode: null,

    escapeMarkup: function (str, mode) {
        switch (mode) {
            case 'markdown':
                return str.replace(/([_*\[`])/g, '\\$&');

            case 'markdownv2':
                return str.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$&');

            default:
                return str;
        }
    },

    sendMessage: function () {
        var params = {
            chat_id: Telegram.chat_id,
            text: Telegram.message,
            disable_web_page_preview: true,
            disable_notification: false
        },
        data,
        response,
        request = new CurlHttpRequest(),
        url = 'https://api.telegram.org/bot' + Telegram.token + '/sendMessage';

        if (Telegram.thread_id !== null) {
            params.message_thread_id = Telegram.thread_id;
        }

        if (Telegram.parse_mode !== null) {
            params.parse_mode = Telegram.parse_mode;
        }

        if (Telegram.proxy) {
            request.SetProxy(Telegram.proxy);
        }

        request.AddHeader('Content-Type: application/json');
        data = JSON.stringify(params);

        // hide token in logs
        Zabbix.Log(4, '[Telegram Webhook] URL: ' + url.replace(Telegram.token, '<TOKEN>'));
        Zabbix.Log(4, '[Telegram Webhook] params: ' + data);

        response = request.Post(url, data);
        Zabbix.Log(4, '[Telegram Webhook] HTTP code: ' + request.Status());

        try {
            response = JSON.parse(response);
        }
        catch (error) {
            response = null;
        }

        if (request.Status() !== 200 || !response || response.ok !== true) {
            if (response && typeof response.description === 'string') {
                throw response.description;
            }
            else {
                throw 'Unknown error. Check debug log for more information.';
            }
        }
    }
};

try {
    var params = JSON.parse(value);

    if (typeof params.Token === 'undefined') {
        throw 'Incorrect value is given for parameter "Token": parameter is missing';
    }

    if (typeof params.To === 'undefined') {
        throw 'Incorrect value is given for parameter "To": parameter is missing';
    }

    Telegram.token = params.Token;

    if (params.HTTPProxy) {
        Telegram.proxy = params.HTTPProxy;
    }

    if (params.ParseMode) {
        params.ParseMode = params.ParseMode.toLowerCase();
        if (['markdown', 'markdownv2', 'html'].indexOf(params.ParseMode) !== -1) {
            Telegram.parse_mode = params.ParseMode;
        }
    }

    // Parse chat_id[:thread_id]
    if (params.To.indexOf(':') !== -1) {
        var parts = params.To.split(':');
        Telegram.chat_id = parts[0];
        Telegram.thread_id = parseInt(parts[1], 10);

        if (isNaN(Telegram.thread_id)) {
            throw 'Invalid message_thread_id in "To" field';
        }
    }
    else {
        Telegram.chat_id = params.To;
    }

    Telegram.message = params.Subject + '\n' + params.Message;

    if (Telegram.parse_mode === 'markdown' || Telegram.parse_mode === 'markdownv2') {
        Telegram.message = Telegram.escapeMarkup(Telegram.message, Telegram.parse_mode);
    }

    Telegram.sendMessage();

    return 'OK';
}
catch (error) {
    Zabbix.Log(4, '[Telegram Webhook] notification failed: ' + error);
    throw 'Sending failed: ' + error + '.';
}
