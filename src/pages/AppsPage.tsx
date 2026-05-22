import React, { useState } from 'react'
import Layout from '../components/Layout'
import AppListRow from '../components/ios/AppListRow'
import AppIcon from '../components/ios/AppIcon'
import { mockBots, categories } from '../data/bots'
import { Search } from 'lucide-react'
import { cn, formatPrice } from '../lib/utils'
import { Link } from 'react-router-dom'

const AppsPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('All')

  const filtered = mockBots.filter((bot) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      bot.name.toLowerCase().includes(q) ||
      bot.subtitle.toLowerCase().includes(q) ||
      bot.creator.toLowerCase().includes(q)
    const matchesCat = category === 'All' || bot.category === category
    return matchesSearch && matchesCat
  })

  return (
    <Layout title="Apps">
      <div className="mb-4 lg:mb-6">
        <div className="relative max-w-xl">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-label-tertiary"
          />
          <input
            type="search"
            placeholder="Games, Apps, Stories and More"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ios-search pl-10 w-full"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-5 lg:mb-6 lg:flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'px-4 py-1.5 rounded-full text-[15px] font-medium whitespace-nowrap transition-colors',
              category === cat
                ? 'bg-foreground text-background'
                : 'bg-fill-secondary/30 text-foreground active:opacity-70 lg:hover:bg-fill-secondary/50'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Desktop: card grid */}
      <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {filtered.map((bot) => (
          <Link
            key={bot.id}
            to={`/bot/${bot.id}`}
            className="ios-grouped flex items-center gap-4 p-4 lg:hover:shadow-md transition-shadow"
          >
            <AppIcon src={bot.image} alt={bot.name} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="ios-headline truncate">{bot.name}</p>
              <p className="ios-footnote truncate">{bot.subtitle}</p>
              <p className="ios-caption mt-1">{bot.category} · ★ {bot.rating}</p>
            </div>
            <span className={cn('ios-get-btn flex-shrink-0', bot.price === 0 && 'ios-get-btn-filled')}>
              {formatPrice(bot.price)}
            </span>
          </Link>
        ))}
      </div>

      {/* Mobile / tablet list */}
      <div className="ios-grouped mb-8 md:hidden">
        {filtered.length > 0 ? (
          filtered.map((bot, i) => (
            <div key={bot.id}>
              <AppListRow bot={bot} showChevron={false} />
              {i < filtered.length - 1 && <div className="ios-separator" />}
            </div>
          ))
        ) : (
          <p className="p-8 text-center ios-subhead">No apps found</p>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="hidden md:block p-12 text-center ios-subhead">No apps found</p>
      )}
    </Layout>
  )
}

export default AppsPage
