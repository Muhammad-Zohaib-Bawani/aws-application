// sequelize-cli reads this (CommonJS). Same DB settings used at runtime by src/lib/db.ts.
require('dotenv').config();
const fs = require('fs');

// SSL matching RDS `verify-full`: verify the cert against the RDS CA bundle.
// Point DB_CA_CERT at global-bundle.pem. Falls back to encrypt-without-verify
// if no CA file is set. ponytail: fallback is fine for practice, not prod.
function sslOptions() {
  if (process.env.DB_SSL !== 'true') return {};
  const caPath = process.env.DB_CA_CERT;
  if (caPath && fs.existsSync(caPath)) {
    return { ssl: { require: true, rejectUnauthorized: true, ca: fs.readFileSync(caPath).toString() } };
  }
  return { ssl: { require: true, rejectUnauthorized: false } };
}

const common = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  dialectOptions: sslOptions(),
};

module.exports = {
  development: common,
  production: common,
};
