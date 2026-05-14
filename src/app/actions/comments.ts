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

  const comment = await db.comment.create({
    data: { body, threadId, authorId: session.userId, parentId },
  })

  const link = `/discussoes/${threadId}#comment-${comment.id}`
  const actorName = session.name.split(' ')[0]

  // Notifica o autor da discussão (se não for o próprio)
  if (thread.authorId !== session.userId) {
    await db.notification.create({
      data: {
        userId: thread.authorId,
        actorId: session.userId,
        type: 'thread_reply',
        title: `${actorName} respondeu sua discussão "${thread.title.slice(0, 50)}${thread.title.length > 50 ? '…' : ''}"`,
        link,
      },
    })
  }

  // Notifica o autor do comentário pai (se for reply e não for o próprio)
  if (parentId) {
    const parent = await db.comment.findUnique({ where: { id: parentId } })
    if (parent && parent.authorId !== session.userId && parent.authorId !== thread.authorId) {
      await db.notification.create({
        data: {
          userId: parent.authorId,
          actorId: session.userId,
          type: 'comment_reply',
          title: `${actorName} respondeu seu comentário em "${thread.title.slice(0, 50)}${thread.title.length > 50 ? '…' : ''}"`,
          link,
        },
      })
    }
  }

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
