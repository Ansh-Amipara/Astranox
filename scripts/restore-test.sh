#!/usr/bin/env bash
set -e

# ==============================================================================
# Astranox MongoDB Automated Restore Test Verification Script
# ==============================================================================

echo "=== [$(date)] Starting MongoDB Automated Restore Verification Test ==="

TEMP_DB="astranox_restore_verify_$$"
TARGET_URI="${DATABASE_URL:-mongodb://localhost:27017}"
ARCHIVE_FILE="$1"

if [ -z "$ARCHIVE_FILE" ]; then
  # Look for latest dump in backups/ or create a transient dump
  LATEST_BACKUP=$(ls -t backups/astranox_*.gz 2>/dev/null | head -1)
  if [ -n "$LATEST_BACKUP" ]; then
    ARCHIVE_FILE="$LATEST_BACKUP"
    echo "Found latest local backup archive: $ARCHIVE_FILE"
  else
    echo "No backup archive provided. Creating temporary snapshot for verification test..."
    ARCHIVE_FILE="/tmp/transient_verify_$$.gz"
    mongodump --uri="$TARGET_URI/astranox" --archive="$ARCHIVE_FILE" --gzip --quiet
  fi
fi

if [ ! -f "$ARCHIVE_FILE" ]; then
  echo "CRITICAL ERROR: Archive file '$ARCHIVE_FILE' not found!" >&2
  exit 1
fi

echo "Restoring archive '$ARCHIVE_FILE' into temporary database '$TEMP_DB'..."
if ! mongorestore \
  --uri="$TARGET_URI" \
  --archive="$ARCHIVE_FILE" \
  --gzip \
  --nsFrom="astranox.*" \
  --nsTo="${TEMP_DB}.*" \
  --quiet; then
  echo "CRITICAL ERROR: mongorestore failed during verification test!" >&2
  exit 1
fi

echo "Verifying restored database integrity..."
# Use node/mongosh to count documents in key collections
COUNT_REPORT=$(node -e "
const { MongoClient } = require('mongodb');
async function verify() {
  const client = new MongoClient('$TARGET_URI');
  try {
    await client.connect();
    const db = client.db('$TEMP_DB');
    const cols = await db.listCollections().toArray();
    console.log('Restored Collections: ' + cols.length);
    for (const c of cols) {
      const count = await db.collection(c.name).countDocuments();
      console.log(' - ' + c.name + ': ' + count + ' documents');
    }
    await db.dropDatabase();
    console.log('Temporary test database successfully cleaned up.');
  } finally {
    await client.close();
  }
}
verify().catch((err) => {
  console.error('CRITICAL: Verification error: ' + err.message);
  process.exit(1);
});
")

echo "$COUNT_REPORT"

if [[ "$ARCHIVE_FILE" == /tmp/transient_verify_* ]]; then
  rm -f "$ARCHIVE_FILE"
fi

echo "=== [$(date)] Restore test PASSED successfully ==="
