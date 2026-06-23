-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "FinancingType" AS ENUM ('loan', 'line_of_credit', 'factoring', 'leasing');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending_review', 'info_requested', 'awaiting_client', 'approved', 'rejected', 'blocked');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('liasse_fiscale', 'releve_bancaire');

-- CreateEnum
CREATE TYPE "RiskBucket" AS ENUM ('low', 'medium', 'high');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "siren" TEXT NOT NULL,
    "businessType" TEXT,
    "legalCategory" TEXT,
    "codeNaf" TEXT,
    "creationDate" TIMESTAMP(3),
    "address" TEXT,
    "countryCode" TEXT DEFAULT 'FR',
    "postalCode" TEXT,
    "owner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancingRequest" (
    "id" TEXT NOT NULL,
    "type" "FinancingType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending_review',
    "companyId" TEXT NOT NULL,
    "fundUsage" TEXT,
    "rejectedReason" TEXT,
    "amount" INTEGER NOT NULL,
    "durationInMonth" INTEGER NOT NULL,
    "interestRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "companyId" TEXT NOT NULL,
    "financingRequestId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "financingRequestId" TEXT NOT NULL,
    "riskBucket" "RiskBucket" NOT NULL,
    "globalScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_siren_key" ON "Company"("siren");

-- CreateIndex
CREATE UNIQUE INDEX "Score_financingRequestId_key" ON "Score"("financingRequestId");

-- AddForeignKey
ALTER TABLE "FinancingRequest" ADD CONSTRAINT "FinancingRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_financingRequestId_fkey" FOREIGN KEY ("financingRequestId") REFERENCES "FinancingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_financingRequestId_fkey" FOREIGN KEY ("financingRequestId") REFERENCES "FinancingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

