# Local Development Setup Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account created
- Your Supabase project created at: https://ijruhconijiksnayqlew.supabase.co

## Step 1: Environment Variables ✅
Your `.env` file has been created with the correct Supabase credentials.

## Step 2: Database Setup

You need to run the migration SQL in your Supabase database:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ijruhconijiksnayqlew
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase/migrations/20250101000000_initial_schema.sql`
5. Paste it into the SQL editor
6. Click "Run" or press Ctrl/Cmd + Enter

This will create:
- `sessions` table with proper schema
- Indexes for performance
- Row Level Security policies (allowing public access for this app)
- A cleanup function for expired sessions

## Step 3: Enable Realtime ⚠️ CRITICAL

**This step is REQUIRED for the app to work properly!**

1. In Supabase Dashboard, go to "Database" → "Replication"
2. Find the `sessions` table in the list
3. **Toggle the switch to enable replication** (it should turn green/blue)
4. This allows real-time updates to work via WebSocket

Without this step:
- ❌ Participant list won't update when new users join
- ❌ Votes won't appear in real-time
- ❌ Reveals and resets won't sync across clients

## Step 4: Start Development Server

```bash
npm run dev
```

The app should now be running at http://localhost:3000

## Step 5: Test the Application

1. Open http://localhost:3000
2. Enter a nickname (or leave blank for random)
3. Click "Create Session"
4. Copy the session URL
5. Open it in another browser/tab to test real-time features

## Troubleshooting

### "Missing Supabase configuration" error
- Make sure `.env` file exists in the project root
- Verify the environment variables are correct
- Restart the dev server

### Database errors
- Make sure you ran the migration SQL in Supabase
- Check that Row Level Security policies are created
- Verify the table exists in Database → Tables

### Real-time not working (participants not updating)
**Symptom**: When a new user joins, their name doesn't appear for others

1. **Check if Realtime is enabled**:
   - Go to Supabase Dashboard → Database → Replication
   - Make sure the `sessions` table has replication enabled (toggle is ON)

2. **Check browser console**:
   - Open DevTools (F12) → Console tab
   - Look for messages like "Realtime subscription status: SUBSCRIBED"
   - If you see "CHANNEL_ERROR", Realtime is not enabled
   - If you see "TIMED_OUT", check your network connection

3. **Verify the connection**:
   - You should see: "✅ Successfully subscribed to real-time updates"
   - When someone joins/votes/reveals, you should see: "✅ Session updated via real-time"

4. **Force refresh**:
   - Try refreshing the page - the participant should appear after refresh
   - If they appear after refresh but not in real-time, it's a Realtime configuration issue

### Page refresh creates new user with different name
**Symptom**: Every time you refresh, you appear as a new participant

This has been **FIXED** in the latest version. The app now:
1. Stores your participant info in browser localStorage
2. Checks if you're still in the session when you return
3. Preserves your nickname and participant ID across refreshes

If you still see this issue:
1. Clear your browser's localStorage (DevTools → Application → Local Storage)
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Check the console for "Restored participant from localStorage: YourName"

### API errors
- Check that both public and service role keys are in `.env`
- Verify your Supabase project URL is correct
- Check the Network tab in browser dev tools for failed requests

## Additional Configuration

### Optional: Set up session cleanup cron job

You can set up a Supabase Edge Function or use Vercel Cron to periodically clean up expired sessions:

```sql
SELECT delete_expired_sessions();
```

Run this daily to keep your database clean.

## Next Steps

Once local development is working:
1. Push your code to GitHub
2. Deploy to Vercel
3. Set the same environment variables in Vercel project settings
4. Your app will be live!
