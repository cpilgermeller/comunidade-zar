import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { NewFundamentoForm } from '@/components/new-fundamento-form'
import { BookOpen } from 'lucide-react'
import { db } from '@/lib/db'

export default async function NovoFundamentoPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const existingTypes = await db.fundamento.findMany({
    select: { allegationType: true },
    distinct: ['allegationType'],
    orderBy: { allegationType: 'asc' },
  })

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BookOpen size={18} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Contribuir com Fundamento</h1>
              <p className="text-sm text-gray-500">Compartilhe sua abordagem para enriquecer o banco</p>
            </div>
          </div>
          <NewFundamentoForm existingTypes={existingTypes.map((t) => t.allegationType)} />
        </div>
      </main>
    </div>
  )
}
