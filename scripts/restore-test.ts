import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('CRITICAL: DATABASE_URL is not set.');
  process.exit(1);
}

async function runRestoreVerification() {
  console.log('=== [Restore Test] Connecting to MongoDB to verify database structure ===');
  const client = new MongoClient(dbUrl!);

  try {
    await client.connect();
    const db = client.db();
    const collections = await db.listCollections().toArray();

    console.log(`Found ${collections.length} collections in target database:`);
    const criticalCollections = ['User', 'TrainerSave', 'OwnedPokemon', 'AuditLog', 'FeatureFlag', 'ShopItem'];
    const colNames = collections.map((c) => c.name);

    let allCriticalPresent = true;
    for (const name of criticalCollections) {
      const exists = colNames.includes(name);
      const count = exists ? await db.collection(name).countDocuments() : 0;
      console.log(`  - [${exists ? 'OK' : 'MISSING'}] ${name}: ${count} documents`);
      if (!exists) allCriticalPresent = false;
    }

    if (!allCriticalPresent) {
      console.warn('WARNING: Some critical collections are not yet created in the database.');
    } else {
      console.log('=== [Restore Test] Database structural verification PASSED ===');
    }
  } catch (err: any) {
    console.error('CRITICAL: Restore verification failed with error:', err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

runRestoreVerification();
