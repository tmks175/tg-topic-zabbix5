var Telegram = {
    token: null,
    to: null,
    message: null,
    proxy: null,
    parse_mode: null,
    thread_id: null,   // support tg-thread

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
            chat_id: Telegram.to,
            text: Telegram.message,
            disable_web_page_preview: true,
            disable_notification: false
        },
        data,
        response,
        request = new CurlHttpRequest(),
        url = 'https://api.telegram.org/bot' + Telegram.token + '/sendMessage';

        if (Telegram.parse_mode !== null) {
            params['parse_mode'] = Telegram.parse_mode;
        }

        // adding a parameter message_thread_id, if set
        if (Telegram.thread_id !== null && Telegram.thread_id !== '' && Telegram.thread_id !== '0') {
            params['message_thread_id'] = parseInt(Telegram.thread_id);
        }

        if (Telegram.proxy) {
            request.SetProxy(Telegram.proxy);
        }

        request.AddHeader('Content-Type: application/json');
        data = JSON.stringify(params);

        // logging in without a token
        Zabbix.Log(4, '[Telegram Topic Webhook] URL: ' + url.replace(Telegram.token, '<TOKEN>'));
        Zabbix.Log(4, '[Telegram Topic Webhook] params: ' + data);
        response = request.Post(url, data);
        Zabbix.Log(4, '[Telegram Topic Webhook] HTTP code: ' + request.Status());

        try {
            response = JSON.parse(response);
        }
        catch (error) {
            response = null;
        }

        if (request.Status() !== 200 || typeof response.ok !== 'boolean' || response.ok !== true) {
            if (typeof response.description === 'string') {
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

    Telegram.token = params.Token;

    if (params.HTTPProxy) {
        Telegram.proxy = params.HTTPProxy;
    }

    if (params.ParseMode) {
        params.ParseMode = params.ParseMode.toLowerCase();

        if (['markdown', 'html', 'markdownv2'].indexOf(params.ParseMode) !== -1) {
            Telegram.parse_mode = params.ParseMode;
        }
    }

    Telegram.to = params.To;
    Telegram.message = params.Subject + '\n' + params.Message;

    if (params.ThreadID) {
        Telegram.thread_id = params.ThreadID;
    }

    if (['markdown', 'markdownv2'].indexOf(params.ParseMode) !== -1) {
        Telegram.message = Telegram.escapeMarkup(Telegram.message, params.ParseMode);
    }

    Telegram.sendMessage();

    return 'OK';
}
catch (error) {
    Zabbix.Log(4, '[Telegram Topic Webhook] notification failed: ' + error);
    throw 'Sending failed: ' + error + '.';
}