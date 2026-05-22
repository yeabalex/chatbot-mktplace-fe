import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import FeaturedCard from '../components/ios/FeaturedCard'
import AppGridItem from '../components/ios/AppGridItem'
import AppListRow from '../components/ios/AppListRow'
import SectionHeader from '../components/ios/SectionHeader'
import { mockBots } from '../data/bots'

const MarketplacePage: React.FC = () => {
  const featured = mockBots.filter((b) => b.featured)
  const topCharts = [...mockBots].sort((a, b) => b.downloads - a.downloads)
  const editorsChoice = mockBots.filter((b) => b.editorsChoice)
  const newApps = [...mockBots].reverse()

  return (
    <Layout title="Today">
      <div className="pb-6 lg:pb-10">

        {/* ── Featured cards ── */}
        <div className="mb-10 lg:mb-12">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2 lg:overflow-visible lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5 lg:snap-none">
            {featured.map((bot) => (
              <FeaturedCard key={bot.id} bot={bot} />
            ))}
          </div>
        </div>

        {/* ── Must-Have Bots ── */}
        <div className="mb-10">
          <SectionHeader title="Must-Have Bots" className="!px-0 mb-4" />
          <div className="flex gap-5 sm:gap-6 overflow-x-auto hide-scrollbar pb-1 lg:overflow-visible lg:flex-wrap lg:justify-start">
            {mockBots.map((bot) => (
              <AppGridItem key={bot.id} bot={bot} />
            ))}
          </div>
        </div>

        {/* ── Editor's Choice + Top Charts ── */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-10">
          {editorsChoice.length > 0 && (
            <div className="mb-10 lg:mb-0">
              <SectionHeader title="Editor's Choice" href="/apps" className="!px-0" />
              <div className="ios-grouped">
                {editorsChoice.map((bot, i) => (
                  <div key={bot.id}>
                    <AppListRow bot={bot} showChevron={false} />
                    {i < editorsChoice.length - 1 && <div className="ios-separator" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-10 lg:mb-0">
            <SectionHeader title="Top Charts" href="/apps" linkLabel="Charts" className="!px-0" />
            <div className="ios-grouped">
              {topCharts.slice(0, 5).map((bot, i) => (
                <div key={bot.id}>
                  <AppListRow bot={bot} rank={i + 1} showChevron={false} />
                  {i < 4 && <div className="ios-separator" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── New & Noteworthy ── */}
        <div className="mb-6">
          <SectionHeader title="New & Noteworthy" className="!px-0" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {newApps.map((bot) => (
              <Link
                key={bot.id}
                to={`/bot/${bot.id}`}
                className="bg-card rounded-2xl p-4 active:opacity-80 lg:hover:shadow-md transition-shadow shadow-sm"
              >
                <img
                  src={bot.iconImage ?? bot.image}
                  alt={bot.name}
                  loading="lazy"
                  className="app-icon w-14 h-14 sm:w-16 sm:h-16 mb-3 object-cover"
                />
                <p className="ios-headline text-[15px] line-clamp-1">{bot.name}</p>
                <p className="ios-footnote line-clamp-1">{bot.creator}</p>
                <p className="text-primary text-[13px] font-semibold mt-2">
                  {bot.price === 0 ? 'GET' : `$${bot.price.toFixed(2)}`}
                </p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}

export default MarketplacePage

