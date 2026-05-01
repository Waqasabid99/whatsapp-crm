/*
  Warnings:

  - A unique constraint covering the columns `[providerTemplateId]` on the table `Template` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `components` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "category" TEXT,
ADD COLUMN     "components" JSONB NOT NULL,
ALTER COLUMN "content" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Template_providerTemplateId_key" ON "Template"("providerTemplateId");
