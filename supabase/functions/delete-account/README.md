# Delete Account Edge Function (Beginner Guide)

This function performs **full account deletion**:
1. Deletes user profile row from `public.users`
2. Deletes auth account from `auth.users` using Admin API

Function name: `delete-account`

## Why this is needed
Client-side app cannot safely use service-role keys.  
So full auth user deletion must happen on a secure server layer (Edge Function).

## Deploy Steps

1. Install Supabase CLI (if not installed):
```bash
npm i -g supabase
```

2. Login:
```bash
supabase login
```

3. Link your project (from repo root):
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

4. Deploy function:
```bash
supabase functions deploy delete-account
```

5. Set secrets (default names OR EP aliases supported):
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
supabase secrets set EP_SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
supabase secrets set EP_SUPABASE_URL=YOUR_SUPABASE_URL
supabase secrets set EP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Do **not** expose service role key in frontend `.env`.

## Frontend usage
Already wired in `Settings.jsx`:
```js
await supabase.functions.invoke("delete-account", { method: "POST" })
```

## Test checklist
1. Login as normal user
2. Open Settings
3. Type `DELETE` and click Delete Account
4. Expect success toast and redirect to register page
5. Try login with same account -> should fail (account removed)

## Common errors
- `401 Missing access token`:
  User not logged in or session expired.
- `500 Server env is missing`:
  Required secrets missing (`SUPABASE_*` or `EP_SUPABASE_*`).
- `Function not found`:
  Function not deployed or wrong function name.
