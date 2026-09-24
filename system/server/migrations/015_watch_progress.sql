CREATE INDEX IF NOT EXISTS af_history_user_anime_idx ON af_watch_history(user_id, anime_id, watched_at);
CREATE INDEX IF NOT EXISTS af_history_episode_idx ON af_watch_history(user_id, episode_id, watched_at);
