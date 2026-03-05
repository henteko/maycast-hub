ALTER TABLE play_events ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_play_events_user_email ON play_events(user_email);
