-- Scrum Poker Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    creator_id TEXT NOT NULL,
    participants JSONB NOT NULL DEFAULT '{}'::jsonb,
    revealed BOOLEAN NOT NULL DEFAULT false,
    vote_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    current_round INTEGER NOT NULL DEFAULT 1
);

-- Create index on expires_at for efficient cleanup
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Create index on created_at for querying recent sessions
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no authentication)
-- Note: In production, you may want more restrictive policies
CREATE POLICY "Enable read access for all users" ON sessions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON sessions
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON sessions
    FOR DELETE USING (true);

-- Function to delete expired sessions (for scheduled cleanup)
CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sessions
    WHERE expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the cleanup function
GRANT EXECUTE ON FUNCTION delete_expired_sessions() TO anon;
GRANT EXECUTE ON FUNCTION delete_expired_sessions() TO authenticated;

-- Comment on table
COMMENT ON TABLE sessions IS 'Stores scrum poker sessions with 24-hour TTL';
COMMENT ON COLUMN sessions.participants IS 'JSONB object mapping participant IDs to their data {id, nickname, vote, joinedAt}';
COMMENT ON COLUMN sessions.vote_history IS 'Array of past voting rounds with results';

-- Enable Realtime for sessions table
-- This ensures UPDATE events are broadcast via Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
