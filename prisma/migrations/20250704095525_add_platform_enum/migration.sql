/*
  Warnings:

  - Changed the type of `name` on the `Platform` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PlatformName" AS ENUM ('WHATSAPP', 'TELEGRAM', 'INSTAGRAM');

-- AlterTable
ALTER TABLE "Platform" DROP COLUMN "name",
ADD COLUMN     "name" "PlatformName" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Platform_userId_name_key" ON "Platform"("userId", "name");
