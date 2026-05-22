import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import {
  Sparkles,
  LayoutGrid,
  PlusCircle,
  Library,
  Search,
  UserCircle,
} from 'lucide-react'

const navItems: Array<{
  to: string
  label: string
  icon: typeof Sparkles
  match: string[]
  isCenter?: boolean
}> = [
  { to: '/marketplace', label: 'Today', icon: Sparkles, match: ['/marketplace'] },
  { to: '/apps', label: 'Apps', icon: LayoutGrid, match: ['/apps'] },
  { to: '/studio', label: 'Create', icon: PlusCircle, match: ['/studio'], isCenter: true },
  { to: '/profile', label: 'Library', icon: Library, match: ['/profile'] },
  { to: '/search', label: 'Search', icon: Search, match: ['/search'] },
]

interface AppShellProps {
  children: React.ReactNode
  showMobileTabBar?: boolean
  showDesktopSidebar?: boolean
}

export function PageContainer({
  children,
  className,
  narrow,
}: {
  children: React.ReactNode
  className?: string
  narrow?: boolean
}) {
  return (
    <div
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        narrow ? 'max-w-3xl' : 'max-w-7xl',
        className
      )}
    >
      {children}
    </div>
  )
}

export default function AppShell({
  children,
  showMobileTabBar = true,
  showDesktopSidebar = true,
}: AppShellProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop sidebar — dark slate */}
      {showDesktopSidebar && (
        <aside className="hidden lg:flex lg:flex-col lg:w-[240px] lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 bg-sidebar border-r border-white/8">
          <div className="px-5 pt-8 pb-4">
            <NavLink to="/marketplace" className="flex items-center gap-2.5 active:opacity-70">
              <div className="w-9 h-9 rounded-[22%] bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center shadow-md">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17.2 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </div>
              <span className="text-[19px] font-semibold tracking-tight text-sidebar-foreground">Bot Store</span>
            </NavLink>
          </div>

          <nav className="flex-1 px-3 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.match.some((m) => location.pathname.startsWith(m))
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors',
                    isActive
                      ? 'bg-primary/20 text-white'
                      : 'text-white/50 hover:bg-white/8 hover:text-white/80'
                  )}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/8 active:opacity-70 transition-colors text-left"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <UserCircle size={32} className="text-white/40" strokeWidth={1.5} />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium truncate text-white/80">{user?.name || 'Account'}</p>
                <p className="text-[12px] text-white/40 truncate">{user?.email}</p>
              </div>
            </button>
          </div>
        </aside>
      )}

      {/* Main column */}
      <div
        className={cn(
          'flex flex-col flex-1 w-full min-w-0',
          showDesktopSidebar && 'lg:ml-[240px]'
        )}
      >
        {children}
      </div>

      {/* Mobile tab bar */}
      {showMobileTabBar && (
        <nav className="ios-tab-bar lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <div className="flex items-end justify-around px-2 pt-1.5 pb-2 max-w-lg mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.match.some((m) => location.pathname.startsWith(m))

              if (item.isCenter) {
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="flex flex-col items-center -mt-3 active:opacity-70"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                      <Icon size={26} className="text-white" strokeWidth={2} />
                    </div>
                  </NavLink>
                )
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex flex-col items-center gap-0.5 min-w-[64px] py-1 active:opacity-60',
                    isActive ? 'text-primary' : 'text-label-tertiary'
                  )}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 1.75} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
