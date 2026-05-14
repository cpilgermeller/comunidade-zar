import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM ?? 'Comunidade ZAR <noreply@resend.dev>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://comunidade-zar.vercel.app'

export async function sendWelcomeEmail({
  to,
  name,
  token,
}: {
  to: string
  name: string
  token: string
}) {
  const url = `${BASE_URL}/definir-senha?token=${token}`

  await resend.emails.send({
    from: FROM,
    to,
    subject: '✦ Bem-vindo(a) à Comunidade ZAR — defina sua senha',
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: linear-gradient(135deg, #0a1628, #102882); border-radius: 16px; margin-bottom: 16px;">
            <span style="color: white; font-size: 28px;">✦</span>
          </div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #0a1628;">Comunidade ZAR</h1>
          <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Sua transformação está aqui.</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 8px;">Olá, <strong>${name}</strong>!</p>
        <p style="font-size: 15px; line-height: 1.6; color: #374151;">
          Seu acesso à Comunidade ZAR foi liberado. Clique no botão abaixo para criar sua senha e acessar a plataforma.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${url}"
            style="display: inline-block; background: linear-gradient(135deg, #0a1628, #102882); color: white; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none;">
            Criar minha senha →
          </a>
        </div>

        <p style="font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.6;">
          Este link expira em 48 horas.<br/>
          Se você não solicitou esse acesso, ignore este e-mail.
        </p>

        <hr style="border: none; border-top: 1px solid #f0eae6; margin: 24px 0;" />
        <p style="font-size: 12px; color: #c4b5b0; text-align: center;">
          ✦ Transformação, estratégia e resultados
        </p>
      </div>
    `,
  })
}
