'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function updateDiscussionsLastSeen() {
  const session = await getSession()
  if (!session) return
  const cookieStore = await cookies()
  cookieStore.set('disc_last', new Date().toISOString(), {
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  })
}

export async function createThread(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  const title = (formData.get('title') as string).trim()
  const body = (formData.get('body') as string).trim()
  const categoryId = formData.get('categoryId') as string

  if (!title || !body || !categoryId) redirect('/')

  const thread = await db.thread.create({
    data: { title, body, categoryId, authorId: session.userId, lastActivityAt: new Date() },
  })

  revalidatePath('/')
  redirect(`/discussoes/${thread.id}`)
}

const EDIT_WINDOW_MS = 30 * 60 * 1000

export async function updateThread(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string } | undefined> {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  const threadId = formData.get('threadId') as string
  const title = (formData.get('title') as string).trim()
  const body = (formData.get('body') as string).trim()

  if (!title || !body) return { error: 'Título e conteúdo são obrigatórios.' }

  const thread = await db.thread.findUnique({ where: { id: threadId } })
  if (!thread) return { error: 'Discussão não encontrada.' }
  if (thread.authorId !== session.userId) return { error: 'Não autorizado.' }
  if (Date.now() - thread.createdAt.getTime() > EDIT_WINDOW_MS) {
    return { error: 'O prazo de edição de 30 minutos já encerrou.' }
  }

  await db.thread.update({ where: { id: threadId }, data: { title, body } })
  revalidatePath(`/discussoes/${threadId}`)
}

export async function deleteThread(threadId: string) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  const thread = await db.thread.findUnique({ where: { id: threadId } })
  if (!thread) return

  if (thread.authorId !== session.userId && session.role !== 'admin') {
    throw new Error('Não autorizado')
  }

  await db.thread.delete({ where: { id: threadId } })
  revalidatePath('/')
  redirect('/')
}

export async function toggleThreadLike(threadId: string) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  const existing = await db.like.findUnique({
    where: { userId_threadId: { userId: session.userId, threadId } },
  })

  if (existing) {
    await db.like.delete({ where: { id: existing.id } })
  } else {
    await db.like.create({ data: { userId: session.userId, threadId } })
  }

  revalidatePath(`/discussoes/${threadId}`)
}

export async function markBestAnswer(threadId: string, commentId: string) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')
  const thread = await db.thread.findUnique({ where: { id: threadId } })
  if (!thread) throw new Error('Não autorizado')
  const canManage = thread.authorId === session.userId || session.role === 'admin'
  if (!canManage) throw new Error('Não autorizado')
  await db.thread.update({ where: { id: threadId }, data: { bestCommentId: commentId, resolved: true } })
  revalidatePath(`/discussoes/${threadId}`)
}

export async function clearBestAnswer(threadId: string) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')
  const thread = await db.thread.findUnique({ where: { id: threadId } })
  if (!thread) throw new Error('Não autorizado')
  const canManage = thread.authorId === session.userId || session.role === 'admin'
  if (!canManage) throw new Error('Não autorizado')
  await db.thread.update({ where: { id: threadId }, data: { bestCommentId: null, resolved: false } })
  revalidatePath(`/discussoes/${threadId}`)
}

export async function toggleBookmark(threadId: string) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')
  const existing = await db.threadBookmark.findUnique({
    where: { userId_threadId: { userId: session.userId, threadId } },
  })
  if (existing) {
    await db.threadBookmark.delete({ where: { id: existing.id } })
  } else {
    await db.threadBookmark.create({ data: { userId: session.userId, threadId } })
  }
  revalidatePath(`/discussoes/${threadId}`)
  revalidatePath('/discussoes/salvos')
  revalidatePath('/discussoes')
}

export async function incrementViews(threadId: string) {
  await db.thread.update({
    where: { id: threadId },
    data: { views: { increment: 1 } },
  })
}
