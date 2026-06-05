export interface Bot {
  id: string
  name: string
  description: string
  subtitle: string
  category: string
  rating: number
  downloads: number
  reviews: number
  price: number
  /** Hero/banner image (large, used in featured cards and detail page) */
  image: string
  /** Square icon image (small, used in list rows and grid items) */
  iconImage?: string
  creator: string
  creatorId?: string
  aiModel?: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
  featured?: boolean
  editorsChoice?: boolean
  tagline?: string
  isLiked?: boolean
  isPurchased?: boolean
  likeCount?: number
  preview?: {
    previewQueriesUsed: number
    previewQueriesLimit: number
    previewQueriesRemaining: number | null
    hasUnlimitedAccess: boolean
  }
}

export interface BotDetails extends Bot {
  longDescription: string
  creatorImage: string
  features?: string[]
  screenshots?: string[]
  testimonials: Array<{ author: string; text: string; rating: number }>
  version?: string
  updated?: string
  size?: string
  ageRating?: string
}

// Separate hero (large) and icon (small) images for each bot
export const mockBots: Bot[] = [
  {
    id: '1',
    name: 'Support Pro',
    subtitle: 'Customer Support AI',
    description: 'AI-powered customer support for e-commerce',
    category: 'Business',
    rating: 4.8,
    downloads: 2450000,
    reviews: 3240,
    price: 0,
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop',
    iconImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=120&h=120&fit=crop',
    creator: 'TechTeam',
    featured: true,
    editorsChoice: true,
    tagline: 'Resolve tickets 70% faster',
    likeCount: 1450,
  },
  {
    id: '2',
    name: 'Content Writer',
    subtitle: 'Blog & Social AI',
    description: 'Generate engaging content for blogs and social media',
    category: 'Productivity',
    rating: 4.6,
    downloads: 1890000,
    reviews: 2100,
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop',
    iconImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=120&h=120&fit=crop',
    creator: 'WriteBot Inc',
    featured: true,
    tagline: 'Write smarter, publish faster',
    likeCount: 890,
  },
  {
    id: '3',
    name: 'Sales Master',
    subtitle: 'Close Deals with AI',
    description: 'Intelligent sales conversations that convert',
    category: 'Business',
    rating: 4.7,
    downloads: 3200000,
    reviews: 4100,
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    iconImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=120&h=120&fit=crop',
    creator: 'SalesForce AI',
    featured: true,
    tagline: 'Your AI sales closer',
    likeCount: 2100,
  },
  {
    id: '4',
    name: 'Lingua Tutor',
    subtitle: 'Learn Languages Naturally',
    description: 'Interactive language learning through conversation',
    category: 'Education',
    rating: 4.5,
    downloads: 1540000,
    reviews: 980,
    price: 2.99,
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop',
    iconImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&h=120&fit=crop',
    creator: 'LinguaAI',
    tagline: 'Speak fluently, naturally',
    likeCount: 430,
  },
  {
    id: '5',
    name: 'Mindful AI',
    subtitle: 'Wellness Companion',
    description: 'Supportive AI for wellness and mindfulness',
    category: 'Health & Fitness',
    rating: 4.9,
    downloads: 4100000,
    reviews: 5200,
    price: 0,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop',
    iconImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=120&h=120&fit=crop',
    creator: 'WellnessAI',
    editorsChoice: true,
    tagline: 'Your daily calm companion',
    likeCount: 3800,
  },
  {
    id: '6',
    name: 'Code Helper',
    subtitle: 'Debug Faster with AI',
    description: 'AI-powered code analysis and debugging',
    category: 'Developer Tools',
    rating: 4.7,
    downloads: 2800000,
    reviews: 3600,
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
    iconImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=120&h=120&fit=crop',
    creator: 'DevTools AI',
    tagline: 'Ship code with confidence',
    likeCount: 1750,
  },
]

export const botDetails: Record<string, BotDetails> = {
  '1': {
    ...mockBots[0],
    longDescription:
      'Support Pro is the ultimate AI assistant for businesses automating customer service. Advanced NLP handles inquiries efficiently around the clock.',
    creatorImage: 'https://api.dicebear.com/7.x/initials/svg?seed=TT',
    features: [
      '24/7 Customer Support',
      'Multi-language Support',
      'CRM Integration',
      'Analytics Dashboard',
      'Custom Training',
      'Sentiment Analysis',
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1677442d019cecf8d4b4c54ea07188342?w=400&h=800&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=800&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=800&fit=crop',
    ],
    testimonials: [
      { author: 'Sarah J.', text: 'Reduced response time by 70%. Essential for our team.', rating: 5 },
      { author: 'Mike C.', text: 'Easy setup, impressive results. Great value.', rating: 5 },
      { author: 'Emma D.', text: 'Handles most queries without human help.', rating: 4 },
    ],
    version: '2.1.0',
    updated: '2 weeks ago',
    size: '24 MB',
    ageRating: '4+',
  },
}

export const categories = [
  'All',
  'Business',
  'Productivity',
  'Education',
  'Health & Fitness',
  'Developer Tools',
] as const

// Fill details for other bots from list data
mockBots.forEach((bot) => {
  if (!botDetails[bot.id]) {
    botDetails[bot.id] = {
      ...bot,
      longDescription: bot.description + '. Built for modern teams who need reliable AI assistance every day.',
      creatorImage: `https://api.dicebear.com/7.x/initials/svg?seed=${bot.creator}`,
      features: ['Smart conversations', 'Easy integration', 'Analytics', 'Multi-language'],
      screenshots: [bot.image, bot.image, bot.image],
      testimonials: [
        { author: 'Alex R.', text: 'Exactly what I needed. Works flawlessly.', rating: 5 },
        { author: 'Jordan P.', text: 'Clean UI and powerful under the hood.', rating: 4 },
      ],
      version: '1.0.0',
      updated: '1 week ago',
      size: '18 MB',
      ageRating: '4+',
    }
  }
})
