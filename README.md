# Zabbix Telegram Topic Webhook

Webhook для **Zabbix 5 LTS**, добавляющий поддержку отправки уведомлений
в **Telegram-группы с включёнными темами (forum topics)**.

Оригинальный Telegram webhook Zabbix не поддерживает параметр `message_thread_id`, из-за чего
сообщения не могут быть направлены в конкретные топики.
Доработанный скрипт решает проблему, добавляя новый параметр `ThreadID`.