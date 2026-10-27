const { execSync } = require('child_process');

// Ensure a fallback DATABASE_URL exists for Prisma code generation on Vercel / CI
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/surefire_plumbing';
}

try {
  console.log('[Prisma] Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
  console.log('[Prisma] Client generated successfully.');
} catch (error) {
  console.warn('[Prisma Warning] Prisma generate warning (falling back gracefully):', error.message);
}
