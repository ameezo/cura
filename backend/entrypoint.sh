#!/bin/sh
# entrypoint.sh — Runs before Gunicorn starts.
# 1. Waits for Postgres to accept connections
# 2. Runs all pending Alembic migrations
# 3. Starts Gunicorn

set -e   # exit immediately on any error

echo "⏳ Waiting for PostgreSQL to be ready..."

# Poll until pg_isready succeeds (max 60 seconds)
RETRIES=30
until pg_isready -h "${POSTGRES_HOST:-db}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-postgres}" > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ "$RETRIES" -le 0 ]; then
    echo "❌ Timed out waiting for PostgreSQL. Exiting."
    exit 1
  fi
  echo "   ... not ready yet, retrying in 2s (${RETRIES} retries left)"
  sleep 2
done

echo "✅ PostgreSQL is ready."

echo "🔄 Running database migrations..."
flask db upgrade
echo "✅ Migrations complete."

echo "🚀 Starting Gunicorn..."
exec gunicorn \
  --bind 0.0.0.0:5001 \
  --workers 2 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile - \
  "app.main:create_app()"
