ALTER TABLE af_episodes ADD COLUMN IF NOT EXISTS notes TEXT NULL;
CREATE INDEX IF NOT EXISTS af_episodes_search_idx ON af_episodes(anime_id,episode_number);
