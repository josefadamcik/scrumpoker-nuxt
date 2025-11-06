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

## Step 3: Enable Realtime

1. In Supabase Dashboard, go to "Database" → "Replication"
2. Find the `sessions` table
3. Enable replication by toggling it ON
4. This allows real-time updates to work via WebSocket

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

### Real-time not working
- Enable Replication for the `sessions` table in Supabase
- Check browser console for WebSocket errors
- Verify the ANON key is correct

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
