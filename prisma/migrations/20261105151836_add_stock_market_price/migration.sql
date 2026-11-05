/*
  Warnings:

  - You are about to drop the column `exchanges` on the `stock` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[instrumentKey]` on the table `stock` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[symbol,exchange]` on the table `stock` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `exchange` to the `stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instrumentKey` to the `stock` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "stock_isin_key";

-- AlterTable
ALTER TABLE "stock" DROP COLUMN "exchanges",
ADD COLUMN     "exchange" TEXT NOT NULL,
ADD COLUMN     "instrumentKey" TEXT NOT NULL,
ALTER COLUMN "isin" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "stock_instrumentKey_key" ON "stock"("instrumentKey");

-- CreateIndex
CREATE UNIQUE INDEX "stock_symbol_exchange_key" ON "stock"("symbol", "exchange");
