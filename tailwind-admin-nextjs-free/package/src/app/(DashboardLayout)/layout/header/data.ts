// Profile dropdown items
interface ProfileType {
  title: string
  img: string
  subtitle: string
  icon: string
  url: string
}

const profileDD: ProfileType[] = [
  {
    img: '/images/svgs/icon-account.svg',
    title: 'My Profile',
    subtitle: 'Account settings',
    icon: 'tabler:user',
    url: '/user-profile',
  },
  {
    img: '/images/svgs/icon-tasks.svg',
    title: 'Player Support',
    subtitle: 'Help & Legal',
    icon: 'tabler:shield-check',
    url: '/player-support',
  },
]

// Notifications — populated at runtime; empty until real data is wired
const Notifications: {
  avatar: string
  title: string
  subtitle: string
}[] = []

export { Notifications, profileDD }
