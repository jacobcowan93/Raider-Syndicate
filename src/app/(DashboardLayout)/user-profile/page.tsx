import UserProfile from '@/app/components/user-profile'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Raider Profile — ARC Raider Syndicate',
}

export default function UserProfilePage() {
  return <UserProfile />
}
