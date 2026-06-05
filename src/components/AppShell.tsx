import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import BrandLogo from './brand/BrandLogo'
import {
  Sparkles,
  LayoutGrid,
  PlusCircle,
  Library,
  Search,
  UserCircle,
  Settings,
  TrendingUp,
} from 'lucide-react'

const navItems: Array<{
  to: string
  label: string
  icon: typeof Sparkles
  match: string[]
  isCenter?: boolean
}> = [
  { to: '/marketplace', label: 'Today', icon: Sparkles, match: ['/marketplace'] },
  { to: '/my-bots', label: 'My Bots', icon: LayoutGrid, match: ['/my-bots'] },
  { to: '/studio', label: 'Create', icon: PlusCircle, match: ['/studio'], isCenter: true },
  { to: '/profile', label: 'Library', icon: Library, match: ['/profile'] },
  { to: '/purchases-analytics', label: 'Analytics', icon: TrendingUp, match: ['/purchases-analytics'] },
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
      {/* ── Desktop Sidebar ── */}
      {showDesktopSidebar && (
        <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 bg-sidebar overflow-hidden">
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

          {/* Brand */}
          <div className="relative px-6 pt-8 pb-6">
            <NavLink to="/marketplace" className="flex items-center gap-3 group">
              <div className="transition-transform duration-300 group-hover:scale-110">
                <BrandLogo size="w-10 h-10" iconSize="w-5 h-5" />
              </div>
              <div>
                <span className="text-[20px] font-bold tracking-tight text-white block leading-tight">
                  Bot Store
                </span>
                <span className="text-[11px] font-medium text-white/30 tracking-wider uppercase">
                  Marketplace
                </span>
              </div>
            </NavLink>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-white/8" />

          {/* Navigation */}
          <nav className="relative flex-1 px-4 pt-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.match.some((m) => location.pathname.startsWith(m))
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'sidebar-nav-item',
                    isActive ? 'sidebar-nav-item--active' : 'sidebar-nav-item--inactive'
                  )}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-fade" />
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* User section */}
          <div className="relative p-4 mt-auto">
            <div className="h-px bg-white/8 mb-4" />
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/8 transition-all duration-200 text-left group"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-9 h-9 rounded-full ring-2 ring-white/10 group-hover:ring-white/20 transition-all"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center">
                  <UserCircle size={22} className="text-white/70" strokeWidth={1.5} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold truncate text-white/85 group-hover:text-white transition-colors">
                  {user?.name || 'Account'}
                </p>
                <p className="text-[11px] text-white/35 truncate">{user?.email}</p>
              </div>
              <Settings
                size={16}
                className="text-white/25 group-hover:text-white/50 transition-colors flex-shrink-0"
              />
            </button>
          </div>
        </aside>
      )}

      {/* ── Main Column ── */}
      <div
        className={cn(
          'flex flex-col flex-1 w-full min-w-0',
          showDesktopSidebar && 'lg:ml-[260px]'
        )}
      >
        {children}
      </div>

      {/* ── Mobile Tab Bar ── */}
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
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 transition-transform duration-200 active:scale-90">
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
                    'flex flex-col items-center gap-0.5 min-w-[64px] py-1 transition-all duration-200',
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
