import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Higher multiplier = more expensive
const TYPE_MULTIPLIERS: Record<string, number> = {
  dragon: 1.5,
  steel: 1.3,
  fairy: 1.3,
  ghost: 1.2,
  dark: 1.2,
  fire: 1.1,
  water: 1.1,
  electric: 1.1,
  ice: 1.1,
  fighting: 1.0,
  ground: 1.0,
  rock: 1.0,
  flying: 1.0,
  psychic: 1.0,
  poison: 0.9,
  grass: 0.8,
  bug: 0.7,
  normal: 0.6,
};

function getPowerMultiplier(power: number): number {
  if (power <= 50) return 1.0;
  if (power <= 70) return 2.0;
  if (power <= 90) return 4.0;
  if (power <= 110) return 8.0;
  if (power <= 130) return 15.0;
  if (power <= 150) return 25.0;
  return 50.0; // Over 150 power (e.g. V-create 180, Explosion 250)
}

export async function seedAstralMoveShop() {
  console.log('Generating Astral Move Shop pricing...');
  
  // Fetch all moves that are NOT in any PokemonLearnset
  // Wait, the user said: "Every move that is NOT learned through a Pokémon's natural learnset is purchasable"
  // Let's just find all moves that don't exist in PokemonLearnset.
  
  // Since we use Prisma, it's easier to fetch all moves and their learnsets.
  const allMoves = await prisma.move.findMany({
    include: {
      learnsets: { select: { id: true }, take: 1 },
      type: { select: { name: true } }
    }
  });

  const shopEntries = [];
  
  for (const move of allMoves) {
    // All moves are now purchasable!
    
    // Safety check, moves with no power were already excluded, but just in case
    if (!move.power || move.power < 1) continue;

    const baseCost = 500;
    const powerMultiplier = getPowerMultiplier(move.power);
    const typeMultiplier = TYPE_MULTIPLIERS[move.type.name.toLowerCase()] || 1.0;
    
    const calculatedPrice = Math.floor(baseCost * powerMultiplier * typeMultiplier);
    // Ensure min price is 500
    const finalPrice = Math.max(500, calculatedPrice);

    shopEntries.push({
      moveId: move.id,
      price: finalPrice
    });
  }

  // Clear existing shop
  await prisma.astralMoveShop.deleteMany({});
  
  // Insert new shop entries
  if (shopEntries.length > 0) {
    await prisma.astralMoveShop.createMany({
      data: shopEntries
    });
  }

  console.log(`Successfully generated ${shopEntries.length} Astral Move Shop entries.`);
}
