-- Additional Supabase DDL to align stored data with Supabase Auth.
-- Run after supabase.sql. If you have legacy rows whose user_id values are
-- not valid UUIDs, truncate those tables before running these ALTERs.

alter table public.user_preferences
  alter column user_id type uuid using user_id::uuid;

alter table public.user_integrations
  alter column user_id type uuid using user_id::uuid;

alter table if exists public.user_preferences
  drop constraint if exists user_preferences_user_fk;

alter table if exists public.user_integrations
  drop constraint if exists user_integrations_user_fk;

alter table public.user_preferences
  add constraint user_preferences_user_fk
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.user_integrations
  add constraint user_integrations_user_fk
  foreign key (user_id) references auth.users(id) on delete cascade;

drop policy if exists "Users manage their own preferences" on public.user_preferences;
create policy "Users manage their own preferences"
  on public.user_preferences
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their own integrations" on public.user_integrations;
create policy "Users manage their own integrations"
  on public.user_integrations
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
