-- AlterTable
ALTER TABLE "OwnedPokemon" ADD COLUMN     "heldItemId" TEXT;

-- AddForeignKey
ALTER TABLE "OwnedPokemon" ADD CONSTRAINT "OwnedPokemon_heldItemId_fkey" FOREIGN KEY ("heldItemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
