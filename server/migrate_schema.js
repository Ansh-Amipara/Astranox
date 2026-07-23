const fs = require('fs');
let schema;
try {
  schema = fs.readFileSync('prisma/schema.prisma.bak', 'utf8');
} catch(e) {
  schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  fs.writeFileSync('prisma/schema.prisma.bak', schema);
}

// 1. Change provider
schema = schema.replace(/provider = "postgresql"/g, 'provider = "mongodb"');

// 2. Change autoincrement IDs to ObjectId
schema = schema.replace(/id\s+Int\s+@id\s+@default\(autoincrement\(\)\)/g, 'id String @id @default(auto()) @map("_id") @db.ObjectId');

// 3. Change UUID primary keys to ObjectId
schema = schema.replace(/id\s+String\s+@id\s+@default\(uuid\(\)\)\s+@db\.Uuid/g, 'id String @id @default(auto()) @map("_id") @db.ObjectId');
schema = schema.replace(/id\s+String\s+@id\s+@default\(uuid\(\)\)/g, 'id String @id @default(auto()) @map("_id") @db.ObjectId');

// 4. Change remaining @db.Uuid to @db.ObjectId
schema = schema.replace(/@db\.Uuid/g, '@db.ObjectId');

// 5. Change specific PokeAPI models to map to _id
schema = schema.replace(/id\s+Int\s+@id\r?\n/g, 'id Int @id @map("_id")\n');
schema = schema.replace(/id\s+String\s+@id\r?\n/g, 'id String @id @map("_id")\n');

// 6. Prisma MongoDB specific relation rules:
// First, remove existing onDelete: Cascade
schema = schema.replace(/, onDelete: Cascade/g, '');

// Second, add onDelete: NoAction, onUpdate: NoAction ONLY to @relation that have fields: [...] (meaning they own the foreign key)
schema = schema.replace(/@relation\(([^)]*?fields:[^)]*?)\)/g, (match, p1) => {
    if (p1.includes('onDelete: NoAction')) return match;
    return `@relation(${p1}, onDelete: NoAction, onUpdate: NoAction)`;
});

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema updated successfully.');
