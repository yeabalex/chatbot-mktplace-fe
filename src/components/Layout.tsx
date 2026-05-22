import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppShell, { PageContainer } from './AppShell'
import { cn } from '../lib/utils'
import { UserCircle } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  largeTitle?: boolean
  hideTabBar?: boolean
  rightAction?: React.ReactNode
  narrow?: boolean
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  largeTitle = true,
  hideTabBar = false,
  rightAction,
  narrow = false,
}) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <AppShell showMobileTabBar={!hideTabBar}>
      <div className="h-[env(safe-area-inset-top,0px)] lg:h-0" />

      <header className="ios-blur sticky top-0 z-40 border-b border-border/60 lg:border-none shadow-sm lg:shadow-none">
        <PageContainer className="py-3 lg:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h1
                  className={cn(
                    largeTitle
                      ? 'ios-large-title lg:text-[40px]'
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
                className="p-1 active:opacity-60"
                aria-label="Account"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full ring-2 ring-border"
                  />
                ) : (
                  <UserCircle size={32} className="text-primary" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </PageContainer>
      </header>

      <main className={cn('flex-1', !hideTabBar && 'pb-[84px] lg:pb-8')}>
        <PageContainer narrow={narrow}>{children}</PageContainer>
      </main>
    </AppShell>
  )
}

export default Layout
