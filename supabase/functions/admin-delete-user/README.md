# Admin Delete User Edge Function

Function name: `admin-delete-user`

Purpose:
- Deletes the target user from Supabase Auth **first**
- Deletes the target row from `public.users` **second**
- Logs a critical audit entry if auth deletion succeeds but DB deletion fails

## Deploy

```bash
supabase functions deploy admin-delete-user
```

Ensure secret is present:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
supabase secrets set EP_SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
supabase secrets set EP_SUPABASE_URL=YOUR_SUPABASE_URL
supabase secrets set EP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Frontend payload

```json
{
  "targetUserId": 123,
  "targetEmail": "user@example.com"
}
```

## Why this prevents the bug

Client-side row delete alone can leave an orphan auth account that still logs in.  
This function enforces auth-first deletion and blocks DB deletion if auth deletion fails.
