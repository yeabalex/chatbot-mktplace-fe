import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import FeaturedCard from '../components/ios/FeaturedCard'
import AppGridItem from '../components/ios/AppGridItem'
import AppListRow from '../components/ios/AppListRow'
import SectionHeader from '../components/ios/SectionHeader'
import { fetchBotsList, mapBackendBotToFrontendBot } from '../lib/api'
import { Bot } from '../data/bots'
import { Sparkles, RefreshCw } from 'lucide-react'

const FeaturedCardSkeleton: React.FC = () => (
  <div className="ios-hero-card bg-card border border-border/30 animate-pulse flex flex-col justify-end p-5">
    <div className="h-3 bg-muted rounded-full w-20 mb-2" />
    <div className="h-5 bg-muted rounded-full w-40 mb-3" />
    <div className="h-3 bg-muted rounded-full w-28" />
  </div>
)

const AppGridItemSkeleton: React.FC = () => (
  <div className="w-[120px] sm:w-[130px] flex-shrink-0 animate-pulse flex flex-col items-center text-center">
    <div className="app-icon w-14 h-14 sm:w-16 sm:h-16 bg-muted mb-2.5 rounded-[22%]" />
    <div className="h-3 bg-muted rounded-full w-16 mb-1.5" />
    <div className="h-2.5 bg-muted rounded-full w-12" />
  </div>
)

const AppListRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-3.5 px-4 py-3.5 animate-pulse">
    <div className="w-12 h-12 rounded-[22%] bg-muted flex-shrink-0" />
    <div className="flex-1 min-w-0 space-y-2">
      <div className="h-3.5 bg-muted rounded-full w-24" />
      <div className="h-3 bg-muted rounded-full w-32" />
    </div>
    <div className="w-16 h-7 rounded-full bg-muted flex-shrink-0" />
  </div>
)

const NewAppSkeleton: React.FC = () => (
  <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border/30 animate-pulse flex flex-col">
    <div className="w-14 h-14 sm:w-16 sm:h-16 mb-3 rounded-[22%] bg-muted" />
    <div className="h-3.5 bg-muted rounded-full w-20 mb-2" />
    <div className="h-2.5 bg-muted rounded-full w-16 mb-3.5" />
    <div className="h-7 bg-muted rounded-full w-14 mt-auto" />
  </div>
)

const MarketplacePage: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadBots = () => {
    setLoading(true)
    setError(null)
    fetchBotsList({ limit: 100 })
      .then((res) => {
        const mapped = res.bots.map(mapBackendBotToFrontendBot)
        setBots(mapped)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Failed to fetch bots from server.')
        setLoading(false)
      })
  }

  useEffect(() => {
    loadBots()
  }, [])

  const featured = bots.filter((b) => b.featured)
  const topCharts = [...bots].sort((a, b) => b.downloads - a.downloads)
  const editorsChoice = bots.filter((b) => b.editorsChoice)
  const newApps = [...bots].reverse()

  // Format today's date
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Layout title="Today" subtitle={dateStr}>
      <div className="pb-6 lg:pb-12">

        {/* ── Gradient accent line ── */}
        <div className="gradient-line w-16 mb-8 lg:mb-10 animate-fade" />

        {error ? (
          <div className="bg-card border border-border/30 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-sm my-10 animate-fade">
            <RefreshCw size={32} className="mx-auto mb-3 text-destructive animate-spin-slow" />
            <p className="ios-subhead font-bold text-foreground">Could not connect to API</p>
            <p className="ios-footnote mt-1 mb-4 text-label-tertiary">{error}</p>
            <button
              onClick={loadBots}
              className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-md"
            >
              Retry Connection
            </button>
          </div>
        ) : loading ? (
          <div>
            {/* Skeletons */}
            <section className="mb-12 lg:mb-14">
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5">
                {[1, 2, 3].map((n) => (
                  <FeaturedCardSkeleton key={n} />
                ))}
              </div>
            </section>

            <section className="mb-12 lg:mb-14">
              <SectionHeader title="Popular Bots" href="/bots" className="!px-0 mb-5" />
              <div className="flex gap-5 sm:gap-7 overflow-x-auto hide-scrollbar pb-2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <AppGridItemSkeleton key={n} />
                ))}
              </div>
            </section>

            <section className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-10 mb-12 lg:mb-14">
              <div>
                <SectionHeader title="Editor's Choice" href="/bots" className="!px-0" />
                <div className="ios-grouped">
                  {[1, 2, 3].map((n, i) => (
                    <div key={n}>
                      <AppListRowSkeleton />
                      {i < 2 && <div className="ios-separator" />}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <SectionHeader title="Top Charts" href="/bots" linkLabel="Charts" className="!px-0" />
                <div className="ios-grouped">
                  {[1, 2, 3, 4, 5].map((n, i) => (
                    <div key={n}>
                      <AppListRowSkeleton />
                      {i < 4 && <div className="ios-separator" />}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        ) : (
          <>
            {/* ── Featured Cards ── */}
            {featured.length > 0 && (
              <section className="mb-12 lg:mb-14">
                <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-3 lg:overflow-visible lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5 lg:snap-none">
                  {featured.map((bot, i) => (
                    <FeaturedCard key={bot.id} bot={bot} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Must-Have Bots ── */}
            <section className="mb-12 lg:mb-14 animate-in" style={{ animationDelay: '200ms' }}>
              <SectionHeader
                title="Must-Have Bots"
                badge="Popular"
                href="/bots"
                className="!px-0 mb-5"
              />
              <div className="flex gap-5 sm:gap-7 overflow-x-auto hide-scrollbar pb-2 lg:overflow-visible lg:flex-wrap lg:justify-start">
                {bots.slice(0, 8).map((bot, i) => (
                  <AppGridItem key={bot.id} bot={bot} index={i} />
                ))}
              </div>
            </section>

            {/* ── Editor's Choice + Top Charts ── */}
            <section className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-10 mb-12 lg:mb-14">
              {editorsChoice.length > 0 && (
                <div className="mb-10 lg:mb-0 animate-in" style={{ animationDelay: '300ms' }}>
                  <SectionHeader title="Editor's Choice" href="/bots" className="!px-0" />
                  <div className="ios-grouped">
                    {editorsChoice.slice(0, 4).map((bot, i) => (
                      <div key={bot.id}>
                        <AppListRow bot={bot} showChevron={false} />
                        {i < Math.min(editorsChoice.length, 4) - 1 && <div className="ios-separator" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-10 lg:mb-0 animate-in" style={{ animationDelay: '400ms' }}>
                <SectionHeader title="Top Charts" href="/bots" linkLabel="Charts" className="!px-0" />
                <div className="ios-grouped">
                  {topCharts.slice(0, 5).map((bot, i) => (
                    <div key={bot.id}>
                      <AppListRow bot={bot} rank={i + 1} showChevron={false} />
                      {i < 4 && <div className="ios-separator" />}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── New & Noteworthy ── */}
            <section className="mb-6 animate-in" style={{ animationDelay: '500ms' }}>
              <SectionHeader title="New & Noteworthy" badge="Fresh" className="!px-0 mb-5" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                {newApps.slice(0, 10).map((bot, i) => (
                  <Link
                    key={bot.id}
                    to={`/bot/${bot.id}`}
                    className="bg-card rounded-2xl p-4 sm:p-5 card-hover group border border-border/30 animate-in flex flex-col justify-between"
                    style={{ animationDelay: `${500 + i * 80}ms` }}
                  >
                    <div>
                      <div className="transition-transform duration-300 group-hover:scale-110">
                        <img
                          src={bot.iconImage ?? bot.image}
                          alt={bot.name}
                          loading="lazy"
                          className="app-icon w-14 h-14 sm:w-16 sm:h-16 mb-3 object-cover"
                        />
                      </div>
                      <p className="ios-headline text-[15px] line-clamp-1 group-hover:text-primary transition-colors duration-200">
                        {bot.name}
                      </p>
                      <p className="ios-footnote line-clamp-1 mt-0.5">{bot.creator}</p>
                    </div>
                    <p className="text-[13px] font-bold mt-2.5">
                      {bot.price === 0 ? (
                        <span className="text-primary">GET</span>
                      ) : (
                        <span className="text-foreground">${bot.price.toFixed(2)}</span>
                      )}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

      </div>
    </Layout>
  )
}

export default MarketplacePage
