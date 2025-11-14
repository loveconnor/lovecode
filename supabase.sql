-- Supabase schema for the developer hub integrations/preferences

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  use_demo_data boolean default false,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_integrations (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_id text not null,
  secrets jsonb not null,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, provider_id)
);

create index if not exists user_integrations_user_idx
  on public.user_integrations (user_id);

alter table public.user_preferences enable row level security;
alter table public.user_integrations enable row level security;

create policy "Users manage their own preferences"
  on public.user_preferences
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own integrations"
  on public.user_integrations
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
