-- Episode status enum
DO $$ BEGIN
  CREATE TYPE episode_status AS ENUM ('draft', 'published', 'unpublished');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Shows
CREATE TABLE IF NOT EXISTS shows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    artwork_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Episodes
CREATE TABLE IF NOT EXISTS episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status episode_status NOT NULL DEFAULT 'draft',
    audio_url TEXT,
    audio_duration INTEGER,
    video_url TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_episodes_show_id ON episodes(show_id);
CREATE INDEX IF NOT EXISTS idx_episodes_status ON episodes(status);

-- Play events
CREATE TABLE IF NOT EXISTS play_events (
    id BIGSERIAL PRIMARY KEY,
    episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_agent TEXT,
    ip_hash VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_play_events_episode_id ON play_events(episode_id);
CREATE INDEX IF NOT EXISTS idx_play_events_played_at ON play_events(played_at);

-- Materialized view for play counts
CREATE MATERIALIZED VIEW IF NOT EXISTS episode_play_counts AS
SELECT
    episode_id,
    COUNT(*) AS total_plays,
    COUNT(DISTINCT ip_hash) AS unique_listeners
FROM play_events
GROUP BY episode_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_episode_play_counts_episode_id
ON episode_play_counts(episode_id);
