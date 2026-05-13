-- Add active/inactive status without breaking existing auth/routing
alter table public.users
add column if not exists status text not null default 'active'
check (status in ('active', 'inactive'));

create index if not exists idx_users_status on public.users (status);

-- Prevent normal users from changing their own status via self-update policy
drop policy if exists "user_self_update_profile" on public.users;
create policy "user_self_update_profile"
on public.users
for update
to authenticated
using (lower(email) = lower(auth.jwt()->>'email'))
with check (
  lower(email) = lower(auth.jwt()->>'email')
  and role in ('user', 'admin')
  and status = 'active'
);
