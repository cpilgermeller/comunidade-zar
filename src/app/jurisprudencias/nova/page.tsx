import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { NewJurisprudenceForm } from '@/components/new-jurisprudence-form'
import { Scale } from 'lucide-react'
import { db } from '@/lib/db'

export default async function NovaJurisprudenciaPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const existingSubjects = await db.jurisprudence.findMany({
    select: { subject: true },
    distinct: ['subject'],
    orderBy: { subject: 'asc' },
  })

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Scale size={18} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Adicionar Jurisprudência</h1>
              <p className="text-sm text-gray-500">Registre uma decisão para o banco coletivo</p>
            </div>
          </div>
          <NewJurisprudenceForm existingSubjects={existingSubjects.map((s) => s.subject)} />
        </div>
      </main>
    </div>
  )
}
