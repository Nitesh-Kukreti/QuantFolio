/*
  Warnings:

  - You are about to drop the column `exchange` on the `stock` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[isin]` on the table `stock` will be added. If there are existing duplicate values, this will fail.
  - Made the column `isin` on table `stock` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "stock_symbol_key";

-- AlterTable
ALTER TABLE "stock" DROP COLUMN "exchange",
ADD COLUMN     "exchanges" TEXT[],
ALTER COLUMN "isin" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "stock_isin_key" ON "stock"("isin");
