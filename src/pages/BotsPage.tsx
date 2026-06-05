import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import AppListRow from '../components/ios/AppListRow'
import AppIcon from '../components/ios/AppIcon'
import { categories } from '../data/bots'
import { Search, Sparkles, RefreshCw, Heart } from 'lucide-react'
import { cn, formatPrice } from '../lib/utils'
import { Link } from 'react-router-dom'
import { fetchBotsList, mapBackendBotToFrontendBot } from '../lib/api'
import { Bot } from '../data/bots'
import { useAuth } from '../context/AuthContext'

const BotCardSkeleton: React.FC = () => (
  <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm animate-pulse flex gap-4 items-center">
    <div className="w-16 h-16 rounded-[22%] bg-muted flex-shrink-0" />
    <div className="flex-1 min-w-0 space-y-2">
      <div className="h-3 bg-muted rounded-full w-12" />
      <div className="h-4 bg-muted rounded-full w-28" />
      <div className="h-3 bg-muted rounded-full w-36" />
      <div className="h-3 bg-muted rounded-full w-20" />
    </div>
    <div className="w-14 h-7 rounded-full bg-muted flex-shrink-0" />
  </div>
)

const BotsPage: React.FC = () => {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounce search query to prevent constant refiltering/jankiness
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 250)
    return () => clearTimeout(timer)
  }, [search])

  const loadBots = () => {
    setLoading(true)
    setError(null)
    fetchBotsList({
      category: category !== 'All' ? category : undefined,
      limit: 100,
    })
      .then((res) => {
        const mapped = res.bots.map(mapBackendBotToFrontendBot)
        setBots(mapped)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Failed to retrieve bots.')
        setLoading(false)
      })
  }

  useEffect(() => {
    loadBots()
  }, [category])

  const filtered = bots.filter((bot) => {
    const q = debouncedSearch.toLowerCase()
    const matchesSearch =
      !q ||
      bot.name.toLowerCase().includes(q) ||
      bot.subtitle.toLowerCase().includes(q) ||
      bot.creator.toLowerCase().includes(q)
    return matchesSearch
  })

  return (
    <Layout title="Explore Bots" subtitle="Find your perfect assistant">
      <div className="pb-10">
        
        {/* ── Gradient accent line ── */}
        <div className="gradient-line w-16 mb-8 lg:mb-10 animate-fade" />

        {/* ── Search & Filter Row ── */}
        <div className="flex flex-col gap-6 mb-8 animate-in" style={{ animationDelay: '50ms' }}>
          <div className="relative w-full max-w-xl group">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-label-tertiary transition-colors group-focus-within:text-primary"
            />
            <input
              type="search"
              placeholder="Search bots, productivity tools, assistants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ios-search pl-11 w-full bg-card border border-border/50 shadow-sm"
            />
          </div>

          {/* ── Categories Scrollable List ── */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 lg:flex-wrap">
            {categories.map((cat) => {
              const isSelected = category === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-4 py-2 rounded-full text-[14px] font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer active:scale-95',
                    isSelected
                      ? 'bg-sidebar text-white border-sidebar shadow-md'
                      : 'bg-card text-label-secondary border-border/50 hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {error ? (
          <div className="bg-card border border-border/30 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-sm my-10 animate-fade">
            <RefreshCw size={32} className="mx-auto mb-3 text-destructive animate-spin-slow" />
            <p className="ios-subhead font-bold text-foreground">Error loading bots</p>
            <p className="ios-footnote mt-1 mb-4 text-label-tertiary">{error}</p>
            <button
              onClick={loadBots}
              className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-md"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <BotCardSkeleton key={n} />
            ))}
          </div>
        ) : (
          <>
            {/* ── Desktop: Grid Layout ── */}
            <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {filtered.map((bot, i) => {
                const isLiked = (user && user.likedBots?.includes(bot.id)) || bot.isLiked
                return (
                  <Link
                    key={bot.id}
                    to={`/bot/${bot.id}`}
                    className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm card-hover flex gap-4 items-center group animate-in"
                    style={{ animationDelay: `${100 + i * 40}ms` }}
                  >
                    <div className="transition-transform duration-300 group-hover:scale-105">
                      <AppIcon src={bot.iconImage ?? bot.image} alt={bot.name} size="lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                          {bot.category}
                        </span>
                        {bot.editorsChoice && (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        )}
                      </div>
                      <p className="ios-headline truncate group-hover:text-primary transition-colors duration-200">
                        {bot.name}
                      </p>
                      <p className="ios-footnote truncate">{bot.subtitle}</p>
                      <p className="ios-caption mt-1.5 flex items-center gap-1">
                        <span className="text-amber-400 font-bold">★</span>
                        <span className="font-semibold text-foreground">
                          {bot.rating > 0 ? bot.rating.toFixed(1) : 'New'}
                        </span>
                        <span className="text-label-tertiary">·</span>
                        <Heart size={10} className={cn(isLiked ? "text-destructive fill-destructive" : "text-label-tertiary")} />
                        <span className="font-semibold text-foreground">{(bot.likeCount ?? 0).toLocaleString()}</span>
                        <span className="text-label-tertiary">· {bot.creator}</span>
                      </p>
                    </div>
                    <span className={cn('ios-get-btn flex-shrink-0 self-center', bot.price === 0 && 'ios-get-btn-filled')}>
                      {formatPrice(bot.price)}
                    </span>
                  </Link>
                )
              })}
            </div>

            {/* ── Mobile / Tablet Layout ── */}
            <div className="ios-grouped mb-8 md:hidden animate-in" style={{ animationDelay: '150ms' }}>
              {filtered.length > 0 ? (
                filtered.map((bot, i) => (
                  <div key={bot.id}>
                    <AppListRow bot={bot} showChevron={false} />
                    {i < filtered.length - 1 && <div className="ios-separator" />}
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Sparkles size={32} className="mx-auto mb-3 text-label-tertiary opacity-60" />
                  <p className="ios-subhead font-semibold text-foreground">No bots found</p>
                  <p className="ios-caption mt-1">Try resetting your search filters.</p>
                </div>
              )}
            </div>

            {/* ── Empty State Desktop ── */}
            {filtered.length === 0 && (
              <div className="hidden md:flex flex-col items-center justify-center p-16 bg-card border border-border/30 rounded-2xl text-center max-w-xl mx-auto shadow-sm animate-fade">
                <Sparkles size={40} className="text-primary mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-foreground mb-1">No bots match your criteria</h3>
                <p className="text-label-tertiary text-[14px]">
                  Try typing a different keyword or choosing another category filter.
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </Layout>
  )
}

export default BotsPage
