/*
  Warnings:

  - You are about to drop the column `sentAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `MessagePlatform` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[messageId,platformId]` on the table `MessagePlatform` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,name]` on the table `Platform` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `platformId` to the `MessagePlatform` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "sentAt",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "MessagePlatform" DROP COLUMN "platform",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "errorMsg" TEXT,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "platformId" TEXT NOT NULL,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "status" "MessageStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Platform" ADD COLUMN     "lastSyncAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "MessagePlatform_messageId_platformId_key" ON "MessagePlatform"("messageId", "platformId");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_userId_name_key" ON "Platform"("userId", "name");

-- AddForeignKey
ALTER TABLE "MessagePlatform" ADD CONSTRAINT "MessagePlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE CASCADE ON UPDATE CASCADE;
