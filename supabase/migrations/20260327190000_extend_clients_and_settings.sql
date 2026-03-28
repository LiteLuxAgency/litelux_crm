alter table public.crm_settings
  add column if not exists list_action_search_enabled boolean not null default true,
  add column if not exists list_action_reaction_enabled boolean not null default true,
  add column if not exists list_action_create_enabled boolean not null default true;

alter table public.crm_clients
  add column if not exists complex_name text not null default '',
  add column if not exists is_proxy_phone boolean not null default false,
  add column if not exists parking_spots jsonb not null default '[]'::jsonb,
  add column if not exists objects jsonb not null default '[]'::jsonb;
