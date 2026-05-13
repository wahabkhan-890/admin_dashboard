-- Run this in Supabase SQL editor or through migration pipeline.
-- 1) Non-recursive admin check
create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where lower(u.email) = lower(auth.jwt()->>'email')
      and u.role = 'admin'
  );
$$;

-- 2) Audit logs table
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  action_type text not null,
  actor_email text,
  target_user_id bigint,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

drop policy if exists "admin_insert_audit_logs" on public.audit_logs;
create policy "admin_insert_audit_logs"
on public.audit_logs
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admin_read_audit_logs" on public.audit_logs;
create policy "admin_read_audit_logs"
on public.audit_logs
for select
to authenticated
using (public.is_admin_user());

-- 3) Users policies (replace recursive ones)
alter table public.users enable row level security;

drop policy if exists "admin_can_select_users" on public.users;
create policy "admin_can_select_users"
on public.users
for select
to authenticated
using (public.is_admin_user());

drop policy if exists "admin_can_update_users" on public.users;
create policy "admin_can_update_users"
on public.users
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_can_delete_users" on public.users;
create policy "admin_can_delete_users"
on public.users
for delete
to authenticated
using (public.is_admin_user());

-- 4) Optional safety: stop role tampering from client
-- create policy so authenticated users can insert only "user" role on signup
drop policy if exists "user_self_insert_profile" on public.users;
create policy "user_self_insert_profile"
on public.users
for insert
to authenticated
with check (
  role = 'user'
  and lower(email) = lower(auth.jwt()->>'email')
);
