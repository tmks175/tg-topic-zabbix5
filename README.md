## Zabbix Telegram Topic Webhook

Webhook для **Zabbix 5 LTS**, добавляющий поддержку отправки уведомлений
в **Telegram-группы с включёнными темами (forum topics)**.

Оригинальный Telegram webhook Zabbix не поддерживает параметр `message_thread_id`, из-за чего
сообщения не могут быть направлены в конкретные топики.
Доработанный скрипт решает проблему, добавляя новый параметр `ThreadID`.

## Установка

1. Код из `tg-topic-zabbix.js` скопировать в поле `Script` нового Media type (Administration - Media types - Create media type) или, как вариант, cкопировать файл `tg-topic-zabbix.js` в директорию вебхуков Zabbix: `/usr/lib/zabbix/alertscripts/` (в этом случае выбрать Type: `Script` при настройке Media).

2. Параметры (в разделе `Parameters` или `Script parameters` в зависимости от варианта установки):
`Message - {ALERT.MESSAGE}`
`ParseMode - HTML` *(опционально)*
`Subject - {ALERT.SUBJECT}`
`ThreadID - 185` *(опционально; номер вашего topic в Telegram)*
`To - {ALERT.SENDTO}`
`Token` - *токен полученный у* `BotFather` 
При этом, `номер группы телеграм`, заполняется в настройках пользователя (`Users` - `Media` - `Add` - `Type` *<Ваш Media type>* - `Send to` ... *Пример группы:* `-1001234567890`).

3. При необходимости, создайте несколько `Media` *(clone)* с разными `ThreadID` для разных топиков.

4. В зависимости от сценария, дальнейшие шаги выполняются согласно стандартной логике Zabbix (`Configuration` - `Actions`), где указывается - каким пользователям и через какой способ выполнять отправку уведомлений. Отличным вариантом здесь, в плане гибкости, являются теги, которые могут быть назначены триггерам и указаны далее в настройках Actions.