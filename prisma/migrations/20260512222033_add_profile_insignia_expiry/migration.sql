-- AlterTable
ALTER TABLE "User" ADD COLUMN "accessExpiresAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "areas" TEXT;
ALTER TABLE "User" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "User" ADD COLUMN "instagram" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "state" TEXT;

-- CreateTable
CREATE TABLE "Insignia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "emoji" TEXT NOT NULL DEFAULT '🏅',
    "color" TEXT NOT NULL DEFAULT '#9f1030',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserInsignia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "insigniaId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserInsignia_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserInsignia_insigniaId_fkey" FOREIGN KEY ("insigniaId") REFERENCES "Insignia" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Insignia_name_key" ON "Insignia"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserInsignia_userId_insigniaId_key" ON "UserInsignia"("userId", "insigniaId");
