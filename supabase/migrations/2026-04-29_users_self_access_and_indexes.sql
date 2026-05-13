-- Self access + performance indexes
-- Run after 2026-04-27_rbac_security_and_audit.sql

create index if not exists idx_users_email_lower on public.users (lower(email));
create index if not exists idx_users_role on public.users (role);

-- allow users to read/update/delete their own profile row
drop policy if exists "user_self_select_profile" on public.users;
create policy "user_self_select_profile"
on public.users
for select
to authenticated
using (lower(email) = lower(auth.jwt()->>'email'));

drop policy if exists "user_self_update_profile" on public.users;
create policy "user_self_update_profile"
on public.users
for update
to authenticated
using (lower(email) = lower(auth.jwt()->>'email'))
with check (
  lower(email) = lower(auth.jwt()->>'email')
  and role in ('user', 'admin')
);

drop policy if exists "user_self_delete_profile" on public.users;
create policy "user_self_delete_profile"
on public.users
for delete
to authenticated
using (lower(email) = lower(auth.jwt()->>'email'));
