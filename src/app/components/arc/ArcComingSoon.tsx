'use client'

import { Icon } from '@iconify/react'

interface ArcComingSoonProps {
  title?: string
}

export default function ArcComingSoon({ title = 'Coming Soon' }: ArcComingSoonProps) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-lg border text-center"
      style={{ background: '#0f1117', borderColor: '#1e2433', borderStyle: 'dashed' }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: 'rgba(220,38,38,0.1)' }}
      >
        <Icon icon="solar:shield-star-linear" width={28} height={28} style={{ color: '#dc2626' }} />
      </div>
      <div>
        <p className="text-base font-bold uppercase tracking-widest" style={{ color: '#e2e8f0' }}>
          {title}
        </p>
        <p className="mt-1 text-sm" style={{ color: '#8b9ab3' }}>
          This section is being built for ARC Raider Syndicate.
        </p>
      </div>
    </div>
  )
}
