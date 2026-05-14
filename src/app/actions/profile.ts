'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') throw new Error('Acesso negado.')
  return session
}

export async function updateProfile(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) return { error: 'Não autenticado.' }

  const bio = (formData.get('bio') as string | null)?.trim() ?? null
  const instagram = (formData.get('instagram') as string | null)?.trim() ?? null
  const contactEmail = (formData.get('contactEmail') as string | null)?.trim() ?? null
  const phone = (formData.get('phone') as string | null)?.trim() ?? null
  const state = (formData.get('state') as string | null)?.trim() ?? null
  const areas = (formData.get('areas') as string | null)?.trim() ?? null
  const avatar = (formData.get('avatar') as string | null)?.trim() ?? null

  await db.user.update({
    where: { id: session.userId },
    data: { bio, instagram, contactEmail, phone, state, areas, ...(avatar ? { avatar } : {}) },
  })

  revalidatePath(`/perfil/${session.userId}`)
  revalidatePath('/membros')
  return { success: true }
}

export async function createInsignia(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin()

  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() ?? null
  const emoji = (formData.get('emoji') as string | null)?.trim() || '🏅'
  const color = (formData.get('color') as string | null) || '#9f1030'

  if (!name) return { error: 'Nome obrigatório.' }

  const existing = await db.insignia.findUnique({ where: { name } })
  if (existing) return { error: 'Já existe uma insígnia com esse nome.' }

  await db.insignia.create({ data: { name, description, emoji, color } })
  revalidatePath('/admin')
  return { success: true }
}

export async function assignInsignia(userId: string, insigniaId: string) {
  await requireAdmin()
  await db.userInsignia.upsert({
    where: { userId_insigniaId: { userId, insigniaId } },
    create: { userId, insigniaId },
    update: {},
  })
  revalidatePath(`/perfil/${userId}`)
  revalidatePath('/admin')
}

export async function removeInsignia(userId: string, insigniaId: string) {
  await requireAdmin()
  await db.userInsignia.deleteMany({ where: { userId, insigniaId } })
  revalidatePath(`/perfil/${userId}`)
  revalidatePath('/admin')
}

export async function deleteInsignia(insigniaId: string) {
  await requireAdmin()
  await db.insignia.delete({ where: { id: insigniaId } })
  revalidatePath('/admin')
}
