-- AlterEnum
ALTER TYPE "BattleStatus" ADD VALUE 'WAITING_MOVE_LEARN';

-- AlterTable
ALTER TABLE "Species" ADD COLUMN     "evolutionItem" TEXT,
ADD COLUMN     "evolutionLevel" INTEGER,
ADD COLUMN     "evolvesToId" INTEGER;

-- AddForeignKey
ALTER TABLE "Species" ADD CONSTRAINT "Species_evolvesToId_fkey" FOREIGN KEY ("evolvesToId") REFERENCES "Species"("id") ON DELETE SET NULL ON UPDATE CASCADE;
