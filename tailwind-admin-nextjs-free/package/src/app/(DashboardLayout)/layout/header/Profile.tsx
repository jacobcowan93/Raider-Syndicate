'use client'

import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import { watchAuthState, signOutUser } from '@/lib/firebaseAuth'
import AuthDialog from '@/app/components/arc/AuthDialog'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Profile() {
  const [user, setUser]         = useState<User | null | undefined>(undefined)
  const [authOpen, setAuthOpen] = useState(false)

  // Subscribe to Firebase auth state; undefined = loading, null = signed out
  useEffect(() => watchAuthState(setUser), [])

  // ── Loading (hydration guard — avoids flash) ─────────────────────────────
  if (user === undefined) {
    return (
      <div className="ps-4 flex items-center">
        <div className="h-8 w-20 rounded animate-pulse" style={{ background: '#1e2433' }} />
      </div>
    )
  }

  // ── Signed out ────────────────────────────────────────────────────────────
  if (user === null) {
    return (
      <div className="ps-4 flex items-center">
        <button
          onClick={() => setAuthOpen(true)}
          className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-80"
          style={{ borderColor: '#dc2626', color: '#dc2626', background: 'rgba(220,38,38,0.08)' }}
        >
          <Icon icon="solar:shield-star-linear" width={14} height={14} />
          Join the Syndicate
        </button>

        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    )
  }

  // ── Signed in ─────────────────────────────────────────────────────────────
  const displayName = user.displayName || user.email?.split('@')[0] || 'Raider'
  const initials    = displayName.slice(0, 2).toUpperCase()
  const avatar      = user.photoURL

  return (
    <div className="ps-4 flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 rounded-full border px-2 py-1 text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ borderColor: '#1e2433', background: '#13161e', color: '#e2e8f0' }}
          >
            {/* Avatar or initials */}
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={displayName}
                width={24}
                height={24}
                className="rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black"
                style={{ background: 'rgba(220,38,38,0.15)', color: '#dc2626' }}
              >
                {initials}
              </span>
            )}

            {/* Name */}
            <span style={{ color: '#f97316' }}>Raider:</span>
            <span className="max-w-[96px] truncate">{displayName}</span>

            <Icon icon="tabler:chevron-down" width={12} height={12} style={{ color: '#8b9ab3' }} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48 pb-2 pt-1 rounded-sm">
          {/* Email / phone if available */}
          {(user.email || user.phoneNumber) && (
            <>
              <div className="px-4 py-2">
                <p className="text-xs truncate" style={{ color: '#8b9ab3' }}>
                  {user.email ?? user.phoneNumber}
                </p>
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem asChild>
            <Link
              href="/user-profile"
              className="px-4 py-2 flex items-center gap-2 text-sm hover:bg-lightprimary hover:text-primary"
            >
              <Icon icon="solar:user-circle-linear" width={16} />
              My Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/player-support"
              className="px-4 py-2 flex items-center gap-2 text-sm hover:bg-lightprimary hover:text-primary"
            >
              <Icon icon="solar:shield-check-linear" width={16} />
              Player Support
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => signOutUser()}
            className="px-4 py-2 flex items-center gap-2 text-sm cursor-pointer"
            style={{ color: '#f87171' }}
          >
            <Icon icon="solar:logout-2-linear" width={16} />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
