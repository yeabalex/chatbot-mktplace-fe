import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import AppIcon from '../components/ios/AppIcon'
import { useAuth } from '../context/AuthContext'
import { mockBots } from '../data/bots'
import { cn } from '../lib/utils'
import { ChevronRight, Cloud } from 'lucide-react'

const purchasedIds = ['3', '6', '1']
const likedIds = ['5', '2']

const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const [segment, setSegment] = useState<'all' | 'purchased' | 'wishlist'>('all')

  const purchased = mockBots.filter((b) => purchasedIds.includes(b.id))
  const wishlist = mockBots.filter((b) => likedIds.includes(b.id))
  const all = [...purchased, ...wishlist.filter((b) => !purchasedIds.includes(b.id))]

  const list =
    segment === 'purchased' ? purchased : segment === 'wishlist' ? wishlist : all

  return (
    <Layout title="Library">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 lg:items-start">
        <div>
          <div className="mb-6">
            <Link
              to="/settings"
              className="ios-grouped flex items-center gap-3 p-4 active:opacity-80 lg:hover:shadow-md transition-shadow"
            >
              <img
                src={user?.avatar}
                alt=""
                className="w-[60px] h-[60px] rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="ios-headline">{user?.name || 'Apple ID'}</p>
                <p className="ios-footnote truncate">{user?.email}</p>
              </div>
              <ChevronRight size={20} className="text-fill-secondary flex-shrink-0" />
            </Link>
          </div>

          <div className="flex p-1 bg-fill-secondary/30 rounded-[10px] mb-5 max-w-md">
            {(['all', 'purchased', 'wishlist'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSegment(s)}
                className={cn(
                  'flex-1 py-1.5 rounded-[8px] text-[13px] font-semibold capitalize transition-all',
                  segment === s
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-label-secondary'
                )}
              >
                {s === 'all' ? 'All' : s === 'purchased' ? 'Purchased' : 'Wishlist'}
              </button>
            ))}
          </div>

          {list.length > 0 ? (
            <div className="ios-grouped mb-8 lg:grid lg:grid-cols-1">
              {list.map((bot, i) => (
                <div key={bot.id}>
                  <Link to={`/bot/${bot.id}`} className="ios-list-row">
                    <AppIcon src={bot.image} alt={bot.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="ios-headline truncate">{bot.name}</p>
                      <p className="ios-footnote">{bot.creator}</p>
                    </div>
                    <span className="ios-get-btn text-[13px] min-w-[60px] h-[26px]">OPEN</span>
                  </Link>
                  {i < list.length - 1 && <div className="ios-separator" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 lg:py-24">
              <p className="ios-title-3 mb-2">Your Library is Empty</p>
              <p className="ios-subhead mb-6">Browse the App Store to find bots you love.</p>
              <Link to="/apps" className="text-primary text-[17px] font-medium">
                Go to Apps
              </Link>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary to-[#5ac8fa] text-white lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-2">
              <Cloud size={20} />
              <span className="font-semibold text-[15px]">Bot Cloud</span>
            </div>
            <p className="text-[13px] text-white/85 leading-relaxed">
              All your purchased bots sync across iPhone, iPad, and Mac.
            </p>
          </div>

          <div>
            <h2 className="ios-title-3 mb-3">Available Updates</h2>
            <div className="ios-grouped">
              {purchased.slice(0, 2).map((bot, i) => (
                <div key={bot.id}>
                  <div className="flex items-center gap-3 p-4">
                    <AppIcon src={bot.image} alt={bot.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="ios-headline text-[15px] truncate">{bot.name}</p>
                      <p className="ios-footnote">Version 2.1.0</p>
                    </div>
                    <button className="ios-get-btn ios-get-btn-filled text-[13px] min-w-[64px] h-[26px] flex-shrink-0">
                      UPDATE
                    </button>
                  </div>
                  {i < 1 && <div className="ios-separator" />}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  )
}

export default ProfilePage
