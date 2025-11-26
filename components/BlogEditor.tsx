import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { BlogPost, Category, BlogStatus } from '../types';
import { generateBlogPost } from '../services/geminiService';
import { calculateSEOScore, SEOScoreDisplay } from './SEOSchema';

interface BlogEditorProps {
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
  existingPost?: BlogPost | null;
  allPosts?: BlogPost[];
}

type EditorTab = 'content' | 'seo' | 'images' | 'links' | 'settings';

// Helper to create URL-friendly slug
const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// Character counter component
const CharCounter: React.FC<{ current: number; max: number; label?: string }> = ({ current, max, label }) => {
  const percentage = (current / max) * 100;
  const isOver = current > max;
  const isWarning = percentage > 80 && !isOver;

  return (
    <div className={`text-xs flex items-center gap-2 ${isOver ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-slate-500'}`}>
      {label && <span>{label}:</span>}
      <span className="font-mono">{current}/{max}</span>
      {isOver && <i className="fas fa-exclamation-triangle"></i>}
    </div>
  );
};

// SEO Preview component (Google Search Result Preview)
const SEOPreview: React.FC<{ title: string; description: string; slug: string }> = ({ title, description, slug }) => {
  const displayTitle = title || 'Titel van je artikel';
  const displayDesc = description || 'Voeg een meta beschrijving toe om te zien hoe je artikel eruitziet in Google zoekresultaten.';
  const displayUrl = `writgo.nl/blog/${slug || 'artikel-slug'}`;

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      <p className="text-xs text-slate-500 mb-1">Preview in Google zoekresultaten</p>
      <div className="space-y-1">
        <p className="text-sm text-green-700 truncate">{displayUrl}</p>
        <h3 className="text-lg text-blue-800 hover:underline cursor-pointer truncate" style={{ fontFamily: 'Arial, sans-serif' }}>
          {displayTitle.length > 60 ? displayTitle.substring(0, 57) + '...' : displayTitle}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-2" style={{ fontFamily: 'Arial, sans-serif' }}>
          {displayDesc.length > 160 ? displayDesc.substring(0, 157) + '...' : displayDesc}
        </p>
      </div>
    </div>
  );
};

export const BlogEditor: React.FC<BlogEditorProps> = ({ onSave, onCancel, existingPost, allPosts = [] }) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('content');
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Form state
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    id: existingPost?.id || `blog-${Date.now()}`,
    slug: existingPost?.slug || '',
    title: existingPost?.title || '',
    seoTitle: existingPost?.seoTitle || '',
    metaDescription: existingPost?.metaDescription || '',
    excerpt: existingPost?.excerpt || '',
    content: existingPost?.content || '',
    author: existingPost?.author || 'Writgo Redactie',
    date: existingPost?.date || new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }),
    imageUrl: existingPost?.imageUrl || '',
    featuredImage: existingPost?.featuredImage || { url: '', alt: '', width: 800, height: 533 },
    contentImage: existingPost?.contentImage,
    category: existingPost?.category || Category.OTHER,
    tags: existingPost?.tags || [],
    readTime: existingPost?.readTime || '5 min',
    keyTakeaways: existingPost?.keyTakeaways || [],
    faq: existingPost?.faq || [],
    internalLinks: existingPost?.internalLinks || { blogs: [], products: [] },
    status: existingPost?.status || 'draft',
    publishedAt: existingPost?.publishedAt,
    createdAt: existingPost?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewCount: existingPost?.viewCount || 0,
  });

  // AI Generation state
  const [aiTopic, setAiTopic] = useState('');
  const [aiTargetAudience, setAiTargetAudience] = useState('');
  const [aiKeywords, setAiKeywords] = useState('');

  // Tags input state
  const [tagInput, setTagInput] = useState('');

  // Key takeaways input state
  const [takeawayInput, setTakeawayInput] = useState('');

  // Use ref for autoSave to avoid recreating the callback
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // Calculate SEO score - memoized
  const seoScore = useMemo(() => calculateSEOScore(formData as BlogPost), [formData]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !existingPost) {
      setFormData(prev => ({
        ...prev,
        slug: createSlug(formData.title || '')
      }));
    }
  }, [formData.title, existingPost]);

  // Auto-save draft (debounced) - using ref to avoid dependency issues
  const autoSave = useCallback(() => {
    setAutoSaveStatus('saving');
    const draft = JSON.stringify(formDataRef.current);
    localStorage.setItem(`blog_draft_${formDataRef.current.id}`, draft);
    setTimeout(() => setAutoSaveStatus('saved'), 500);
  }, []);

  useEffect(() => {
    setAutoSaveStatus('unsaved');
    const timer = setTimeout(autoSave, 2000);
    return () => clearTimeout(timer);
  }, [formData, autoSave]);

  // Memoize available posts for linking (exclude current post)
  const availableLinkPosts = useMemo(() => 
    allPosts.filter(post => post.id !== formData.id),
    [allPosts, formData.id]
  );

  const handleInputChange = (field: keyof BlogPost, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeaturedImageChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      featuredImage: {
        ...prev.featuredImage!,
        [field]: value
      },
      imageUrl: field === 'url' ? value as string : prev.imageUrl
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleAddTakeaway = () => {
    if (takeawayInput.trim()) {
      setFormData(prev => ({
        ...prev,
        keyTakeaways: [...(prev.keyTakeaways || []), takeawayInput.trim()]
      }));
      setTakeawayInput('');
    }
  };

  const handleRemoveTakeaway = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyTakeaways: prev.keyTakeaways?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAddFAQ = () => {
    setFormData(prev => ({
      ...prev,
      faq: [...(prev.faq || []), { question: '', answer: '' }]
    }));
  };

  const handleUpdateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq?.map((item, i) => i === index ? { ...item, [field]: value } : item) || []
    }));
  };

  const handleRemoveFAQ = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq?.filter((_, i) => i !== index) || []
    }));
  };

  const handleToggleBlogLink = (blogId: string) => {
    setFormData(prev => {
      const currentLinks = prev.internalLinks?.blogs || [];
      const newLinks = currentLinks.includes(blogId)
        ? currentLinks.filter(id => id !== blogId)
        : [...currentLinks, blogId];
      return {
        ...prev,
        internalLinks: {
          ...prev.internalLinks!,
          blogs: newLinks
        }
      };
    });
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) return;

    setIsGenerating(true);
    try {
      const generated = await generateBlogPost({
        topic: aiTopic,
        targetAudience: aiTargetAudience,
        keywords: aiKeywords
      });

      if (generated) {
        setFormData(prev => ({
          ...prev,
          title: generated.title,
          slug: generated.slug,
          excerpt: generated.excerpt,
          content: generated.content,
          category: generated.category,
          readTime: generated.readTime,
          author: generated.author,
          keyTakeaways: generated.keyTakeaways || [],
          faq: generated.faq || [],
          // Generate SEO fields from AI content
          seoTitle: generated.title.length > 60 ? generated.title.substring(0, 57) + '...' : generated.title,
          metaDescription: generated.excerpt.length > 160 ? generated.excerpt.substring(0, 157) + '...' : generated.excerpt,
        }));
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('Er ging iets mis bij het genereren. Probeer het opnieuw.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.title?.trim()) {
      alert('Vul een titel in');
      setActiveTab('content');
      return;
    }

    if (!formData.content?.trim()) {
      alert('Vul content in');
      setActiveTab('content');
      return;
    }

    // Update timestamps
    const now = new Date().toISOString();
    const finalData: BlogPost = {
      ...formData,
      updatedAt: now,
      publishedAt: formData.status === 'published' && !formData.publishedAt ? now : formData.publishedAt,
      seoScore: seoScore,
    } as BlogPost;

    onSave(finalData);
  };

  const tabs: { id: EditorTab; label: string; icon: string }[] = [
    { id: 'content', label: 'Content', icon: 'fa-file-alt' },
    { id: 'seo', label: 'SEO', icon: 'fa-search' },
    { id: 'images', label: 'Afbeeldingen', icon: 'fa-image' },
    { id: 'links', label: 'Links', icon: 'fa-link' },
    { id: 'settings', label: 'Instellingen', icon: 'fa-cog' },
  ];

  const renderContentTab = () => (
    <div className="space-y-6">
      {/* AI Generation Section */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <i className="fas fa-wand-magic-sparkles mr-2 text-brand-400"></i>
          AI Artikel Generator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="Onderwerp..."
            className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
          <input
            type="text"
            value={aiTargetAudience}
            onChange={(e) => setAiTargetAudience(e.target.value)}
            placeholder="Doelgroep..."
            className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
          <input
            type="text"
            value={aiKeywords}
            onChange={(e) => setAiKeywords(e.target.value)}
            placeholder="Keywords..."
            className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
        </div>
        <button
          onClick={handleAIGenerate}
          disabled={isGenerating || !aiTopic.trim()}
          className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition-colors"
        >
          {isGenerating ? (
            <><i className="fas fa-circle-notch fa-spin mr-2"></i>Genereren...</>
          ) : (
            <><i className="fas fa-wand-magic-sparkles mr-2"></i>Genereer met AI</>
          )}
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Titel <span className="text-accent-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Voer de titel van je artikel in..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Samenvatting / Excerpt
        </label>
        <textarea
          value={formData.excerpt}
          onChange={(e) => handleInputChange('excerpt', e.target.value)}
          placeholder="Korte samenvatting van het artikel..."
          rows={3}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Content (HTML) <span className="text-accent-500">*</span>
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          placeholder="<h2>Kop</h2><p>Je content hier...</p>"
          rows={15}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-y"
        />
        <p className="text-xs text-slate-500 mt-1">
          Gebruik HTML tags: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;a&gt;, &lt;blockquote&gt;
        </p>
      </div>

      {/* Key Takeaways */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Key Takeaways
        </label>
        <div className="space-y-2 mb-3">
          {formData.keyTakeaways?.map((takeaway, index) => (
            <div key={index} className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
              <i className="fas fa-check-circle text-brand-400"></i>
              <span className="flex-1 text-slate-300 text-sm">{takeaway}</span>
              <button
                onClick={() => handleRemoveTakeaway(index)}
                className="text-red-400 hover:text-red-300"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={takeawayInput}
            onChange={(e) => setTakeawayInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTakeaway()}
            placeholder="Voeg een key takeaway toe..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
          <button
            onClick={handleAddTakeaway}
            className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Veelgestelde Vragen (FAQ)
        </label>
        <div className="space-y-4 mb-3">
          {formData.faq?.map((item, index) => (
            <div key={index} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-slate-500">Vraag {index + 1}</span>
                <button
                  onClick={() => handleRemoveFAQ(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              </div>
              <input
                type="text"
                value={item.question}
                onChange={(e) => handleUpdateFAQ(index, 'question', e.target.value)}
                placeholder="Vraag..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm mb-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
              <textarea
                value={item.answer}
                onChange={(e) => handleUpdateFAQ(index, 'answer', e.target.value)}
                placeholder="Antwoord..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleAddFAQ}
          className="text-sm text-brand-400 hover:text-brand-300 flex items-center"
        >
          <i className="fas fa-plus mr-2"></i> Voeg FAQ toe
        </button>
      </div>
    </div>
  );

  const renderSEOTab = () => (
    <div className="space-y-6">
      {/* SEO Score */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <i className="fas fa-chart-line mr-2 text-brand-400"></i>
            SEO Score
          </h3>
          <SEOScoreDisplay score={seoScore} showDetails />
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              seoScore >= 80 ? 'bg-green-500' :
              seoScore >= 60 ? 'bg-yellow-500' :
              seoScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${seoScore}%` }}
          />
        </div>
      </div>

      {/* SEO Title */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-slate-300">
            SEO Titel
          </label>
          <CharCounter current={formData.seoTitle?.length || 0} max={60} />
        </div>
        <input
          type="text"
          value={formData.seoTitle}
          onChange={(e) => handleInputChange('seoTitle', e.target.value)}
          placeholder="Titel voor zoekmachines (max 60 karakters)"
          maxLength={60}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
        />
        <p className="text-xs text-slate-500 mt-1">
          Ideaal: 50-60 karakters. Bevat je belangrijkste keyword.
        </p>
      </div>

      {/* Meta Description */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-slate-300">
            Meta Beschrijving
          </label>
          <CharCounter current={formData.metaDescription?.length || 0} max={160} />
        </div>
        <textarea
          value={formData.metaDescription}
          onChange={(e) => handleInputChange('metaDescription', e.target.value)}
          placeholder="Beschrijving voor zoekmachines (max 160 karakters)"
          maxLength={160}
          rows={3}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none"
        />
        <p className="text-xs text-slate-500 mt-1">
          Ideaal: 150-160 karakters. Beschrijf de waarde voor de lezer.
        </p>
      </div>

      {/* URL Slug */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          URL Slug
        </label>
        <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl overflow-hidden">
          <span className="px-4 py-3 bg-slate-800 text-slate-500 text-sm border-r border-slate-700">
            writgo.nl/blog/
          </span>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', createSlug(e.target.value))}
            placeholder="url-van-je-artikel"
            className="flex-1 bg-transparent px-4 py-3 text-white focus:outline-none"
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Automatisch gegenereerd uit titel. Gebruik kleine letters en streepjes.
        </p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Tags / Keywords
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-sm border border-brand-500/30"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 hover:text-red-400"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            placeholder="Voeg een tag toe..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
          <button
            onClick={handleAddTag}
            className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>

      {/* SEO Preview */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <i className="fab fa-google mr-2"></i>
          Google Preview
        </label>
        <SEOPreview
          title={formData.seoTitle || formData.title || ''}
          description={formData.metaDescription || formData.excerpt || ''}
          slug={formData.slug || ''}
        />
      </div>
    </div>
  );

  const renderImagesTab = () => (
    <div className="space-y-6">
      {/* Featured Image */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <i className="fas fa-image mr-2 text-brand-400"></i>
          Uitgelichte Afbeelding
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Afbeelding URL <span className="text-accent-500">*</span>
              </label>
              <input
                type="url"
                value={formData.featuredImage?.url || ''}
                onChange={(e) => handleFeaturedImageChange('url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Alt Tekst (voor SEO) <span className="text-accent-500">*</span>
              </label>
              <input
                type="text"
                value={formData.featuredImage?.alt || ''}
                onChange={(e) => handleFeaturedImageChange('alt', e.target.value)}
                placeholder="Beschrijf de afbeelding..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                Verplicht voor SEO. Beschrijf wat er op de afbeelding te zien is.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Breedte</label>
                <input
                  type="number"
                  value={formData.featuredImage?.width || 800}
                  onChange={(e) => handleFeaturedImageChange('width', parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Hoogte</label>
                <input
                  type="number"
                  value={formData.featuredImage?.height || 533}
                  onChange={(e) => handleFeaturedImageChange('height', parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Image Preview */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Preview</label>
            <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
              {formData.featuredImage?.url ? (
                <img
                  src={formData.featuredImage.url}
                  alt={formData.featuredImage.alt || 'Preview'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x533?text=Afbeelding+niet+gevonden';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <div className="text-center">
                    <i className="fas fa-image text-4xl mb-2"></i>
                    <p className="text-sm">Geen afbeelding</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Image */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <i className="fas fa-photo-film mr-2 text-accent-400"></i>
          Content Afbeelding
          <span className="ml-2 text-xs text-slate-500 font-normal">(optioneel)</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Afbeelding URL
            </label>
            <input
              type="url"
              value={formData.contentImage?.url || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                contentImage: { ...(prev.contentImage || { url: '', alt: '', position: 'auto' }), url: e.target.value }
              }))}
              placeholder="https://example.com/content-image.jpg"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Alt Tekst</label>
              <input
                type="text"
                value={formData.contentImage?.alt || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contentImage: { ...(prev.contentImage || { url: '', alt: '', position: 'auto' }), alt: e.target.value }
                }))}
                placeholder="Beschrijf de afbeelding..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Onderschrift</label>
              <input
                type="text"
                value={formData.contentImage?.caption || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contentImage: { ...(prev.contentImage || { url: '', alt: '', position: 'auto' }), caption: e.target.value }
                }))}
                placeholder="Optioneel onderschrift..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Positie</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contentImagePosition"
                  value="auto"
                  checked={formData.contentImage?.position !== 'custom'}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    contentImage: { ...(prev.contentImage || { url: '', alt: '', position: 'auto' }), position: 'auto' }
                  }))}
                  className="mr-2"
                />
                <span className="text-slate-300">Automatisch (midden)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contentImagePosition"
                  value="custom"
                  checked={formData.contentImage?.position === 'custom'}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    contentImage: { ...(prev.contentImage || { url: '', alt: '', position: 'auto' }), position: 'custom' }
                  }))}
                  className="mr-2"
                />
                <span className="text-slate-300">Aangepast</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLinksTab = () => (
    <div className="space-y-6">
      {/* Internal Blog Links */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <i className="fas fa-blog mr-2 text-brand-400"></i>
          Gerelateerde Blog Posts
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Selecteer blogs om als gerelateerde content te tonen. Dit verbetert interne linking en SEO.
        </p>

        {availableLinkPosts.length === 0 ? (
          <p className="text-slate-500 text-sm">Geen andere blog posts beschikbaar.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
            {availableLinkPosts.map(post => (
                <label
                  key={post.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    formData.internalLinks?.blogs.includes(post.id)
                      ? 'bg-brand-500/20 border border-brand-500/30'
                      : 'bg-slate-900 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.internalLinks?.blogs.includes(post.id) || false}
                    onChange={() => handleToggleBlogLink(post.id)}
                    className="mr-3 rounded border-slate-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{post.title}</p>
                    <p className="text-slate-500 text-xs">{post.category} • {post.date}</p>
                  </div>
                  {post.seoScore && (
                    <SEOScoreDisplay score={post.seoScore} />
                  )}
                </label>
              ))}
          </div>
        )}
      </div>

      {/* Selected Links Summary */}
      {(formData.internalLinks?.blogs.length || 0) > 0 && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center text-green-400 text-sm">
            <i className="fas fa-check-circle mr-2"></i>
            <span>
              {formData.internalLinks?.blogs.length} gerelateerde blog(s) geselecteerd
            </span>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h4 className="text-sm font-semibold text-white mb-2">
          <i className="fas fa-lightbulb mr-2 text-yellow-400"></i>
          Tips voor interne linking
        </h4>
        <ul className="text-sm text-slate-400 space-y-2">
          <li className="flex items-start">
            <i className="fas fa-check text-green-400 mr-2 mt-1 text-xs"></i>
            Link naar 2-4 relevante blogs per artikel
          </li>
          <li className="flex items-start">
            <i className="fas fa-check text-green-400 mr-2 mt-1 text-xs"></i>
            Kies blogs met een vergelijkbaar onderwerp of doelgroep
          </li>
          <li className="flex items-start">
            <i className="fas fa-check text-green-400 mr-2 mt-1 text-xs"></i>
            Voeg ook links toe in de content zelf met &lt;a href="#/blog/slug"&gt;
          </li>
        </ul>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
        <div className="flex gap-4">
          {(['draft', 'published', 'archived'] as BlogStatus[]).map((status) => (
            <label
              key={status}
              className={`flex items-center px-4 py-2 rounded-lg cursor-pointer border transition-colors ${
                formData.status === status
                  ? status === 'published' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                    status === 'draft' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
                    'bg-slate-500/20 border-slate-500/30 text-slate-400'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={status}
                checked={formData.status === status}
                onChange={() => handleInputChange('status', status)}
                className="sr-only"
              />
              <i className={`fas ${
                status === 'published' ? 'fa-check-circle' :
                status === 'draft' ? 'fa-edit' : 'fa-archive'
              } mr-2`}></i>
              {status === 'draft' ? 'Concept' : status === 'published' ? 'Gepubliceerd' : 'Gearchiveerd'}
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Categorie</label>
        <select
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value as Category)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        >
          {Object.values(Category).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Author */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Auteur</label>
        <input
          type="text"
          value={formData.author}
          onChange={(e) => handleInputChange('author', e.target.value)}
          placeholder="Naam van de auteur"
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      </div>

      {/* Read Time */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Leestijd</label>
        <input
          type="text"
          value={formData.readTime}
          onChange={(e) => handleInputChange('readTime', e.target.value)}
          placeholder="bijv. 5 min"
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      </div>

      {/* Metadata Info */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <h4 className="text-sm font-semibold text-white mb-3">Metadata</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">ID:</span>
            <span className="text-slate-300 ml-2 font-mono text-xs">{formData.id}</span>
          </div>
          <div>
            <span className="text-slate-500">Weergaven:</span>
            <span className="text-slate-300 ml-2">{formData.viewCount || 0}</span>
          </div>
          <div>
            <span className="text-slate-500">Aangemaakt:</span>
            <span className="text-slate-300 ml-2">{formData.createdAt ? new Date(formData.createdAt).toLocaleDateString('nl-NL') : '-'}</span>
          </div>
          <div>
            <span className="text-slate-500">Bijgewerkt:</span>
            <span className="text-slate-300 ml-2">{formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString('nl-NL') : '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Terug
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {existingPost ? 'Artikel Bewerken' : 'Nieuw Artikel'}
            </h1>
            <p className="text-slate-400 text-sm">
              {formData.title || 'Ongetiteld artikel'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Auto-save status */}
          <span className={`text-xs flex items-center ${
            autoSaveStatus === 'saved' ? 'text-green-400' :
            autoSaveStatus === 'saving' ? 'text-yellow-400' : 'text-slate-500'
          }`}>
            <i className={`fas ${
              autoSaveStatus === 'saved' ? 'fa-check-circle' :
              autoSaveStatus === 'saving' ? 'fa-circle-notch fa-spin' : 'fa-circle'
            } mr-1`}></i>
            {autoSaveStatus === 'saved' ? 'Opgeslagen' :
             autoSaveStatus === 'saving' ? 'Opslaan...' : 'Niet opgeslagen'}
          </span>

          {/* SEO Score */}
          <SEOScoreDisplay score={seoScore} showDetails />

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center"
          >
            <i className="fas fa-save mr-2"></i>
            {formData.status === 'published' ? 'Publiceren' : 'Opslaan'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-slate-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-all flex items-center ${
              activeTab === tab.id
                ? 'text-brand-400 border-b-2 border-brand-400 -mb-px'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className={`fas ${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
        {activeTab === 'content' && renderContentTab()}
        {activeTab === 'seo' && renderSEOTab()}
        {activeTab === 'images' && renderImagesTab()}
        {activeTab === 'links' && renderLinksTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};
