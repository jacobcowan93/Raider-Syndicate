'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react'
import Profile from './Profile'
import Notifications from './Notifications'
import SidebarLayout from '../sidebar/Sidebar'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

const NAV_LINKS = [
  { name: 'Home',           href: '/'              },
  { name: 'Blueprints',     href: '/blueprints'    },
  { name: 'Marketplace',    href: '/marketplace'   },
  { name: 'ARC Items',      href: '/arc-items'     },
  { name: 'Maps',           href: '/maps'          },
  { name: 'Skill Trees',    href: '/skill-trees'   },
  { name: 'Trials / Events',href: '/trials-events' },
  { name: 'Guides',         href: '/guides'        },
]

export default function Header() {
  const pathname  = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header
        className='w-full shrink-0 z-20'
        style={{
          background: '#0b0d11',
          borderBottom: '1px solid rgba(220,38,38,0.28)',
          boxShadow: '0 2px 24px rgba(0,0,0,0.5)',
        }}
      >
        <nav className='flex items-center gap-4 px-6 h-[60px] max-w-[1600px] mx-auto w-full'>

          {/* ── Logo ─────────────────────────────────────────────── */}
          <Link
            href='/'
            className='flex-shrink-0 flex items-center select-none mr-4'
            style={{ gap: 10 }}
          >
            {/* Left — ARC */}
            <span
              className='font-black uppercase'
              style={{ fontSize: 22, letterSpacing: '0.15em', color: '#ffffff', lineHeight: 1 }}
            >
              ARC
            </span>

            {/* Right — RAIDER / SYNDICATE stacked */}
            <div className='flex flex-col' style={{ gap: 2 }}>
              <span
                className='font-black uppercase'
                style={{ fontSize: 11, letterSpacing: '0.22em', color: '#dc2626', lineHeight: 1 }}
              >
                Raider
              </span>
              <span
                className='font-black uppercase'
                style={{ fontSize: 11, letterSpacing: '0.22em', color: '#dc2626', lineHeight: 1 }}
              >
                Syndicate
              </span>
            </div>
          </Link>

          {/* ── Desktop nav links ─────────────────────────────────── */}
          <div className='hidden xl:flex items-center gap-0.5 flex-1'>
            {NAV_LINKS.map(link => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className='relative px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors duration-150 group/nav'
                  style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'
                  }}
                >
                  {link.name}
                  {/* Active underline */}
                  {isActive && (
                    <span
                      className='absolute bottom-0 left-2 right-2 h-[2px] rounded-full'
                      style={{
                        background: '#dc2626',
                        boxShadow: '0 0 8px rgba(220,38,38,0.7)',
                      }}
                    />
                  )}
                  {/* Hover underline */}
                  {!isActive && (
                    <span
                      className='absolute bottom-0 left-2 right-2 h-[2px] rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150'
                      style={{ background: 'rgba(220,38,38,0.4)' }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* ── Right actions ─────────────────────────────────────── */}
          <div className='ml-auto flex items-center gap-1'>
            <Notifications />
            <Profile />
          </div>

          {/* ── Mobile hamburger ──────────────────────────────────── */}
          <button
            onClick={() => setIsOpen(true)}
            className='xl:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors'
            aria-label='Open menu'
          >
            <Icon icon='tabler:menu-2' height={22} width={22} className='text-white' />
          </button>

        </nav>
      </header>

      {/* Mobile drawer — keeps sidebar nav for small screens */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side='left' className='w-64 p-0'>
          <VisuallyHidden>
            <SheetTitle>Navigation</SheetTitle>
          </VisuallyHidden>
          <SidebarLayout onClose={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
