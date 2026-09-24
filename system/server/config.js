import 'dotenv/config';

const required = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') throw new Error('Missing required environment variable: ' + name);
  return value;
};
const bool = (value, fallback=false) => String(value ?? fallback).toLowerCase() === 'true';

export const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 8787),
  db: {
    client: required('DB_CLIENT', 'postgres').toLowerCase(),
    host: required('DB_HOST', '127.0.0.1'),
    port: Number(process.env.DB_PORT ?? 5432),
    name: required('DB_NAME', 'anifuze'),
    user: required('DB_USER', 'anifuze'),
    password: required('DB_PASSWORD', 'change-me'),
    ssl: bool(process.env.DB_SSL),
  },
  installationId: required('ANIFUZE_INSTALLATION_ID', 'dev-installation'),
  licenseKey: required('ANIFUZE_LICENSE_KEY', 'dev-license'),
  licenseServiceUrl: process.env.ANIFUZE_LICENSE_SERVICE_URL ?? '',
  templateServiceUrl: process.env.ANIFUZE_TEMPLATE_SERVICE_URL ?? '',
  providerMarketplaceUrl: process.env.ANIFUZE_PROVIDER_MARKETPLACE_URL ?? '',
  templatePublicKey: process.env.ANIFUZE_TEMPLATE_PUBLIC_KEY ?? '',
  releaseDir: process.env.ANIFUZE_RELEASE_DIR ?? '',
  deploymentTarget: process.env.ANIFUZE_DEPLOYMENT_TARGET ?? '',
  domain: required('ANIFUZE_DOMAIN', 'localhost'),
  version: process.env.ANIFUZE_VERSION ?? '1.0.0',
});

export function assertProductionConfig() {
  if (config.nodeEnv !== 'production') return;
  assertSupportedDatabase(config.db.client);
  if (config.db.password === 'change-me') throw new Error('DB_PASSWORD must be changed in production.');
  if (config.licenseKey === 'dev-license') console.warn('AniFuze production license key is not configured.');
  if (config.domain === 'localhost') throw new Error('ANIFUZE_DOMAIN must be configured in production.');
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) throw new Error('PORT must be a valid TCP port.');
}

export function assertSupportedDatabase(client) {
  if (!['postgres','mysql','mariadb'].includes(client)) throw new Error('Unsupported DB_CLIENT: ' + client);
}
