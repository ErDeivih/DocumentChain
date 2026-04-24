/*
  Warnings:

  - You are about to drop the column `createdAt` on the `DocumentStats` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `DocumentStats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocumentStats" DROP COLUMN "createdAt",
DROP COLUMN "isDeleted";
