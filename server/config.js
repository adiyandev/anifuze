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
  domain: required('ANIFUZE_DOMAIN', 'localhost'),
  version: process.env.ANIFUZE_VERSION ?? '1.0.0',
});

export function assertSupportedDatabase(client) {
  if (!['postgres','mysql','mariadb'].includes(client)) throw new Error('Unsupported DB_CLIENT: ' + client);
}
