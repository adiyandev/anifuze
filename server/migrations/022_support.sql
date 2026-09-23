CREATE TABLE IF NOT EXISTS af_support_tickets (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 admin_user_id UUID,
 subject VARCHAR(255) NOT NULL,
 message TEXT NOT NULL,
 status VARCHAR(32) NOT NULL DEFAULT 'open',
 priority VARCHAR(16) NOT NULL DEFAULT 'normal',
 external_id VARCHAR(255),
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_af_support_tickets_status ON af_support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_af_support_tickets_created ON af_support_tickets(created_at DESC);
