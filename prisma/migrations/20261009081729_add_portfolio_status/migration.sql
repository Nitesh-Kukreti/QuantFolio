-- CreateEnum
CREATE TYPE "PortfolioStatus" AS ENUM ('draft', 'active', 'closed');

-- AlterTable
ALTER TABLE "portfolio" ADD COLUMN     "status" "PortfolioStatus" NOT NULL DEFAULT 'draft';
