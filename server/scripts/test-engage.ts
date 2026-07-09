import { BattlesService } from '../src/modules/battles/battles.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.findFirst({ where: { username: 'night' } });
    if (!user) {
      console.error("User night not found");
      return;
    }
    
    const zone = await prisma.zone.findFirst();
    if (!zone) {
      console.error("No zones found");
      return;
    }

    const service = new BattlesService();
    console.log(`Testing engage for user ${user.id} in zone ${zone.id}`);
    
    // Force a 100% encounter by overriding Math.random temporarily
    const originalRandom = Math.random;
    Math.random = () => 0.1; // 0.1 is <= 0.3, so it should trigger an encounter
    
    const result = await service.engageWild(user.id, zone.id);
    console.log("Result:", result);
    
    Math.random = originalRandom;
  } catch (err) {
    console.error("Error during engage:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
