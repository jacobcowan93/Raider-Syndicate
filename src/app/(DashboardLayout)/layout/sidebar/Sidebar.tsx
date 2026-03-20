import Link from 'next/link'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import SidebarContent from './sidebaritems'
import SimpleBar from 'simplebar-react'
import { Icon } from '@iconify/react'
import FullLogo from '../shared/logo/FullLogo'
import {
  AMLogo,
  AMSidebar,
  AMSubmenu,
} from 'tailwind-sidebar'
import 'tailwind-sidebar/styles.css'

interface SidebarItemType {
  heading?: string
  id?: number | string
  name?: string
  title?: string
  icon?: string
  url?: string
  children?: SidebarItemType[]
  disabled?: boolean
  isPro?: boolean
}

const renderSidebarItems = (
  items: SidebarItemType[],
  currentPath: string,
  onClose?: () => void,
  isSubItem: boolean = false
) => {
  return items.map((item, index) => {
    const isSelected = currentPath === item?.url
    const IconComp = item.icon || null

    const iconElement = IconComp ? (
      <Icon icon={IconComp} height={21} width={21} />
    ) : (
      <Icon icon={'ri:checkbox-blank-circle-line'} height={9} width={9} />
    )

    // Heading
    if (item.heading) {
      return (
        <div className='mt-7 mb-2 px-1' key={item.heading}>
          <span className='text-[10px] font-bold uppercase tracking-[0.14em]' style={{ color: 'rgba(255,255,255,0.32)' }}>
            {item.heading}
          </span>
        </div>
      )
    }

    // Submenu
    if (item.children?.length) {
      return (
        <AMSubmenu
          key={item.id}
          icon={iconElement}
          title={item.name}
          ClassName='mt-0.5 text-sidebar-foreground dark:text-sidebar-foreground'>
          {renderSidebarItems(item.children, currentPath, onClose, true)}
        </AMSubmenu>
      )
    }

    // Regular menu item
    const linkTarget = item.url?.startsWith('https') ? '_blank' : '_self'

    return (
      <div onClick={onClose} key={index}>
        <Link
          href={item.url || '#'}
          target={linkTarget}
          className='mt-1 flex items-center gap-2.5 px-3 py-2 rounded text-sm font-semibold border transition-all duration-200'
          style={isSelected ? {
            background: 'rgba(220,38,38,0.18)',
            borderColor: 'rgba(220,38,38,0.55)',
            color: '#ffffff',
            boxShadow: '0 0 12px rgba(220,38,38,0.2)',
          } : {
            background: 'rgba(220,38,38,0.06)',
            borderColor: 'rgba(220,38,38,0.22)',
            color: '#dc2626',
          }}
          onMouseEnter={isSelected ? undefined : e => {
            const el = e.currentTarget
            el.style.background = 'rgba(220,38,38,0.14)'
            el.style.borderColor = 'rgba(220,38,38,0.45)'
            el.style.color = '#ffffff'
          }}
          onMouseLeave={isSelected ? undefined : e => {
            const el = e.currentTarget
            el.style.background = 'rgba(220,38,38,0.06)'
            el.style.borderColor = 'rgba(220,38,38,0.22)'
            el.style.color = '#dc2626'
          }}
        >
          <span className='shrink-0'>{iconElement}</span>
          <span className='truncate flex-1'>{item.title || item.name}</span>
        </Link>
      </div>
    )
  })
}

const SidebarLayout = ({ onClose }: { onClose?: () => void }) => {
  const pathname = usePathname()
  const { theme } = useTheme()

  // Only allow "light" or "dark" for AMSidebar
  const sidebarMode = theme === 'light' || theme === 'dark' ? theme : undefined

  return (
    <AMSidebar
      collapsible='none'
      animation={true}
      showProfile={false}
      width={'270px'}
      showTrigger={false}
      mode={sidebarMode}
      className='sticky top-0 border-r border-border bg-sidebar dark:bg-sidebar z-10 h-screen'>

      {/* Sidebar items */}
      <SimpleBar className='h-screen'>
        <div className='px-4 pt-2 pb-6'>
          {SidebarContent.map((section, index) => (
            <div key={index}>
              {renderSidebarItems(
                [
                  ...(section.heading ? [{ heading: section.heading }] : []),
                  ...(section.children || []),
                ],
                pathname,
                onClose
              )}
            </div>
          ))}

        </div>
      </SimpleBar>
    </AMSidebar>
  )
}

export default SidebarLayout
