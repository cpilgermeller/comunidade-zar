import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { Navbar } from '@/components/navbar'
import { Avatar } from '@/components/avatar'
import { RichTextDisplay } from '@/components/rich-text-editor'
import { formatDate } from '@/lib/utils'
import { deleteTestimonial } from '@/app/actions/testimonials'
import TestimonialForm from '@/components/testimonial-form'
import { Heart, Quote, Trash2, Infinity } from 'lucide-react'

function tenureBadge(since: Date) {
  const months = Math.floor((Date.now() - since.getTime()) / (1000 * 60 * 60 * 24 * 30))
  if (months < 3)  return '🌱 Novata(o)'
  if (months < 12) return '⭐ Membro ZAR'
  if (months < 24) return '🏆 Veterana(o)'
  return '👑 Fundadora(or)'
}

export default async function DepoimentosPage() {
  const session = await getSession()
  const isAdmin = session?.role === 'admin'

  const [testimonials, myTestimonial] = await Promise.all([
    db.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, memberSince: true, isLifetime: true },
        },
      },
    }),
    session
      ? db.testimonial.findFirst({ where: { authorId: session.userId } })
      : Promise.resolve(null),
  ])

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 animate-fade-in">

          {/* Hero */}
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 rounded-3xl p-7 mb-8 text-white shadow-xl shadow-brand-300/20">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-16 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />
            <p className="text-brand-300 text-sm font-medium mb-1 flex items-center gap-1.5">
              <Heart size={13} className="fill-brand-300" /> Transformações reais
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-1">Depoimentos</h1>
            <p className="text-brand-200/80 text-sm max-w-md">
              Histórias de crescimento e resultados dos membros da Comunidade ZAR.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-2xl font-black">{testimonials.length}</span>
              <span className="text-brand-300 text-sm">história{testimonials.length !== 1 ? 's' : ''} compartilhada{testimonials.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Formulário */}
          {session && (
            <div className="bg-white border border-[#dce8ff] rounded-2xl p-6 mb-8 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-1">
                {myTestimonial ? '✏️ Editar seu depoimento' : '✨ Compartilhe sua transformação'}
              </h2>
              <p className="text-xs text-[#94a3b8] mb-4">
                {myTestimonial
                  ? 'Você pode atualizar seu depoimento a qualquer momento.'
                  : 'Seu depoimento inspira outros membros e mostra o impacto real da comunidade.'}
              </p>
              <TestimonialForm
                existing={myTestimonial?.body ?? null}
                existingImage={myTestimonial?.imageUrl ?? null}
              />
            </div>
          )}

          {/* Lista de depoimentos */}
          {testimonials.length === 0 ? (
            <div className="bg-white border border-[#dce8ff] rounded-2xl p-16 text-center shadow-sm">
              <Quote size={32} className="text-brand-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-600">Seja o(a) primeiro(a) a deixar um depoimento!</p>
              <p className="text-sm text-[#94a3b8] mt-1">
                Compartilhe como a Comunidade ZAR impactou sua trajetória.
              </p>
            </div>
          ) : (
            <div className="space-y-6 stagger">
              {testimonials.map((t) => {
                const isOwner = session?.userId === t.author.id
                const tenure = t.author.memberSince ? tenureBadge(new Date(t.author.memberSince)) : null

                return (
                  <article key={t.id} className="bg-white border border-[#dce8ff] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-brand-200 transition-all">

                    {/* Foto do resultado */}
                    {t.imageUrl && (
                      <div className="relative w-full max-h-72 overflow-hidden bg-brand-950">
                        <img
                          src={t.imageUrl}
                          alt={`Resultado de ${t.author.name}`}
                          className="w-full object-cover max-h-72"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                    )}

                    <div className="p-5">
                      {/* Author row */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">
                            {t.author.avatar ? (
                              <img src={t.author.avatar} alt={t.author.name}
                                className="w-10 h-10 rounded-xl object-cover border border-[#dce8ff]" />
                            ) : (
                              <Avatar name={t.author.name} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{t.author.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {tenure && (
                                <span className="text-[11px] text-[#64748b] bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">{tenure}</span>
                              )}
                              {t.author.isLifetime && (
                                <span className="flex items-center gap-0.5 text-[11px] text-gold-700 font-semibold bg-gold-50 border border-gold-200 px-2 py-0.5 rounded-full">
                                  <Infinity size={9} /> Vitalício
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-[#94a3b8]">{formatDate(t.createdAt)}</span>
                          {(isOwner || isAdmin) && (
                            <form action={deleteTestimonial.bind(null, t.id)}>
                              <button type="submit" className="text-gray-300 hover:text-red-400 transition-colors p-1">
                                <Trash2 size={13} />
                              </button>
                            </form>
                          )}
                        </div>
                      </div>

                      {/* Rich text body */}
                      <div className="relative">
                        <Quote size={20} className="text-brand-100 absolute -top-1 -left-1 shrink-0" />
                        <div className="pl-5 text-gray-700">
                          <RichTextDisplay html={t.body} />
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
