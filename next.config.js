/** @type {import('next').NextConfig} */
const nextConfig = {
  // sequelize + mysql2 are server-only; keep them external to the server bundle (Next 14)
  experimental: {
    serverComponentsExternalPackages: ['sequelize', 'pg', 'pg-hstore'],
  },
};

module.exports = nextConfig;
