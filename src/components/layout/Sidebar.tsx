import { Link, useLocation } from 'react-router-dom'
import { GridIcon, BarsIcon, EyeIcon, GearIcon, HelpIcon, ClipboardIcon } from '@/components/common/icons'
import { NAV_ITEMS } from '@/data/dummy'

const ICON_MAP: Record<string, React.ReactNode> = {
  grid: <GridIcon />, bars: <BarsIcon />, eye: <EyeIcon />,
  gear: <GearIcon />, help: <HelpIcon />, clipboard: <ClipboardIcon />,
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { pathname } = useLocation()
  
  function handleNavClick() {
    onClose() // Automatically close sidebar drawer on mobile after clicking link
  }

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="brand brand--plain flex justify-between items-center w-full">
        <div className="brand-text"><div className="brand-name">Atheric AI</div></div>
        <button 
          onClick={onClose} 
          className="lg:hidden text-[#8a93a6] hover:text-[#e7eaf1] text-2xl font-bold p-1 cursor-pointer"
          aria-label="Close menu"
        >
          ×
        </button>
      </div>
      <nav className="nav">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link 
              key={item.id} 
              to={item.href} 
              className={`nav-item${active ? ' active' : ''}`}
              onClick={handleNavClick}
            >
              {ICON_MAP[item.icon]}<span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="sidebar-spacer"/>
      <div className="nav-sep"/>
      <nav className="nav-footer">
        <Link 
          to="/settings" 
          className={`nav-item${pathname === '/settings' ? ' active' : ''}`}
          onClick={handleNavClick}
        >
          {ICON_MAP.gear}<span>Settings</span>
        </Link>
        <Link 
          to="/support" 
          className={`nav-item${pathname === '/support' ? ' active' : ''}`}
          onClick={handleNavClick}
        >
          {ICON_MAP.help}<span>Support</span>
        </Link>
      </nav>
    </aside>
  )
}
