/*
  Warnings:

  - You are about to drop the column `currentPage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `reviewerMode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `selectedCode` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Record" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "actedByUserId" INTEGER,
    "recordType" TEXT NOT NULL,
    "unitCode" TEXT,
    "missionId" TEXT,
    "missionKind" TEXT,
    "loopStage" TEXT,
    "status" TEXT,
    "submissionText" TEXT,
    "reviewerComment" TEXT,
    "checkpointNotes" TEXT,
    "toolName" TEXT,
    "toolCategory" TEXT,
    "toolUrl" TEXT,
    "toolNote" TEXT,
    "savedPromptText" TEXT,
    "bundleId" TEXT,
    "score" INTEGER,
    "passed" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Record_actedByUserId_fkey" FOREIGN KEY ("actedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Record" ("checkpointNotes", "createdAt", "id", "loopStage", "missionId", "missionKind", "recordType", "reviewerComment", "savedPromptText", "status", "submissionText", "toolCategory", "toolName", "toolNote", "toolUrl", "unitCode", "userId") SELECT "checkpointNotes", "createdAt", "id", "loopStage", "missionId", "missionKind", "recordType", "reviewerComment", "savedPromptText", "status", "submissionText", "toolCategory", "toolName", "toolNote", "toolUrl", "unitCode", "userId" FROM "Record";
DROP TABLE "Record";
ALTER TABLE "new_Record" RENAME TO "Record";
CREATE INDEX "Record_userId_idx" ON "Record"("userId");
CREATE INDEX "Record_actedByUserId_idx" ON "Record"("actedByUserId");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'learner',
    "experienceLevel" TEXT,
    "weeklyAvailability" TEXT,
    "learnerGoals" TEXT,
    "audience" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("consentGiven", "createdAt", "email", "experienceLevel", "id", "learnerGoals", "name", "passwordHash", "weeklyAvailability") SELECT "consentGiven", "createdAt", "email", "experienceLevel", "id", "learnerGoals", "name", "passwordHash", "weeklyAvailability" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
