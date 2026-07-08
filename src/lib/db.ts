import fs from 'fs';
import { Sequelize } from 'sequelize';
import { initProfile } from '@/models/profile';

// Reuse one Sequelize instance across Next.js hot-reloads (dev) to avoid
// exhausting DB connections. ponytail: global singleton, fine for single-instance;
// use a pooler (RDS Proxy) if you scale to many serverless instances.
const globalForDb = globalThis as unknown as { sequelize?: Sequelize };

// SSL matching RDS `verify-full` — verify against the CA at DB_CA_CERT
// (global-bundle.pem). Falls back to encrypt-without-verify if no CA set.
function sslOptions() {
  if (process.env.DB_SSL !== 'true') return {};
  const caPath = process.env.DB_CA_CERT;
  if (caPath && fs.existsSync(caPath)) {
    return { ssl: { require: true, rejectUnauthorized: true, ca: fs.readFileSync(caPath).toString() } };
  }
  return { ssl: { require: true, rejectUnauthorized: false } };
}

function createSequelize(): Sequelize {
  return new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: sslOptions(),
    },
  );
}

export const sequelize = globalForDb.sequelize ?? createSequelize();
if (process.env.NODE_ENV !== 'production') globalForDb.sequelize = sequelize;

// Register models against this instance (idempotent — init is cheap).
initProfile(sequelize);
