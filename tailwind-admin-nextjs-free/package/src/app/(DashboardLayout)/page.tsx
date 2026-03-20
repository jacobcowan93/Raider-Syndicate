'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'

const RED = '#dc2626'

const sections = [
  {
    name: 'Blueprints',
    href: '/blueprints',
    icon: 'solar:document-text-linear',
    description: 'Browse craftable items, workbench recipes, and gear schematics.',
  },
  {
    name: 'Marketplace',
    href: '/marketplace',
    icon: 'solar:shop-linear',
    description: 'Buy and sell ARC Raiders items with other players via G2G.',
  },
  {
    name: 'Maps',
    href: '/maps',
    icon: 'solar:map-linear',
    description: 'Live event schedules and conditions across all mission maps.',
  },
  {
    name: 'Skill Trees',
    href: '/skill-trees',
    icon: 'solar:structure-linear',
    description: 'Browse augments and study ARC enemy units to plan your loadout.',
  },
  {
    name: 'Guides',
    href: '/guides',
    icon: 'solar:book-open-linear',
    description: 'Community walkthroughs, quest guides, and MetaForge resources.',
  },
  {
    name: 'Profile',
    href: '/user-profile',
    icon: 'solar:user-circle-linear',
    description: 'Your syndicate identity, settings, and linked accounts.',
  },
]

const stats = [
  { value: '—', label: 'Blueprints', icon: 'solar:document-text-linear' },
  { value: '—', label: 'Maps', icon: 'solar:map-linear' },
  { value: '—', label: 'Guides', icon: 'solar:book-open-linear' },
  { value: '—', label: 'Raiders', icon: 'solar:users-group-rounded-linear' },
]

export default function HomePage() {
  return (
    /* Escape the container's px-6 pt-[30px] so the hero is full-bleed */
    <div className="-mx-6 -mt-[30px]">

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-60px)] flex flex-col items-center justify-center overflow-hidden bg-[#0b0d11]">

        {/* Background video — muted, auto-play, looping, always silent */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          style={{ animation: 'arcHeroZoom 14s ease-in-out infinite' }}
          src="/images/backgrounds/ARC_Home.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Gradient overlay — deeper at bottom for text readability */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.55) 100%)' }}
        />

        {/* ARC red radial glow — top-left */}
        <div
          className="absolute top-1/4 -left-16 w-[520px] h-[520px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.18) 0%, transparent 70%)' }}
        />
        {/* Gold radial glow — bottom-right */}
        <div
          className="absolute bottom-1/4 -right-16 w-[420px] h-[420px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.14) 0%, transparent 70%)' }}
        />

        {/* Subtle grid overlay (Spectral texture feel) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Top rule */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dc2626]/40 to-transparent" />

        {/* Hero content — with local backdrop for readability */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 py-20">
          {/* Local radial backdrop so text reads over any video frame */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 90% 90% at 50% 50%, rgba(0,0,0,0.5) 0%, transparent 100%)' }}
          />

          {/* Eyebrow */}
          <span
            className="relative mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ borderColor: 'rgba(34,139,34,0.5)', color: '#228B22', background: 'rgba(34,139,34,0.1)' }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#228B22' }} />
            Welcome, Raider
          </span>

          {/* Main title */}
          <h1
            className="relative font-black uppercase leading-none select-none"
            style={{
              fontSize: 'clamp(3rem, 10vw, 7rem)',
              letterSpacing: '0.12em',
              color: '#ffffff',
              textShadow: `0 0 40px rgba(255,255,255,0.2), 0 4px 32px rgba(0,0,0,0.95)`,
            }}
          >
            ARC
          </h1>
          <h2
            className="relative font-black uppercase mb-6 select-none"
            style={{
              fontSize: 'clamp(1.1rem, 3.2vw, 2rem)',
              letterSpacing: '0.35em',
              color: RED,
              textShadow: `0 0 28px rgba(220,38,38,0.6), 0 2px 16px rgba(0,0,0,0.95)`,
            }}
          >
            Raider Syndicate
          </h2>

          {/* Divider */}
          <div className="relative flex items-center gap-3 mb-8">
            <div className="h-px w-16" style={{ background: `linear-gradient(to right, transparent, ${RED}60)` }} />
            <Icon icon="solar:shield-star-linear" width={20} height={20} style={{ color: RED }} />
            <div className="h-px w-16" style={{ background: `linear-gradient(to left, transparent, ${RED}60)` }} />
          </div>

          <p className="relative max-w-lg text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)' }}>
            The ARC Raiders one-stop companion: connect your profile, track blueprints, queue up guides, stay on top of weekly trials, roam interactive maps, craft and share skill trees, and study deep item breakdowns.
          </p>
        </div>

        {/* Scroll nudge */}
        <div className="absolute bottom-8 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#94a3b8]">Explore</span>
          <div className="w-px h-10 bg-gradient-to-b from-[#94a3b8] to-transparent" />
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────── */}
      <div
        className="border-y"
        style={{ background: '#0f1117', borderColor: '#1e2433' }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-[#1e2433]">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center justify-center gap-1 py-7 px-4">
              <Icon icon={s.icon} width={22} height={22} style={{ color: '#dc2626' }} />
              <span className="text-2xl font-black text-white tracking-tight">{s.value}</span>
              <span className="text-xs uppercase tracking-widest text-[#8b9ab3]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION CARDS (Spectral spotlight feel) ─────────────────── */}
      <div className="px-6 py-16" style={{ background: '#0b0d11' }}>
        <div className="max-w-5xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: '#dc2626' }}>
              Syndicate Modules
            </p>
            <h3 className="text-2xl font-black uppercase tracking-wide text-white">
              Everything You Need
            </h3>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => (
              <Link
                key={section.name}
                href={section.href}
                className="group relative flex flex-col gap-3 rounded-lg p-6 border transition-all duration-250"
                style={{ background: '#0f1117', borderColor: 'rgba(220,38,38,0.18)' }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.borderColor = 'rgba(220,38,38,0.5)'
                  el.style.boxShadow = '0 0 28px rgba(220,38,38,0.12)'
                  el.style.background = '#13161e'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.borderColor = 'rgba(220,38,38,0.18)'
                  el.style.boxShadow = 'none'
                  el.style.background = '#0f1117'
                }}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded flex items-center justify-center"
                  style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}
                >
                  <Icon icon={section.icon} width={20} height={20} style={{ color: RED }} />
                </div>

                {/* Text */}
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wide text-sm mb-1">
                    {section.name}
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: '#8b9ab3' }}>
                    {section.description}
                  </p>
                </div>

                {/* Arrow */}
                <div
                  className="mt-auto pt-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(220,38,38,0.6)' }}
                >
                  Enter
                  <Icon icon="solar:arrow-right-linear" width={14} height={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM RULE ─────────────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#dc2626]/30 to-transparent" />
    </div>
  )
}
