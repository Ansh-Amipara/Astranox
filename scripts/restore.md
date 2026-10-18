# MongoDB Database Restore Runbook

This runbook outlines the operational procedure for restoring Astranox MongoDB databases from automated backup archives (`.gz`).

---

## 1. Prerequisites

- **mongo-tools** (`mongorestore`, `mongodump`) installed or Docker running.
- Access to the target MongoDB connection string (`DATABASE_URL`).
- The backup archive file (e.g. `astranox_backup_YYYYMMDD_HHMMSS.gz`).

---

## 2. Standard Production Restoration Procedure

### Step 1: Download or Locate Backup Archive
If restoring from S3 / cloud storage:
```bash
aws s3 cp s3://$BACKUP_S3_BUCKET/daily/astranox_backup_20261018_020000.gz ./astranox_backup.gz
```

### Step 2: Validate Archive Integrity
Check that the gzip archive is intact before executing restoration:
```bash
gzip -t ./astranox_backup.gz && echo "Archive integrity valid"
```

### Step 3: Run mongorestore
To restore into the target database with drop-before-insert (replaces existing collections cleanly):

```bash
mongorestore \
  --uri="mongodb+srv://<username>:<password>@cluster.mongodb.net/astranox?retryWrites=true&w=majority" \
  --archive="./astranox_backup.gz" \
  --gzip \
  --drop \
  --noIndexRestore=false
```

> [!CAUTION]
> Using `--drop` will delete existing collections in the target database before restoring. Ensure you have an export of current state if you need to rollback.

---

## 3. Restoring to a Temporary Database (Safe Validation)

To verify the backup contents without affecting active production users, restore into an isolated database:

```bash
mongorestore \
  --uri="mongodb://localhost:27017/astranox_test_restore?replicaSet=rs0" \
  --archive="./astranox_backup.gz" \
  --gzip \
  --nsFrom="astranox.*" \
  --nsTo="astranox_test_restore.*"
```

---

## 4. Post-Restore Verification Checklist

After restoration completes:
1. **Document Counts:** Verify key collections are populated:
   - `User`
   - `TrainerSave`
   - `OwnedPokemon`
   - `AuditLog`
   - `FeatureFlag`
   - `ShopItem`
2. **Data Versioning:** Run migration check:
   ```bash
   pnpm --filter api migrate:data
   ```
3. **Application Health:**
   ```bash
   curl -s http://localhost:4005/health
   ```
