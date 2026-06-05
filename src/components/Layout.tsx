import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppShell, { PageContainer } from './AppShell'
import { cn } from '../lib/utils'
import { UserCircle } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  largeTitle?: boolean
  hideTabBar?: boolean
  rightAction?: React.ReactNode
  narrow?: boolean
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  subtitle,
  largeTitle = true,
  hideTabBar = false,
  rightAction,
  narrow = false,
}) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Format today's date
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <AppShell showMobileTabBar={!hideTabBar}>
      <div className="h-[env(safe-area-inset-top,0px)] lg:h-0" />

      <header className="glass sticky top-0 z-40 border-b border-border/40">
        <PageContainer className="py-3 lg:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Date subtitle on desktop for Today page */}
              {subtitle && (
                <p className="text-[13px] font-semibold uppercase tracking-wider text-primary mb-1 hidden lg:block animate-fade">
                  {subtitle}
                </p>
              )}
              {title && (
                <h1
                  className={cn(
                    largeTitle
                      ? 'ios-large-title lg:text-[42px]'
                      : 'ios-headline lg:text-[22px]'
                  )}
                >
                  {title}
                </h1>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 lg:hidden">
              {rightAction}
              <button
                onClick={() => navigate('/settings')}
                className="p-1 active:opacity-60 transition-opacity"
                aria-label="Account"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-9 h-9 rounded-full ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
                    <UserCircle size={24} className="text-primary" strokeWidth={1.5} />
                  </div>
                )}
              </button>
            </div>
          </div>
        </PageContainer>
      </header>

      <main className={cn('flex-1', !hideTabBar && 'pb-[84px] lg:pb-10')}>
        <PageContainer narrow={narrow}>{children}</PageContainer>
      </main>
    </AppShell>
  )
}

export default Layout
