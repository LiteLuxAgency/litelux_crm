alter table public.crm_clients
  add column if not exists preferences text not null default '',
  add column if not exists passport_data text not null default '';
