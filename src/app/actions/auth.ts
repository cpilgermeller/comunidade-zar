'use server'

import { db } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

export async function login(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const user = await db.user.findUnique({ where: { email } })
  if (!user) return { error: 'E-mail ou senha inválidos.' }
  if (user.blocked) return { error: 'Sua conta foi bloqueada. Entre em contato com o administrador.' }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { error: 'E-mail ou senha inválidos.' }

  await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role, accessExpiresAt: user.accessExpiresAt?.toISOString() ?? null })
  redirect('/')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
