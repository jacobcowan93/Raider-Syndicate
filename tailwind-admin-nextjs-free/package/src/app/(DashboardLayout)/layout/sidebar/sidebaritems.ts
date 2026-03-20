import { uniqueId } from 'lodash'

export interface ChildItem {
  id?: number | string
  name?: string
  icon?: string
  children?: ChildItem[]
  item?: unknown
  url?: string
  color?: string
  disabled?: boolean
  subtitle?: string
  badge?: boolean
  badgeType?: string
  isPro?: boolean
}

export interface MenuItem {
  heading?: string
  name?: string
  icon?: string
  id?: number | string
  to?: string
  items?: MenuItem[]
  children?: ChildItem[]
  url?: string
  disabled?: boolean
  subtitle?: string
  badgeType?: string
  badge?: boolean
  isPro?: boolean
}

const SidebarContent: MenuItem[] = [
  {
    children: [
      { name: 'Home',                 icon: 'solar:home-2-linear',         id: uniqueId(), url: '/'              },
      { name: 'Blueprints',           icon: 'solar:document-text-linear',  id: uniqueId(), url: '/blueprints'    },
      { name: 'Marketplace',          icon: 'solar:shop-linear',           id: uniqueId(), url: '/marketplace'   },
      { name: 'ARC Items',            icon: 'solar:box-linear',            id: uniqueId(), url: '/arc-items'     },
      { name: 'Maps',                 icon: 'solar:map-linear',            id: uniqueId(), url: '/maps'          },
      { name: 'Skill Trees',          icon: 'solar:structure-linear',      id: uniqueId(), url: '/skill-trees'   },
      { name: 'Trials / Events',      icon: 'solar:calendar-mark-linear',  id: uniqueId(), url: '/trials-events' },
      { name: 'Guides',               icon: 'solar:book-open-linear',      id: uniqueId(), url: '/guides'        },
      { name: 'Profile',              icon: 'solar:user-circle-linear',    id: uniqueId(), url: '/user-profile'  },
      { name: 'Player Support',       icon: 'solar:shield-check-linear',   id: uniqueId(), url: '/player-support'},
    ],
  },
]

export default SidebarContent
