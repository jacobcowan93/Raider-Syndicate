'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'

interface DataSource {
  label: string
  href: string
  icon: string
}

interface ArcPageShellProps {
  title: string
  subtitle: string
  icon: string
  accent?: string
  dataSources?: DataSource[]
  children?: React.ReactNode
}

const DEFAULT_SOURCES: DataSource[] = [
  {
    label: 'MetaForge',
    href: 'https://metaforge.app/arc-raiders/api',
    icon: 'solar:database-linear',
  },
  {
    label: 'G2G',
    href: 'https://docs.g2g.com',
    icon: 'solar:shop-linear',
  },
]

export default function ArcPageShell({
  title,
  subtitle,
  icon,
  accent = '#dc2626',
  dataSources = DEFAULT_SOURCES,
  children,
}: ArcPageShellProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div
        className="flex items-center gap-4 rounded-lg border p-6"
        style={{ background: '#13161e', borderColor: '#1e2433' }}
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
          style={{ background: accent + '18' }}
        >
          <Icon icon={icon} width={24} height={24} style={{ color: accent }} />
        </div>
        <div>
          <h1
            className="text-lg font-black uppercase tracking-widest"
            style={{ color: '#e2e8f0' }}
          >
            {title}
          </h1>
          <p className="text-sm" style={{ color: '#8b9ab3' }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Custom content slot */}
      {children}

      {/* Empty state / data source banner */}
      <div
        className="flex flex-col items-center justify-center gap-5 rounded-lg border py-16 text-center"
        style={{ background: '#0f1117', borderColor: '#1e2433', borderStyle: 'dashed' }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: accent + '12' }}
        >
          <Icon icon={icon} width={28} height={28} style={{ color: accent + 'aa' }} />
        </div>

        <div>
          <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
            No data yet
          </p>
          <p className="mt-1 text-xs" style={{ color: '#8b9ab3' }}>
            Connect a data source to populate this section.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {dataSources.map((src) => (
            <Link
              key={src.label}
              href={src.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={{
                borderColor: accent + '40',
                color: accent,
                background: accent + '0a',
              }}
            >
              <Icon icon={src.icon} width={14} height={14} />
              Connect {src.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
