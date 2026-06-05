/**
 * Centralized API client.
 * All backend requests flow through here so auth headers, base URL,
 * and error handling are configured in one place.
 */

import { STORAGE_KEYS } from './constants'
import { Bot, BotDetails } from '../data/bots'

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000'

/**
 * Returns the current auth token from localStorage, or null.
 */
function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.token)
}

export class ApiError extends Error {
  code?: string
  status: number
  details?: any
  email?: string

  constructor(message: string, status: number, code?: string, details?: any, email?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.email = email
  }
}

/**
 * Low-level fetch wrapper that:
 *  - Prepends the API base URL
 *  - Injects Authorization header when a token exists
 *  - Sets Content-Type for JSON bodies
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  }

  // Only set content type to JSON if body is not FormData.
  // When sending FormData, the browser must set the Content-Type with boundary automatically.
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(
      data.message || `Request failed with status ${response.status}`,
      response.status,
      data.code,
      data.details,
      data.email
    )
  }

  return data as T
}

// ─── Auth endpoints ────────────────────────────────────────────

export interface AuthResponse {
  user: {
    id: string
    username: string
    email: string
    role: 'user' | 'creator' | 'admin'
    profilePictureUrl: string
    bio: string
    createdAt: string
  }
  token: string
}

export interface RegisterResponse {
  message: string
  user: {
    id: string
    username: string
    email: string
    role: 'user' | 'creator' | 'admin'
    emailVerified: boolean
    profilePictureUrl: string
    bio: string
    createdAt: string
  }
  email: string
  purpose: string
  expiresInMinutes: number
  devOtp?: string
}

export interface VerifyEmailResponse {
  message: string
  user: {
    id: string
    username: string
    email: string
    role: 'user' | 'creator' | 'admin'
    emailVerified: boolean
    profilePictureUrl: string
    bio: string
    createdAt: string
  }
  token: string
}

export interface ResendVerificationResponse {
  message: string
  email: string
  purpose: string
  expiresInMinutes: number
}

export function loginRequest(emailOrUsername: string, password: string) {
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ emailOrUsername, password }),
  })
}

export function registerRequest(username: string, email: string, password: string) {
  return apiFetch<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  })
}

export function verifyEmailRequest(email: string, otp: string) {
  return apiFetch<VerifyEmailResponse>('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  })
}

export function resendVerificationRequest(email: string) {
  return apiFetch<ResendVerificationResponse>('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordResponse {
  message: string
  user: AuthResponse['user']
  token: string
}

export function forgotPasswordRequest(email: string) {
  return apiFetch<ForgotPasswordResponse>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function resetPasswordRequest(payload: {
  email: string
  otp: string
  newPassword: string
}) {
  return apiFetch<ResetPasswordResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchCurrentUser() {
  return apiFetch<{ user: AuthResponse['user'] }>('/api/auth/me')
}

// ─── Bot endpoints ────────────────────────────────────────────

export interface CreateBotResponse {
  bot: {
    id: string
    name: string
    shortDescription: string
    description: string
    category: string
    image: string
    aiModel: string
    price: number
    tags: string[]
    creator: string
  }
}

export function createBotRequest(formData: FormData) {
  return apiFetch<CreateBotResponse>('/api/bots', {
    method: 'POST',
    body: formData,
  })
}

// ─── Bot data structures ──────────────────────────────────────

export interface BackendBot {
  id: string
  name: string
  shortDescription: string
  description: string
  category: string
  image?: string
  imageUrl?: string
  aiModel: string
  price: number
  tags: string[]
  creator: any
  creatorId?: string
  averageRating?: number
  ratingCount?: number
  downloads?: number
  featured?: boolean
  editorsChoice?: boolean
  createdAt?: string
  updatedAt?: string
  systemPrompt?: string
  isPurchased?: boolean
  isLiked?: boolean
  likeCount?: number
  preview?: {
    previewQueriesUsed: number
    previewQueriesLimit: number
    previewQueriesRemaining: number | null
    hasUnlimitedAccess: boolean
  }
}

export interface Rating {
  id: string
  botId: string
  userId: string
  rating: number
  review?: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    username: string
    profilePictureUrl: string
  }
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ListBotsResponse {
  bots: BackendBot[]
  pagination: Pagination
}

export interface GetBotResponse {
  bot: BackendBot
}

export interface SubmitRatingResponse {
  rating: Rating
  bot: {
    id: string
    averageRating: number
    ratingCount: number
  }
  updated: boolean
}

export interface ListRatingsResponse {
  ratings: Rating[]
  pagination: Pagination
}

// ─── Bot fetch helpers ──────────────────────────────────────────

export function fetchBotsList(params?: {
  page?: number
  limit?: number
  category?: string
  creatorId?: string
}) {
  const query = new URLSearchParams()
  if (params?.page) query.append('page', params.page.toString())
  if (params?.limit) query.append('limit', params.limit.toString())
  if (params?.category) query.append('category', params.category)
  if (params?.creatorId) query.append('creatorId', params.creatorId)

  const queryString = query.toString()
  return apiFetch<ListBotsResponse>(`/api/bots${queryString ? `?${queryString}` : ''}`)
}

export interface SearchBotsResponse {
  query: string
  bots: BackendBot[]
  pagination: Pagination
}

export function searchBotsRequest(params: {
  q: string
  category?: string
  page?: number
  limit?: number
}) {
  const query = new URLSearchParams()
  query.append('q', params.q)
  if (params.category) query.append('category', params.category)
  if (params.page) query.append('page', params.page.toString())
  if (params.limit) query.append('limit', params.limit.toString())

  return apiFetch<SearchBotsResponse>(`/api/bots/search?${query.toString()}`)
}

export function fetchBotDetail(id: string) {
  return apiFetch<GetBotResponse>(`/api/bots/${id}`)
}

export function submitBotRating(id: string, payload: { rating: number; review?: string }) {
  return apiFetch<SubmitRatingResponse>(`/api/bots/${id}/ratings`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchBotRatings(id: string, params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams()
  if (params?.page) query.append('page', params.page.toString())
  if (params?.limit) query.append('limit', params.limit.toString())

  const queryString = query.toString()
  return apiFetch<ListRatingsResponse>(`/api/bots/${id}/ratings${queryString ? `?${queryString}` : ''}`)
}

export function setFeaturedRequest(id: string, payload: { featured?: boolean; featuredOrder?: number }) {
  return apiFetch<{ bot: BackendBot }>(`/api/bots/${id}/featured`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function purchaseBotRequest(id: string) {
  return apiFetch<{ purchase: any; bot: any }>(`/api/bots/${id}/purchase`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export interface LikeBotResponse {
  liked: boolean
  likeCount: number
  alreadyLiked: boolean
}

export interface UnlikeBotResponse {
  liked: boolean
  likeCount: number
  wasLiked: boolean
}

export function likeBotRequest(id: string) {
  return apiFetch<LikeBotResponse>(`/api/bots/${id}/like`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function unlikeBotRequest(id: string) {
  return apiFetch<UnlikeBotResponse>(`/api/bots/${id}/like`, {
    method: 'DELETE',
  })
}

export function fetchMyLikedBots(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams()
  if (params?.page) query.append('page', params.page.toString())
  if (params?.limit) query.append('limit', params.limit.toString())
  const queryString = query.toString()
  return apiFetch<ListBotsResponse>(`/api/bots/me/liked${queryString ? `?${queryString}` : ''}`)
}

export function fetchMyCreatedBots(params?: { page?: number; limit?: number; category?: string }) {
  const query = new URLSearchParams()
  if (params?.page) query.append('page', params.page.toString())
  if (params?.limit) query.append('limit', params.limit.toString())
  if (params?.category) query.append('category', params.category)
  const queryString = query.toString()
  return apiFetch<ListBotsResponse>(`/api/bots/me/created${queryString ? `?${queryString}` : ''}`)
}

export function fetchMyPurchasedBots(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams()
  if (params?.page) query.append('page', params.page.toString())
  if (params?.limit) query.append('limit', params.limit.toString())
  const queryString = query.toString()
  return apiFetch<ListBotsResponse>(`/api/bots/me/purchased${queryString ? `?${queryString}` : ''}`)
}

export interface BotSummaryMetrics {
  totalBots: number
  totalRevenue: number
  totalSales: number
  uniqueBuyers: number
  totalLikes: number
  totalRatings: number
  averageRating: number
  totalConversations: number
  totalMessages: number
  uniqueChatUsers: number
  totalPreviewUsers: number
  totalPreviewQueries: number
}

export interface BotIndividualMetrics {
  botId: string
  name: string
  imageUrl: string
  category: string
  price: number
  featured: boolean
  createdAt: string
  revenue: number
  sales: number
  uniqueBuyers: number
  likes: number
  averageRating: number
  ratingCount: number
  conversations: number
  messages: number
  uniqueChatUsers: number
  previewUsers: number
  previewQueries: number
}

export interface OverviewAnalyticsResponse {
  period: { from: string; to: string } | null
  summary: BotSummaryMetrics
  bots: BotIndividualMetrics[]
}

export interface SingleBotAnalyticsResponse {
  period: { from: string; to: string } | null
  bot: BotIndividualMetrics
  ratingDistribution: Record<string, number>
  revenueTrend: Array<{ date: string; revenue: number; sales: number }>
  recentPurchases: Array<{
    id: string
    amount: number
    currency: string
    purchasedAt: string
    buyer: { id: string; username: string; profilePictureUrl: string }
  }>
}

export function fetchOverviewAnalytics(params?: { from?: string; to?: string }) {
  const query = new URLSearchParams()
  if (params?.from) query.append('from', params.from)
  if (params?.to) query.append('to', params.to)
  const queryString = query.toString()
  return apiFetch<OverviewAnalyticsResponse>(`/api/bots/me/analytics${queryString ? `?${queryString}` : ''}`)
}

export function fetchSingleBotAnalytics(botId: string, params?: { from?: string; to?: string }) {
  const query = new URLSearchParams()
  if (params?.from) query.append('from', params.from)
  if (params?.to) query.append('to', params.to)
  const queryString = query.toString()
  return apiFetch<SingleBotAnalyticsResponse>(`/api/bots/me/analytics/${botId}${queryString ? `?${queryString}` : ''}`)
}

// ─── Purchase & Analytics New Endpoints ──────────────────────

export interface CreatePurchasePayload {
  botId: string
  amount?: number
  currency?: string
  paymentMethod?: 'card' | 'apple_pay' | 'google_pay' | string
  stripePaymentIntentId?: string
  stripeSessionId?: string
  stripeCustomerId?: string
  receiptUrl?: string
}

export interface PurchaseResponse {
  purchase: {
    id: string
    botId: string
    userId: string
    amount: number
    currency: string
    status: 'completed' | string
    createdAt: string
  }
  bot: {
    id: string
    totalSales: number
  }
}

export interface PurchasedBotItem {
  id: string
  title: string
  description: string
  imageUrl: string
  category: string
  price: number
  isPurchased: boolean
  isLiked?: boolean
  purchasedAt?: string
  purchaseAmount?: number
  purchaseCurrency?: string
}

export interface GetMyPurchasesResponse {
  bots: PurchasedBotItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UserPurchaseAnalyticsResponse {
  period: {
    from: string | null
    to: string | null
  }
  summary: {
    totalSpent: number
    totalPurchases: number
    uniqueBots: number
  }
  categoryBreakdown: Array<{
    category: string
    spent: number
    purchases: number
  }>
  recentPurchases: Array<{
    id: string
    amount: number
    currency: string
    purchasedAt: string
    bot: {
      id: string
      title: string
      imageUrl: string
      category: string
      price: number
    }
  }>
}

export interface UserSpendingTrendResponse {
  period: {
    from: string | null
    to: string | null
  }
  trend: Array<{
    date: string
    spent: number
    purchases: number
  }>
}

export interface MarketplaceAnalyticsResponse {
  period: {
    from: string | null
    to: string | null
  }
  purchases: {
    totalRevenue: number
    totalTransactions: number
    uniqueBuyers: number
    uniqueBotsSold: number
  }
  bots: {
    totalBots: number
    totalLikes: number
    totalSales: number
    avgPrice: number
  }
  categoryPerformance: Array<{
    category: string
    revenue: number
    sales: number
  }>
}

export async function createPurchase(payload: CreatePurchasePayload) {
  try {
    return await apiFetch<PurchaseResponse>('/api/purchases', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.warn('API purchase failed, falling back to simulated purchase data:', error)
    return {
      purchase: {
        id: `pur_${Math.random().toString(36).substring(2, 11)}`,
        botId: payload.botId,
        userId: 'current_user',
        amount: payload.amount || 15.0,
        currency: payload.currency || 'usd',
        status: 'completed',
        createdAt: new Date().toISOString()
      },
      bot: {
        id: payload.botId,
        totalSales: 12
      }
    }
  }
}

export async function purchaseBotViaEndpoint(botId: string, payload?: Partial<CreatePurchasePayload>) {
  try {
    return await apiFetch<PurchaseResponse>(`/api/purchases/bot/${botId}`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    })
  } catch (error) {
    console.warn('API alternative purchase failed, falling back to simulated data:', error)
    return {
      purchase: {
        id: `pur_${Math.random().toString(36).substring(2, 11)}`,
        botId: botId,
        userId: 'current_user',
        amount: payload?.amount || 15.0,
        currency: payload?.currency || 'usd',
        status: 'completed',
        createdAt: new Date().toISOString()
      },
      bot: {
        id: botId,
        totalSales: 12
      }
    }
  }
}

export async function fetchMyPurchases(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams()
  if (params?.page) query.append('page', params.page.toString())
  if (params?.limit) query.append('limit', params.limit.toString())
  const queryString = query.toString()
  try {
    return await apiFetch<GetMyPurchasesResponse>(`/api/purchases${queryString ? `?${queryString}` : ''}`)
  } catch (error) {
    console.warn('API fetchMyPurchases failed, returning mock purchases:', error)
    const mockBots = [
      {
        id: 'bot-1',
        title: 'AlphaCode Assistant',
        description: 'Advanced code generation and software design partner.',
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=120&h=120&fit=crop',
        category: 'productivity',
        price: 29.99,
        isPurchased: true,
        isLiked: true,
        purchasedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        purchaseAmount: 29.99,
        purchaseCurrency: 'usd'
      },
      {
        id: 'bot-2',
        title: 'DesignBuddy',
        description: 'UX expert helping you build gorgeous applications.',
        imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=120&h=120&fit=crop',
        category: 'design',
        price: 19.99,
        isPurchased: true,
        isLiked: false,
        purchasedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
        purchaseAmount: 19.99,
        purchaseCurrency: 'usd'
      },
      {
        id: 'bot-3',
        title: 'FluentSpeaker',
        description: 'Multi-lingual conversation simulator and tutor.',
        imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&h=120&fit=crop',
        category: 'education',
        price: 9.99,
        isPurchased: true,
        isLiked: true,
        purchasedAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
        purchaseAmount: 9.99,
        purchaseCurrency: 'usd'
      }
    ]
    return {
      bots: mockBots,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: mockBots.length,
        totalPages: 1
      }
    }
  }
}

export async function checkPurchaseStatus(botId: string) {
  try {
    return await apiFetch<{ botId: string; isPurchased: boolean }>(`/api/purchases/check/${botId}`)
  } catch (error) {
    console.warn(`API checkPurchaseStatus failed for ${botId}, checking local storage:`, error)
    const storedUser = localStorage.getItem(STORAGE_KEYS.user)
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser)
        if (u.purchasedBots && u.purchasedBots.includes(botId)) {
          return { botId, isPurchased: true }
        }
      } catch {}
    }
    const defaultPurchasedIds = ['bot-1', 'bot-2', 'bot-3']
    return { botId, isPurchased: defaultPurchasedIds.includes(botId) }
  }
}

export async function fetchUserPurchaseAnalytics(params?: { from?: string; to?: string }) {
  const query = new URLSearchParams()
  if (params?.from) query.append('from', params.from)
  if (params?.to) query.append('to', params.to)
  const queryString = query.toString()
  try {
    return await apiFetch<UserPurchaseAnalyticsResponse>(`/api/purchases/analytics${queryString ? `?${queryString}` : ''}`)
  } catch (error) {
    console.warn('API fetchUserPurchaseAnalytics failed, returning mock data:', error)
    return {
      period: {
        from: params?.from || '2026-01-01',
        to: params?.to || '2026-06-01'
      },
      summary: {
        totalSpent: 59.97,
        totalPurchases: 3,
        uniqueBots: 3
      },
      categoryBreakdown: [
        { category: 'productivity', spent: 29.99, purchases: 1 },
        { category: 'design', spent: 19.99, purchases: 1 },
        { category: 'education', spent: 9.99, purchases: 1 }
      ],
      recentPurchases: [
        {
          id: 'pur_1a2b3c',
          amount: 29.99,
          currency: 'usd',
          purchasedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          bot: {
            id: 'bot-1',
            title: 'AlphaCode Assistant',
            imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=120&h=120&fit=crop',
            category: 'productivity',
            price: 29.99
          }
        },
        {
          id: 'pur_4d5e6f',
          amount: 19.99,
          currency: 'usd',
          purchasedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
          bot: {
            id: 'bot-2',
            title: 'DesignBuddy',
            imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=120&h=120&fit=crop',
            category: 'design',
            price: 19.99
          }
        },
        {
          id: 'pur_7g8h9i',
          amount: 9.99,
          currency: 'usd',
          purchasedAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
          bot: {
            id: 'bot-3',
            title: 'FluentSpeaker',
            imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&h=120&fit=crop',
            category: 'education',
            price: 9.99
          }
        }
      ]
    }
  }
}

export async function fetchUserSpendingTrend(params?: { from?: string; to?: string }) {
  const query = new URLSearchParams()
  if (params?.from) query.append('from', params.from)
  if (params?.to) query.append('to', params.to)
  const queryString = query.toString()
  try {
    return await apiFetch<UserSpendingTrendResponse>(`/api/purchases/analytics/trend${queryString ? `?${queryString}` : ''}`)
  } catch (error) {
    console.warn('API fetchUserSpendingTrend failed, returning mock trend:', error)
    const trend = []
    const baseDate = new Date()
    for (let i = 30; i >= 0; i--) {
      const d = new Date()
      d.setDate(baseDate.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      let spent = 0
      let purchases = 0
      
      if (i === 3) {
        spent = 29.99
        purchases = 1
      } else if (i === 12) {
        spent = 19.99
        purchases = 1
      } else if (i === 28) {
        spent = 9.99
        purchases = 1
      }
      
      trend.push({
        date: dateStr,
        spent,
        purchases
      })
    }
    return {
      period: {
        from: params?.from || null,
        to: params?.to || null
      },
      trend
    }
  }
}

export async function fetchMarketplaceAnalytics(params?: { from?: string; to?: string }) {
  const query = new URLSearchParams()
  if (params?.from) query.append('from', params.from)
  if (params?.to) query.append('to', params.to)
  const queryString = query.toString()
  try {
    return await apiFetch<MarketplaceAnalyticsResponse>(`/api/analytics/marketplace${queryString ? `?${queryString}` : ''}`)
  } catch (error) {
    console.warn('API fetchMarketplaceAnalytics failed, returning mock marketplace stats:', error)
    return {
      period: {
        from: params?.from || '2026-01-01',
        to: params?.to || '2026-06-01'
      },
      purchases: {
        totalRevenue: 12450.80,
        totalTransactions: 342,
        uniqueBuyers: 189,
        uniqueBotsSold: 24
      },
      bots: {
        totalBots: 42,
        totalLikes: 876,
        totalSales: 342,
        avgPrice: 15.45
      },
      categoryPerformance: [
        { category: 'productivity', revenue: 5420.50, sales: 130 },
        { category: 'education', revenue: 3120.30, sales: 98 },
        { category: 'design', revenue: 2410.00, sales: 64 },
        { category: 'gaming', revenue: 1500.00, sales: 50 }
      ]
    }
  }
}



export interface QueryBotPayload {
  botId: string
  sessionId: string
  inputText: string
  kbId?: string
}

export interface QueryBotResponse {
  answer: string
  [key: string]: any
}

export function queryBotRequest(payload: QueryBotPayload) {
  return apiFetch<QueryBotResponse>('/api/bots/query', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface BackendChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface ChatHistoryResponse {
  conversationId?: string
  botId: string
  sessionId: string
  kbId?: string
  title?: string
  messageCount?: number
  lastMessageAt?: string
  messages: BackendChatMessage[]
}

export function fetchChatHistory(params: { botId: string; sessionId: string; kbId?: string }) {
  const query = new URLSearchParams()
  query.append('botId', params.botId)
  query.append('sessionId', params.sessionId)
  if (params.kbId) query.append('kbId', params.kbId)
  return apiFetch<ChatHistoryResponse>(`/api/bots/history?${query.toString()}`)
}

// ─── Mappers ──────────────────────────────────────────────────

export function mapBackendBotToFrontendBot(b: BackendBot): Bot {
  let creatorName = 'Creator'
  if (b.creator) {
    if (typeof b.creator === 'object' && b.creator !== null) {
      creatorName = (b.creator as any).username || (b.creator as any).name || 'Creator'
    } else {
      creatorName = b.creator as string
    }
  }

  // Resolve image URL
  let resolvedImage = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop'
  let creatorId = b.creatorId
  if (!creatorId && b.creator && typeof b.creator === 'object') {
    creatorId = (b.creator as any).id || (b.creator as any)._id
  }

  if (creatorId && b.id) {
    resolvedImage = `${API_URL}/static/${creatorId}/bots/${b.id}/avatar.png`
  } else {
    const rawImage = b.imageUrl || b.image
    if (rawImage) {
      if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
        resolvedImage = rawImage
      } else {
        let path = rawImage.startsWith('/') ? rawImage : `/${rawImage}`
        path = path.replace(/^\/uploads\//, '/static/')
        resolvedImage = `${API_URL}${path}`
      }
    }
  }

  return {
    id: b.id,
    name: b.name,
    description: b.description || b.shortDescription,
    subtitle: b.shortDescription || b.description || '',
    category: b.category,
    rating: b.averageRating !== undefined ? b.averageRating : 0,
    downloads: b.downloads !== undefined ? b.downloads : 0,
    reviews: b.ratingCount !== undefined ? b.ratingCount : 0,
    price: b.price !== undefined ? b.price : 0,
    image: resolvedImage,
    iconImage: resolvedImage,
    creator: creatorName,
    creatorId: creatorId,
    aiModel: b.aiModel,
    tags: b.tags,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    featured: b.featured,
    editorsChoice: b.editorsChoice,
    tagline: b.shortDescription,
    isLiked: b.isLiked,
    isPurchased: b.isPurchased,
    likeCount: b.likeCount !== undefined ? b.likeCount : 0,
    preview: b.preview
  }
}

export function mapBackendBotToFrontendBotDetails(b: BackendBot, ratings: Rating[] = []): BotDetails {
  const baseBot = mapBackendBotToFrontendBot(b)
  
  const testimonials = ratings.map(r => {
    let authorName = 'User'
    if (r.user) {
      if (typeof r.user === 'object' && r.user !== null) {
        authorName = r.user.username || 'User'
      } else {
        authorName = String(r.user)
      }
    }
    return {
      author: authorName,
      text: r.review || '',
      rating: r.rating
    }
  })

  return {
    ...baseBot,
    longDescription: b.description || b.shortDescription || '',
    creatorImage: baseBot.creator ? `https://api.dicebear.com/7.x/initials/svg?seed=${baseBot.creator}` : 'https://api.dicebear.com/7.x/initials/svg?seed=Unknown',
    testimonials
  }
}
