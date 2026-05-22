import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppShell, { PageContainer } from '../components/AppShell'
import AppIcon from '../components/ios/AppIcon'
import AppListRow from '../components/ios/AppListRow'
import Button from '../components/ui/Button'
import { botDetails, mockBots } from '../data/bots'
import { cn, formatDownloads, formatPrice } from '../lib/utils'
import { ArrowLeft, Star, Share2, ChevronRight, Cloud, Shield } from 'lucide-react'

const BotDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const bot = botDetails[id || '1']
  const related = mockBots.filter((b) => b.id !== id).slice(0, 3)

  if (!bot) {
    return (
      <AppShell showMobileTabBar={false}>
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
          <p className="ios-subhead">App not found</p>
        </div>
      </AppShell>
    )
  }

  const purchaseCard = (
    <div className="ios-grouped p-5 lg:sticky lg:top-24 space-y-4">
      <div className="flex flex-col items-center text-center lg:items-stretch lg:text-left">
        <AppIcon src={bot.iconImage ?? bot.image} alt={bot.name} size="xl" className="lg:hidden mb-3" />
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate(`/chat/${id}`)}
          className="lg:max-w-none"
        >
          {bot.price === 0 ? 'Get — Free' : `Buy — $${bot.price.toFixed(2)}`}
        </Button>
        {bot.price > 0 && (
          <p className="ios-caption text-center mt-2">In-App Purchases</p>
        )}
      </div>
      <div className="space-y-2 pt-2 border-t border-separator/60">
        <div className="flex justify-between ios-footnote">
          <span>Version</span>
          <span>{bot.version}</span>
        </div>
        <div className="flex justify-between ios-footnote">
          <span>Updated</span>
          <span>{bot.updated}</span>
        </div>
        <div className="flex justify-between ios-footnote">
          <span>Size</span>
          <span>{bot.size}</span>
        </div>
      </div>
    </div>
  )

  return (
    <AppShell showMobileTabBar={false}>
      <div className="h-[env(safe-area-inset-top,0px)] lg:h-0" />

      <header className="ios-blur sticky top-0 z-40 border-b border-separator/40 lg:border-none">
        <PageContainer className="flex items-center justify-between py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-0.5 text-primary active:opacity-60"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
            <span className="text-[17px]">Back</span>
          </button>
          <button className="p-2 text-primary active:opacity-60">
            <Share2 size={22} />
          </button>
        </PageContainer>
      </header>

      <div className="flex-1 pb-10 lg:pb-12">
        <PageContainer>
          {/* App header */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2 pb-6 lg:pb-8 border-b border-separator/60">
            <AppIcon src={bot.iconImage ?? bot.image} alt={bot.name} size="xl" className="hidden sm:block flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="ios-large-title sm:ios-title-2 lg:text-[32px] mb-1">{bot.name}</h1>
              <p className="ios-subhead text-lg">{bot.creator}</p>
              <p className="ios-footnote mt-1">{bot.subtitle}</p>
              <div className="flex items-center gap-3 mt-4 sm:hidden">
                <button
                  onClick={() => navigate(`/chat/${id}`)}
                  className={cn('ios-get-btn ios-get-btn-filled')}
                >
                  {bot.price === 0 ? 'GET' : formatPrice(bot.price)}
                </button>
                {bot.price > 0 && <span className="ios-caption">In-App Purchases</span>}
              </div>
            </div>
            <div className="hidden sm:block lg:hidden flex-shrink-0 w-[280px]">{purchaseCard}</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-separator/60 rounded-xl overflow-hidden my-6 lg:my-8">
            {[
              { label: `${bot.reviews.toLocaleString()} Ratings`, value: `${bot.rating} ★` },
              { label: 'Age', value: bot.ageRating },
              { label: 'Category', value: bot.category },
              { label: 'Downloads', value: formatDownloads(bot.downloads) },
            ].map((stat) => (
              <div key={stat.label} className="bg-card p-4 text-center">
                <p className="ios-caption uppercase text-label-tertiary mb-1">{stat.label}</p>
                <p className="ios-headline text-[15px]">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Screenshots */}
          <div className="mb-8 lg:mb-10 -mx-4 sm:mx-0">
            <div className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar px-4 sm:px-0 snap-x">
              {bot.screenshots.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-[320px] sm:h-[400px] lg:h-[480px] w-[200px] sm:w-[240px] lg:w-[280px] rounded-2xl object-cover flex-shrink-0 snap-center shadow-md"
                />
              ))}
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] lg:gap-10 xl:gap-12">
            <div className="space-y-8 lg:space-y-10 min-w-0">
              <section>
                <h2 className="ios-title-3 mb-2">Description</h2>
                <p className="ios-subhead leading-relaxed max-w-3xl">{bot.longDescription}</p>
              </section>

              <section className="ios-grouped p-4 lg:max-w-3xl">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="ios-title-3">What&apos;s New</h2>
                  <span className="ios-caption">Version {bot.version}</span>
                </div>
                <p className="ios-footnote mb-2">{bot.updated}</p>
                <p className="ios-subhead">Performance improvements and bug fixes.</p>
              </section>

              <section className="lg:max-w-3xl">
                <h2 className="ios-title-3 mb-4">Ratings & Reviews</h2>
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-6">
                  <span className="text-[56px] lg:text-[64px] font-bold leading-none">{bot.rating}</span>
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={16}
                          className={cn(
                            i <= Math.round(bot.rating)
                              ? 'fill-label-tertiary text-label-tertiary'
                              : 'text-fill-secondary'
                          )}
                        />
                      ))}
                    </div>
                    <p className="ios-caption">{bot.reviews.toLocaleString()} Ratings</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                  {bot.testimonials.map((t, i) => (
                    <div key={i} className="ios-grouped p-4">
                      <div className="flex justify-between mb-1">
                        <span className="ios-headline text-[15px]">{t.author}</span>
                        <span className="ios-caption">{t.rating}★</span>
                      </div>
                      <p className="ios-subhead">{t.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="lg:max-w-3xl">
                <h2 className="ios-title-3 mb-3">Information</h2>
                <div className="ios-grouped">
                  {[
                    { label: 'Provider', value: bot.creator },
                    { label: 'Size', value: bot.size },
                    { label: 'Category', value: bot.category },
                    { label: 'Compatibility', value: 'Web, iOS, Android' },
                    { label: 'Languages', value: 'English + 12 more' },
                  ].map((row, i, arr) => (
                    <div key={row.label}>
                      <div className="flex justify-between px-4 py-3">
                        <span className="ios-subhead">{row.label}</span>
                        <span className="ios-subhead text-label-tertiary">{row.value}</span>
                      </div>
                      {i < arr.length - 1 && <div className="ios-separator !ml-0" />}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="ios-title-3 mb-3">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {bot.features.map((f) => (
                    <span
                      key={f}
                      className="px-3 py-1.5 rounded-full bg-fill-secondary/25 ios-footnote"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="ios-title-3 mb-3">You Might Also Like</h2>
                <div className="ios-grouped lg:max-w-2xl">
                  {related.map((b, i) => (
                    <div key={b.id}>
                      <AppListRow bot={b} showChevron={false} />
                      {i < related.length - 1 && <div className="ios-separator" />}
                    </div>
                  ))}
                </div>
              </section>

              <div className="sm:hidden">{purchaseCard}</div>

              <div className="flex items-center justify-center gap-6 py-4 text-label-tertiary">
                <Cloud size={20} />
                <Shield size={20} />
                <span className="ios-caption">Works with iCloud</span>
              </div>
            </div>

            <aside className="hidden lg:block">{purchaseCard}</aside>
          </div>
        </PageContainer>
      </div>
    </AppShell>
  )
}

export default BotDetailPage
