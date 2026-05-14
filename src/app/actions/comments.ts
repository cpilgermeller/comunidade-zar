'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createComment(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  const body = (formData.get('body') as string).trim()
  const threadId = formData.get('threadId') as string
  const parentId = (formData.get('parentId') as string) || null

  if (!body) return { error: 'Comentário não pode estar vazio.' }

  const thread = await db.thread.findUnique({ where: { id: threadId } })
  if (!thread || thread.locked) return { error: 'Esta discussão está encerrada.' }

  await db.comment.create({
    data: { body, threadId, authorId: session.userId, parentId },
  })

  revalidatePath(`/discussoes/${threadId}`)
}

export async function deleteComment(commentId: string, threadId: string) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  const comment = await db.comment.findUnique({ where: { id: commentId } })
  if (!comment) return

  if (comment.authorId !== session.userId && session.role !== 'admin') {
    throw new Error('Não autorizado')
  }

  await db.comment.delete({ where: { id: commentId } })
  revalidatePath(`/discussoes/${threadId}`)
}

export async function toggleCommentLike(commentId: string, threadId: string) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  const existing = await db.like.findUnique({
    where: { userId_commentId: { userId: session.userId, commentId } },
  })

  if (existing) {
    await db.like.delete({ where: { id: existing.id } })
  } else {
    await db.like.create({ data: { userId: session.userId, commentId } })
  }

  revalidatePath(`/discussoes/${threadId}`)
}
