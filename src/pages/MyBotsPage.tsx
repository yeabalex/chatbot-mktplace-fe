import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import AppIcon from '../components/ios/AppIcon'
import { useAuth } from '../context/AuthContext'
import {
  fetchOverviewAnalytics,
  fetchSingleBotAnalytics,
  OverviewAnalyticsResponse,
  SingleBotAnalyticsResponse,
  BotIndividualMetrics
} from '../lib/api'
import { cn, formatPrice } from '../lib/utils'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Heart,
  MessageSquare,
  ShoppingBag,
  Star,
  Users,
  Plus,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Search,
  Sparkles,
  HelpCircle
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

export default function MyBotsPage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // State
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<'30d' | '90d' | 'all' | 'custom'>('all')
  const [fromConfig, setFromConfig] = useState<string>('')
  const [toConfig, setToConfig] = useState<string>('')
  
  const [overview, setOverview] = useState<OverviewAnalyticsResponse | null>(null)
  const [loadingOverview, setLoadingOverview] = useState(true)
  const [errorOverview, setErrorOverview] = useState<string | null>(null)

  const [singleAnalytics, setSingleAnalytics] = useState<SingleBotAnalyticsResponse | null>(null)
  const [loadingSingle, setLoadingSingle] = useState(false)
  const [errorSingle, setErrorSingle] = useState<string | null>(null)

  // Quick Preset Handlers
  useEffect(() => {
    const today = new Date()
    let fromDate = ''
    let toDate = today.toISOString().split('T')[0]

    if (dateFilter === '30d') {
      const priorDate = new Date()
      priorDate.setDate(today.getDate() - 30)
      fromDate = priorDate.toISOString().split('T')[0]
    } else if (dateFilter === '90d') {
      const priorDate = new Date()
      priorDate.setDate(today.getDate() - 90)
      fromDate = priorDate.toISOString().split('T')[0]
    }

    if (dateFilter !== 'custom') {
      setFromConfig(fromDate)
      setToConfig(toDate)
    }
  }, [dateFilter])

  // Fetch overview data
  const loadOverview = async () => {
    setLoadingOverview(true)
    setErrorOverview(null)
    try {
      const data = await fetchOverviewAnalytics({
        from: fromConfig || undefined,
        to: toConfig || undefined
      })
      setOverview(data)
    } catch (err: any) {
      console.error(err)
      setErrorOverview(err.message || 'Failed to load analytics overview.')
    } finally {
      setLoadingOverview(false)
    }
  }

  // Fetch single bot data
  const loadSingleBot = async (botId: string) => {
    setLoadingSingle(true)
    setErrorSingle(null)
    try {
      const data = await fetchSingleBotAnalytics(botId, {
        from: fromConfig || undefined,
        to: toConfig || undefined
      })
      setSingleAnalytics(data)
    } catch (err: any) {
      console.error(err)
      setErrorSingle(err.message || 'Failed to load detailed bot analytics.')
    } finally {
      setLoadingSingle(false)
    }
  }

  // Refetch when dates change
  useEffect(() => {
    if (dateFilter !== 'custom' || (fromConfig && toConfig)) {
      loadOverview()
      if (selectedBotId) {
        loadSingleBot(selectedBotId)
      }
    }
  }, [fromConfig, toConfig, selectedBotId])

  // Handle row selection
  const handleSelectBot = (botId: string) => {
    setSelectedBotId(botId)
    loadSingleBot(botId)
  }

  const handleBackToOverview = () => {
    setSelectedBotId(null)
    setSingleAnalytics(null)
  }

  return (
    <Layout
      title={selectedBotId ? 'Bot Details' : 'My Bots'}
      subtitle={selectedBotId ? 'Performance Breakdown' : 'Analytics & Sales Dashboard'}
      rightAction={
        <button
          onClick={() => navigate('/studio')}
          className="p-2 bg-primary text-white rounded-full active:scale-95 transition-transform"
          aria-label="Create Bot"
        >
          <Plus size={20} />
        </button>
      }
    >
      <div className="pb-10 animate-fade">
        
        {/* ── Filter Row & Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2">
          {/* Presets */}
          <div className="flex gap-2 p-1 bg-fill-secondary/15 rounded-xl border border-border/20 max-w-fit overflow-x-auto hide-scrollbar">
            {[
              { id: 'all', label: 'All Time' },
              { id: '30d', label: 'Last 30 Days' },
              { id: '90d', label: 'Last 90 Days' },
              { id: 'custom', label: 'Custom Date' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setDateFilter(p.id as any)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95',
                  dateFilter === p.id
                    ? 'bg-card text-foreground shadow-sm border border-border/30'
                    : 'text-label-secondary hover:text-foreground'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs */}
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 animate-in">
              <input
                type="date"
                value={fromConfig}
                onChange={(e) => setFromConfig(e.target.value)}
                className="bg-card border border-border/40 rounded-xl px-3 py-1.5 text-[13px] text-foreground font-semibold outline-none focus:border-primary/50"
              />
              <span className="text-label-tertiary font-bold text-xs">to</span>
              <input
                type="date"
                value={toConfig}
                onChange={(e) => setToConfig(e.target.value)}
                className="bg-card border border-border/40 rounded-xl px-3 py-1.5 text-[13px] text-foreground font-semibold outline-none focus:border-primary/50"
              />
              <button
                onClick={() => {
                  loadOverview()
                  if (selectedBotId) loadSingleBot(selectedBotId)
                }}
                className="p-1.5 bg-primary text-white rounded-lg active:scale-95 transition-transform"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── Main View Switcher ── */}
        {!selectedBotId ? (
          /* =========================================================
             OVERVIEW DASHBOARD
             ========================================================= */
          loadingOverview ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <LoaderCircle />
              <p className="text-[14px] text-label-tertiary mt-2">Loading analytics dashboard...</p>
            </div>
          ) : errorOverview ? (
            <div className="bg-card border border-border/30 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-sm my-10">
              <RefreshCw size={32} className="mx-auto mb-3 text-destructive animate-spin-slow" />
              <p className="ios-subhead font-bold text-foreground">Error loading analytics</p>
              <p className="ios-footnote mt-1 mb-4 text-label-tertiary">{errorOverview}</p>
              <button
                onClick={loadOverview}
                className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-md cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : !overview || overview.bots.length === 0 ? (
            /* Empty State */
            <div className="bg-card border border-border/30 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm my-10">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={28} className="text-primary animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">No Bots Created Yet</h3>
              <p className="text-label-tertiary text-[14px] max-w-sm mx-auto mb-6 leading-relaxed">
                You need to create your first chatbot in the studio to start tracking analytics and earning revenue.
              </p>
              <Link
                to="/studio"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-md text-[14px] gap-2"
              >
                <Plus size={16} />
                Create a Bot
              </Link>
            </div>
          ) : (
            <div className="space-y-8 animate-in">
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Revenue Card */}
                <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-label-tertiary mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Total Earnings</span>
                      <DollarSign size={16} className="text-success" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-foreground leading-none">
                      {formatPrice(overview.summary.totalRevenue)}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/10 flex justify-between text-[11px] text-label-tertiary font-semibold">
                    <span>Sales: {overview.summary.totalSales}</span>
                    <span>Buyers: {overview.summary.uniqueBuyers}</span>
                  </div>
                </div>

                {/* Bots Card */}
                <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-label-tertiary mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Created Bots</span>
                      <ShoppingBag size={16} className="text-primary" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-foreground leading-none">
                      {overview.summary.totalBots}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/10 flex justify-between text-[11px] text-label-tertiary font-semibold">
                    <span>Avg Rating:</span>
                    <span className="text-amber-500 font-bold">
                      {overview.summary.averageRating > 0 ? `${overview.summary.averageRating.toFixed(1)} ★` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Engagement Card */}
                <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-label-tertiary mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Engagement</span>
                      <MessageSquare size={16} className="text-cyan-500" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-foreground leading-none">
                      {overview.summary.totalConversations}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/10 flex justify-between text-[11px] text-label-tertiary font-semibold">
                    <span>Messages: {overview.summary.totalMessages}</span>
                    <span>Users: {overview.summary.uniqueChatUsers}</span>
                  </div>
                </div>

                {/* Trial & Likes Card */}
                <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-label-tertiary mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Free Trials</span>
                      <Users size={16} className="text-amber-500" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-foreground leading-none">
                      {overview.summary.totalPreviewUsers}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/10 flex justify-between text-[11px] text-label-tertiary font-semibold">
                    <span>Likes: {overview.summary.totalLikes} ❤️</span>
                    <span>Queries: {overview.summary.totalPreviewQueries}</span>
                  </div>
                </div>
              </div>

              {/* Bot Breakdown List */}
              <div className="space-y-4">
                <h2 className="text-[18px] font-black text-foreground tracking-tight">Your Bot Directory</h2>
                <div className="bg-card rounded-2xl border border-border/30 overflow-hidden shadow-sm">
                  {/* Table Header (visible on desktop) */}
                  <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.2fr_1fr] gap-4 p-4 bg-muted/40 border-b border-border/20 text-[11px] font-bold text-label-tertiary uppercase tracking-wider">
                    <span>Bot Name</span>
                    <span className="text-right">Sales / Revenue</span>
                    <span className="text-right">Likes</span>
                    <span className="text-right">Avg Rating</span>
                    <span className="text-right">Chats / Messages</span>
                    <span className="text-center">Action</span>
                  </div>

                  {/* List Rows */}
                  {overview.bots.map((bot, i) => (
                    <div key={bot.botId} className="group transition-colors hover:bg-muted/10">
                      {/* Desktop Grid Layout */}
                      <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.2fr_1fr] gap-4 p-4 items-center">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <AppIcon src={bot.imageUrl} alt={bot.name} size="md" className="rounded-xl border border-border/10 shadow-xs flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[14px] font-black text-foreground truncate">{bot.name}</p>
                            <p className="text-[11px] text-label-tertiary font-semibold capitalize">{bot.category}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-[14px] font-black text-foreground">{bot.sales} sales</p>
                          <p className="text-[11px] text-success font-bold">{formatPrice(bot.revenue)}</p>
                        </div>

                        <div className="text-right flex items-center justify-end gap-1 text-[13px] font-bold text-foreground">
                          <Heart size={12} className="text-destructive fill-destructive" />
                          <span>{bot.likes}</span>
                        </div>

                        <div className="text-right flex items-center justify-end gap-1 text-[13px] font-bold text-foreground">
                          <span className="text-amber-500 font-bold">★</span>
                          <span>{bot.averageRating > 0 ? bot.averageRating.toFixed(1) : '0.0'}</span>
                          <span className="text-[11px] text-label-tertiary">({bot.ratingCount})</span>
                        </div>

                        <div className="text-right">
                          <p className="text-[13px] font-bold text-foreground">{bot.conversations} chats</p>
                          <p className="text-[11px] text-label-tertiary">{bot.messages} msgs</p>
                        </div>

                        <div className="flex justify-center">
                          <button
                            onClick={() => handleSelectBot(bot.botId)}
                            className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/15 text-primary text-[12px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </div>

                      {/* Mobile Row Layout */}
                      <div className="md:hidden p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3 min-w-0">
                          <AppIcon src={bot.imageUrl} alt={bot.name} size="md" className="rounded-lg" />
                          <div className="min-w-0">
                            <p className="text-[14px] font-bold text-foreground truncate">{bot.name}</p>
                            <p className="text-[11px] text-success font-semibold mt-0.5">{formatPrice(bot.revenue)} ({bot.sales} sales)</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded flex items-center gap-0.5">
                                ★ {bot.averageRating > 0 ? bot.averageRating.toFixed(1) : '0.0'}
                              </span>
                              <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1 py-0.5 rounded flex items-center gap-0.5">
                                ❤️ {bot.likes}
                              </span>
                              <span className="text-[10px] font-bold text-cyan-600 bg-cyan-600/10 px-1 py-0.5 rounded flex items-center gap-0.5">
                                💬 {bot.conversations}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectBot(bot.botId)}
                          className="px-3 py-1.5 bg-primary text-white text-[12px] font-bold rounded-lg cursor-pointer"
                        >
                          View
                        </button>
                      </div>

                      {i < overview.bots.length - 1 && <div className="ios-separator" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        ) : (
          /* =========================================================
             SINGLE BOT DETAILED BREAKDOWN
             ========================================================= */
          <div>
            {/* Back Button */}
            <button
              onClick={handleBackToOverview}
              className="flex items-center gap-1 text-primary active:opacity-60 font-semibold mb-6 transition-opacity cursor-pointer group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[14px]">Back to Overview</span>
            </button>

            {loadingSingle ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <LoaderCircle />
                <p className="text-[14px] text-label-tertiary mt-2">Loading detailed breakdown...</p>
              </div>
            ) : errorSingle || !singleAnalytics ? (
              <div className="bg-card border border-border/30 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-sm my-10 animate-fade">
                <RefreshCw size={32} className="mx-auto mb-3 text-destructive animate-spin-slow" />
                <p className="ios-subhead font-bold text-foreground">Error loading bot details</p>
                <p className="ios-footnote mt-1 mb-4 text-label-tertiary">{errorSingle || 'No data found'}</p>
                <button
                  onClick={() => loadSingleBot(selectedBotId)}
                  className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-md"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-8 animate-in">
                {/* Bot Profile Card */}
                <div className="bg-card border border-border/30 rounded-3xl p-5 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-4 min-w-0">
                    <AppIcon src={singleAnalytics.bot.imageUrl} alt={singleAnalytics.bot.name} size="lg" className="rounded-2xl border border-border/20 shadow-sm flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="section-badge capitalize">{singleAnalytics.bot.category}</span>
                        {singleAnalytics.bot.featured && (
                          <span className="text-[9px] bg-accent/15 text-accent font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">FEATURED</span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight leading-tight">
                        {singleAnalytics.bot.name}
                      </h2>
                      <p className="text-[12px] text-label-tertiary mt-1 font-semibold">
                        Price: {singleAnalytics.bot.price === 0 ? 'FREE' : formatPrice(singleAnalytics.bot.price)} · Created {new Date(singleAnalytics.bot.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/studio/${singleAnalytics.bot.botId}`)}
                    className="w-full sm:w-auto px-5 py-2 border border-border hover:bg-muted/40 rounded-xl text-[13px] font-bold text-label-secondary transition-all active:scale-95 flex-shrink-0 text-center"
                  >
                    Edit in Studio
                  </button>
                </div>

                {/* Key Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Revenue */}
                  <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm">
                    <p className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider mb-1">Bot Earnings</p>
                    <p className="text-2xl font-black text-foreground">{formatPrice(singleAnalytics.bot.revenue)}</p>
                    <p className="text-[11px] text-label-secondary font-semibold mt-1">From {singleAnalytics.bot.sales} sales</p>
                  </div>

                  {/* Rating */}
                  <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm">
                    <p className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider mb-1">Feedback</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-black text-foreground">
                        {singleAnalytics.bot.averageRating > 0 ? singleAnalytics.bot.averageRating.toFixed(1) : 'New'}
                      </p>
                      <span className="text-amber-500 text-[18px]">★</span>
                    </div>
                    <p className="text-[11px] text-label-secondary font-semibold mt-1">Based on {singleAnalytics.bot.ratingCount} ratings</p>
                  </div>

                  {/* Chats */}
                  <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm">
                    <p className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider mb-1">Active Chats</p>
                    <p className="text-2xl font-black text-foreground">{singleAnalytics.bot.conversations}</p>
                    <p className="text-[11px] text-label-secondary font-semibold mt-1">{singleAnalytics.bot.messages} total messages</p>
                  </div>

                  {/* Likes */}
                  <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm">
                    <p className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider mb-1">Likes Count</p>
                    <p className="text-2xl font-black text-foreground">
                      {singleAnalytics.bot.likes} <span className="text-destructive text-[18px]">❤️</span>
                    </p>
                    <p className="text-[11px] text-label-secondary font-semibold mt-1">Active likes</p>
                  </div>
                </div>

                {/* Charts & Distributions */}
                <div className="grid lg:grid-cols-2 gap-6 items-start">
                  
                  {/* Revenue Trend Chart */}
                  <div className="bg-card rounded-2xl border border-border/30 p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[15px] font-black text-foreground tracking-tight">Earnings Trend</h3>
                      <TrendingUp size={16} className="text-success" />
                    </div>
                    
                    {singleAnalytics.revenueTrend.length > 0 ? (
                      <div className="h-[220px] w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={singleAnalytics.revenueTrend} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary, #007aff)" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="var(--color-primary, #007aff)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120, 120, 128, 0.1)" />
                            <XAxis
                              dataKey="date"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 10, fill: 'var(--color-label-tertiary, #8e8e93)' }}
                              tickFormatter={(date) => {
                                const parts = date.split('-')
                                return parts.length > 2 ? `${parts[1]}/${parts[2]}` : date
                              }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 10, fill: 'var(--color-label-tertiary, #8e8e93)' }}
                              tickFormatter={(val) => `$${val}`}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'var(--color-card, #ffffff)',
                                border: '1px solid var(--color-border, #e5e5ea)',
                                borderRadius: '12px',
                                fontSize: '12px'
                              }}
                              formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Revenue']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="var(--color-primary, #007aff)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[220px] w-full flex items-center justify-center border border-dashed border-border/30 rounded-xl">
                        <p className="text-[12px] text-label-tertiary font-semibold">No sales during this period.</p>
                      </div>
                    )}
                  </div>

                  {/* Rating Distribution */}
                  <div className="bg-card rounded-2xl border border-border/30 p-5 shadow-sm space-y-4">
                    <h3 className="text-[15px] font-black text-foreground tracking-tight">Rating Breakdown</h3>
                    
                    <div className="space-y-3.5 pt-2">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = singleAnalytics.ratingDistribution[String(stars)] || 0
                        const total = singleAnalytics.bot.ratingCount || 1
                        const percentage = Math.min(100, Math.round((count / total) * 100))
                        
                        return (
                          <div key={stars} className="flex items-center gap-3.5">
                            <span className="text-[12px] font-bold text-label-secondary w-3 flex-shrink-0">{stars}</span>
                            <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden border border-border/20">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-label-tertiary w-8 text-right flex-shrink-0">
                              {count}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                </div>

                {/* Recent Purchases */}
                <div className="space-y-4">
                  <h3 className="text-[18px] font-black text-foreground tracking-tight">Recent Acquisitions</h3>
                  <div className="bg-card rounded-2xl border border-border/30 overflow-hidden shadow-sm">
                    {singleAnalytics.recentPurchases.length > 0 ? (
                      singleAnalytics.recentPurchases.map((purchase, index) => (
                        <div key={purchase.id}>
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              {purchase.buyer.profilePictureUrl ? (
                                <img
                                  src={purchase.buyer.profilePictureUrl}
                                  alt=""
                                  className="w-9 h-9 rounded-full object-cover border border-border/10"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/15 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                  {purchase.buyer.username.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-[14px] font-black text-foreground truncate">
                                  {purchase.buyer.username}
                                </p>
                                <p className="text-[11px] text-label-tertiary mt-0.5">
                                  {new Date(purchase.purchasedAt).toLocaleDateString()} at {new Date(purchase.purchasedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[14px] font-black text-success">
                                +{formatPrice(purchase.amount)}
                              </span>
                              <p className="text-[9px] text-label-tertiary font-bold uppercase tracking-wider">
                                {purchase.currency}
                              </p>
                            </div>
                          </div>
                          {index < singleAnalytics.recentPurchases.length - 1 && (
                            <div className="ios-separator" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-label-tertiary">
                        <HelpCircle className="mx-auto text-label-tertiary/40 mb-2 w-8 h-8" />
                        <p className="text-[13px] font-semibold text-foreground">No purchases logged</p>
                        <p className="text-[11px] mt-0.5">We couldn&apos;t find any transactions for this bot.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </Layout>
  )
}

function LoaderCircle() {
  return (
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )
}
