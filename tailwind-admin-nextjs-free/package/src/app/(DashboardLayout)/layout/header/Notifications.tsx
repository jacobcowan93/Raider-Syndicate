'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { type User } from 'firebase/auth'
import { watchAuthState } from '@/lib/firebaseAuth'
import * as MessagesData from './data'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu'

const Notifications = () => {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  // Mirror the same auth-watch pattern as Profile.tsx
  useEffect(() => watchAuthState(setUser), [])

  const isSignedIn  = user !== null && user !== undefined
  const unreadCount = MessagesData.Notifications.length
  // Badge only appears when authenticated AND there are real unread items
  const hasUnread   = isSignedIn && unreadCount > 0

  return (
    <div className='relative group/menu px-2'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label='Notifications'
            className='relative flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-white/[0.08] focus:outline-none'
          >
            <Icon
              icon='tabler:bell'
              height={20}
              className='text-white'
            />
            {/* Badge — only rendered when signed in with real unread notifications */}
            {hasUnread && (
              <span
                className='absolute -top-[2px] -right-[2px] h-2 w-2 rounded-full'
                style={{ background: '#dc2626', boxShadow: '0 0 6px rgba(220,38,38,0.7)' }}
              />
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align='end'
          className='w-72 p-4 rounded-sm border border-border'
        >
          <div className='flex items-center justify-between mb-3'>
            <h3 className='text-sm font-semibold text-white'>Notifications</h3>
            {hasUnread && (
              <span
                className='text-xs px-2 py-0.5 rounded font-semibold'
                style={{ background: 'rgba(220,38,38,0.15)', color: '#dc2626' }}
              >
                {unreadCount} new
              </span>
            )}
          </div>

          {!isSignedIn ? (
            <p className='py-5 text-xs text-center' style={{ color: '#8b9ab3' }}>
              Sign in to view notifications.
            </p>
          ) : unreadCount === 0 ? (
            <p className='py-5 text-xs text-center' style={{ color: '#8b9ab3' }}>
              No new notifications.
            </p>
          ) : (
            // Future: render real notification items from MessagesData.Notifications
            <p className='py-5 text-xs text-center' style={{ color: '#8b9ab3' }}>
              No new notifications.
            </p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Notifications
