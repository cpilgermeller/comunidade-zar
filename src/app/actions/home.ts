'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') throw new Error('Acesso negado.')
  return session
}

export async function createAnnouncement(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await requireAdmin()
  const title = (formData.get('title') as string).trim()
  const content = (formData.get('content') as string).trim()
  const pinned = formData.get('pinned') === 'on'

  if (!title || !content) return { error: 'Título e conteúdo são obrigatórios.' }

  await db.announcement.create({ data: { title, content, pinned, authorId: session.userId } })
  revalidatePath('/')
  return { success: true }
}

export async function deleteAnnouncement(id: string) {
  await requireAdmin()
  await db.announcement.delete({ where: { id } })
  revalidatePath('/')
}

export async function togglePinAnnouncement(id: string) {
  await requireAdmin()
  const ann = await db.announcement.findUnique({ where: { id } })
  if (!ann) return
  await db.announcement.update({ where: { id }, data: { pinned: !ann.pinned } })
  revalidatePath('/')
}

export async function createEvent(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await requireAdmin()
  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const link = (formData.get('link') as string).trim()
  const dateStr = formData.get('eventDate') as string

  if (!title || !dateStr) return { error: 'Título e data são obrigatórios.' }

  const eventDate = new Date(dateStr)
  if (isNaN(eventDate.getTime())) return { error: 'Data inválida.' }

  await db.event.create({
    data: { title, description: description || null, link: link || null, eventDate, authorId: session.userId },
  })
  revalidatePath('/')
  return { success: true }
}

export async function deleteEvent(id: string) {
  await requireAdmin()
  await db.event.delete({ where: { id } })
  revalidatePath('/')
}
