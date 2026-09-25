-- Customer-owned stream providers. API/Embed providers belong to the customer installation.
ALTER TABLE af_providers ADD COLUMN IF NOT EXISTS owner_user_id VARCHAR(128) NULL;
ALTER TABLE af_providers ADD COLUMN IF NOT EXISTS ownership VARCHAR(32) NOT NULL DEFAULT 'system';
ALTER TABLE af_providers ADD COLUMN IF NOT EXISTS product_license_id VARCHAR(128) NULL;
ALTER TABLE af_providers ADD COLUMN IF NOT EXISTS immutable_admin BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS af_providers_owner_idx ON af_providers(owner_user_id);
CREATE INDEX IF NOT EXISTS af_providers_license_idx ON af_providers(product_license_id);
