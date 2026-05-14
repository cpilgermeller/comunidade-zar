'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

type Notification = {
  id: string
  type: string
  title: string
  link: string
  read: boolean
  createdAt: string
  actor: { name: string }
}

export function NotificationBell({ initialUnread }: { initialUnread: number }) {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(initialUnread)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchNotifications = useCallback(async () => {
    const res = await fetch('/api/notifications')
    const data = await res.json()
    setNotifications(data.notifications ?? [])
    setUnread(data.unread ?? 0)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (open && !loaded) fetchNotifications()
  }, [open, loaded, fetchNotifications])

  // Fecha ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({}), headers: { 'Content-Type': 'application/json' } })
    setNotifications((n) => n.map((x) => ({ ...x, read: true })))
    setUnread(0)
  }

  async function handleClick(n: Notification) {
    if (!n.read) {
      await fetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ id: n.id }), headers: { 'Content-Type': 'application/json' } })
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))
      setUnread((u) => Math.max(0, u - 1))
    }
    setOpen(false)
    router.push(n.link)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl text-gray-500 hover:bg-brand-50 hover:text-brand-800 transition-colors"
        title="Notificações"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#f0eae6] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f7f2ef]">
            <span className="text-sm font-bold text-gray-900">Notificações</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-700 hover:text-brand-900 font-medium transition-colors">
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!loaded ? (
              <div className="px-4 py-8 text-center text-sm text-[#b5a9a4]">Carregando...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="text-[#e8ddd9] mx-auto mb-2" />
                <p className="text-sm text-[#b5a9a4]">Nenhuma notificação ainda.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#f7f2ef]">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3 hover:bg-[#fdf9f7] transition-colors ${!n.read ? 'bg-brand-50/40' : ''}`}
                  >
                    <div className="flex items-start gap-2.5">
                      {!n.read && <span className="w-2 h-2 bg-brand-600 rounded-full shrink-0 mt-1.5" />}
                      <div className={!n.read ? '' : 'ml-4'}>
                        <p className="text-sm text-gray-800 leading-snug">{n.title}</p>
                        <p className="text-[11px] text-[#b5a9a4] mt-0.5">{formatDate(new Date(n.createdAt))}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
