import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { queryBotRequest, fetchChatHistory } from '../lib/api'
import { useAuth } from './AuthContext'

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
  sendMessage: (botId: string, conversationId: string, text: string) => Promise<any>
  deleteConversation: (botId: string, conversationId: string) => void
  loadHistory: (botId: string, conversationId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextValue | null>(null)

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Record<string, Conversation[]>>({})
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  // Load conversations when user changes
  useEffect(() => {
    setActiveConversationId(null)

    if (!user) {
      setConversations({})
      setLoadedUserId(null)
      return
    }

    const storageKey = `chatbot_marketplace_sessions_${user.id}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects
        Object.keys(parsed).forEach(botId => {
          parsed[botId] = parsed[botId].map((c: any) => ({
            ...c,
            updatedAt: new Date(c.updatedAt),
            messages: c.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            }))
          }))
        })
        setConversations(parsed)
      } catch {
        setConversations({})
      }
    } else {
      setConversations({})
    }
    setLoadedUserId(user.id)
  }, [user?.id])

  // Persist sessions to localStorage
  useEffect(() => {
    if (!user || user.id !== loadedUserId) return
    const storageKey = `chatbot_marketplace_sessions_${user.id}`
    localStorage.setItem(storageKey, JSON.stringify(conversations))
  }, [conversations, user?.id, loadedUserId])

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

  const loadHistory = useCallback(async (botId: string, conversationId: string) => {
    try {
      const res = await fetchChatHistory({ botId, sessionId: conversationId })
      if (!res.messages || res.messages.length === 0) {
        return
      }

      const mappedMessages: Message[] = res.messages.map((msg) => ({
        id: msg.id || Math.random().toString(),
        role: msg.role === 'assistant' ? 'bot' : 'user',
        text: msg.content,
        timestamp: new Date(msg.createdAt),
      }))

      setConversations((prev) => {
        const list = prev[botId] ?? []
        return {
          ...prev,
          [botId]: list.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: mappedMessages,
                  title: res.title || c.title,
                }
              : c
          ),
        }
      })
    } catch (err) {
      console.error('Error loading chat history:', err)
    }
  }, [])

  const sendMessage = useCallback(
    async (botId: string, conversationId: string, text: string): Promise<any> => {
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

      try {
        const res = await queryBotRequest({
          botId,
          sessionId: conversationId,
          inputText: text
        })

        const botMsg: Message = {
          id: uid(),
          role: 'bot',
          text: res.answer || "Sorry, I couldn't process that.",
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
        return res
      } catch (err: any) {
        console.error('Error sending message:', err)
        const errMsg: Message = {
          id: uid(),
          role: 'bot',
          text: `Error: ${err.message || 'Failed to query bot.'}`,
          timestamp: new Date(),
        }
        setConversations((prev) => {
          const list = prev[botId] ?? []
          return {
            ...prev,
            [botId]: list.map((c) =>
              c.id === conversationId
                ? { ...c, messages: [...c.messages, errMsg], updatedAt: new Date() }
                : c
            ),
          }
        })
        throw err
      }
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
        loadHistory,
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
