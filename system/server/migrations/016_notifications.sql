CREATE TABLE IF NOT EXISTS af_user_notifications (
  id VARCHAR(128) PRIMARY KEY,
  notification_id VARCHAR(128) NOT NULL,
  user_id VARCHAR(128) NOT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL,
  UNIQUE(notification_id,user_id)
);

CREATE INDEX IF NOT EXISTS af_user_notifications_user_idx ON af_user_notifications(user_id,created_at);
CREATE INDEX IF NOT EXISTS af_user_notifications_unread_idx ON af_user_notifications(user_id,read_at);

CREATE INDEX IF NOT EXISTS af_notifications_schedule_idx ON af_notifications(scheduled_at,enabled);
