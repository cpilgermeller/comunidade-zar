import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const db = new PrismaClient({ adapter })

async function main() {
  const adminEmail = 'admin@zar.com'
  const existing = await db.user.findUnique({ where: { email: adminEmail } })

  if (!existing) {
    const hash = await bcrypt.hash('admin123', 12)
    await db.user.create({
      data: {
        name: 'Administrador ZAR',
        email: adminEmail,
        password: hash,
        role: 'admin',
      },
    })
    console.log('✅ Admin criado: admin@zar.com / admin123')
  }

  const cats = [
    { name: 'Dúvidas Gerais', slug: 'duvidas-gerais', description: 'Perguntas e dúvidas gerais do curso', color: '#6366f1' },
    { name: 'Estratégias', slug: 'estrategias', description: 'Estratégias, técnicas e boas práticas', color: '#8b5cf6' },
    { name: 'Compartilhamentos', slug: 'compartilhamentos', description: 'Compartilhe aprendizados e conquistas', color: '#10b981' },
    { name: 'Discussão', slug: 'discussao', description: 'Debates e trocas de ideias', color: '#f59e0b' },
    { name: 'Feedback', slug: 'feedback', description: 'Sugestões e feedbacks', color: '#3b82f6' },
  ]

  for (const cat of cats) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Categorias criadas')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
