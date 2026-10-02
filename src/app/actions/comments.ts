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

  db.thread.update({ where: { id: threadId }, data: { lastActivityAt: new Date() } }).catch(() => {})

  const link = `/discussoes/${threadId}#comment-${comment.id}`
  const actorName = session.name.split(' ')[0]

  try {
    const titleShort = `${thread.title.slice(0, 50)}${thread.title.length > 50 ? '…' : ''}`
    const alreadyNotified = new Set([session.userId])

    // Notifica o autor da discussão (se não for o próprio)
    if (thread.authorId !== session.userId) {
      alreadyNotified.add(thread.authorId)
      await db.notification.create({
        data: {
          userId: thread.authorId,
          actorId: session.userId,
          type: 'thread_reply',
          title: `${actorName} respondeu sua discussão "${titleShort}"`,
          link,
        },
      })
    }

    // Notifica o autor do comentário pai (se for reply e não for o próprio)
    if (parentId) {
      const parent = await db.comment.findUnique({ where: { id: parentId } })
      if (parent && !alreadyNotified.has(parent.authorId)) {
        alreadyNotified.add(parent.authorId)
        await db.notification.create({
          data: {
            userId: parent.authorId,
            actorId: session.userId,
            type: 'comment_reply',
            title: `${actorName} respondeu seu comentário em "${titleShort}"`,
            link,
          },
        })
      }
    }

    // Notifica outros participantes que comentaram na thread
    const otherParticipants = await db.comment.findMany({
      where: { threadId, authorId: { notIn: [...alreadyNotified] } },
      select: { authorId: true },
      distinct: ['authorId'],
      take: 10,
      orderBy: { createdAt: 'desc' },
    })
    for (const p of otherParticipants) {
      await db.notification.create({
        data: {
          userId: p.authorId,
          actorId: session.userId,
          type: 'thread_reply',
          title: `${actorName} também respondeu em "${titleShort}"`,
          link,
        },
      })
    }
  } catch (err) {
    console.error('Erro ao criar notificação:', err)
    // Não interrompe o fluxo — comentário já foi salvo
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

  // Se esse comentário é a melhor resposta, limpa o campo na thread
  const thread = await db.thread.findUnique({ where: { id: threadId }, select: { bestCommentId: true } })
  if (thread?.bestCommentId === commentId) {
    await db.thread.update({ where: { id: threadId }, data: { bestCommentId: null, resolved: false } })
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
