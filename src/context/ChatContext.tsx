import React, { createContext, useContext, useState, useCallback } from 'react'

export interface Message {
  id: string
  role: 'user' | 'bot'
  text: string
  timestamp: Date
}

export interface Conversation {
  id: string
  botId: string
  title: string
  messages: Message[]
  updatedAt: Date
}

interface ChatContextValue {
  conversations: Record<string, Conversation[]> // keyed by botId
  activeConversationId: string | null
  setActiveConversationId: (id: string | null) => void
  getConversations: (botId: string) => Conversation[]
  getActiveConversation: (botId: string) => Conversation | null
  createConversation: (botId: string, botName: string) => Conversation
  sendMessage: (botId: string, conversationId: string, text: string) => void
  deleteConversation: (botId: string, conversationId: string) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

// Simulated bot replies per category feel
const BOT_REPLIES: Record<string, string[]> = {
  default: [
    "That's a great question! Let me help you with that.",
    "I understand what you're looking for. Here's what I can do...",
    "Sure! I can definitely assist with that.",
    "Great point. Based on what you've shared, I'd suggest...",
    "I'm on it! Give me a moment to process that for you.",
    "Absolutely, here's my take on that...",
  ],
}

function getBotReply(text: string): string {
  const replies = BOT_REPLIES.default
  // Simple hash to pick a consistent-ish reply
  const idx = text.length % replies.length
  return replies[idx]
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Record<string, Conversation[]>>({})
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  const getConversations = useCallback(
    (botId: string) => conversations[botId] ?? [],
    [conversations]
  )

  const getActiveConversation = useCallback(
    (botId: string): Conversation | null => {
      const list = conversations[botId] ?? []
      return list.find((c) => c.id === activeConversationId) ?? list[0] ?? null
    },
    [conversations, activeConversationId]
  )

  const createConversation = useCallback(
    (botId: string, botName: string): Conversation => {
      const newConvo: Conversation = {
        id: uid(),
        botId,
        title: `New chat`,
        messages: [
          {
            id: uid(),
            role: 'bot',
            text: `Hi! I'm ${botName}. How can I help you today?`,
            timestamp: new Date(),
          },
        ],
        updatedAt: new Date(),
      }
      setConversations((prev) => ({
        ...prev,
        [botId]: [newConvo, ...(prev[botId] ?? [])],
      }))
      setActiveConversationId(newConvo.id)
      return newConvo
    },
    []
  )

  const sendMessage = useCallback(
    (botId: string, conversationId: string, text: string) => {
      const userMsg: Message = {
        id: uid(),
        role: 'user',
        text,
        timestamp: new Date(),
      }

      // Optimistically add user message
      setConversations((prev) => {
        const list = prev[botId] ?? []
        return {
          ...prev,
          [botId]: list.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  title: c.messages.length === 1 ? text.slice(0, 40) : c.title,
                  messages: [...c.messages, userMsg],
                  updatedAt: new Date(),
                }
              : c
          ),
        }
      })

      // Simulate bot reply after a short delay
      setTimeout(() => {
        const botMsg: Message = {
          id: uid(),
          role: 'bot',
          text: getBotReply(text),
          timestamp: new Date(),
        }
        setConversations((prev) => {
          const list = prev[botId] ?? []
          return {
            ...prev,
            [botId]: list.map((c) =>
              c.id === conversationId
                ? { ...c, messages: [...c.messages, botMsg], updatedAt: new Date() }
                : c
            ),
          }
        })
      }, 900 + Math.random() * 600)
    },
    []
  )

  const deleteConversation = useCallback((botId: string, conversationId: string) => {
    setConversations((prev) => {
      const list = (prev[botId] ?? []).filter((c) => c.id !== conversationId)
      return { ...prev, [botId]: list }
    })
    setActiveConversationId((prev) => (prev === conversationId ? null : prev))
  }, [])

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        setActiveConversationId,
        getConversations,
        getActiveConversation,
        createConversation,
        sendMessage,
        deleteConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used inside ChatProvider')
  return ctx
}
