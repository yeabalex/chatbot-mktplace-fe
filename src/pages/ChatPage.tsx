import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Send,
  Trash2,
  Bot,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Sparkles,
} from 'lucide-react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import { botDetails, Bot as FrontendBot } from '../data/bots'
import { cn } from '../lib/utils'
import type { Message } from '../context/ChatContext'
import { fetchBotDetail, mapBackendBotToFrontendBot, purchaseBotRequest } from '../lib/api'
import MarkdownRenderer from '../components/ui/MarkdownRenderer'

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(date)
}

function formatDate(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated, updateUser } = useAuth()
  
  const [bot, setBot] = useState<FrontendBot | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const {
    getConversations,
    getActiveConversation,
    createConversation,
    sendMessage,
    deleteConversation,
    setActiveConversationId,
    activeConversationId,
    loadHistory,
  } = useChat()

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  // Desktop: sidebar inline. Mobile: sidebar is a drawer (overlay).
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Trial / Query limit modal state
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)

  const conversations = getConversations(id ?? '')
  const activeConvo = getActiveConversation(id ?? '')

  // Load bot details
  useEffect(() => {
    if (!id) return
    const localBot = botDetails[id]
    if (localBot) {
      setBot(localBot)
    }

    setLoading(true)
    fetchBotDetail(id)
      .then((res) => {
        setBot(mapBackendBotToFrontendBot(res.bot))
      })
      .catch((err) => {
        console.error('Error loading bot for chat:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  // Create first conversation if none exist
  useEffect(() => {
    if (bot && conversations.length === 0) {
      createConversation(id ?? '', bot.name)
    }
  }, [bot, id, conversations.length])

  // Load chat history dynamically when active conversation changes
  useEffect(() => {
    if (id && activeConvo?.id) {
      loadHistory(id, activeConvo.id)
    }
  }, [id, activeConvo?.id, loadHistory])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConvo?.messages])

  // Typing indicator: show while last message is from user
  useEffect(() => {
    const msgs = activeConvo?.messages ?? []
    const last = msgs[msgs.length - 1]
    setIsTyping(last?.role === 'user')
  }, [activeConvo?.messages])

  // Close mobile drawer on route change / resize
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [activeConversationId])

  const handlePurchase = async () => {
    if (!bot) return
    setPurchasing(true)
    setPurchaseError(null)
    try {
      await purchaseBotRequest(bot.id)
      
      // Update local auth context purchasedBots
      if (user) {
        const updatedPurchased = [...(user.purchasedBots || []), bot.id]
        updateUser({ purchasedBots: updatedPurchased })
      }
      
      // Update local bot details and set access as unlimited
      setBot((prev) => {
        if (!prev) return null
        return {
          ...prev,
          isPurchased: true,
          preview: prev.preview ? {
            ...prev.preview,
            previewQueriesRemaining: null,
            hasUnlimitedAccess: true
          } : undefined
        }
      })
      setShowLimitModal(false)
    } catch (err: any) {
      console.error(err)
      setPurchaseError(err.message || 'Purchase failed. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="ios-subhead">Bot not found</p>
      </div>
    )
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || !activeConvo) return
    setInput('')
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
    try {
      const res = await sendMessage(id ?? '', activeConvo.id, text)
      if (res && res.preview) {
        setBot((prev) => prev ? { ...prev, preview: res.preview } : null)
      }
    } catch (err: any) {
      if (err.code === 'PREVIEW_LIMIT_EXCEEDED') {
        if (err.details) {
          setBot((prev) => prev ? { ...prev, preview: err.details } : null)
        }
        setShowLimitModal(true)
      }
    }
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleNewChat() {
    if (!bot) return
    createConversation(id ?? '', bot.name)
    setMobileSidebarOpen(false)
  }

  // Shared sidebar content — used in both desktop panel and mobile drawer
  const sidebarContent = (
    <>
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={bot.iconImage ?? bot.image}
            alt={bot.name}
            className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
          />
          <span className="text-[15px] font-semibold text-white/90 truncate">{bot.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleNewChat}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="New chat"
          >
            <Plus size={18} />
          </button>
          {/* Close button — mobile only */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
        {conversations.length === 0 && (
          <p className="text-white/30 text-[13px] text-center mt-8 px-4">No conversations yet</p>
        )}
        {conversations.map((convo) => {
          const isActive = convo.id === (activeConversationId ?? conversations[0]?.id)
          return (
            <div
              key={convo.id}
              className={cn(
                'group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
                isActive
                  ? 'bg-white/12 text-white'
                  : 'text-white/50 hover:bg-white/8 hover:text-white/80'
              )}
              onClick={() => {
                setActiveConversationId(convo.id)
                setMobileSidebarOpen(false)
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate leading-tight">
                  {convo.title || 'New chat'}
                </p>
                <p className="text-[11px] text-white/35 mt-0.5">{formatDate(convo.updatedAt)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteConversation(id ?? '', convo.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-white/40 hover:text-red-400 transition-all flex-shrink-0"
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Back to store */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <button
          onClick={() => navigate(`/bot/${id}`)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/8 transition-colors text-[13px]"
        >
          <ArrowLeft size={15} />
          Back to store
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ── Desktop sidebar — inline panel ── */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col bg-sidebar border-r border-white/8 transition-all duration-300 flex-shrink-0 overflow-hidden',
          desktopSidebarOpen ? 'lg:w-[260px]' : 'lg:w-0'
        )}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile sidebar — full-screen drawer overlay ── */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Drawer panel */}
          <aside className="relative flex flex-col bg-sidebar w-[280px] max-w-[85vw] h-full z-10 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ── Main chat area ── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">

        {/* Chat header */}
        <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-card border-b border-border/60 flex-shrink-0">
          {/* Toggle: desktop uses inline panel toggle, mobile opens drawer */}
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) {
                setDesktopSidebarOpen((v) => !v)
              } else {
                setMobileSidebarOpen(true)
              }
            }}
            className="p-1.5 rounded-lg hover:bg-muted text-label-tertiary hover:text-foreground transition-colors flex-shrink-0"
            title="Chat history"
          >
            {desktopSidebarOpen
              ? <PanelLeftClose size={20} className="hidden lg:block" />
              : <PanelLeftOpen size={20} className="hidden lg:block" />
            }
            {/* On mobile always show the open icon */}
            <PanelLeftOpen size={20} className="lg:hidden" />
          </button>

          {/* Mobile back arrow */}
          <button
            onClick={() => navigate(`/bot/${id}`)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-muted text-label-tertiary hover:text-foreground transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>

          <img
            src={bot.iconImage ?? bot.image}
            alt={bot.name}
            className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-semibold text-foreground leading-tight truncate">
                {bot.name}
              </p>
              {bot.preview && !bot.preview.hasUnlimitedAccess && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/15 px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
                  Trial: {bot.preview.previewQueriesRemaining !== null ? bot.preview.previewQueriesRemaining : (bot.preview.previewQueriesLimit - bot.preview.previewQueriesUsed)} / {bot.preview.previewQueriesLimit} left
                </span>
              )}
            </div>
            <p className="text-[12px] text-label-tertiary truncate hidden sm:block">{bot.subtitle}</p>
          </div>

          {/* New chat button — icon only on mobile, icon+label on sm+ */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[13px] font-medium transition-colors flex-shrink-0"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {!activeConvo || activeConvo.messages.length === 0 ? (
            <EmptyState
              botName={bot.name}
              onPrompt={(p) => {
                if (!activeConvo) return
                sendMessage(id ?? '', activeConvo.id, p)
              }}
            />
          ) : (
            <>
              {activeConvo.messages.map((msg, i) => {
                const showDate =
                  i === 0 ||
                  formatDate(msg.timestamp) !== formatDate(activeConvo.messages[i - 1].timestamp)
                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                      <div className="flex items-center gap-3 my-2">
                        <div className="flex-1 h-px bg-border/60" />
                        <span className="text-[11px] text-label-tertiary font-medium px-2">
                          {formatDate(msg.timestamp)}
                        </span>
                        <div className="flex-1 h-px bg-border/60" />
                      </div>
                    )}
                    <MessageBubble msg={msg} botImage={bot.iconImage ?? bot.image} />
                  </React.Fragment>
                )
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <img
                    src={bot.iconImage ?? bot.image}
                    alt=""
                    className="w-7 h-7 rounded-lg object-cover flex-shrink-0 mb-1"
                  />
                  <div className="bg-card border border-border/60 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-label-tertiary rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-label-tertiary rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-label-tertiary rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input bar */}
        <div className="px-3 sm:px-4 py-3 bg-card border-t border-border/60 flex-shrink-0">
          <div className="flex items-end gap-2 bg-background rounded-2xl border border-border/80 px-3 sm:px-4 py-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${bot.name}…`}
              rows={1}
              className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-label-tertiary resize-none outline-none leading-relaxed py-1.5 min-h-[28px] max-h-[120px]"
              style={{ fontFamily: 'var(--font-sans)' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all mb-0.5',
                input.trim()
                  ? 'bg-primary text-white hover:bg-primary/90 active:scale-95'
                  : 'bg-muted text-label-tertiary cursor-not-allowed'
              )}
            >
              <Send size={15} strokeWidth={2.5} />
            </button>
          </div>
          {/* Hint — hidden on very small screens to save space */}
          <p className="hidden sm:block text-[11px] text-label-tertiary text-center mt-2">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* ── Limit Reached Modal ── */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setShowLimitModal(false)}
          />
          {/* Content panel */}
          <div className="relative w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowLimitModal(false)}
              className="absolute top-4 right-4 p-2 text-label-tertiary hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-accent animate-pulse" />
            </div>

            <h3 className="text-xl font-extrabold text-foreground tracking-tight mb-2">
              Preview Limit Reached
            </h3>
            
            <p className="text-[14px] text-label-secondary leading-relaxed mb-6">
              You have used all {bot.preview?.previewQueriesLimit || 3} free preview queries for <strong className="text-foreground">{bot.name}</strong>. Purchase this assistant to continue chatting without limits.
            </p>

            {purchaseError && (
              <p className="text-[12px] font-semibold text-destructive mb-4 bg-destructive/10 px-3 py-1.5 rounded-lg w-full">
                {purchaseError}
              </p>
            )}

            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/35 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-[14px]"
              >
                <Sparkles size={16} />
                {purchasing ? 'Processing...' : `Buy Lifetime Access for $${bot.price?.toFixed(2) || '0.00'}`}
              </button>
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full bg-muted hover:bg-muted/80 text-label-secondary font-semibold py-3 px-4 rounded-xl active:scale-[0.98] transition-all cursor-pointer text-[14px]"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Message bubble ──────────────────────────────────────────────────────────
function MessageBubble({ msg, botImage }: { msg: Message; botImage: string }) {
  const isUser = msg.role === 'user'
  return (
    <div className={cn('flex items-end gap-2', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      {isUser ? (
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mb-1">
          <User size={13} className="text-primary" />
        </div>
      ) : (
        <img
          src={botImage}
          alt=""
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover flex-shrink-0 mb-1"
        />
      )}

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[78%] sm:max-w-[65%] lg:max-w-[55%] px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm',
          isUser
            ? 'bg-primary text-white rounded-2xl rounded-br-sm'
            : 'bg-card border border-border/60 text-foreground rounded-2xl rounded-bl-sm'
        )}
      >
        <div className="text-[14px] sm:text-[15px] leading-relaxed break-words">
          <MarkdownRenderer text={msg.text} />
        </div>
        <p
          className={cn(
            'text-[10px] sm:text-[11px] mt-1 text-right',
            isUser ? 'text-white/60' : 'text-label-tertiary'
          )}
        >
          {formatTime(msg.timestamp)}
        </p>
      </div>
    </div>
  )
}

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ botName, onPrompt }: { botName: string; onPrompt: (p: string) => void }) {
  const prompts = [
    'What can you help me with?',
    'Give me a quick demo',
    'What are your key features?',
    'How do I get started?',
  ]
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[280px] gap-5 text-center px-4">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Bot size={24} className="text-primary sm:hidden" />
        <Bot size={28} className="text-primary hidden sm:block" />
      </div>
      <div>
        <h2
          className="text-[18px] sm:text-[20px] font-bold text-foreground mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Start a conversation
        </h2>
        <p className="text-[13px] sm:text-[14px] text-label-secondary">
          Ask {botName} anything to get started
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xs sm:max-w-md">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onPrompt(p)}
            className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-card border border-border/60 text-[12px] sm:text-[13px] text-label-secondary hover:border-primary/40 hover:text-primary hover:bg-primary/5 active:bg-primary/10 transition-all text-left leading-snug"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
