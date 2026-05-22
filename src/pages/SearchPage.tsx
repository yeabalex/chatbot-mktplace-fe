import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import AppListRow from '../components/ios/AppListRow'
import { mockBots } from '../data/bots'
import { Search, X } from 'lucide-react'

const trending = ['Support', 'Sales', 'Education', 'Free bots', 'AI Writer']

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const results = query
    ? mockBots.filter(
        (b) =>
          b.name.toLowerCase().includes(query.toLowerCase()) ||
          b.category.toLowerCase().includes(query.toLowerCase()) ||
          b.creator.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <Layout title="Search" largeTitle>
      <div className="max-w-2xl">
        <div className="relative mb-6 lg:mb-8">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-label-tertiary"
          />
          <input
            type="search"
            autoFocus
            placeholder="Search bots"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="ios-search pl-10 pr-10 w-full"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-fill-secondary/40"
            >
              <X size={14} className="text-label-secondary" />
            </button>
          )}
        </div>

        {!query ? (
          <>
            <h2 className="ios-title-3 mb-3">Trending</h2>
            <div className="flex flex-wrap gap-2 mb-8">
              {trending.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 rounded-full bg-fill-secondary/25 text-[15px] text-primary font-medium active:opacity-70 lg:hover:bg-fill-secondary/40"
                >
                  {term}
                </button>
              ))}
            </div>
            <h2 className="ios-title-3 mb-3">Suggested</h2>
            <div className="ios-grouped lg:max-w-3xl">
              {mockBots.slice(0, 4).map((bot, i) => (
                <div key={bot.id}>
                  <AppListRow bot={bot} showChevron={false} />
                  {i < 3 && <div className="ios-separator" />}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="ios-footnote mb-3">{results.length} Results</p>
            <div className="ios-grouped mb-8 lg:max-w-4xl">
              {results.length > 0 ? (
                <div className="lg:grid lg:grid-cols-2 lg:gap-0">
                  {results.map((bot, i) => (
                    <div key={bot.id} className="lg:border-b lg:border-separator/50 last:lg:border-0">
                      <AppListRow bot={bot} showChevron={false} />
                      {i < results.length - 1 && (
                        <div className="ios-separator lg:hidden" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center col-span-2">
                  <p className="ios-headline mb-1">No Results</p>
                  <p className="ios-subhead mb-4">Try a different search term</p>
                  <button
                    onClick={() => navigate('/apps')}
                    className="text-primary text-[17px] font-medium"
                  >
                    Browse All Apps
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default SearchPage
