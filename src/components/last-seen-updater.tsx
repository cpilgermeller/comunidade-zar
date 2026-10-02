'use client'

import { useEffect } from 'react'
import { updateDiscussionsLastSeen } from '@/app/actions/threads'

export function LastSeenUpdater() {
  useEffect(() => {
    updateDiscussionsLastSeen()
  }, [])

  return null
}
