import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AppShell, { PageContainer } from '../components/AppShell'
import AppIcon from '../components/ios/AppIcon'
import AppListRow from '../components/ios/AppListRow'
import Button from '../components/ui/Button'
import { Bot, BotDetails } from '../data/bots'
import { cn, formatDownloads, formatPrice } from '../lib/utils'
import { ArrowLeft, Star, Share2, Sparkles, Cloud, Shield, MessageSquare, CheckCircle2, RefreshCw, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  fetchBotDetail,
  fetchBotRatings,
  submitBotRating,
  fetchBotsList,
  mapBackendBotToFrontendBotDetails,
  mapBackendBotToFrontendBot,
  purchaseBotRequest,
  likeBotRequest,
  unlikeBotRequest,
  createPurchase
} from '../lib/api'

const DetailPageSkeleton: React.FC = () => (
  <AppShell showMobileTabBar={false}>
    <header className="glass sticky top-0 z-40 border-b border-border/40">
      <PageContainer className="flex items-center justify-between py-3.5">
        <div className="w-16 h-5 bg-muted rounded-full animate-pulse" />
        <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
      </PageContainer>
    </header>
    <div className="flex-1 pb-20 pt-6 animate-pulse">
      <PageContainer className="max-w-5xl">
        <div className="flex flex-row gap-4 sm:gap-6 items-start pb-8 border-b border-border/40">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-muted flex-shrink-0" />
          <div className="flex-1 space-y-3 mt-1">
            <div className="h-4 bg-muted rounded-full w-24" />
            <div className="h-8 bg-muted rounded-full w-48 sm:w-64" />
            <div className="h-4 bg-muted rounded-full w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-card rounded-2xl p-4 border border-border/30 h-20" />
          ))}
        </div>
        <div className="space-y-6">
          <div className="h-6 bg-muted rounded-full w-32 mb-4" />
          <div className="flex gap-4 overflow-x-auto hide-scrollbar">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-[320px] w-[180px] sm:w-[220px] rounded-2xl bg-muted flex-shrink-0" />
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  </AppShell>
)

const BotDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated, updateUser } = useAuth()

  const [bot, setBot] = useState<BotDetails | null>(null)
  const [related, setRelated] = useState<Bot[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Review states
  const [userRating, setUserRating] = useState<number>(0)
  const [userReview, setUserReview] = useState<string>('')
  const [submittingRating, setSubmittingRating] = useState<boolean>(false)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Purchase states
  const [purchasing, setPurchasing] = useState<boolean>(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  
  // Payment drawer modal states
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay'>('card')

  // Like states
  const [togglingLike, setTogglingLike] = useState<boolean>(false)

  const isLiked = user && bot && user.likedBots?.includes(bot.id)

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!bot || togglingLike) return

    setTogglingLike(true)
    try {
      if (isLiked) {
        const res = await unlikeBotRequest(bot.id)
        if (user) {
          const updatedLiked = (user.likedBots || []).filter(id => id !== bot.id)
          updateUser({ likedBots: updatedLiked })
        }
        setBot(prev => prev ? { ...prev, likeCount: res.likeCount } : null)
      } else {
        const res = await likeBotRequest(bot.id)
        if (user) {
          const updatedLiked = [...(user.likedBots || []), bot.id]
          updateUser({ likedBots: updatedLiked })
        }
        setBot(prev => prev ? { ...prev, likeCount: res.likeCount } : null)
      }
    } catch (err) {
      console.error('Error toggling like:', err)
    } finally {
      setTogglingLike(false)
    }
  }

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!bot) return

    if (bot.price > 0) {
      setShowPaymentModal(true)
    } else {
      setPurchasing(true)
      setPurchaseError(null)
      try {
        await createPurchase({ botId: bot.id, amount: 0, paymentMethod: 'free' })
        setPurchaseSuccess(true)
        if (user) {
          const updatedPurchased = [...(user.purchasedBots || []), bot.id]
          updateUser({ purchasedBots: updatedPurchased })
        }
        setBot(prev => prev ? { ...prev, isPurchased: true } : null)
        setTimeout(() => setPurchaseSuccess(false), 3000)
      } catch (err: any) {
        console.error(err)
        setPurchaseError(err.message || 'Purchase failed.')
      } finally {
        setPurchasing(false)
      }
    }
  }

  const executePayment = async () => {
    if (!bot) return
    setPurchasing(true)
    setPurchaseError(null)
    try {
      const mockReceiptId = `rec_${Math.random().toString(36).substring(2, 11)}`
      const mockPaymentIntentId = `pi_${Math.random().toString(36).substring(2, 15)}`
      const mockSessionId = `cs_${Math.random().toString(36).substring(2, 15)}`

      const payload = {
        botId: bot.id,
        amount: bot.price,
        currency: 'usd',
        paymentMethod: selectedPaymentMethod,
        stripePaymentIntentId: mockPaymentIntentId,
        stripeSessionId: mockSessionId,
        stripeCustomerId: 'cus_demo123',
        receiptUrl: `https://stripe.com/receipts/${mockReceiptId}`
      }

      await createPurchase(payload)
      setPurchaseSuccess(true)
      setShowPaymentModal(false)

      if (user) {
        const updatedPurchased = [...(user.purchasedBots || []), bot.id]
        updateUser({ purchasedBots: updatedPurchased })
      }

      setBot(prev => prev ? { ...prev, isPurchased: true } : null)
      setTimeout(() => setPurchaseSuccess(false), 3000)
    } catch (err: any) {
      console.error(err)
      setPurchaseError(err.message || 'Payment failed. Please check details and try again.')
    } finally {
      setPurchasing(false)
    }
  }

  const isCreator = user && bot && String(user.id) === String(bot.creatorId)
  const isPurchased = bot?.isPurchased || (user && bot && user.purchasedBots?.includes(bot.id))
  const canChat = bot && (bot.price === 0 || isCreator || isPurchased)

  const loadBotData = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [botRes, ratingsRes] = await Promise.all([
        fetchBotDetail(id),
        fetchBotRatings(id, { limit: 50 })
      ])

      const details = mapBackendBotToFrontendBotDetails(botRes.bot, ratingsRes.ratings)
      setBot(details)

      // Retrieve related bots
      try {
        const relatedRes = await fetchBotsList({ category: botRes.bot.category, limit: 5 })
        const filteredRelated = relatedRes.bots
          .filter((b) => b.id !== id)
          .map(mapBackendBotToFrontendBot)
          .slice(0, 3)
        setRelated(filteredRelated)
      } catch (relErr) {
        console.error('Error fetching related bots:', relErr)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to retrieve bot detail.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBotData()
  }, [id])

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || userRating === 0) return

    setSubmittingRating(true)
    setSubmitError(null)
    try {
      await submitBotRating(id, { rating: userRating, review: userReview })
      setSubmitSuccess(true)
      setUserReview('')
      setUserRating(0)

      // Re-fetch bot data silently to update ratings average and testimonial list
      const [botRes, ratingsRes] = await Promise.all([
        fetchBotDetail(id),
        fetchBotRatings(id, { limit: 50 })
      ])
      const details = mapBackendBotToFrontendBotDetails(botRes.bot, ratingsRes.ratings)
      setBot(details)

      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (err: any) {
      console.error(err)
      setSubmitError(err.message || 'Could not submit rating.')
    } finally {
      setSubmittingRating(false)
    }
  }

  if (loading) {
    return <DetailPageSkeleton />
  }

  if (error || !bot) {
    return (
      <AppShell showMobileTabBar={false}>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-6 text-center animate-fade">
          <RefreshCw className="text-destructive mb-3 w-10 h-10 animate-spin-slow" />
          <p className="ios-subhead font-bold text-foreground">Error loading bot details</p>
          <p className="ios-footnote mt-1 text-label-tertiary">{error || 'Bot not found'}</p>
          <div className="flex gap-4 mt-6">
            <button onClick={() => navigate(-1)} className="text-primary font-semibold">
              Go Back
            </button>
            <button onClick={loadBotData} className="text-primary font-semibold border-l border-border/50 pl-4">
              Retry
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell showMobileTabBar={false}>
      <div className="h-[env(safe-area-inset-top,0px)] lg:h-0" />

      {/* ── Sticky Top Navbar ── */}
      <header className="glass sticky top-0 z-40 border-b border-border/40">
        <PageContainer className="flex items-center justify-between py-3.5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-primary active:opacity-60 font-semibold transition-opacity cursor-pointer"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
            <span className="text-[16px]">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLikeToggle}
              disabled={togglingLike}
              className="flex items-center gap-1.5 p-2 text-primary active:opacity-60 transition-all cursor-pointer hover:scale-110"
              aria-label={isLiked ? "Unlike Bot" : "Like Bot"}
            >
              <Heart 
                size={20} 
                className={cn(
                  isLiked ? "fill-destructive text-destructive" : "text-primary"
                )} 
              />
              <span className="text-[14px] font-bold text-label-secondary">
                {(bot.likeCount ?? 0).toLocaleString()}
              </span>
            </button>
            <button className="p-2 text-primary active:opacity-60 transition-opacity cursor-pointer" aria-label="Share">
              <Share2 size={20} />
            </button>
          </div>
        </PageContainer>
      </header>

      <div className="flex-1 pb-20 pt-6">
        <PageContainer className="max-w-5xl">
          
          {/* ── App Top Header Block ── */}
          <div className="flex flex-row gap-4 sm:gap-6 items-start pb-8 border-b border-border/40 animate-fade">
            {/* Responsive App Icon */}
            <div className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
              <AppIcon 
                src={bot.iconImage ?? bot.image} 
                alt={bot.name} 
                size="lg" 
                className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl shadow-md border border-border/20"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="section-badge">{bot.category}</span>
                {bot.editorsChoice && (
                  <span className="text-[10px] font-bold text-accent bg-accent/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Editor&apos;s Pick
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-1">
                {bot.name}
              </h1>
              
              <p className="text-[14px] sm:text-[16px] font-semibold text-primary mb-1">
                By {bot.creator}
              </p>
              
              <p className="text-[13px] sm:text-[14px] text-label-tertiary font-medium line-clamp-2 sm:line-clamp-none leading-relaxed">
                {bot.subtitle}
              </p>
              
              {/* Primary Call-To-Action Button Row */}
              <div className="flex flex-wrap items-center gap-3 mt-5">
                {canChat ? (
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/chat/${id}`)}
                    className="shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:scale-105 active:scale-95 transition-all duration-200 px-6 py-2.5 h-auto text-[15px] font-bold"
                  >
                    <MessageSquare size={16} className="mr-1.5" />
                    Chat Now
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/chat/${id}`)}
                      className="hover:scale-105 active:scale-95 transition-all duration-200 px-6 py-2.5 h-auto text-[15px] font-bold"
                    >
                      <MessageSquare size={16} className="mr-1.5" />
                      Try Bot
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handlePurchase}
                      disabled={purchasing || purchaseSuccess}
                      className="shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:scale-105 active:scale-95 transition-all duration-200 px-6 py-2.5 h-auto text-[15px] font-bold bg-accent hover:bg-accent/90"
                    >
                      <Sparkles size={16} className="mr-1.5 animate-pulse" />
                      {purchasing ? 'Processing...' : purchaseSuccess ? 'Purchased!' : `Buy for $${bot.price.toFixed(2)}`}
                    </Button>
                  </>
                )}
                {!isPurchased && (
                  <span className="text-[14px] font-bold text-label-secondary bg-muted px-4 py-2.5 rounded-full border border-border/40">
                    {bot.price === 0 ? 'FREE' : `$${bot.price.toFixed(2)}`}
                  </span>
                )}
              </div>
              
              {bot.preview && !bot.preview.hasUnlimitedAccess && (
                <div className="mt-3.5 flex items-center gap-1.5 text-[13px] font-semibold text-label-secondary bg-muted/40 px-3.5 py-1.5 rounded-xl border border-border/20 w-fit">
                  <Sparkles size={14} className="text-accent animate-pulse" />
                  <span>
                    Free trial: {bot.preview.previewQueriesRemaining !== null ? bot.preview.previewQueriesRemaining : (bot.preview.previewQueriesLimit - bot.preview.previewQueriesUsed)} / {bot.preview.previewQueriesLimit} queries left
                  </span>
                </div>
              )}

              {bot.preview && !bot.preview.hasUnlimitedAccess && bot.preview.previewQueriesRemaining === 0 && (
                <p className="text-[12px] font-bold text-destructive mt-2 animate-fade">
                  Free preview limit reached. Purchase this bot to continue chatting.
                </p>
              )}
              
              {purchaseError && (
                <p className="text-[12px] font-semibold text-destructive mt-2 animate-fade">
                  {purchaseError}
                </p>
              )}
            </div>
          </div>

          {/* ── Key Metrics dashboard ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8 animate-in" style={{ animationDelay: '100ms' }}>
            {[
              { 
                label: 'Rating', 
                value: bot.rating > 0 ? `${bot.rating.toFixed(1)} ★` : 'New', 
                subtext: `${bot.reviews.toLocaleString()} reviews`,
                color: 'text-amber-500' 
              },
              { 
                label: 'AI Model', 
                value: bot.aiModel || 'Standard', 
                subtext: 'LLM Engine',
                color: 'text-foreground' 
              },
              { 
                label: 'Category', 
                value: bot.category, 
                subtext: 'Store Category',
                color: 'text-primary' 
              },
              { 
                label: 'Popularity', 
                value: formatDownloads(bot.downloads), 
                subtext: 'Active sessions',
                color: 'text-foreground' 
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-2xl p-4 border border-border/30 shadow-sm text-center flex flex-col justify-center">
                <p className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider mb-1">{stat.label}</p>
                <p className={cn("text-[18px] sm:text-[20px] font-black leading-none", stat.color)}>{stat.value}</p>
                <p className="text-[11px] text-label-tertiary font-medium mt-1">{stat.subtext}</p>
              </div>
            ))}
          </div>

          {/* ── Layout Split: Left main, Right sidebar specs ── */}
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 xl:gap-12 items-start">
            
            {/* Left Content Area */}
            <div className="space-y-10 min-w-0">
              
              {/* Description */}
              <section className="animate-in" style={{ animationDelay: '150ms' }}>
                <h2 className="text-[18px] sm:text-[20px] font-bold text-foreground mb-3">Description</h2>
                <p className="text-[15px] text-label-secondary leading-relaxed whitespace-pre-line">
                  {bot.longDescription}
                </p>
              </section>

              {/* Tags Section */}
              {bot.tags && bot.tags.length > 0 && (
                <section className="animate-in" style={{ animationDelay: '200ms' }}>
                  <h2 className="text-[18px] sm:text-[20px] font-bold text-foreground mb-4">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {bot.tags.map((tag) => (
                      <span key={tag} className="bg-muted text-label-secondary border border-border/40 px-3.5 py-1.5 rounded-full text-[13px] font-semibold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Reviews Section */}
              <section className="animate-in space-y-6" style={{ animationDelay: '300ms' }}>
                <h2 className="text-[18px] sm:text-[20px] font-bold text-foreground">Ratings & Reviews</h2>
                
                <div className="flex gap-6 items-center">
                  <span className="text-[52px] sm:text-[60px] font-extrabold leading-none tracking-tight text-foreground">
                    {bot.rating > 0 ? bot.rating.toFixed(1) : '0.0'}
                  </span>
                  <div>
                    <div className="flex gap-0.5 mb-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={15}
                          className={cn(
                            i <= Math.round(bot.rating)
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-fill-secondary/40'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-[12px] text-label-tertiary font-bold">
                      {bot.reviews.toLocaleString()} global ratings
                    </p>
                  </div>
                </div>

                {/* ── Rating & Review Form ── */}
                {isAuthenticated ? (
                  <div className="bg-card rounded-2xl border border-border/30 p-5 shadow-sm">
                    <h3 className="text-[15px] font-bold text-foreground mb-3">Write a Review</h3>
                    {submitSuccess ? (
                      <div className="text-center py-4 flex flex-col items-center">
                        <CheckCircle2 size={36} className="text-success mb-2 animate-bounce" />
                        <p className="ios-subhead font-bold text-foreground">Review submitted!</p>
                        <p className="ios-caption text-label-tertiary mt-1">Thank you for sharing your feedback.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleRatingSubmit} className="space-y-4">
                        {submitError && (
                          <div className="text-[13px] text-destructive font-semibold bg-destructive/10 px-3 py-2 rounded-lg">
                            {submitError}
                          </div>
                        )}
                        <div className="flex items-center gap-2.5">
                          <span className="text-[14px] font-semibold text-label-secondary">Your Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                type="button"
                                key={s}
                                onClick={() => setUserRating(s)}
                                className="focus:outline-none transition-transform active:scale-125 cursor-pointer"
                              >
                                <Star
                                  size={22}
                                  className={cn(
                                    s <= userRating
                                      ? 'fill-amber-500 text-amber-500'
                                      : 'text-label-tertiary/35 hover:text-amber-400'
                                  )}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <textarea
                            placeholder="Write your review here (optional)..."
                            value={userReview}
                            onChange={(e) => setUserReview(e.target.value)}
                            className="w-full bg-muted/50 border border-border/40 rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-label-tertiary outline-none focus:border-primary/40 focus:bg-card transition-all min-h-[80px] resize-none"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={submittingRating || userRating === 0}
                            className="px-4 py-2 h-auto text-[13px] font-bold shadow-md shadow-primary/20"
                          >
                            {submittingRating ? 'Submitting...' : 'Submit Review'}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="bg-card rounded-2xl border border-border/30 p-5 shadow-sm text-center">
                    <p className="text-[14px] text-label-secondary font-medium mb-3">
                      Have you used this assistant? Sign in to write a review.
                    </p>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-5 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-md text-[13px]"
                    >
                      Sign In to Review
                    </Link>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  {bot.testimonials.length > 0 ? (
                    bot.testimonials.map((t, i) => (
                      <div key={i} className="bg-card rounded-2xl border border-border/30 p-5 shadow-sm flex flex-col justify-between">
                        <p className="text-[14px] text-label-secondary leading-relaxed italic mb-4">
                          &ldquo;{t.text}&rdquo;
                        </p>
                        <div className="flex justify-between items-center border-t border-border/20 pt-3">
                          <span className="text-[13px] font-bold text-foreground">{t.author}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={10}
                                className={cn(
                                  s <= t.rating ? 'fill-amber-500 text-amber-500' : 'text-fill-secondary/20'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center bg-muted/30 border border-border/20 rounded-xl">
                      <p className="text-[13px] text-label-tertiary">No reviews yet. Be the first to review!</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Related bots */}
              {related.length > 0 && (
                <section className="animate-in" style={{ animationDelay: '350ms' }}>
                  <h2 className="text-[18px] sm:text-[20px] font-bold text-foreground mb-4">You Might Also Like</h2>
                  <div className="bg-card rounded-2xl border border-border/30 overflow-hidden shadow-sm">
                    {related.map((b, i) => (
                      <div key={b.id}>
                        <AppListRow bot={b} showChevron={false} />
                        {i < related.length - 1 && <div className="ios-separator" />}
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>

            {/* Right Sidebar specs (hidden on mobile, sticky on desktop) */}
            <aside className="hidden lg:block space-y-6 lg:sticky lg:top-24 animate-in" style={{ animationDelay: '150ms' }}>
              <div className="bg-card rounded-2xl border border-border/30 p-5 shadow-sm space-y-5">
                <h3 className="text-[16px] font-bold text-foreground">Specifications</h3>
                
                <div className="space-y-4">
                  {[
                    { label: 'Provider', value: bot.creator },
                    { label: 'Category', value: bot.category },
                    { label: 'AI Model', value: bot.aiModel || 'Standard' },
                    { label: 'Released', value: bot.createdAt ? new Date(bot.createdAt).toLocaleDateString() : 'N/A' },
                  ].map((spec) => (
                    <div key={spec.label} className="flex justify-between items-center text-[13px]">
                      <span className="text-label-tertiary font-semibold">{spec.label}</span>
                      <span className="text-foreground font-bold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border/30 p-5 shadow-sm flex flex-col items-center text-center">
                <Shield size={28} className="text-primary mb-2" />
                <h4 className="text-[14px] font-bold text-foreground">Secure Integration</h4>
                <p className="text-[11px] text-label-tertiary mt-1">
                  This bot is verified for safety, content guidelines, and strict API transmission protocols.
                </p>
              </div>
            </aside>

          </div>

          {/* Footer branding details */}
          <div className="flex items-center justify-center gap-6 py-8 text-label-tertiary/75 border-t border-border/40 mt-12">
            <div className="flex items-center gap-1.5 text-[12px] font-bold">
              <Cloud size={16} className="text-primary" />
              <span>Universal Cloud Sync</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-bold">
              <Shield size={16} className="text-accent" />
              <span>Verified Safety Protocols</span>
            </div>
          </div>

        </PageContainer>
      </div>

      {/* ── Payment Sheet Drawer Modal ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border/30 overflow-hidden shadow-2xl animate-in">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border/10 flex justify-between items-center bg-muted/30">
              <h3 className="text-[17px] font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
                <Sparkles size={16} className="text-primary animate-pulse" />
                Secure Checkout
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-label-tertiary hover:text-foreground font-bold text-sm cursor-pointer p-1 active:scale-90"
              >
                Cancel
              </button>
            </div>

            {/* Bot Summary Row */}
            <div className="p-6 border-b border-border/10 flex gap-4 items-center bg-card">
              <AppIcon src={bot.iconImage ?? bot.image} alt={bot.name} size="md" className="rounded-xl flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-black text-foreground truncate">{bot.name}</p>
                <p className="text-[11px] text-label-secondary font-semibold capitalize mt-0.5">{bot.category}</p>
              </div>
              <div className="ml-auto text-right flex-shrink-0">
                <p className="text-[16px] font-black text-primary">${bot.price.toFixed(2)}</p>
                <p className="text-[9px] text-label-tertiary font-bold uppercase tracking-wider">usd</p>
              </div>
            </div>

            {/* Payment Options */}
            <div className="p-6 space-y-4">
              <p className="text-[11px] font-bold text-label-tertiary uppercase tracking-wider">Select Payment Method</p>
              
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'card', name: 'Credit Card', icon: '💳' },
                  { id: 'apple_pay', name: 'Apple Pay', icon: ' Pay' },
                  { id: 'google_pay', name: 'Google Pay', icon: 'G Pay' }
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(method.id as any)}
                    className={cn(
                      "p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center active:scale-95 cursor-pointer",
                      selectedPaymentMethod === method.id
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border/40 hover:bg-muted/40 text-label-secondary"
                    )}
                  >
                    <span className="text-xl font-bold">{method.icon}</span>
                    <span className="text-[11px] font-bold tracking-tight">{method.name}</span>
                  </button>
                ))}
              </div>

              {/* Card Details form (if Card is selected) */}
              {selectedPaymentMethod === 'card' ? (
                <div className="space-y-3 pt-3 border-t border-border/10 animate-fade">
                  <div>
                    <label className="text-[11px] font-bold text-label-tertiary uppercase tracking-wider block mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="•••• •••• •••• ••••"
                      defaultValue="4242 4242 4242 4242"
                      disabled
                      className="w-full bg-muted/40 border border-border/30 rounded-xl px-3.5 py-2.5 text-[13px] text-foreground font-semibold outline-none focus:border-primary/40 focus:bg-card"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-label-tertiary uppercase tracking-wider block mb-1">Expires</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        defaultValue="12/28"
                        disabled
                        className="w-full bg-muted/40 border border-border/30 rounded-xl px-3.5 py-2.5 text-[13px] text-foreground font-semibold outline-none focus:border-primary/40 focus:bg-card"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-label-tertiary uppercase tracking-wider block mb-1">CVC</label>
                      <input
                        type="password"
                        placeholder="•••"
                        defaultValue="123"
                        disabled
                        className="w-full bg-muted/40 border border-border/30 rounded-xl px-3.5 py-2.5 text-[13px] text-foreground font-semibold outline-none focus:border-primary/40 focus:bg-card"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-muted/30 border border-border/20 rounded-2xl text-center space-y-2 py-6 animate-fade">
                  <span className="text-2xl font-bold">{selectedPaymentMethod === 'apple_pay' ? '' : 'G'}</span>
                  <p className="text-[12px] font-bold text-foreground">Fast Checkout Enabled</p>
                  <p className="text-[11px] text-label-tertiary max-w-[200px] mx-auto">Click "Pay" below to authorize transaction using device authentication.</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-muted/10 border-t border-border/10 flex flex-col gap-3">
              <button
                onClick={executePayment}
                disabled={purchasing}
                className="w-full py-3 bg-primary hover:bg-primary/95 disabled:bg-muted text-primary-foreground font-extrabold text-[14px] rounded-2xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                {purchasing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay $${bot.price.toFixed(2)}`
                )}
              </button>
              <p className="text-[10px] text-center text-label-tertiary font-semibold flex items-center justify-center gap-1.5">
                🔒 SSL Encrypted & Verified by Stripe Checkout
              </p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

export default BotDetailPage

