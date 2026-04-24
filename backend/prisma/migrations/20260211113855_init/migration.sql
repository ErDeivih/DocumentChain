/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accessToken]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[refreshToken]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessToken` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessTokenExpiresAt` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshTokenExpiresAt` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Made the column `refreshToken` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Session_token_idx";

-- DropIndex
DROP INDEX "Session_token_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "expiresAt",
DROP COLUMN "token",
ADD COLUMN     "accessToken" TEXT NOT NULL,
ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "refreshToken" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "encryptedPrivateKeyRecovery" TEXT,
ADD COLUMN     "recoveryKeyHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Session_accessToken_key" ON "Session"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_accessToken_idx" ON "Session"("accessToken");

-- CreateIndex
CREATE INDEX "Session_refreshToken_idx" ON "Session"("refreshToken");
