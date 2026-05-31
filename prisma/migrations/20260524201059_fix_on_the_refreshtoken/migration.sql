/*
  Warnings:

  - You are about to drop the column `verifiedEmail` on the `refresh_tokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "verifiedEmail";
