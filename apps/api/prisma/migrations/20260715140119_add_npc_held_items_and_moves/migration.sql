-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TrainerType" ADD VALUE 'HUNTER';
ALTER TYPE "TrainerType" ADD VALUE 'ELDER';
ALTER TYPE "TrainerType" ADD VALUE 'GUARDIAN';
ALTER TYPE "TrainerType" ADD VALUE 'CADRE';
ALTER TYPE "TrainerType" ADD VALUE 'OPERATIVE';

-- AlterTable
ALTER TABLE "NpcTrainerPokemon" ADD COLUMN     "heldItemId" TEXT;

-- CreateTable
CREATE TABLE "NpcTrainerPokemonMove" (
    "id" SERIAL NOT NULL,
    "npcTrainerPokemonId" UUID NOT NULL,
    "moveId" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NpcTrainerPokemonMove_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NpcTrainerPokemonMove_npcTrainerPokemonId_slot_key" ON "NpcTrainerPokemonMove"("npcTrainerPokemonId", "slot");

-- AddForeignKey
ALTER TABLE "NpcTrainerPokemon" ADD CONSTRAINT "NpcTrainerPokemon_heldItemId_fkey" FOREIGN KEY ("heldItemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTrainerPokemonMove" ADD CONSTRAINT "NpcTrainerPokemonMove_npcTrainerPokemonId_fkey" FOREIGN KEY ("npcTrainerPokemonId") REFERENCES "NpcTrainerPokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTrainerPokemonMove" ADD CONSTRAINT "NpcTrainerPokemonMove_moveId_fkey" FOREIGN KEY ("moveId") REFERENCES "Move"("id") ON DELETE CASCADE ON UPDATE CASCADE;
