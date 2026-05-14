'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createThread(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  const title = (formData.get('title') as string).trim()
  const body = (formData.get('body') as string).trim()
  const categoryId = formData.get('categoryId') as string

  if (!title || !body || !categoryId) redirect('/')

  const thread = await db.thread.create({
    data: { title, body, categoryId, authorId: session.userId },
  })

  revalidatePath('/')
  redirect(`/discussoes/${thread.id}`)
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

export async function incrementViews(threadId: string) {
  await db.thread.update({
    where: { id: threadId },
    data: { views: { increment: 1 } },
  })
}
