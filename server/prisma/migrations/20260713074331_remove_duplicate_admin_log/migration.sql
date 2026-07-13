/*
  Warnings:

  - You are about to drop the `AdminAuditLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminAuditLog" DROP CONSTRAINT "AdminAuditLog_actorId_fkey";

-- DropTable
DROP TABLE "AdminAuditLog";
