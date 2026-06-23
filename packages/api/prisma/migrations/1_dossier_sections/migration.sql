-- CreateEnum
CREATE TYPE "GateStatus" AS ENUM ('complet', 'action_requise', 'attente_client');

-- CreateEnum
CREATE TYPE "SourceKind" AS ENUM ('bank', 'fiscal');

-- CreateEnum
CREATE TYPE "SourceState" AS ENUM ('connected', 'pending', 'failed', 'fallback');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "FactorDirection" AS ENUM ('up', 'down');

-- CreateEnum
CREATE TYPE "IndicatorStatus" AS ENUM ('conforme', 'notable', 'blocking', 'info');

-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "calibrationNote" TEXT,
ADD COLUMN     "confidence" "Confidence" NOT NULL,
ADD COLUMN     "confidenceReason" TEXT;

-- CreateTable
CREATE TABLE "Completeness" (
    "id" TEXT NOT NULL,
    "financingRequestId" TEXT NOT NULL,
    "gateStatus" "GateStatus" NOT NULL,
    "lastReminderAt" TIMESTAMP(3),

    CONSTRAINT "Completeness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectionSource" (
    "id" TEXT NOT NULL,
    "financingRequestId" TEXT NOT NULL,
    "kind" "SourceKind" NOT NULL,
    "state" "SourceState" NOT NULL,
    "label" TEXT NOT NULL,
    "detail" TEXT,

    CONSTRAINT "ConnectionSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiddenAccount" (
    "id" TEXT NOT NULL,
    "financingRequestId" TEXT NOT NULL,
    "ibanMasked" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,

    CONSTRAINT "HiddenAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreFactor" (
    "id" TEXT NOT NULL,
    "scoreId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "direction" "FactorDirection" NOT NULL,
    "weight" INTEGER NOT NULL,

    CONSTRAINT "ScoreFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckItem" (
    "id" TEXT NOT NULL,
    "scoreId" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "CheckItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analyse" (
    "id" TEXT NOT NULL,
    "financingRequestId" TEXT NOT NULL,
    "preAssessment" TEXT NOT NULL,

    CONSTRAINT "Analyse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indicator" (
    "id" TEXT NOT NULL,
    "analyseId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT,
    "value" TEXT NOT NULL,
    "threshold" TEXT,
    "status" "IndicatorStatus" NOT NULL,
    "evidenceLabel" TEXT,

    CONSTRAINT "Indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mitigant" (
    "id" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Mitigant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Completeness_financingRequestId_key" ON "Completeness"("financingRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Analyse_financingRequestId_key" ON "Analyse"("financingRequestId");

-- AddForeignKey
ALTER TABLE "Completeness" ADD CONSTRAINT "Completeness_financingRequestId_fkey" FOREIGN KEY ("financingRequestId") REFERENCES "FinancingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionSource" ADD CONSTRAINT "ConnectionSource_financingRequestId_fkey" FOREIGN KEY ("financingRequestId") REFERENCES "FinancingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiddenAccount" ADD CONSTRAINT "HiddenAccount_financingRequestId_fkey" FOREIGN KEY ("financingRequestId") REFERENCES "FinancingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreFactor" ADD CONSTRAINT "ScoreFactor_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "Score"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckItem" ADD CONSTRAINT "CheckItem_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "Score"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analyse" ADD CONSTRAINT "Analyse_financingRequestId_fkey" FOREIGN KEY ("financingRequestId") REFERENCES "FinancingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicator" ADD CONSTRAINT "Indicator_analyseId_fkey" FOREIGN KEY ("analyseId") REFERENCES "Analyse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mitigant" ADD CONSTRAINT "Mitigant_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

