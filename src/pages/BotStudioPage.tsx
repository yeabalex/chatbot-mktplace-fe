import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/ui/Button'
import { Upload, Plus, Trash2, Save, Eye } from 'lucide-react'
import { cn } from '../lib/utils'

interface BotFormData {
  name: string
  description: string
  shortDescription: string
  category: string
  image: string
  aiModel: string
  knowledgeBase: string[]
  systemPrompt: string
  price: number
  visibility: 'private' | 'public'
  tags: string[]
}

const inputClass =
  'w-full px-4 py-3.5 text-[17px] bg-transparent outline-none placeholder:text-label-tertiary'

const BotStudioPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'knowledge' | 'publish'>('basic')
  const [isSaving, setIsSaving] = useState(false)
  const [newTag, setNewTag] = useState('')

  const [formData, setFormData] = useState<BotFormData>({
    name: id ? 'My Existing Bot' : '',
    description: id ? 'A description of the bot' : '',
    shortDescription: '',
    category: 'Business',
    image: '',
    aiModel: 'gpt-4',
    knowledgeBase: [],
    systemPrompt: '',
    price: 0,
    visibility: 'public',
    tags: [],
  })

  const tabs = [
    { id: 'basic' as const, label: 'App Info' },
    { id: 'advanced' as const, label: 'AI' },
    { id: 'knowledge' as const, label: 'Data' },
    { id: 'publish' as const, label: 'Submit' },
  ]

  const categories = ['Business', 'Productivity', 'Education', 'Health & Fitness', 'Developer Tools']
  const aiModels = ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet']

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] })
      setNewTag('')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      alert('Draft saved')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    setIsSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 1500))
      alert('Submitted for App Review!')
      navigate('/marketplace')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Layout title={id ? 'Edit App' : 'New App'}>
      <div className="px-4 pb-8">
        <p className="ios-subhead mb-4 -mt-2">
          Submit your bot to the App Store for review.
        </p>

        {/* Segmented tabs */}
        <div className="flex p-1 bg-fill-secondary/30 rounded-[10px] mb-6 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 py-1.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap px-2 transition-all',
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-label-secondary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-6">
              <div className="w-[100px] h-[100px] app-icon bg-fill-secondary/30 flex items-center justify-center mb-3">
                {formData.image ? (
                  <img src={formData.image} alt="" className="w-full h-full object-cover app-icon" />
                ) : (
                  <Upload size={32} className="text-label-tertiary" />
                )}
              </div>
              <button className="text-primary text-[15px] font-medium">Add App Icon</button>
              <p className="ios-caption mt-1">1024×1024 required for store</p>
            </div>

            <div className="ios-grouped">
              <input
                className={inputClass}
                placeholder="App Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <div className="ios-separator !ml-0" />
              <input
                className={inputClass}
                placeholder="Subtitle"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              />
              <div className="ios-separator !ml-0" />
              <textarea
                className={cn(inputClass, 'min-h-[100px] resize-none')}
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div className="ios-separator !ml-0" />
              <select
                className={inputClass}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <input
                className="ios-search flex-1"
                placeholder="Add keyword"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button variant="secondary" size="sm" onClick={handleAddTag}>
                <Plus size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-fill-secondary/30 text-[13px] flex items-center gap-1"
                >
                  {tag}
                  <button onClick={() => setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })}>×</button>
                </span>
              ))}
            </div>

            <Button variant="primary" fullWidth onClick={() => setActiveTab('advanced')}>
              Continue
            </Button>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div className="ios-grouped">
              <select
                className={inputClass}
                value={formData.aiModel}
                onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
              >
                {aiModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <div className="ios-separator !ml-0" />
              <textarea
                className={cn(inputClass, 'min-h-[140px] font-mono text-[15px] resize-none')}
                placeholder="System prompt / instructions"
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              />
            </div>

            <p className="ios-footnote px-1">Visibility</p>
            <div className="ios-grouped">
              {(['private', 'public'] as const).map((v, i) => (
                <div key={v}>
                  <label className="flex items-center justify-between px-4 py-3.5 cursor-pointer">
                    <span className="text-[17px] capitalize">{v === 'public' ? 'Public on Store' : 'Private'}</span>
                    <input
                      type="radio"
                      name="vis"
                      checked={formData.visibility === v}
                      onChange={() => setFormData({ ...formData, visibility: v })}
                      className="accent-primary w-5 h-5"
                    />
                  </label>
                  {i === 0 && <div className="ios-separator !ml-0" />}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setActiveTab('basic')}>
                Back
              </Button>
              <Button variant="primary" fullWidth onClick={() => setActiveTab('knowledge')}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="space-y-4">
            <div className="ios-grouped p-6 text-center">
              <Upload size={28} className="mx-auto text-label-tertiary mb-2" />
              <p className="ios-headline text-[15px] mb-1">Upload Knowledge</p>
              <p className="ios-footnote mb-4">PDF, TXT, DOCX up to 10MB</p>
              <Button variant="secondary" size="sm">
                Choose Files
              </Button>
            </div>

            {formData.knowledgeBase.map((file, i) => (
              <div key={i} className="ios-grouped flex items-center justify-between px-4 py-3">
                <span className="ios-subhead">{file}</span>
                <button className="text-destructive p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setActiveTab('advanced')}>
                Back
              </Button>
              <Button variant="primary" fullWidth onClick={() => setActiveTab('publish')}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'publish' && (
          <div className="space-y-4">
            <div className="ios-grouped">
              <div className="flex items-center px-4 py-3.5">
                <span className="flex-1 text-[17px]">Price</span>
                <span className="text-label-tertiary mr-1">$</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-20 text-right text-[17px] outline-none"
                  min={0}
                  step={0.01}
                />
              </div>
              <div className="ios-separator !ml-0" />
              <div className="px-4 py-3">
                <p className="ios-footnote">Set to $0 for a free app with GET button</p>
              </div>
            </div>

            <div className="ios-grouped p-4 space-y-2">
              <p className="ios-headline text-[15px] mb-2">Review Checklist</p>
              {['App icon & name', 'AI model configured', 'Pricing set'].map((item) => (
                <p key={item} className="ios-subhead flex items-center gap-2">
                  <span className="text-success">✓</span> {item}
                </p>
              ))}
            </div>

            <Button variant="ghost" fullWidth>
              <Eye size={16} /> Preview on Store
            </Button>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setActiveTab('knowledge')}>
                Back
              </Button>
              <Button variant="primary" fullWidth onClick={handlePublish} isLoading={isSaving}>
                Submit for Review
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-separator/60">
          <Button variant="secondary" fullWidth onClick={handleSave} isLoading={isSaving}>
            <Save size={16} /> Save Draft
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default BotStudioPage
