-- Allow authenticated admins to permanently delete audit logs.
drop policy if exists "admin_delete_audit_logs" on public.audit_logs;
create policy "admin_delete_audit_logs"
on public.audit_logs
for delete
to authenticated
using (public.is_admin_user());
