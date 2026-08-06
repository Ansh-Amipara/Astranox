-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BattleStatus" AS ENUM ('ACTIVE', 'WAITING_SWITCH', 'WON', 'LOST', 'FLED', 'CAUGHT');

-- CreateEnum
CREATE TYPE "BattleType" AS ENUM ('WILD', 'NPC');

-- CreateEnum
CREATE TYPE "TrainerType" AS ENUM ('NORMAL', 'GYM', 'ELITE', 'CHAMPION', 'RIVAL', 'BOSS', 'LEGENDARY');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "refreshTokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerSave" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "starterChosenAt" TIMESTAMP(3),
    "money" INTEGER NOT NULL DEFAULT 3000,
    "badges" TEXT[],
    "continentId" UUID,
    "regionId" UUID,
    "areaId" UUID,
    "positionX" INTEGER NOT NULL DEFAULT 0,
    "positionY" INTEGER NOT NULL DEFAULT 0,
    "facing" TEXT NOT NULL DEFAULT 'DOWN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerSave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnedPokemon" (
    "id" UUID NOT NULL,
    "trainerId" UUID NOT NULL,
    "speciesId" INTEGER NOT NULL,
    "nickname" TEXT,
    "level" INTEGER NOT NULL DEFAULT 5,
    "isParty" BOOLEAN NOT NULL DEFAULT false,
    "boxNumber" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 0,
    "ivHp" INTEGER NOT NULL DEFAULT 0,
    "ivAttack" INTEGER NOT NULL DEFAULT 0,
    "ivDefense" INTEGER NOT NULL DEFAULT 0,
    "ivSpAtk" INTEGER NOT NULL DEFAULT 0,
    "ivSpDef" INTEGER NOT NULL DEFAULT 0,
    "ivSpeed" INTEGER NOT NULL DEFAULT 0,
    "currentXp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OwnedPokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnedPokemonMove" (
    "id" SERIAL NOT NULL,
    "ownedPokemonId" UUID NOT NULL,
    "moveId" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OwnedPokemonMove_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Type" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "damageRelations" JSONB NOT NULL,

    CONSTRAINT "Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "spriteUrl" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" UUID NOT NULL,
    "trainerId" UUID NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Move" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "power" INTEGER,
    "accuracy" INTEGER,
    "priority" INTEGER NOT NULL,
    "damageClass" TEXT NOT NULL,
    "ailment" TEXT,
    "ailmentChance" INTEGER,
    "flinchChance" INTEGER,
    "statChanges" JSONB,

    CONSTRAINT "Move_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Species" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "spriteUrl" TEXT NOT NULL,
    "hp" INTEGER NOT NULL,
    "attack" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "spAtk" INTEGER NOT NULL,
    "spDef" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "catchRate" INTEGER NOT NULL DEFAULT 255,
    "baseExp" INTEGER NOT NULL DEFAULT 100,
    "type1Id" INTEGER NOT NULL,
    "type2Id" INTEGER,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Learnset" (
    "id" SERIAL NOT NULL,
    "speciesId" INTEGER NOT NULL,
    "moveId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "learnOrder" INTEGER NOT NULL,

    CONSTRAINT "Learnset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleSession" (
    "id" UUID NOT NULL,
    "trainerId" UUID NOT NULL,
    "status" "BattleStatus" NOT NULL DEFAULT 'ACTIVE',
    "battleType" "BattleType" NOT NULL DEFAULT 'WILD',
    "turnNumber" INTEGER NOT NULL DEFAULT 1,
    "playerActivePokemonId" UUID NOT NULL,
    "npcTrainerId" UUID,
    "opponentPokemonData" JSONB NOT NULL DEFAULT '{}',
    "opponentPartyData" JSONB,
    "playerPokemonData" JSONB NOT NULL,
    "playerPartyData" JSONB,
    "log" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BattleSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcTrainer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "spriteUrl" TEXT NOT NULL,
    "trainerClass" TEXT NOT NULL,
    "rewardMoney" INTEGER NOT NULL DEFAULT 0,
    "badgeName" TEXT,
    "trainerType" "TrainerType" NOT NULL DEFAULT 'NORMAL',

    CONSTRAINT "NpcTrainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcTrainerPokemon" (
    "id" UUID NOT NULL,
    "npcTrainerId" UUID NOT NULL,
    "speciesId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 5,
    "position" INTEGER NOT NULL DEFAULT 0,
    "ivHp" INTEGER NOT NULL DEFAULT 0,
    "ivAttack" INTEGER NOT NULL DEFAULT 0,
    "ivDefense" INTEGER NOT NULL DEFAULT 0,
    "ivSpAtk" INTEGER NOT NULL DEFAULT 0,
    "ivSpDef" INTEGER NOT NULL DEFAULT 0,
    "ivSpeed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NpcTrainerPokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerDefeatedNpc" (
    "id" UUID NOT NULL,
    "trainerId" UUID NOT NULL,
    "npcTrainerId" UUID NOT NULL,
    "defeatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainerDefeatedNpc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "beforeValues" JSONB,
    "afterValues" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerSave_userId_key" ON "TrainerSave"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OwnedPokemonMove_ownedPokemonId_slot_key" ON "OwnedPokemonMove"("ownedPokemonId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "Type_name_key" ON "Type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_key" ON "Item"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_trainerId_itemId_key" ON "InventoryItem"("trainerId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Move_name_key" ON "Move"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Species_name_key" ON "Species"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Learnset_speciesId_moveId_level_key" ON "Learnset"("speciesId", "moveId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerDefeatedNpc_trainerId_npcTrainerId_key" ON "TrainerDefeatedNpc"("trainerId", "npcTrainerId");

-- AddForeignKey
ALTER TABLE "TrainerSave" ADD CONSTRAINT "TrainerSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedPokemon" ADD CONSTRAINT "OwnedPokemon_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerSave"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedPokemon" ADD CONSTRAINT "OwnedPokemon_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedPokemonMove" ADD CONSTRAINT "OwnedPokemonMove_ownedPokemonId_fkey" FOREIGN KEY ("ownedPokemonId") REFERENCES "OwnedPokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedPokemonMove" ADD CONSTRAINT "OwnedPokemonMove_moveId_fkey" FOREIGN KEY ("moveId") REFERENCES "Move"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerSave"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Move" ADD CONSTRAINT "Move_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Species" ADD CONSTRAINT "Species_type1Id_fkey" FOREIGN KEY ("type1Id") REFERENCES "Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Species" ADD CONSTRAINT "Species_type2Id_fkey" FOREIGN KEY ("type2Id") REFERENCES "Type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Learnset" ADD CONSTRAINT "Learnset_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Learnset" ADD CONSTRAINT "Learnset_moveId_fkey" FOREIGN KEY ("moveId") REFERENCES "Move"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleSession" ADD CONSTRAINT "BattleSession_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerSave"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTrainerPokemon" ADD CONSTRAINT "NpcTrainerPokemon_npcTrainerId_fkey" FOREIGN KEY ("npcTrainerId") REFERENCES "NpcTrainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerDefeatedNpc" ADD CONSTRAINT "TrainerDefeatedNpc_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerSave"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerDefeatedNpc" ADD CONSTRAINT "TrainerDefeatedNpc_npcTrainerId_fkey" FOREIGN KEY ("npcTrainerId") REFERENCES "NpcTrainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
