import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'

// Kiwify envia um token na query string que você configura no painel deles
function verifyToken(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  return token === process.env.KIWIFY_WEBHOOK_TOKEN
}

function calcExpiresAt(frequency: number, frequencyType: string): Date | null {
  const now = new Date()
  const type = (frequencyType ?? '').toUpperCase()
  if (type === 'YEAR') {
    return new Date(now.setFullYear(now.getFullYear() + frequency))
  }
  // MONTH (padrão)
  return new Date(now.setMonth(now.getMonth() + frequency))
}

export async function POST(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const event = body.event as string
  const data = body.data as Record<string, unknown> ?? {}

  const customer = data.customer as Record<string, string> | undefined
  const subscription = data.subscription as Record<string, unknown> | undefined
  const plan = subscription?.plan as Record<string, unknown> | undefined

  // Eventos que criam ou renovam acesso
  if (event === 'order_approved' || event === 'subscription_active') {
    if (!customer?.email || !customer?.name) {
      return NextResponse.json({ error: 'Dados do cliente ausentes' }, { status: 400 })
    }

    const email = customer.email.toLowerCase().trim()
    const name = customer.name.trim()

    // Determina prazo de acesso pelo plano
    const frequency = Number(plan?.frequency ?? 1)
    const frequencyType = (plan?.frequency_type as string) ?? 'MONTH'
    const isLifetime = (data.type as string) === 'payment' && !subscription
    const accessExpiresAt = isLifetime ? null : calcExpiresAt(frequency, frequencyType)

    let user = await db.user.findUnique({ where: { email } })

    if (!user) {
      // Cria conta com senha temporária aleatória
      const tempPassword = randomBytes(16).toString('hex')
      const hashed = await bcrypt.hash(tempPassword, 12)

      user = await db.user.create({
        data: {
          name,
          email,
          password: hashed,
          role: 'member',
          isLifetime,
          accessExpiresAt,
          memberSince: new Date(),
        },
      })

      // Cria token para definir senha (válido 48h)
      const token = randomBytes(32).toString('hex')
      await db.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      })

      // Envia e-mail de boas-vindas com link para criar senha
      try {
        await sendWelcomeEmail({ to: email, name, token })
      } catch (err) {
        console.error('Erro ao enviar e-mail de boas-vindas:', err)
      }
    } else {
      // Usuário já existe — renova o acesso
      await db.user.update({
        where: { id: user.id },
        data: {
          isLifetime: isLifetime || user.isLifetime,
          accessExpiresAt: isLifetime ? null : accessExpiresAt,
          blocked: false,
        },
      })
    }

    return NextResponse.json({ ok: true, userId: user.id })
  }

  // Eventos que expiram o acesso
  if (
    event === 'subscription_canceled' ||
    event === 'subscription_expired' ||
    event === 'order_refunded'
  ) {
    const email = customer?.email?.toLowerCase().trim()
    if (email) {
      await db.user.updateMany({
        where: { email },
        data: { accessExpiresAt: new Date() }, // expira imediatamente
      })
    }
    return NextResponse.json({ ok: true })
  }

  // Outros eventos ignorados
  return NextResponse.json({ ok: true, ignored: true })
}
