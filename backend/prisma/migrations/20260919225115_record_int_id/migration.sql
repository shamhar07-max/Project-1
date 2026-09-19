/*
  Warnings:

  - The primary key for the `Record` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Record` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Record" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Record" ("checkpointNotes", "createdAt", "id", "loopStage", "missionId", "missionKind", "recordType", "reviewerComment", "savedPromptText", "status", "submissionText", "toolCategory", "toolName", "toolNote", "toolUrl", "unitCode", "userId") SELECT "checkpointNotes", "createdAt", "id", "loopStage", "missionId", "missionKind", "recordType", "reviewerComment", "savedPromptText", "status", "submissionText", "toolCategory", "toolName", "toolNote", "toolUrl", "unitCode", "userId" FROM "Record";
DROP TABLE "Record";
ALTER TABLE "new_Record" RENAME TO "Record";
CREATE INDEX "Record_userId_idx" ON "Record"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
