/*
  Warnings:

  - Added the required column `companyId` to the `EmailTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Settings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmailTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    CONSTRAINT "EmailTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EmailTemplate" ("body", "id", "step", "subject") SELECT "body", "id", "step", "subject" FROM "EmailTemplate";
DROP TABLE "EmailTemplate";
ALTER TABLE "new_EmailTemplate" RENAME TO "EmailTemplate";
CREATE UNIQUE INDEX "EmailTemplate_companyId_step_key" ON "EmailTemplate"("companyId", "step");
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("amount", "clientEmail", "clientName", "createdAt", "dueDate", "id", "invoiceNumber", "status", "updatedAt") SELECT "amount", "clientEmail", "clientName", "createdAt", "dueDate", "id", "invoiceNumber", "status", "updatedAt" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE TABLE "new_Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "reminderInterval" INTEGER NOT NULL DEFAULT 5,
    CONSTRAINT "Settings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Settings" ("id", "reminderInterval") SELECT "id", "reminderInterval" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
CREATE UNIQUE INDEX "Settings_companyId_key" ON "Settings"("companyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Company_email_key" ON "Company"("email");
