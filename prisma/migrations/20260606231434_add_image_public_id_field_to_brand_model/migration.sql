/*
  Warnings:

  - Added the required column `imagePublicId` to the `Brand` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "imagePublicId" TEXT NOT NULL;
