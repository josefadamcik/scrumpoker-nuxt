# Debug Checklist

Please check the following and tell me what you see:

## 1. Browser Console Messages
When you load the session page, what messages do you see in the browser console (F12)?

Look for:
- "Subscribing to real-time updates for session: ..."
- "Realtime subscription status: ..."
- Any errors in red?

## 2. Supabase Realtime Configuration
In your Supabase dashboard:
- Database → Replication
- Is the "sessions" table listed?
- Is the toggle switch ON (enabled)?

## 3. Test the API directly
Can you share what happens when:
- You create a session
- You refresh the page
- A second person joins

Which specific thing is not working:
A) Participant name changes on refresh?
B) New participants don't appear in the list?
C) Both?
