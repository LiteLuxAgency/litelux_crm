alter table public.crm_clients
  add column if not exists address text not null default '';
