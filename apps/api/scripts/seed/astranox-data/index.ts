import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/Ansh-Amipara/Astranox-data/feature/ansh';

function getLocalDataDir(): string | null {
  const isDataDir = (dirPath: string) => {
    try {
      return (
        fs.existsSync(dirPath) &&
        fs.existsSync(path.join(dirPath, 'species.json')) &&
        fs.existsSync(path.join(dirPath, 'types.json'))
      );
    } catch {
      return false;
    }
  };

  const candidates = [
    'D:/Project/fangame/Astranox-data',
    path.resolve(process.cwd(), '../../..', 'Astranox-data'),
    path.resolve(process.cwd(), '../..', 'Astranox-data'),
    path.resolve(process.cwd(), '..', 'Astranox-data'),
    path.resolve(__dirname, '../../../../../../Astranox-data'),
  ];

  for (const c of candidates) {
    if (isDataDir(c)) return c;
  }

  // Walk up from __dirname checking parent directories for Astranox-data
  let curr = __dirname;
  for (let i = 0; i < 10; i++) {
    const parent = path.dirname(curr);
    const candidate = path.join(parent, 'Astranox-data');
    if (isDataDir(candidate)) return candidate;
    if (parent === curr) break;
    curr = parent;
  }

  return null;
}

const LOCAL_DATA_DIR = getLocalDataDir();

async function loadJSON(file: string) {
  if (LOCAL_DATA_DIR) {
    const filePath = path.join(LOCAL_DATA_DIR, file);
    if (fs.existsSync(filePath)) {
      console.log(`Loading ${file} from local directory: ${filePath}`);
      const raw = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  }

  console.log(`Fetching ${file} from GitHub (${GITHUB_BASE_URL})...`);
  const response = await fetch(`${GITHUB_BASE_URL}/${file}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
  }
  return await response.json();
}

async function main() {
  console.log('Starting Astranox-data Seed Pipeline...');
  if (LOCAL_DATA_DIR) {
    console.log(`Using local Astranox-data source: ${LOCAL_DATA_DIR}`);
  } else {
    console.log(`Using remote GitHub source: ${GITHUB_BASE_URL}`);
  }

  console.log('Clearing existing data (dropping entire database)...');
  await prisma.$runCommandRaw({ dropDatabase: 1 });

  // Types
  const types = await loadJSON('types.json');
  console.log(`Seeding ${types.length} types...`);
  const cleanTypes = types.map((t: any) => ({
    id: t.id,
    name: t.name,
    damageRelations: t.damageRelations,
  }));
  await prisma.type.createMany({ data: cleanTypes });

  // Items
  const items = await loadJSON('items.json');
  console.log(`Seeding ${items.length} items...`);
  await prisma.item.createMany({ data: items });

  // Moves
  const moves = await loadJSON('moves.json');
  console.log(`Seeding ${moves.length} moves...`);
  await prisma.move.createMany({ data: moves });

  // Species
  const rawSpecies = await loadJSON('species.json');
  console.log(`Seeding ${rawSpecies.length} species...`);
  const SPLIT_EVOLUTIONS: Record<number, number[]> = {
    133: [134, 135, 136, 196, 197, 470, 471, 700], // Eevee
    935: [936, 937], // Charcadet
    236: [106, 107, 237], // Tyrogue
    265: [266, 268], // Wurmple
    281: [282, 475], // Kirlia
    361: [362, 478], // Snorunt
    840: [841, 842, 1011], // Applin
  };

  const speciesMap = new Map();
  rawSpecies.forEach((s: any) => speciesMap.set(s.id, s));

  rawSpecies.forEach((s: any) => {
    let toIds: number[] = [];
    if (SPLIT_EVOLUTIONS[s.id]) {
      toIds = SPLIT_EVOLUTIONS[s.id];
    } else if (s.evolvesToId) {
      toIds = [s.evolvesToId];
    }

    toIds.forEach((targetId) => {
      const target = speciesMap.get(targetId);
      if (target) {
        target.evolvesFromId = s.id;
      }
    });
  });

  const species = rawSpecies.map((s: any) => {
    delete s.evolutionItem; // ensure this is stripped out just in case
    delete s.evolvesToId;
    s.megaEvolvesToIds = s.megaEvolvesToIds || [];
    s.gmaxEvolvesToIds = s.gmaxEvolvesToIds || [];
    return s;
  });
  await prisma.species.createMany({ data: species });

  // Learnsets
  const learnsets = await loadJSON('learnsets.json');
  console.log(`Seeding ${learnsets.length} learnsets...`);
  const cleanLearnsets = learnsets.map((l: any) => {
    const { id, ...rest } = l;
    return rest;
  });
  await prisma.pokemonLearnset.createMany({ data: cleanLearnsets });

  // Shop
  const shop = await loadJSON('shop.json');
  console.log(`Seeding ${shop.length} shop items...`);
  const cleanShop = shop.map((s: any) => {
    const { id, ...rest } = s;
    return rest;
  });
  await prisma.astralMoveShop.createMany({ data: cleanShop });

  console.log('Astranox-data Seed Pipeline Complete!');
}

main()
  .catch((err) => {
    console.error('Fatal error during seed pipeline:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
