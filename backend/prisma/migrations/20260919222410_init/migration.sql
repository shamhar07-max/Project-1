-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "experienceLevel" TEXT,
    "weeklyAvailability" TEXT,
    "learnerGoals" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "reviewerMode" BOOLEAN NOT NULL DEFAULT false,
    "currentPage" TEXT NOT NULL DEFAULT 'home',
    "selectedCode" TEXT NOT NULL DEFAULT 'DB-00',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL PRIMARY KEY,
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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Record_userId_idx" ON "Record"("userId");
