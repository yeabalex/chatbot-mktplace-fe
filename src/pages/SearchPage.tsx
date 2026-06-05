import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import AppListRow from '../components/ios/AppListRow'
import { Search, X, RefreshCw, Sparkles, Loader2 } from 'lucide-react'
import { fetchBotsList, searchBotsRequest, mapBackendBotToFrontendBot } from '../lib/api'
import { Bot } from '../data/bots'

const trending = ['Support', 'Sales', 'Education', 'Free bots', 'AI Writer']

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  
  // Suggested state
  const [suggestedBots, setSuggestedBots] = useState<Bot[]>([])
  const [loadingSuggested, setLoadingSuggested] = useState(true)
  const [suggestedError, setSuggestedError] = useState<string | null>(null)

  // Search state
  const [searchResults, setSearchResults] = useState<Bot[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const navigate = useNavigate()

  // Debounce search input to avoid hitting endpoint on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(handler)
  }, [query])

  // Load suggestions
  const loadSuggestions = () => {
    setLoadingSuggested(true)
    setSuggestedError(null)
    fetchBotsList({ limit: 4 })
      .then((res) => {
        setSuggestedBots(res.bots.map(mapBackendBotToFrontendBot))
        setLoadingSuggested(false)
      })
      .catch((err: any) => {
        console.error(err)
        setSuggestedError(err.message || 'Failed to retrieve suggestions.')
        setLoadingSuggested(false)
      })
  }

  useEffect(() => {
    loadSuggestions()
  }, [])

  // Call backend search endpoint when debounced query updates
  useEffect(() => {
    const trimmed = debouncedQuery.trim()
    
    if (trimmed.length < 2) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    setSearching(true)
    setSearchError(null)
    searchBotsRequest({ q: trimmed })
      .then((res) => {
        setSearchResults(res.bots.map(mapBackendBotToFrontendBot))
        setSearching(false)
      })
      .catch((err: any) => {
        console.error(err)
        setSearchError(err.message || 'Failed to query search API.')
        setSearching(false)
      })
  }, [debouncedQuery])

  return (
    <Layout title="Search" largeTitle>
      <div className="max-w-2xl">
        {/* Search Input Box */}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-fill-secondary/40 cursor-pointer"
            >
              <X size={14} className="text-label-secondary" />
            </button>
          )}
        </div>

        {/* ── EMPTY QUERY: SHOW SUGGESTIONS & TRENDING ── */}
        {!query ? (
          <>
            <h2 className="ios-title-3 mb-3">Trending</h2>
            <div className="flex flex-wrap gap-2 mb-8">
              {trending.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 rounded-full bg-fill-secondary/25 text-[15px] text-primary font-medium active:opacity-70 cursor-pointer lg:hover:bg-fill-secondary/40"
                >
                  {term}
                </button>
              ))}
            </div>

            <h2 className="ios-title-3 mb-3">Suggested</h2>
            {loadingSuggested ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : suggestedError ? (
              <div className="p-6 text-center bg-card border border-border/20 rounded-xl">
                <p className="text-[13px] text-destructive font-semibold mb-2">{suggestedError}</p>
                <button onClick={loadSuggestions} className="text-primary font-bold text-xs cursor-pointer">
                  Retry
                </button>
              </div>
            ) : suggestedBots.length > 0 ? (
              <div className="ios-grouped lg:max-w-3xl">
                {suggestedBots.map((bot, i) => (
                  <div key={bot.id}>
                    <AppListRow bot={bot} showChevron={false} />
                    {i < suggestedBots.length - 1 && <div className="ios-separator" />}
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          /* ── ACTIVE QUERY: SHOW RESULTS ── */
          <>
            {/* Length Check Indicator */}
            {query.trim().length < 2 ? (
              <div className="p-8 text-center text-label-tertiary">
                <p className="text-[14px] font-medium">Type at least 2 characters to search...</p>
              </div>
            ) : searching ? (
              /* Searching State Spinner */
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-primary mb-2" />
                <p className="text-[13px] text-label-tertiary font-medium">Querying marketplace...</p>
              </div>
            ) : searchError ? (
              /* Search API Error */
              <div className="bg-card border border-border/30 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-sm my-6">
                <RefreshCw size={24} className="mx-auto mb-3 text-destructive" />
                <p className="ios-subhead font-bold text-foreground">Search Failed</p>
                <p className="ios-footnote mt-1 mb-4 text-label-tertiary">{searchError}</p>
                <button
                  onClick={() => {
                    setSearching(true);
                    searchBotsRequest({ q: query.trim() })
                      .then((res) => {
                        setSearchResults(res.bots.map(mapBackendBotToFrontendBot))
                        setSearching(false)
                      })
                      .catch((err) => {
                        setSearchError(err.message || 'Failed to search.')
                        setSearching(false)
                      })
                  }}
                  className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-md cursor-pointer"
                >
                  Retry Search
                </button>
              </div>
            ) : (
              /* Results List */
              <>
                <p className="ios-footnote mb-3">{searchResults.length} Results</p>
                <div className="ios-grouped mb-8 lg:max-w-4xl">
                  {searchResults.length > 0 ? (
                    <div className="lg:grid lg:grid-cols-2 lg:gap-0">
                      {searchResults.map((bot, i) => (
                        <div key={bot.id} className="lg:border-b lg:border-separator/50 last:lg:border-0">
                          <AppListRow bot={bot} showChevron={false} />
                          {i < searchResults.length - 1 && (
                            <div className="ios-separator lg:hidden" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* No Results State */
                    <div className="p-8 text-center col-span-2">
                      <Sparkles size={36} className="mx-auto mb-3 text-label-tertiary opacity-40 animate-bounce" />
                      <p className="ios-headline mb-1">No Results</p>
                      <p className="ios-subhead mb-4">We couldn&apos;t find any bots matching &ldquo;{query}&rdquo;</p>
                      <button
                        onClick={() => navigate('/my-bots')}
                        className="text-primary text-[17px] font-medium cursor-pointer"
                      >
                        Manage My Bots
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

export default SearchPage
