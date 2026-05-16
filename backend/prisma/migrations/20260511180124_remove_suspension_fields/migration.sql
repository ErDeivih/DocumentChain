/*
  Warnings:

  - You are about to drop the column `isSuspended` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `suspendReason` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `suspendedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isSuspended",
DROP COLUMN "suspendReason",
DROP COLUMN "suspendedAt";
