import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

// GET — lista notificações do usuário
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const notifications = await db.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { actor: { select: { name: true } } },
  })

  const unread = notifications.filter((n) => !n.read).length

  return NextResponse.json({ notifications, unread })
}

// PATCH — marca todas como lidas
export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await req.json().catch(() => ({}))

  if (id) {
    await db.notification.updateMany({
      where: { id, userId: session.userId },
      data: { read: true },
    })
  } else {
    await db.notification.updateMany({
      where: { userId: session.userId, read: false },
      data: { read: true },
    })
  }

  return NextResponse.json({ ok: true })
}
