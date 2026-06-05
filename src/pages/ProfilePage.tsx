import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import AppIcon from '../components/ios/AppIcon'
import { useAuth } from '../context/AuthContext'
import { 
  fetchMyPurchasedBots, 
  fetchMyLikedBots, 
  fetchMyCreatedBots, 
  mapBackendBotToFrontendBot 
} from '../lib/api'
import { Bot } from '../data/bots'
import { cn } from '../lib/utils'
import { 
  ChevronRight, 
  Cloud, 
  Heart, 
  ShoppingBag, 
  Code, 
  Settings, 
  LayoutGrid, 
  RefreshCw, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  Shield,
  User as UserIcon,
  MessageSquare
} from 'lucide-react'

const LibrarySkeleton: React.FC = () => (
  <Layout title="Library">
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 lg:items-start animate-pulse">
      <div>
        <div className="h-32 bg-muted rounded-3xl mb-6" />
        <div className="h-10 bg-muted rounded-xl mb-5 max-w-md" />
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="h-24 bg-muted rounded-2xl" />
        <div className="h-44 bg-muted rounded-2xl" />
      </div>
    </div>
  </Layout>
)

const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [segment, setSegment] = useState<string>('all')
  const [purchased, setPurchased] = useState<Bot[]>([])
  const [liked, setLiked] = useState<Bot[]>([])
  const [created, setCreated] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Simulated updates state: botId -> status
  const [updatesState, setUpdatesState] = useState<Record<string, 'idle' | 'updating' | 'updated'>>({})

  const loadLibraryData = () => {
    setLoading(true)
    setError(null)
    Promise.all([
      fetchMyPurchasedBots({ limit: 100 }),
      fetchMyLikedBots({ limit: 100 }),
      fetchMyCreatedBots({ limit: 100 })
    ])
      .then(([purchasedRes, likedRes, createdRes]) => {
        setPurchased(purchasedRes.bots.map(mapBackendBotToFrontendBot))
        setLiked(likedRes.bots.map(mapBackendBotToFrontendBot))
        setCreated(createdRes.bots.map(mapBackendBotToFrontendBot))
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Failed to retrieve library data.')
        setLoading(false)
      })
  }

  useEffect(() => {
    loadLibraryData()
  }, [])

  // Deduplicate bots by their ID when combining
  const getDeduplicatedList = (list1: Bot[], list2: Bot[], list3: Bot[]) => {
    const map = new Map<string, Bot>()
    list3.forEach(b => map.set(b.id, b))
    list2.forEach(b => map.set(b.id, b))
    list1.forEach(b => map.set(b.id, b))
    return Array.from(map.values())
  }
  const all = getDeduplicatedList(purchased, created, liked)

  const showCreatedTab = user?.role === 'creator' || user?.role === 'admin' || created.length > 0

  const segments = [
    { id: 'all', label: 'All', count: all.length },
    { id: 'purchased', label: 'Purchased', count: purchased.length },
    { id: 'liked', label: 'Liked', count: liked.length },
    ...(showCreatedTab ? [{ id: 'created', label: 'Created', count: created.length }] : [])
  ]

  const list =
    segment === 'purchased' ? purchased :
    segment === 'liked' ? liked :
    segment === 'created' ? created : all

  const handleUpdate = (botId: string) => {
    setUpdatesState(prev => ({ ...prev, [botId]: 'updating' }))
    setTimeout(() => {
      setUpdatesState(prev => ({ ...prev, [botId]: 'updated' }))
    }, 2000)
  }

  if (loading) {
    return <LibrarySkeleton />
  }

  if (error) {
    return (
      <Layout title="Library">
        <div className="bg-card border border-border/30 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-sm my-10 animate-fade">
          <RefreshCw size={32} className="mx-auto mb-3 text-destructive animate-spin-slow" />
          <p className="ios-subhead font-bold text-foreground">Error loading Library</p>
          <p className="ios-footnote mt-1 mb-4 text-label-tertiary">{error}</p>
          <button
            onClick={loadLibraryData}
            className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-md cursor-pointer"
          >
            Retry
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Library">
      <div className="pb-10 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 lg:items-start animate-in">
        
        {/* Main Column */}
        <div className="space-y-6">
          
          {/* ── Premium User Banner ── */}
          <div className="relative overflow-hidden bg-card border border-border/40 rounded-3xl p-6 shadow-sm group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-transparent pointer-events-none" />
            
            <div className="relative flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={user?.avatar}
                    alt=""
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-primary/20 shadow-md"
                  />
                  {user?.role === 'creator' && (
                    <span className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full shadow-md">
                      <Sparkles size={12} />
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                      {user?.name || 'Guest User'}
                    </h2>
                    
                    {/* Role Badge */}
                    <span className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider",
                      user?.role === 'admin' && "bg-destructive/10 text-destructive",
                      user?.role === 'creator' && "bg-primary/10 text-primary",
                      user?.role === 'user' && "bg-label-tertiary/10 text-label-tertiary"
                    )}>
                      {user?.role === 'admin' && <Shield size={10} />}
                      {user?.role === 'creator' && <Sparkles size={10} />}
                      {user?.role === 'user' && <UserIcon size={10} />}
                      {user?.role || 'user'}
                    </span>
                  </div>
                  <p className="text-[13px] sm:text-[14px] text-label-tertiary font-medium mt-0.5">
                    {user?.email}
                  </p>
                </div>
              </div>
              
              <Link
                to="/settings"
                className="flex items-center justify-center gap-1.5 self-start sm:self-center px-4 py-2 border border-border/60 hover:bg-muted/40 rounded-xl text-[13px] font-bold text-label-secondary transition-all active:scale-95"
              >
                <Settings size={15} />
                Edit Settings
              </Link>
            </div>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-border/20 text-center">
              <div className="space-y-0.5">
                <p className="text-2xl font-black text-foreground leading-none">{purchased.length}</p>
                <p className="text-[11px] font-bold text-label-tertiary uppercase tracking-wider">Purchased</p>
              </div>
              <div className="space-y-0.5 border-x border-border/10">
                <p className="text-2xl font-black text-foreground leading-none">{liked.length}</p>
                <p className="text-[11px] font-bold text-label-tertiary uppercase tracking-wider">Liked</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl font-black text-foreground leading-none">{created.length}</p>
                <p className="text-[11px] font-bold text-label-tertiary uppercase tracking-wider">Created</p>
              </div>
            </div>
          </div>

          {/* ── Purchases & Analytics Hub Card ── */}
          <div className="bg-card border border-border/40 hover:border-primary/30 rounded-3xl p-4 sm:p-5 shadow-sm transition-all duration-300 group hover:scale-[1.01]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <ShoppingBag size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-[14px] sm:text-[15px] font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                    Purchases & Spending Analytics
                  </h3>
                  <p className="text-[11px] sm:text-[12px] text-label-tertiary font-medium">
                    {user?.role === 'admin' 
                      ? 'View personal expenses and marketplace admin logs' 
                      : 'View personal expense trends and chatbot receipts'}
                  </p>
                </div>
              </div>
              
              <Link
                to="/purchases-analytics"
                className="flex items-center justify-center gap-1 px-3.5 py-1.5 bg-primary text-white text-[12px] font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                Open Hub
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* ── Segment Controller ── */}
          <div className="flex p-1 bg-fill-secondary/15 rounded-[12px] border border-border/20 shadow-inner overflow-x-auto hide-scrollbar max-w-xl">
            {segments.map((s) => (
              <button
                key={s.id}
                onClick={() => setSegment(s.id)}
                className={cn(
                  'flex-1 min-w-[70px] py-2 rounded-[10px] text-[13px] sm:text-[14px] font-bold capitalize transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap',
                  segment === s.id
                    ? 'bg-card text-foreground shadow-sm border border-border/30'
                    : 'text-label-secondary hover:text-foreground'
                )}
              >
                {s.label}
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                  segment === s.id
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-label-tertiary'
                )}>
                  {s.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── Bot List ── */}
          {list.length > 0 ? (
            <div className="ios-grouped mb-8 border border-border/30 shadow-sm animate-fade">
              {list.map((bot, i) => {
                const isPurchased = user?.purchasedBots?.includes(bot.id)
                const isCreated = bot.creatorId === user?.id
                const isFree = bot.price === 0
                const canChatDirectly = isPurchased || isCreated || isFree

                return (
                  <div key={bot.id} className="group">
                    <div className="flex items-center justify-between gap-4 p-4 hover:bg-muted/40 transition-colors">
                      <Link to={`/bot/${bot.id}`} className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className="transition-transform duration-300 group-hover:scale-105">
                          <AppIcon src={bot.iconImage ?? bot.image} alt={bot.name} size="md" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="ios-headline truncate group-hover:text-primary transition-colors duration-200">
                              {bot.name}
                            </p>
                            {bot.rating > 0 && (
                              <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                ★ {bot.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <p className="ios-footnote truncate mt-0.5">By {bot.creator}</p>
                          <span className="text-[10px] font-semibold text-label-tertiary bg-muted px-2 py-0.5 rounded-full border border-border/30 uppercase tracking-wider mt-1.5 inline-block">
                            {bot.category}
                          </span>
                        </div>
                      </Link>

                      <div className="flex-shrink-0">
                        {canChatDirectly ? (
                          <button
                            onClick={() => navigate(`/chat/${bot.id}`)}
                            className="ios-get-btn ios-get-btn-filled text-[12px] min-w-[72px] h-[28px] cursor-pointer"
                          >
                            CHAT
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/bot/${bot.id}`)}
                            className="ios-get-btn text-[12px] min-w-[72px] h-[28px] cursor-pointer"
                          >
                            {bot.price === 0 ? 'FREE' : `$${bot.price.toFixed(2)}`}
                          </button>
                        )}
                      </div>
                    </div>
                    {i < list.length - 1 && <div className="ios-separator" />}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-card border border-border/30 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm animate-fade my-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <LayoutGrid size={28} className="text-primary animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {segment === 'purchased' ? 'No Purchased Bots' : segment === 'liked' ? 'Liked Bots list is Empty' : segment === 'created' ? 'No Created Bots' : 'Your Library is Empty'}
              </h3>
              <p className="text-label-tertiary text-[14px] max-w-sm mx-auto mb-6 leading-relaxed">
                {segment === 'purchased' 
                  ? "Bots you purchase from the store will appear here for easy access." 
                  : segment === 'liked' 
                    ? "Tap the heart icon on any bot in the marketplace to add it to your Liked list." 
                    : segment === 'created'
                      ? "Start building your own custom AI chatbots using our Bot Studio."
                      : "Explore the marketplace, discover new assistants, or create your own."}
              </p>
              <Link
                to={segment === 'created' ? '/studio' : '/bots'}
                className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-md text-[14px]"
              >
                {segment === 'created' ? 'Go to Bot Studio' : 'Browse Bots'}
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 mt-8 lg:mt-0">
          
          {/* Bot Cloud */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary to-[#5ac8fa] text-white shadow-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/[0.05] pointer-events-none" />
            <div className="relative flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cloud size={20} className="animate-float" />
                <span className="font-semibold text-[15px]">Bot Cloud Sync</span>
              </div>
              <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <p className="text-[13px] text-white/85 leading-relaxed">
              All your purchased assistants and chat configurations sync instantly across your devices.
            </p>
          </div>

          {/* Available Updates */}
          <div className="animate-in" style={{ animationDelay: '150ms' }}>
            <h2 className="ios-title-3 mb-3 flex items-center gap-1.5">
              Updates
              <span className="text-[11px] font-bold text-white bg-primary px-2 py-0.5 rounded-full">
                {purchased.filter(b => updatesState[b.id] !== 'updated').length}
              </span>
            </h2>
            <div className="ios-grouped border border-border/30 shadow-sm p-1.5 space-y-1">
              {purchased.length > 0 ? (
                purchased.slice(0, 2).map((bot, i) => {
                  const state = updatesState[bot.id] || 'idle'
                  return (
                    <div key={bot.id}>
                      <div className="flex items-center gap-3 p-3">
                        <AppIcon src={bot.iconImage ?? bot.image} alt={bot.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="ios-headline text-[14px] truncate">{bot.name}</p>
                          <p className="ios-footnote mt-0.5">
                            {state === 'updated' ? 'Up to date' : 'v2.1.0 available'}
                          </p>
                        </div>
                        <button
                          disabled={state !== 'idle'}
                          onClick={() => handleUpdate(bot.id)}
                          className={cn(
                            'text-[12px] font-bold min-w-[76px] h-[26px] rounded-full transition-all duration-200 flex items-center justify-center gap-1',
                            state === 'idle' && 'bg-primary/10 text-primary hover:bg-primary/15 cursor-pointer',
                            state === 'updating' && 'bg-muted text-label-tertiary cursor-not-allowed',
                            state === 'updated' && 'bg-success/10 text-success cursor-default'
                          )}
                        >
                          {state === 'idle' && 'UPDATE'}
                          {state === 'updating' && (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              ...
                            </>
                          )}
                          {state === 'updated' && (
                            <>
                              <CheckCircle2 size={12} />
                              DONE
                            </>
                          )}
                        </button>
                      </div>
                      {i < Math.min(purchased.length, 2) - 1 && <div className="ios-separator !ml-[68px]" />}
                    </div>
                  )
                })
              ) : (
                <div className="p-6 text-center text-label-tertiary">
                  <CheckCircle2 size={24} className="mx-auto mb-1.5 text-success/70" />
                  <p className="text-[13px] font-semibold text-foreground">All bots up to date</p>
                  <p className="text-[11px] mt-0.5">No updates pending</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  )
}

export default ProfilePage
