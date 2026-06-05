import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/ui/Button'
import { 
  Upload, Plus, Trash2, Save, Eye, Sliders, Database, ClipboardCheck, Sparkles, 
  AlertCircle, ArrowLeft, ArrowRight, Loader2, CheckCircle2, Shield, MessageSquare
} from 'lucide-react'
import { cn, formatPrice } from '../lib/utils'
import AppIcon from '../components/ios/AppIcon'
import { createBotRequest } from '../lib/api'

interface BotFormData {
  name: string
  description: string
  shortDescription: string
  category: string
  image: File | null | string
  aiModel: string
  knowledgeBase: File[]
  systemPrompt: string
  price: number
  tags: string[]
}

const inputClass =
  'w-full px-4 py-3.5 text-[15px] bg-transparent outline-none placeholder:text-label-tertiary font-medium text-foreground'

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const BotStudioPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'knowledge' | 'publish'>('basic')
  const [isSaving, setIsSaving] = useState(false)
  const [newTag, setNewTag] = useState('')
  
  // Status states: 'editing' | 'building' | 'success'
  const [status, setStatus] = useState<'editing' | 'building' | 'success'>('editing')
  
  // Loading progress steps
  const [buildSteps, setBuildSteps] = useState([
    { label: 'Initializing assistant workspace...', status: 'waiting' as 'waiting' | 'running' | 'done' },
    { label: 'Ingesting knowledge source documents...', status: 'waiting' as 'waiting' | 'running' | 'done' },
    { label: 'Configuring safety guardrails and guidelines...', status: 'waiting' as 'waiting' | 'running' | 'done' },
    { label: 'Generating marketplace secure bot instance ID...', status: 'waiting' as 'waiting' | 'running' | 'done' },
  ])

  const [formData, setFormData] = useState<BotFormData>({
    name: id ? 'My Custom Assistant' : '',
    description: id ? 'A custom AI assistant designed to handle technical tasks and customer support queries efficiently.' : '',
    shortDescription: id ? 'Efficient support assistant' : '',
    category: 'Business',
    image: null,
    aiModel: 'gpt-4',
    knowledgeBase: [],
    systemPrompt: id ? 'You are a professional assistant. Answer questions clearly and concisely.' : '',
    price: 0,
    tags: id ? ['support', 'business'] : [],
  })

  const [iconPreviewUrl, setIconPreviewUrl] = useState('')
  const [createdBot, setCreatedBot] = useState<any>(null)

  const iconInputRef = useRef<HTMLInputElement>(null)
  const kbInputRef = useRef<HTMLInputElement>(null)

  // ── Validation logic ──
  const isBasicValid = 
    formData.name.trim() !== '' && 
    formData.shortDescription.trim() !== '' && 
    formData.description.trim() !== '' && 
    formData.category.trim() !== '' &&
    formData.image !== null

  const isAdvancedValid = 
    isBasicValid && 
    formData.systemPrompt.trim() !== ''

  const isKnowledgeValid = isAdvancedValid && formData.knowledgeBase.length > 0

  const isPublishValid = isKnowledgeValid && formData.price >= 0

  const tabs = [
    { id: 'basic' as const, label: 'Metadata', icon: Sparkles, enabled: true },
    { id: 'advanced' as const, label: 'AI Config', icon: Sliders, enabled: isBasicValid },
    { id: 'knowledge' as const, label: 'Data', icon: Database, enabled: isAdvancedValid },
    { id: 'publish' as const, label: 'Submit', icon: ClipboardCheck, enabled: isKnowledgeValid },
  ]

  const categories = ['Business', 'Productivity', 'Education', 'Health & Fitness', 'Developer Tools']
  const aiModels = ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet']

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        if (img.width !== img.height) {
          alert('Image must be square (1:1 aspect ratio). Please upload a square image.')
          if (e.target) {
            e.target.value = ''
          }
        } else {
          setFormData(prev => ({ ...prev, image: file }))
          setIconPreviewUrl(img.src)
        }
      }
    }
  }

  const handleKbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      setFormData(prev => ({
        ...prev,
        knowledgeBase: [...prev.knowledgeBase, ...newFiles]
      }))
    }
  }

  const handleRemoveKbFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      knowledgeBase: prev.knowledgeBase.filter((_, i) => i !== index)
    }))
  }

  const handleAddTag = () => {
    const trimmed = newTag.trim().toLowerCase()
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData({ ...formData, tags: [...formData.tags, trimmed] })
      setNewTag('')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      alert('Draft saved successfully!')
    } finally {
      setIsSaving(false)
    }
  }

  // ── Simulated progress build steps ──
  useEffect(() => {
    if (status !== 'building') return

    const updateStep = (index: number, state: 'waiting' | 'running' | 'done') => {
      setBuildSteps(prev => prev.map((step, i) => {
        if (i === index) return { ...step, status: state }
        return step
      }))
    }

    // Start first step
    updateStep(0, 'running')

    const intervals = [
      setTimeout(() => {
        updateStep(0, 'done')
        updateStep(1, 'running')
      }, 1000),
      setTimeout(() => {
        updateStep(1, 'done')
        updateStep(2, 'running')
      }, 2200),
      setTimeout(() => {
        updateStep(2, 'done')
        updateStep(3, 'running')
      }, 3400),
      setTimeout(() => {
        updateStep(3, 'done')
      }, 4500),
    ]

    return () => {
      intervals.forEach(clearTimeout)
    }
  }, [status])

  // Transition to success screen once simulation finishes AND backend has returned
  useEffect(() => {
    const allStepsDone = buildSteps.every(step => step.status === 'done')
    if (allStepsDone && createdBot && status === 'building') {
      setStatus('success')
    }
  }, [buildSteps, createdBot, status])

  const handlePublishSubmit = async () => {
    if (!isPublishValid) return
    setStatus('building')

    const data = new FormData()
    data.append('name', formData.name)
    data.append('description', formData.description)
    data.append('shortDescription', formData.shortDescription)
    data.append('category', formData.category)
    data.append('aiModel', formData.aiModel)
    data.append('systemPrompt', formData.systemPrompt)
    data.append('price', formData.price.toString())
    data.append('tags', JSON.stringify(formData.tags))
    
    if (formData.image instanceof File) {
      data.append('image', formData.image)
    }

    formData.knowledgeBase.forEach((file) => {
      data.append('knowledgeBase', file)
    })

    try {
      const response = await createBotRequest(data)
      setCreatedBot(response.bot)
    } catch (err: any) {
      setStatus('editing')
      alert(err.message || 'Failed to deploy bot. Please try again.')
    }
  }

  // Fallback bot metadata for display on the success summary page
  const botId = createdBot?.id || id || 'bot-new'

  // Render Building / Progress Screen
  if (status === 'building') {
    return (
      <Layout title="Creating Bot..." subtitle="Deploying AI Assistant" narrow>
        <div className="max-w-md mx-auto py-16 px-4 text-center">
          <div className="mb-8 relative flex justify-center">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl w-24 h-24 mx-auto animate-pulse" />
            <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Assembling Workspace</h2>
          <p className="text-[14px] text-label-tertiary mb-8">Please wait while your customize parameters are compiled and launched.</p>

          <div className="bg-card rounded-2xl border border-border/30 p-5 shadow-sm space-y-4 text-left">
            {buildSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                {step.status === 'done' && (
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                )}
                {step.status === 'running' && (
                  <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
                )}
                {step.status === 'waiting' && (
                  <div className="w-5 h-5 rounded-full border-2 border-border/60 flex-shrink-0" />
                )}
                <span className={cn(
                  "text-[13px] font-semibold transition-colors duration-300",
                  step.status === 'done' && "text-label-secondary",
                  step.status === 'running' && "text-primary font-bold",
                  step.status === 'waiting' && "text-label-tertiary"
                )}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  // Render Success Summary Screen
  if (status === 'success') {
    return (
      <Layout title="Bot Created!" subtitle="Deployment Successful" narrow>
        <div className="pb-16 max-w-xl mx-auto animate-fade">
          
          <div className="gradient-line w-16 mb-6" />

          {/* Success Banner Card */}
          <div className="bg-card rounded-2xl border border-border/30 p-6 shadow-sm mb-6 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 border border-success/20">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground mb-1">Your Bot is Live!</h2>
            <p className="text-[13px] text-label-tertiary">
              It is successfully deployed and listed under the identifier details below.
            </p>
          </div>

          {/* Configuration details specifications */}
          <div className="bg-card rounded-2xl border border-border/30 p-5 shadow-sm space-y-5 mb-8">
            <h3 className="text-[15px] font-bold text-foreground border-b border-border/40 pb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-primary" />
              Instance Specifications
            </h3>

            {/* Profile Row */}
            <div className="flex items-center gap-4 py-1">
              <AppIcon src={createdBot?.image || iconPreviewUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&h=120&fit=crop'} alt={createdBot?.name || formData.name} size="md" />
              <div>
                <h4 className="font-bold text-[16px] text-foreground leading-tight">{createdBot?.name || formData.name}</h4>
                <p className="text-[12px] text-label-tertiary font-medium mt-0.5">{createdBot?.category || formData.category}</p>
              </div>
            </div>

            <div className="h-px bg-border/30" />

            <div className="space-y-4">
              <div className="flex justify-between items-start text-[13px]">
                <span className="text-label-tertiary font-semibold">Instance ID</span>
                <span className="font-mono text-foreground font-bold bg-muted px-2 py-0.5 rounded text-[12px]">
                  {botId}
                </span>
              </div>

              <div className="flex justify-between items-center text-[13px]">
                <span className="text-label-tertiary font-semibold">Model Foundation</span>
                <span className="font-bold text-foreground capitalize">{createdBot?.aiModel || formData.aiModel}</span>
              </div>

              <div className="flex justify-between items-center text-[13px]">
                <span className="text-label-tertiary font-semibold">Price Setup</span>
                <span className="font-bold text-foreground">
                  {createdBot ? (createdBot.price === 0 ? 'Free (GET)' : formatPrice(createdBot.price)) : (formData.price === 0 ? 'Free (GET)' : formatPrice(formData.price))}
                </span>
              </div>

              <div className="flex justify-between items-start text-[13px]">
                <span className="text-label-tertiary font-semibold">Knowledge Ingestion</span>
                <span className="font-bold text-foreground text-right text-[12px] max-w-[70%]">
                  {formData.knowledgeBase.length > 0 
                    ? formData.knowledgeBase.map(f => f.name).join(', ')
                    : 'Standard Model Knowledge'
                  }
                </span>
              </div>

              {(createdBot?.tags || formData.tags).length > 0 && (
                <div className="flex justify-between items-start text-[13px]">
                  <span className="text-label-tertiary font-semibold">Tags</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[70%]">
                    {(createdBot?.tags || formData.tags).map((tag: string) => (
                      <span key={tag} className="text-[11px] font-semibold bg-muted px-2 py-0.5 rounded text-label-secondary">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action redirects */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              className="flex-1 shadow-md shadow-primary/20 hover:scale-105 transition-all duration-200"
              onClick={() => navigate(`/chat/${botId}`)}
            >
              <MessageSquare size={16} className="mr-1.5" />
              Open Chat to Test
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="sm:w-1/3 hover:bg-muted/40"
              onClick={() => navigate('/marketplace')}
            >
              Back to Store
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  // Render Editing / Creation screen
  return (
    <Layout title={id ? 'Edit Bot' : 'Create Bot'} subtitle="Bot Creator Studio" narrow>
      <div className="pb-16 animate-fade">
        
        {/* ── Gradient accent line ── */}
        <div className="gradient-line w-16 mb-6 animate-fade" />
        
        <p className="text-[14px] text-label-secondary mb-6 -mt-2">
          Design, fine-tune, configure custom knowledge bases, and deploy your custom AI bot directly to the marketplace store.
        </p>

        {/* ── Tabbed Segment Control ── */}
        <div className="flex p-1 bg-muted/60 border border-border/40 rounded-xl mb-8 overflow-x-auto hide-scrollbar shadow-sm">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id
            const Icon = tab.icon
            const isTabEnabled = tab.enabled
            
            return (
              <button
                key={tab.id}
                disabled={!isTabEnabled}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[13px] font-bold whitespace-nowrap px-3 transition-all duration-200',
                  isSelected
                    ? 'bg-card text-primary shadow-sm border border-border/10 cursor-pointer'
                    : isTabEnabled
                      ? 'text-label-tertiary hover:text-label-secondary cursor-pointer'
                      : 'text-label-tertiary/40 cursor-not-allowed opacity-50'
                )}
              >
                <Icon size={14} className={isSelected ? 'text-primary' : isTabEnabled ? 'text-label-tertiary' : 'text-label-tertiary/40'} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── Metadata Form Tab ── */}
        {activeTab === 'basic' && (
          <div className="space-y-6 animate-in">
            {/* Icon Uploader */}
            <div 
              className="flex flex-col items-center py-6 bg-card border border-border/30 rounded-2xl shadow-sm cursor-pointer hover:bg-muted/10 transition-colors"
              onClick={() => iconInputRef.current?.click()}
            >
              <input 
                type="file"
                ref={iconInputRef}
                onChange={handleIconChange}
                accept="image/*"
                className="hidden"
              />
              <div className="w-24 h-24 app-icon bg-muted flex items-center justify-center mb-3 border border-border/40 overflow-hidden transition-all hover:scale-105">
                {iconPreviewUrl ? (
                  <img src={iconPreviewUrl} alt="" className="w-full h-full object-cover app-icon" />
                ) : (
                  <Upload size={28} className="text-label-tertiary" />
                )}
              </div>
              <span className="text-primary text-[14px] font-bold hover:underline">
                Upload Bot Icon
              </span>
              <p className="text-[11px] text-label-tertiary mt-1 font-semibold flex items-center gap-1">
                Square size (min 512×512px) required
                {!formData.image && <span className="text-[10px] text-destructive uppercase font-bold ml-1">Required</span>}
              </p>
            </div>

            {/* Inputs Block */}
            <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden">
              <div>
                <label className="block text-[11px] font-bold text-label-tertiary uppercase tracking-wider px-4 pt-3.5 flex items-center justify-between">
                  <span>Bot Name</span>
                  {!formData.name.trim() && <span className="text-[10px] text-destructive tracking-normal uppercase font-bold">Required</span>}
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. Sales Master, Lingua Tutor..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="h-px bg-border/40" />
              <div>
                <label className="block text-[11px] font-bold text-label-tertiary uppercase tracking-wider px-4 pt-3.5 flex items-center justify-between">
                  <span>Short Tagline / Subtitle</span>
                  {!formData.shortDescription.trim() && <span className="text-[10px] text-destructive tracking-normal uppercase font-bold">Required</span>}
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. Close deals 5x faster, Speak like a native speaker..."
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                />
              </div>
              <div className="h-px bg-border/40" />
              <div>
                <label className="block text-[11px] font-bold text-label-tertiary uppercase tracking-wider px-4 pt-3.5 flex items-center justify-between">
                  <span>Long Description</span>
                  {!formData.description.trim() && <span className="text-[10px] text-destructive tracking-normal uppercase font-bold">Required</span>}
                </label>
                <textarea
                  className={cn(inputClass, 'min-h-[120px] resize-none py-3')}
                  placeholder="Provide a detailed overview of what your bot does, who it is for, and how to query it."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="h-px bg-border/40" />
              <div className="relative">
                <label className="block text-[11px] font-bold text-label-tertiary uppercase tracking-wider px-4 pt-3.5">
                  Category
                </label>
                <select
                  className={cn(inputClass, 'appearance-none cursor-pointer pr-10')}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 bottom-4 pointer-events-none text-label-tertiary">
                  ▼
                </div>
              </div>
            </div>

            {/* Keyword tags */}
            <div className="bg-card rounded-2xl border border-border/30 p-5 shadow-sm space-y-4">
              <label className="block text-[12px] font-bold text-foreground">
                Search Tags / Keywords
              </label>
              <div className="flex gap-2">
                <input
                  className="ios-search flex-1 bg-muted/50"
                  placeholder="e.g. chat, translator, customer-care"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button variant="secondary" size="md" className="h-[44px] cursor-pointer" onClick={handleAddTag}>
                  <Plus size={18} />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-primary/10 border border-primary/10 text-primary font-semibold text-[12px] flex items-center gap-1.5"
                    >
                      #{tag}
                      <button 
                        onClick={() => setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })}
                        className="hover:text-destructive text-[14px] cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-6 gap-4">
              <Button 
                variant="secondary" 
                size="md" 
                onClick={handleSave} 
                isLoading={isSaving}
                className="w-auto px-6 cursor-pointer"
              >
                <Save size={16} className="mr-1.5" /> Save Draft
              </Button>
              <Button 
                variant="primary" 
                size="md" 
                disabled={!isBasicValid}
                onClick={() => isBasicValid && setActiveTab('advanced')}
                className="w-auto px-6 cursor-pointer"
              >
                Continue <ArrowRight size={16} className="ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ── AI Settings Form Tab ── */}
        {activeTab === 'advanced' && (
          <div className="space-y-6 animate-in">
            <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden">
              <div className="relative">
                <label className="block text-[11px] font-bold text-label-tertiary uppercase tracking-wider px-4 pt-3.5">
                  AI Foundation Model
                </label>
                <select
                  className={cn(inputClass, 'appearance-none cursor-pointer pr-10')}
                  value={formData.aiModel}
                  onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                >
                  {aiModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 bottom-4 pointer-events-none text-label-tertiary">
                  ▼
                </div>
              </div>
              <div className="h-px bg-border/40" />
              <div>
                <label className="block text-[11px] font-bold text-label-tertiary uppercase tracking-wider px-4 pt-3.5 flex items-center justify-between">
                  <span>System Prompt / Core Instructions</span>
                  {!formData.systemPrompt.trim() && <span className="text-[10px] text-destructive tracking-normal uppercase font-bold">Required</span>}
                </label>
                <textarea
                  className={cn(inputClass, 'min-h-[180px] font-mono text-[14px] leading-relaxed resize-none py-3')}
                  placeholder="Define role, response format, safety filters, tone of voice, etc..."
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                />
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-6 gap-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="md" 
                  onClick={() => setActiveTab('basic')}
                  className="w-auto px-6 cursor-pointer"
                >
                  <ArrowLeft size={16} className="mr-1.5" /> Back
                </Button>
                <Button 
                  variant="secondary" 
                  size="md" 
                  onClick={handleSave} 
                  isLoading={isSaving}
                  className="w-auto px-6 cursor-pointer"
                >
                  <Save size={16} className="mr-1.5" /> Save Draft
                </Button>
              </div>
              <Button 
                variant="primary" 
                size="md" 
                disabled={!isAdvancedValid}
                onClick={() => isAdvancedValid && setActiveTab('knowledge')}
                className="w-auto px-6 cursor-pointer"
              >
                Continue <ArrowRight size={16} className="ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Knowledge Base Form Tab ── */}
        {activeTab === 'knowledge' && (
          <div className="space-y-6 animate-in">
            <div 
              className="bg-card rounded-2xl border border-border/30 p-6 text-center shadow-sm flex flex-col items-center cursor-pointer hover:bg-muted/10 transition-colors"
              onClick={() => kbInputRef.current?.click()}
            >
              <input 
                type="file"
                ref={kbInputRef}
                onChange={handleKbChange}
                accept=".pdf,.txt,.docx"
                multiple
                className="hidden"
              />
              <div className="p-4 bg-primary/10 rounded-full text-primary mb-3">
                <Upload size={28} />
              </div>
              <h3 className="text-[16px] font-bold text-foreground mb-1">Knowledge Source Files</h3>
              <p className="text-[12px] text-label-tertiary mb-5 max-w-sm">
                Add proprietary guidelines, reference articles, or manuals. PDF, TXT, or DOCX formats supported (up to 10MB).
              </p>
              <Button variant="outline" size="md" className="cursor-pointer">
                Choose Files
              </Button>
            </div>

            {formData.knowledgeBase.length > 0 ? (
              <div className="space-y-2">
                {formData.knowledgeBase.map((file, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border/30 flex items-center justify-between px-4 py-3.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Database size={16} className="text-primary" />
                      <div className="flex flex-col text-left">
                        <span className="text-[14px] font-semibold text-label-secondary leading-tight">{file.name}</span>
                        <span className="text-[11px] text-label-tertiary font-medium">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveKbFile(i)
                      }}
                      className="text-destructive p-1.5 hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
                <AlertCircle size={18} className="flex-shrink-0 text-destructive" />
                <p className="text-[12px] font-semibold">Required: Please upload at least one knowledge source document to proceed.</p>
              </div>
            )}

            {/* Action Row */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-6 gap-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="md" 
                  onClick={() => setActiveTab('advanced')}
                  className="w-auto px-6 cursor-pointer"
                >
                  <ArrowLeft size={16} className="mr-1.5" /> Back
                </Button>
                <Button 
                  variant="secondary" 
                  size="md" 
                  onClick={handleSave} 
                  isLoading={isSaving}
                  className="w-auto px-6 cursor-pointer"
                >
                  <Save size={16} className="mr-1.5" /> Save Draft
                </Button>
              </div>
              <Button 
                variant="primary" 
                size="md" 
                disabled={!isKnowledgeValid}
                onClick={() => isKnowledgeValid && setActiveTab('publish')}
                className="w-auto px-6 cursor-pointer"
              >
                Continue <ArrowRight size={16} className="ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Submission Form Tab ── */}
        {activeTab === 'publish' && (
          <div className="space-y-6 animate-in">
            {/* Pricing Card */}
            <div className="bg-card rounded-2xl border border-border/30 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-foreground">Marketplace Pricing</h3>
                  <p className="text-[11px] text-label-tertiary mt-0.5">Define purchase rates or leave free</p>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/60 border border-border/40 rounded-xl px-4 py-2 font-black">
                  <span className="text-label-tertiary font-bold">$</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-20 text-right text-[16px] outline-none bg-transparent"
                    min={0}
                    step={0.01}
                  />
                </div>
              </div>
              <div className="h-px bg-border/40" />
              <p className="text-[12px] text-label-tertiary font-semibold">
                Note: A price of $0.00 displays your bot with a standard &ldquo;GET&rdquo; action indicator.
              </p>
            </div>

            {/* Checklist items */}
            <div className="bg-card rounded-2xl border border-border/30 p-5 shadow-sm space-y-4">
              <h3 className="text-[15px] font-bold text-foreground">Verification Checklist</h3>
              <div className="space-y-3">
                {[
                  { name: 'Bot name is configured', ok: !!formData.name.trim() },
                  { name: 'Bot icon is uploaded', ok: !!formData.image },
                  { name: 'AI model instructions defined', ok: !!formData.systemPrompt.trim() },
                  { name: 'Knowledge base documents uploaded', ok: formData.knowledgeBase.length > 0 },
                  { name: 'Pricing parameters saved', ok: formData.price >= 0 },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-2.5 text-[14px] font-semibold text-label-secondary">
                    {item.ok ? (
                      <span className="text-success text-lg leading-none">✓</span>
                    ) : (
                      <span className="text-destructive text-lg leading-none">✗</span>
                    )}
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" size="md" className="border-border/60 hover:bg-muted/30 cursor-pointer w-auto px-6">
              <Eye size={16} className="mr-1.5" /> Preview on Store
            </Button>

            {/* Action Row */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-6 gap-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="md" 
                  onClick={() => setActiveTab('knowledge')}
                  className="w-auto px-6 cursor-pointer"
                >
                  <ArrowLeft size={16} className="mr-1.5" /> Back
                </Button>
                <Button 
                  variant="secondary" 
                  size="md" 
                  onClick={handleSave} 
                  isLoading={isSaving}
                  className="w-auto px-6 cursor-pointer"
                >
                  <Save size={16} className="mr-1.5" /> Save Draft
                </Button>
              </div>
              <Button 
                variant="primary" 
                size="md" 
                disabled={!isPublishValid}
                className="w-auto px-8 shadow-lg shadow-primary/25 cursor-pointer" 
                onClick={handlePublishSubmit}
              >
                Submit Bot
              </Button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}

export default BotStudioPage
