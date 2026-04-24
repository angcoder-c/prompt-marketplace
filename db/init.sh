#!/bin/sh
set -e

DB_PATH="/data/promptmk.db"

echo "Checking database initialization..."

if [ ! -f "$DB_PATH" ]; then
    echo "Initializing database with schema and seeds..."
    sqlite3 "$DB_PATH" < /db/ddl.sql
    sqlite3 "$DB_PATH" < /db/seeds.sql
    echo "Database initialized successfully"
else
    echo "Database already exists, skipping initialization"
fi

exec "$@"