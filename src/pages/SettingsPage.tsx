import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell, { PageContainer } from '../components/AppShell'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import {
  ArrowLeft,
  ChevronRight,
  Bell,
  CreditCard,
  Shield,
  Moon,
  Globe,
  LogOut,
} from 'lucide-react'

type RowProps = {
  label: string
  value?: string
  icon?: React.ReactNode
  destructive?: boolean
  onClick?: () => void
  toggle?: boolean
  checked?: boolean
  onToggle?: (v: boolean) => void
}

function SettingsRow({
  label,
  value,
  icon,
  destructive,
  onClick,
  toggle,
  checked,
  onToggle,
}: RowProps) {
  const content = (
    <div className="flex items-center gap-3 px-4 py-3 min-h-[44px] bg-card active:bg-fill-secondary/15 lg:hover:bg-fill-secondary/10">
      {icon && <span className="text-primary w-7 flex justify-center">{icon}</span>}
      <span className={cn('flex-1 text-[17px]', destructive ? 'text-destructive' : 'text-foreground')}>
        {label}
      </span>
      {toggle ? (
        <button
          role="switch"
          aria-checked={checked}
          onClick={() => onToggle?.(!checked)}
          className={cn(
            'w-[51px] h-[31px] rounded-full transition-colors relative flex-shrink-0',
            checked ? 'bg-success' : 'bg-fill-secondary/50'
          )}
        >
          <span
            className={cn(
              'absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow transition-transform',
              checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
            )}
          />
        </button>
      ) : (
        <>
          {value && <span className="ios-subhead">{value}</span>}
          {!destructive && <ChevronRight size={18} className="text-fill-secondary" />}
        </>
      )}
    </div>
  )

  if (onClick || toggle) {
    return (
      <button type="button" onClick={toggle ? undefined : onClick} className="w-full text-left">
        {content}
      </button>
    )
  }
  return content
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <AppShell showMobileTabBar={false}>
      <div className="h-[env(safe-area-inset-top,0px)] lg:h-0" />

      <header className="ios-blur sticky top-0 z-40 border-b border-separator/40 lg:border-none">
        <PageContainer narrow className="flex items-center py-3 max-w-3xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-0.5 text-primary active:opacity-60"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
            <span className="text-[17px]">Back</span>
          </button>
          <h1 className="flex-1 text-center ios-headline -ml-12 lg:text-left lg:ml-4 lg:ios-large-title">
            Settings
          </h1>
        </PageContainer>
      </header>

      <div className="flex-1 pb-10">
        <PageContainer narrow className="pt-4 pb-10 space-y-6 max-w-3xl">
          <div className="ios-grouped">
            <div className="flex items-center gap-3 p-4">
              <img src={user?.avatar} alt="" className="w-14 h-14 rounded-full" />
              <div>
                <p className="ios-headline">{user?.name}</p>
                <p className="ios-footnote">{user?.email}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="ios-footnote uppercase px-4 mb-2 text-label-tertiary">Account</p>
            <div className="ios-grouped">
              <SettingsRow label="Payment Methods" icon={<CreditCard size={20} />} />
              <div className="ios-separator" />
              <SettingsRow label="Subscriptions" value="Free" icon={<Globe size={20} />} />
            </div>
          </div>

          <div>
            <p className="ios-footnote uppercase px-4 mb-2 text-label-tertiary">Preferences</p>
            <div className="ios-grouped">
              <SettingsRow
                label="Notifications"
                icon={<Bell size={20} />}
                toggle
                checked={notifications}
                onToggle={setNotifications}
              />
              <div className="ios-separator" />
              <SettingsRow
                label="Dark Mode"
                icon={<Moon size={20} />}
                toggle
                checked={darkMode}
                onToggle={setDarkMode}
              />
              <div className="ios-separator" />
              <SettingsRow label="Privacy & Security" icon={<Shield size={20} />} />
            </div>
          </div>

          <div>
            <p className="ios-footnote uppercase px-4 mb-2 text-label-tertiary">Support</p>
            <div className="ios-grouped">
              <SettingsRow label="Help" />
              <div className="ios-separator" />
              <SettingsRow label="Send Feedback" />
              <div className="ios-separator" />
              <SettingsRow label="About Bot Store" value="1.0" />
            </div>
          </div>

          <div className="ios-grouped max-w-md">
            <SettingsRow
              label="Sign Out"
              icon={<LogOut size={20} />}
              destructive
              onClick={handleLogout}
            />
          </div>
        </PageContainer>
      </div>
    </AppShell>
  )
}

export default SettingsPage
