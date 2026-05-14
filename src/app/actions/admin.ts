'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') throw new Error('Acesso negado.')
  return session
}

export async function createUser(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin()

  const name = (formData.get('name') as string).trim()
  const email = (formData.get('email') as string).trim().toLowerCase()
  const password = formData.get('password') as string
  const role = (formData.get('role') as string) || 'member'
  const accessExpiresRaw = formData.get('accessExpiresAt') as string | null
  const memberSinceRaw = formData.get('memberSince') as string | null
  const isLifetime = formData.get('isLifetime') === 'on'

  if (!name || !email || !password) return { error: 'Preencha todos os campos.' }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return { error: 'E-mail já cadastrado.' }

  const hashed = await bcrypt.hash(password, 12)
  const accessExpiresAt = accessExpiresRaw ? new Date(accessExpiresRaw) : null
  const memberSince = memberSinceRaw ? new Date(memberSinceRaw) : new Date()
  await db.user.create({ data: { name, email, password: hashed, role, accessExpiresAt, memberSince, isLifetime } })

  revalidatePath('/admin')
  return { success: true }
}

export async function toggleBlockUser(userId: string) {
  await requireAdmin()

  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return

  await db.user.update({
    where: { id: userId },
    data: { blocked: !user.blocked },
  })

  revalidatePath('/admin')
}

export async function deleteUser(userId: string) {
  await requireAdmin()
  await db.user.delete({ where: { id: userId } })
  revalidatePath('/admin')
}

export async function togglePinThread(threadId: string) {
  await requireAdmin()

  const thread = await db.thread.findUnique({ where: { id: threadId } })
  if (!thread) return

  await db.thread.update({
    where: { id: threadId },
    data: { pinned: !thread.pinned },
  })

  revalidatePath('/')
}

export async function toggleLockThread(threadId: string) {
  await requireAdmin()

  const thread = await db.thread.findUnique({ where: { id: threadId } })
  if (!thread) return

  await db.thread.update({
    where: { id: threadId },
    data: { locked: !thread.locked },
  })

  revalidatePath(`/discussoes/${threadId}`)
}

export async function createCategory(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin()

  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string).trim()
  const color = (formData.get('color') as string) || '#6366f1'
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  if (!name) return { error: 'Nome obrigatório.' }

  await db.category.create({ data: { name, slug, description, color } })
  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}
