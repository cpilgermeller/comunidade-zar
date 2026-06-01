import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { CadastrarMuralForm } from './form'
import { ChevronLeft, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default async function CadastrarMuralPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const existing = await db.opportunityProfile.findUnique({ where: { userId: session.userId } })
  if (existing) redirect('/mural?cadastrado=1')

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 animate-fade-in">
          <Link href="/mural" className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-800 mb-6 transition-colors">
            <ChevronLeft size={16} /> Mural de Oportunidades
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-900 to-brand-700 rounded-xl flex items-center justify-center shadow-md shadow-brand-200">
              <Briefcase size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Cadastro de Correspondente</h1>
              <p className="text-sm text-gray-500">Seu perfil será revisado antes de aparecer no mural.</p>
            </div>
          </div>
          <CadastrarMuralForm />
        </div>
      </main>
    </div>
  )
}
