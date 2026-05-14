import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: 'Senha deve ter pelo menos 8 caracteres.' }, { status: 400 })
  }

  const record = await db.passwordResetToken.findUnique({ where: { token } })

  if (!record || record.usedAt || new Date() > record.expiresAt) {
    return NextResponse.json({ error: 'Link inválido ou expirado. Solicite um novo link ao administrador.' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 12)

  await db.user.update({
    where: { id: record.userId },
    data: { password: hashed },
  })

  await db.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
