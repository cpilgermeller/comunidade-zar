import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'

const url = process.env.DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

const client = createClient({ url, authToken })

const statements = [
  `ALTER TABLE "Thread" ADD COLUMN "resolved" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "Thread" ADD COLUMN "bestCommentId" TEXT`,
  `CREATE TABLE IF NOT EXISTS "ThreadBookmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE,
    CONSTRAINT "ThreadBookmark_userId_threadId_key" UNIQUE ("userId", "threadId")
  )`,
  `ALTER TABLE "Thread" ADD COLUMN "featured" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "Thread" ADD COLUMN "lastActivityAt" DATETIME`,
  `UPDATE "Thread" SET "lastActivityAt" = "createdAt" WHERE "lastActivityAt" IS NULL`,
  `ALTER TABLE "Category" ADD COLUMN "template" TEXT`,
]

for (const sql of statements) {
  try {
    await client.execute(sql)
    console.log('✓', sql.slice(0, 60))
  } catch (e) {
    if (e.message.includes('duplicate column') || e.message.includes('already exists')) {
      console.log('⏭ já existe:', sql.slice(0, 60))
    } else {
      console.error('✗', e.message)
      process.exit(1)
    }
  }
}

console.log('\nMigração concluída.')
