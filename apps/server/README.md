# CRM backend

Минимальный сервер для CRM в Telegram Web App.

Что уже есть:

- `Express API` для клиентов и настроек
- интеграция с `Supabase`
- `Telegraf`-бот для уведомлений
- фоновая проверка напоминаний по `callback_at`
- фоновая проверка напоминаний через 24 часа после отметки `no_answer`

## Старт

```bash
cd apps/server
cp .env.example .env
npm install
npm run dev
```

## Основные ручки

- `GET /healthz`
- `GET /api/clients`
- `POST /api/clients`
- `PATCH /api/clients/:id`
- `DELETE /api/clients/:id`
- `GET /api/settings`
- `PUT /api/settings`

## Telegram

Бот стартует только если в `crm_settings` включен `telegram_enabled` и задан `telegram_bot_token`.

После `/start` в личке с ботом текущий `chat_id` сохраняется в настройках, и именно в этот чат уходят напоминания.
