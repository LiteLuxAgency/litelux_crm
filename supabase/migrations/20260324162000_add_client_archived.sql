alter table public.crm_clients
  add column if not exists is_archived boolean not null default false;

create index if not exists crm_clients_is_archived_idx
  on public.crm_clients (is_archived)
  where is_archived = true;
