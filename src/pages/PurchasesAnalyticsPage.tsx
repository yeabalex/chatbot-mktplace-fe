import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import AppIcon from '../components/ios/AppIcon'
import { useAuth } from '../context/AuthContext'
import {
  fetchUserPurchaseAnalytics,
  fetchUserSpendingTrend,
  fetchMarketplaceAnalytics,
  UserPurchaseAnalyticsResponse,
  UserSpendingTrendResponse,
  MarketplaceAnalyticsResponse,
} from '../lib/api'
import { cn, formatPrice } from '../lib/utils'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  ShoppingBag,
  Star,
  Users,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Search,
  Sparkles,
  HelpCircle,
  Shield,
  FileText,
  CheckCircle,
  CreditCard,
  Lock,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

export default function PurchasesAnalyticsPage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Tab State: 'buyer' | 'admin'
  const [activeTab, setActiveTab] = useState<'buyer' | 'admin'>('buyer')
  const [dateFilter, setDateFilter] = useState<'30d' | '90d' | 'all' | 'custom'>('all')
  const [fromConfig, setFromConfig] = useState<string>('')
  const [toConfig, setToConfig] = useState<string>('')

  // Data States
  const [buyerData, setBuyerData] = useState<UserPurchaseAnalyticsResponse | null>(null)
  const [spendingTrend, setSpendingTrend] = useState<UserSpendingTrendResponse | null>(null)
  const [marketplaceData, setMarketplaceData] = useState<MarketplaceAnalyticsResponse | null>(null)

  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null)

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

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        from: fromConfig || undefined,
        to: toConfig || undefined
      }

      if (activeTab === 'buyer') {
        const [buyerAnalytics, trend] = await Promise.all([
          fetchUserPurchaseAnalytics(params),
          fetchUserSpendingTrend(params)
        ])
        setBuyerData(buyerAnalytics)
        setSpendingTrend(trend)
      } else {
        const adminAnalytics = await fetchMarketplaceAnalytics(params)
        setMarketplaceData(adminAnalytics)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to fetch analytics data.')
    } finally {
      setLoading(false)
    }
  }

  // Refetch when dates or active tab changes
  useEffect(() => {
    if (dateFilter !== 'custom' || (fromConfig && toConfig)) {
      loadData()
    }
  }, [fromConfig, toConfig, activeTab])

  const handleOpenReceipt = (purchase: any) => {
    setSelectedReceipt({
      id: purchase.id,
      amount: purchase.amount,
      currency: purchase.currency || 'usd',
      purchasedAt: purchase.purchasedAt,
      paymentMethod: purchase.paymentMethod || 'card',
      stripePaymentIntentId: purchase.stripePaymentIntentId || `pi_${Math.random().toString(36).substring(2, 12)}`,
      stripeCustomerId: purchase.stripeCustomerId || 'cus_demo123',
      bot: purchase.bot || {
        id: 'bot-unknown',
        title: 'Chatbot Assistant',
        category: 'general',
        price: purchase.amount
      }
    })
  }

  const isAdmin = user?.role === 'admin'

  return (
    <Layout
      title="Purchases & Stats"
      subtitle={activeTab === 'admin' ? 'Marketplace Revenue Details' : 'Your spending metrics & receipts'}
      rightAction={
        isAdmin && (
          <button
            onClick={() => setActiveTab(prev => prev === 'buyer' ? 'admin' : 'buyer')}
            className={cn(
              "px-3 py-1.5 rounded-full text-[12px] font-bold border transition-all active:scale-95",
              activeTab === 'admin'
                ? "bg-primary text-white border-primary"
                : "bg-muted text-label-secondary border-border/40"
            )}
          >
            {activeTab === 'admin' ? "Switch to Personal" : "Switch to Admin"}
          </button>
        )
      }
    >
      <div className="pb-12 animate-fade">
        
        {/* ── Perspective Switching tabs (Admin only see switcher) ── */}
        {isAdmin && (
          <div className="flex p-1 bg-fill-secondary/15 rounded-xl border border-border/20 max-w-md mb-6">
            <button
              onClick={() => setActiveTab('buyer')}
              className={cn(
                "flex-1 py-2 text-center rounded-lg text-[13px] font-bold transition-all active:scale-95 cursor-pointer",
                activeTab === 'buyer' ? "bg-card text-foreground shadow-sm border border-border/20" : "text-label-secondary"
              )}
            >
              My Spending & Purchases
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={cn(
                "flex-1 py-2 text-center rounded-lg text-[13px] font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5",
                activeTab === 'admin' ? "bg-card text-foreground shadow-sm border border-border/20" : "text-label-secondary"
              )}
            >
              <Shield size={14} />
              Marketplace Admin Stats
            </button>
          </div>
        )}

        {/* ── Date range selector toolbar ── */}
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

          {/* Custom Dates */}
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
                onClick={loadData}
                className="p-1.5 bg-primary text-white rounded-lg active:scale-95 transition-transform"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── Main content wrapper ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-[14px] text-label-tertiary mt-2">Loading stats & transactions...</p>
          </div>
        ) : error ? (
          <div className="bg-card border border-border/30 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-sm my-10 animate-fade">
            <RefreshCw size={32} className="mx-auto mb-3 text-destructive animate-spin-slow" />
            <p className="ios-subhead font-bold text-foreground">Error loading analytics</p>
            <p className="ios-footnote mt-1 mb-4 text-label-tertiary">{error}</p>
            <button
              onClick={loadData}
              className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-md cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : activeTab === 'buyer' ? (
          /* =========================================================
             BUYER SPENDING VIEW
             ========================================================= */
          <div className="space-y-8 animate-in">
            {/* Stats widgets */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider mb-2">Total Spent</p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground leading-none">
                    {formatPrice(buyerData?.summary.totalSpent || 0)}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/10 flex items-center gap-1 text-[11px] text-label-tertiary font-semibold">
                  <TrendingUp size={12} className="text-success" />
                  <span>USD Currency</span>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider mb-2">Total Purchases</p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground leading-none">
                    {buyerData?.summary.totalPurchases || 0}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/10 text-[11px] text-label-tertiary font-semibold">
                  <span>Transactions count</span>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider mb-2">Unique Chatbots</p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground leading-none">
                    {buyerData?.summary.uniqueBots || 0}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/10 text-[11px] text-label-tertiary font-semibold">
                  <span>Acquired assistants</span>
                </div>
              </div>
            </div>

            {/* Spending Chart & Breakdown Split */}
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Recharts Spending Trend (covers 2 cols on lg) */}
              <div className="lg:col-span-2 bg-card rounded-2xl border border-border/30 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-[15px] font-black text-foreground tracking-tight">Spending Behavior</h3>
                    <p className="text-[11px] text-label-tertiary font-medium">Daily purchase spending habits</p>
                  </div>
                  <BarChart3 size={16} className="text-primary" />
                </div>

                {spendingTrend && spendingTrend.trend.some(t => t.spent > 0) ? (
                  <div className="h-[240px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={spendingTrend.trend} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary, #007aff)" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="var(--color-primary, #007aff)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120, 120, 128, 0.1)" />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 9, fill: 'var(--color-label-tertiary, #8e8e93)' }}
                          tickFormatter={(date) => {
                            const parts = date.split('-')
                            return parts.length > 2 ? `${parts[1]}/${parts[2]}` : date
                          }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 9, fill: 'var(--color-label-tertiary, #8e8e93)' }}
                          tickFormatter={(val) => `$${val}`}
                        />
                        <ChartTooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-card, #ffffff)',
                            border: '1px solid var(--color-border, #e5e5ea)',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}
                          formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Spent']}
                        />
                        <Area type="monotone" dataKey="spent" stroke="var(--color-primary, #007aff)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpent)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[240px] w-full flex flex-col items-center justify-center border border-dashed border-border/30 rounded-xl">
                    <Info className="text-label-tertiary/40 mb-1.5 w-6 h-6" />
                    <p className="text-[12px] text-label-tertiary font-semibold">No spending registered in this period.</p>
                  </div>
                )}
              </div>

              {/* Category Breakdown list */}
              <div className="bg-card rounded-2xl border border-border/30 p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-[15px] font-black text-foreground tracking-tight">Category Allocation</h3>
                  <p className="text-[11px] text-label-tertiary font-medium">Spending by bot categories</p>
                </div>

                <div className="space-y-4 pt-2">
                  {buyerData && buyerData.categoryBreakdown.length > 0 ? (
                    buyerData.categoryBreakdown.map((item) => {
                      const total = buyerData.summary.totalSpent || 1
                      const percentage = Math.round((item.spent / total) * 100)
                      return (
                        <div key={item.category} className="space-y-1">
                          <div className="flex justify-between items-center text-[12px] font-bold">
                            <span className="capitalize text-foreground">{item.category}</span>
                            <span className="text-label-secondary">{formatPrice(item.spent)} ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden border border-border/10">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-label-tertiary">{item.purchases} bot{item.purchases > 1 ? 's' : ''} bought</p>
                        </div>
                      )
                    })
                  ) : (
                    <div className="py-8 text-center text-label-tertiary">
                      <p className="text-[12px]">No category data available.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Recent Purchases & receipts */}
            <div className="space-y-4">
              <h3 className="text-[17px] font-black text-foreground tracking-tight">Purchase Logs & Receipts</h3>
              <div className="bg-card rounded-2xl border border-border/30 overflow-hidden shadow-sm">
                {buyerData && buyerData.recentPurchases.length > 0 ? (
                  buyerData.recentPurchases.map((purchase, index) => (
                    <div
                      key={purchase.id}
                      onClick={() => handleOpenReceipt(purchase)}
                      className="group cursor-pointer hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4 p-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <AppIcon src={purchase.bot.imageUrl} alt={purchase.bot.title} size="md" className="rounded-xl flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[14px] font-black text-foreground group-hover:text-primary transition-colors truncate">
                              {purchase.bot.title}
                            </p>
                            <p className="text-[11px] text-label-tertiary font-semibold capitalize mt-0.5">
                              {purchase.bot.category} · {new Date(purchase.purchasedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-[14px] font-black text-foreground">
                              {formatPrice(purchase.amount)}
                            </p>
                            <p className="text-[9px] text-label-tertiary font-bold uppercase tracking-wider">
                              Invoice
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-label-tertiary group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                      {index < buyerData.recentPurchases.length - 1 && (
                        <div className="ios-separator" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-label-tertiary">
                    <ShoppingBag className="mx-auto text-label-tertiary/40 mb-3 w-10 h-10 animate-bounce-slow" />
                    <p className="text-[14px] font-semibold text-foreground">No purchases made yet</p>
                    <p className="text-[11px] mt-1">Explore our Marketplace and purchase your first assistant.</p>
                    <Link to="/marketplace" className="inline-flex items-center justify-center bg-primary text-white font-bold px-5 py-2 rounded-full mt-4 text-[12px] shadow-sm">
                      Go to Marketplace
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* =========================================================
             ADMIN MARKETPLACE VIEW
             ========================================================= */
          <div className="space-y-8 animate-in">
            {/* Stats widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm">
                <p className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider mb-2">Marketplace Revenue</p>
                <p className="text-2xl sm:text-3xl font-black text-success leading-none">
                  {formatPrice(marketplaceData?.purchases.totalRevenue || 0)}
                </p>
                <p className="text-[11px] text-label-tertiary font-medium mt-3 border-t border-border/10 pt-2.5">
                  Transactions: {marketplaceData?.purchases.totalTransactions}
                </p>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm">
                <p className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider mb-2">Registered Buyers</p>
                <p className="text-2xl sm:text-3xl font-black text-foreground leading-none">
                  {marketplaceData?.purchases.uniqueBuyers || 0}
                </p>
                <p className="text-[11px] text-label-tertiary font-medium mt-3 border-t border-border/10 pt-2.5">
                  Unique active accounts
                </p>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm">
                <p className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider mb-2">Marketplace Bots</p>
                <p className="text-2xl sm:text-3xl font-black text-foreground leading-none">
                  {marketplaceData?.bots.totalBots || 0}
                </p>
                <p className="text-[11px] text-label-tertiary font-medium mt-3 border-t border-border/10 pt-2.5">
                  Avg price: {formatPrice(marketplaceData?.bots.avgPrice || 0)}
                </p>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border/30 shadow-sm">
                <p className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider mb-2">Store Liked Count</p>
                <p className="text-2xl sm:text-3xl font-black text-destructive leading-none">
                  {marketplaceData?.bots.totalLikes || 0} ❤️
                </p>
                <p className="text-[11px] text-label-tertiary font-medium mt-3 border-t border-border/10 pt-2.5">
                  Total user favorites
                </p>
              </div>
            </div>

            {/* Category Performance Breakdown */}
            <div className="space-y-4">
              <h3 className="text-[17px] font-black text-foreground tracking-tight">Category Performance Breakdown</h3>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {marketplaceData && marketplaceData.categoryPerformance.map((category) => {
                  return (
                    <div key={category.category} className="bg-card border border-border/30 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                      <div>
                        <span className="section-badge capitalize">{category.category}</span>
                        <h4 className="text-xl font-extrabold text-foreground tracking-tight mt-3">
                          {formatPrice(category.revenue)}
                        </h4>
                        <p className="text-[11px] text-label-tertiary font-semibold mt-0.5">Category Revenue</p>
                      </div>
                      <div className="pt-3 border-t border-border/10 flex justify-between text-[11px] text-label-secondary font-bold">
                        <span>Sales: {category.sales}</span>
                        <span className="text-primary font-bold">
                          Avg: {formatPrice(category.sales > 0 ? (category.revenue / category.sales) : 0)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Admin Notice */}
            <div className="p-4 bg-muted/40 border border-border/30 rounded-2xl flex gap-3 items-start">
              <Shield size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-bold text-foreground">Marketplace Administration Stats Panel</p>
                <p className="text-[11px] text-label-tertiary mt-0.5 leading-relaxed">
                  You are viewing system-wide analytics logs. Values indicate overall buyer checkout purchases, active stripe authorization logs, and content indexing. Contact details, stripe tokens, and user credentials remain secured under encryption protocols.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ── Receipt/Invoice Modal details sheet ── */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border/30 overflow-hidden shadow-2xl animate-in">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border/10 flex justify-between items-center bg-muted/30">
              <h3 className="text-[17px] font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
                <FileText size={16} className="text-primary" />
                Invoice Receipt
              </h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-label-tertiary hover:text-foreground font-bold text-sm cursor-pointer p-1 active:scale-90"
              >
                Close
              </button>
            </div>

            {/* Success check animation header */}
            <div className="p-6 text-center border-b border-border/10 bg-success/5 space-y-1">
              <CheckCircle size={36} className="text-success mx-auto" />
              <p className="text-[16px] font-black text-foreground">Payment Successful</p>
              <p className="text-[11px] text-label-tertiary font-semibold">
                ID: {selectedReceipt.id}
              </p>
            </div>

            {/* Invoice Details info */}
            <div className="p-6 space-y-4 text-[13px]">
              <div className="flex justify-between">
                <span className="text-label-tertiary font-semibold">Chatbot Assistant:</span>
                <span className="text-foreground font-extrabold">{selectedReceipt.bot.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-label-tertiary font-semibold">Category:</span>
                <span className="text-foreground font-bold capitalize">{selectedReceipt.bot.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-label-tertiary font-semibold">Purchased On:</span>
                <span className="text-foreground font-semibold">
                  {new Date(selectedReceipt.purchasedAt).toLocaleDateString()} at {new Date(selectedReceipt.purchasedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="h-px bg-border/20 my-2" />
              
              <div className="flex justify-between">
                <span className="text-label-tertiary font-semibold">Payment Method:</span>
                <span className="text-foreground font-bold capitalize flex items-center gap-1.5">
                  <CreditCard size={14} className="text-primary" />
                  {selectedReceipt.paymentMethod.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-label-tertiary font-semibold">Stripe ID:</span>
                <span className="text-label-secondary font-mono text-[10px] break-all max-w-[200px] text-right font-semibold">
                  {selectedReceipt.stripePaymentIntentId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-label-tertiary font-semibold">Stripe Customer:</span>
                <span className="text-label-secondary font-mono text-[10px] font-semibold">
                  {selectedReceipt.stripeCustomerId}
                </span>
              </div>

              <div className="h-px bg-border/20 my-2" />

              <div className="flex justify-between text-[15px] font-extrabold">
                <span className="text-foreground">Charged Total:</span>
                <span className="text-primary">{formatPrice(selectedReceipt.amount)}</span>
              </div>
            </div>

            {/* Receipt Footer Actions */}
            <div className="p-6 bg-muted/10 border-t border-border/10 flex gap-3">
              <button
                onClick={() => {
                  window.open(selectedReceipt.receiptUrl || 'https://stripe.com', '_blank')
                }}
                className="flex-1 py-2.5 border border-border/60 hover:bg-muted/40 text-label-secondary font-bold text-[12px] rounded-xl transition-all text-center active:scale-95 cursor-pointer"
              >
                View PDF Invoice
              </button>
              <button
                onClick={() => navigate(`/chat/${selectedReceipt.bot.id}`)}
                className="flex-1 py-2.5 bg-primary hover:bg-primary/95 text-white font-extrabold text-[12px] rounded-xl transition-all text-center active:scale-95 cursor-pointer"
              >
                Launch Chatbot
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  )
}
