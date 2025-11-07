# Real-Time Debugging Guide

## Quick Test Procedure

### Step 1: Test Participant Persistence
1. Create a new session
2. Note your nickname in the header: "You are: YourName"
3. **Refresh the page (F5)**
4. Check if nickname is the same
5. Open console (F12) - you should see:
   ```
   📋 Session loaded, checking participant status...
   ✅ Restored participant from localStorage: YourName
   ```

### Step 2: Test Real-Time Updates
1. Copy the session URL
2. Open it in **another browser** (or incognito window)
3. Join with a different name
4. In the **first browser**, open console (F12)
5. You should see:
   ```
   ✅ Session updated via real-time: {...}
   ```
6. The new participant should appear in the list **immediately**

---

## If It's NOT Working

### Console Messages to Look For

#### Good Signs ✅
```
Subscribing to real-time updates for session: xxx
Realtime subscription status: SUBSCRIBED
✅ Successfully subscribed to real-time updates
📋 Session loaded, checking participant status...
✅ Restored participant from localStorage: YourName
```

#### Bad Signs ❌
```
CHANNEL_ERROR → Realtime NOT enabled in Supabase
TIMED_OUT → Network/connection issue
❌ Failed to join session → API error
```

---

## Common Issues & Solutions

### Issue 1: "CHANNEL_ERROR" in console
**Cause**: Supabase Realtime is not enabled

**Fix**:
1. Go to https://supabase.com/dashboard/project/ijruhconijiksnayqlew
2. Click **Database** → **Replication**
3. Find the `sessions` table in the list
4. **Toggle the switch ON** (it should turn green/blue)
5. Refresh your browser

### Issue 2: Participant name changes on refresh
**Symptom**: Every refresh creates a new participant

**Debugging**:
1. Open console (F12)
2. Refresh the page
3. Look for one of these:
   - ✅ `"Restored participant from localStorage: YourName"` → **WORKING**
   - 🚪 `"Joining session..."` → **NOT WORKING**

**Possible causes**:
- localStorage is disabled/cleared
- Session expired (24 hours)
- Participant was removed from session manually

**Fix**:
1. Check localStorage:
   - DevTools → Application → Local Storage
   - Look for `scrumpoker_participant`
   - Should contain: `{"participantId":"...","nickname":"...","sessionId":"..."}`

2. If empty, that's your problem. Create a new session to test.

### Issue 3: New participants don't appear
**Symptom**: Second browser joins, but first browser doesn't update

**Debugging in FIRST browser**:
1. Open console
2. Second browser joins
3. Look for: `"✅ Session updated via real-time"`
   - **If YES**: UI issue (unlikely)
   - **If NO**: Realtime not working

**Fix**:
1. **Check Realtime is enabled** (see Issue 1)
2. Check console for subscription status:
   ```
   Realtime subscription status: SUBSCRIBED   ← Good
   Realtime subscription status: CHANNEL_ERROR ← Bad (enable Realtime)
   ```

3. **Hard refresh both browsers** (Ctrl+Shift+R)

### Issue 4: "Missing Supabase configuration"
**Symptom**: Can't load any page, immediate error

**Fix**:
1. Check `.env` file exists in project root
2. Verify it contains:
   ```
   NEXT_PUBLIC_SUPABASE_URL="https://ijruhconijiksnayqlew.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
   SUPABASE_SERVICE_ROLE_KEY="eyJ..."
   ```
3. Restart dev server: `npm run dev`

---

## Expected Console Output

### On Initial Page Load:
```
Subscribing to real-time updates for session: abc123
Realtime subscription status: SUBSCRIBED
✅ Successfully subscribed to real-time updates
📋 Session loaded, checking participant status...
✅ Restored participant from localStorage: SwiftPanda
👥 Initializing presence tracking for: SwiftPanda
```

### When Someone Joins:
```
✅ Session updated via real-time: {id: "abc123", participants: {...}}
```

### When You Vote:
```
✅ Vote submitted: 5
✅ Session updated via real-time: {...}
```

### When Host Reveals:
```
✅ Votes revealed
✅ Session updated via real-time: {...}
```

---

## Still Not Working?

Please provide:
1. Screenshot of console (F12) showing all messages
2. Screenshot of Supabase Dashboard → Database → Replication page
3. Exact steps you're taking
4. Which specific thing isn't working:
   - [ ] Participant name changes on refresh
   - [ ] New participants don't appear in list
   - [ ] Votes don't update in real-time
   - [ ] Something else: _______________
