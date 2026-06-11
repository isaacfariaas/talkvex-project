#!/bin/sh
set -e

echo "Running database migrations..."
node -e "
const { execSync } = require('child_process');
try {
  execSync('node_modules/.bin/prisma migrate deploy', { stdio: 'inherit' });
} catch (e) {
  console.warn('Migration via local binary failed, trying npx...');
  execSync('npx --yes prisma@7.8.0 migrate deploy --schema=prisma/schema.prisma', { stdio: 'inherit' });
}
"

echo "Starting application..."
exec node server.js
