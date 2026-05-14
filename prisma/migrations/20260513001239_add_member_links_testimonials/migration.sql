-- CreateTable
CREATE TABLE "UsefulLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🔗',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "Testimonial_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "instagram" TEXT,
    "contactEmail" TEXT,
    "phone" TEXT,
    "state" TEXT,
    "areas" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "accessExpiresAt" DATETIME,
    "memberSince" DATETIME,
    "isLifetime" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("accessExpiresAt", "areas", "avatar", "bio", "blocked", "contactEmail", "createdAt", "email", "id", "instagram", "name", "password", "phone", "role", "state", "updatedAt") SELECT "accessExpiresAt", "areas", "avatar", "bio", "blocked", "contactEmail", "createdAt", "email", "id", "instagram", "name", "password", "phone", "role", "state", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
