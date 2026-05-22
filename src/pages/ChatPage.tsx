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
} from 'lucide-react'
import { useChat } from '../context/ChatContext'
import { botDetails } from '../data/bots'
import { cn } from '../lib/utils'
import type { Message } from '../context/ChatContext'

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
  const bot = botDetails[id ?? '1']

  const {
    getConversations,
    getActiveConversation,
    createConversation,
    sendMessage,
    deleteConversation,
    setActiveConversationId,
    activeConversationId,
  } = useChat()

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  // Desktop: sidebar inline. Mobile: sidebar is a drawer (overlay).
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const conversations = getConversations(id ?? '')
  const activeConvo = getActiveConversation(id ?? '')

  // Create first conversation if none exist
  useEffect(() => {
    if (bot && conversations.length === 0) {
      createConversation(id ?? '', bot.name)
    }
  }, [bot, id])

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

  if (!bot) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="ios-subhead">Bot not found</p>
      </div>
    )
  }

  function handleSend() {
    const text = input.trim()
    if (!text || !activeConvo) return
    setInput('')
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
    sendMessage(id ?? '', activeConvo.id, text)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleNewChat() {
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
            <p className="text-[15px] font-semibold text-foreground leading-tight truncate">
              {bot.name}
            </p>
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
        <p className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {msg.text}
        </p>
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
