-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "OwnedPokemon" ADD COLUMN     "isForTrade" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Friendship" (
    "id" UUID NOT NULL,
    "userAId" UUID NOT NULL,
    "userBId" UUID NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeRequest" (
    "id" UUID NOT NULL,
    "initiatorId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    "offeredPokemonId" UUID NOT NULL,
    "requestedPokemonId" UUID NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_userAId_userBId_key" ON "Friendship"("userAId", "userBId");

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeRequest" ADD CONSTRAINT "TradeRequest_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "TrainerSave"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeRequest" ADD CONSTRAINT "TradeRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "TrainerSave"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeRequest" ADD CONSTRAINT "TradeRequest_offeredPokemonId_fkey" FOREIGN KEY ("offeredPokemonId") REFERENCES "OwnedPokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeRequest" ADD CONSTRAINT "TradeRequest_requestedPokemonId_fkey" FOREIGN KEY ("requestedPokemonId") REFERENCES "OwnedPokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
