# LiteLux CRM

Мобильный CRM-интерфейс на `React + Vite + Tailwind` с локальным API-слоем для сохранения в отдельную схему `crm` в Supabase.

## Запуск

```bash
npm install
npm run dev

# затем выполните SQL из crm_schema.sql в Supabase SQL Editor
```

## Что есть

- CRM с воронками и этапами;
- задачи;
- формы создания клиента, собственника и объекта;
- отдельная схема Supabase в `crm_schema.sql`;
- локальный API в `server/index.mjs`.
