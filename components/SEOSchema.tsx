import React from 'react';
import { BlogPost as BlogPostType } from '../types';

interface SEOSchemaProps {
  post: BlogPostType;
  baseUrl?: string;
}

// Helper to generate Schema.org Article structured data
const generateArticleSchema = (post: BlogPostType, baseUrl: string) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.seoTitle || post.title,
    "description": post.metaDescription || post.excerpt,
    "image": post.featuredImage?.url || post.imageUrl,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Writgo Academy",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "datePublished": post.publishedAt || post.date,
    "dateModified": post.updatedAt || post.publishedAt || post.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`
    },
    "articleSection": post.category,
    "keywords": post.tags?.join(', ') || '',
    "wordCount": post.content ? post.content.split(/\s+/).length : 0
  };

  return schema;
};

// Helper to generate FAQ Schema
const generateFAQSchema = (post: BlogPostType) => {
  if (!post.faq || post.faq.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faq.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return schema;
};

// Helper to generate Breadcrumb Schema
const generateBreadcrumbSchema = (post: BlogPostType, baseUrl: string) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${baseUrl}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `${baseUrl}/blog/${post.slug}`
      }
    ]
  };

  return schema;
};

export const SEOSchema: React.FC<SEOSchemaProps> = ({ post, baseUrl = 'https://writgo.nl' }) => {
  const articleSchema = generateArticleSchema(post, baseUrl);
  const faqSchema = generateFAQSchema(post);
  const breadcrumbSchema = generateBreadcrumbSchema(post, baseUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
};

// SEO Meta Tags component for document head
interface SEOMetaProps {
  post: BlogPostType;
  baseUrl?: string;
}

export const SEOMeta: React.FC<SEOMetaProps> = ({ post, baseUrl = 'https://writgo.nl' }) => {
  // Note: In a real implementation with Next.js, you would use next/head
  // For this client-side app, we'll update document head directly
  React.useEffect(() => {
    // Store original title to restore on cleanup
    const originalTitle = document.title;
    
    // Track created meta tags for cleanup
    const createdElements: HTMLElement[] = [];

    // Update page title
    document.title = post.seoTitle || `${post.title} | Writgo Academy`;

    // Update or create meta tags
    const updateOrCreateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
        createdElements.push(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    updateOrCreateMeta('description', post.metaDescription || post.excerpt);
    updateOrCreateMeta('author', post.author);
    if (post.tags) {
      updateOrCreateMeta('keywords', post.tags.join(', '));
    }

    // Open Graph tags
    updateOrCreateMeta('og:title', post.seoTitle || post.title, true);
    updateOrCreateMeta('og:description', post.metaDescription || post.excerpt, true);
    updateOrCreateMeta('og:type', 'article', true);
    updateOrCreateMeta('og:url', `${baseUrl}/blog/${post.slug}`, true);
    updateOrCreateMeta('og:image', post.featuredImage?.url || post.imageUrl, true);
    updateOrCreateMeta('og:site_name', 'Writgo Academy', true);

    // Twitter Card tags
    updateOrCreateMeta('twitter:card', 'summary_large_image');
    updateOrCreateMeta('twitter:title', post.seoTitle || post.title);
    updateOrCreateMeta('twitter:description', post.metaDescription || post.excerpt);
    updateOrCreateMeta('twitter:image', post.featuredImage?.url || post.imageUrl);

    // Article specific tags
    if (post.publishedAt) {
      updateOrCreateMeta('article:published_time', post.publishedAt, true);
    }
    if (post.updatedAt) {
      updateOrCreateMeta('article:modified_time', post.updatedAt, true);
    }
    updateOrCreateMeta('article:author', post.author, true);
    updateOrCreateMeta('article:section', post.category, true);
    if (post.tags) {
      post.tags.forEach((tag, index) => {
        updateOrCreateMeta(`article:tag:${index}`, tag, true);
      });
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const createdCanonical = !canonical;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${baseUrl}/blog/${post.slug}`;

    // Cleanup function - remove created elements and restore original title
    return () => {
      document.title = originalTitle;
      createdElements.forEach(el => el.remove());
      if (createdCanonical && canonical) {
        canonical.remove();
      }
    };
  }, [post, baseUrl]);

  return null;
};

// SEO Score Calculator
export const calculateSEOScore = (post: BlogPostType): number => {
  let score = 0;
  const checks: { passed: boolean; weight: number }[] = [];

  // SEO Title check (max 60 chars, exists)
  const hasSeoTitle = !!post.seoTitle && post.seoTitle.length > 0;
  const seoTitleLength = post.seoTitle?.length || 0;
  const seoTitleOptimal = seoTitleLength > 30 && seoTitleLength <= 60;
  checks.push({ passed: hasSeoTitle && seoTitleOptimal, weight: 15 });

  // Meta description check (max 160 chars, exists)
  const hasMetaDesc = !!post.metaDescription && post.metaDescription.length > 0;
  const metaDescLength = post.metaDescription?.length || 0;
  const metaDescOptimal = metaDescLength > 120 && metaDescLength <= 160;
  checks.push({ passed: hasMetaDesc && metaDescOptimal, weight: 15 });

  // Featured image with alt text
  const hasFeaturedImage = !!post.featuredImage?.url;
  const hasAltText = !!post.featuredImage?.alt && post.featuredImage.alt.length > 5;
  checks.push({ passed: hasFeaturedImage && hasAltText, weight: 10 });

  // Content length (at least 300 words)
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  checks.push({ passed: wordCount >= 300, weight: 10 });

  // Has key takeaways
  checks.push({ passed: !!post.keyTakeaways && post.keyTakeaways.length >= 3, weight: 10 });

  // Has FAQ section
  checks.push({ passed: !!post.faq && post.faq.length >= 2, weight: 10 });

  // Has tags
  checks.push({ passed: !!post.tags && post.tags.length >= 3, weight: 5 });

  // Has internal links
  const hasInternalLinks = !!post.internalLinks && 
    (post.internalLinks.blogs.length > 0 || post.internalLinks.products.length > 0);
  checks.push({ passed: hasInternalLinks, weight: 10 });

  // Slug is SEO-friendly (no special chars, reasonable length)
  const slugOptimal = post.slug && post.slug.length > 5 && post.slug.length < 60 && 
    /^[a-z0-9-]+$/.test(post.slug);
  checks.push({ passed: !!slugOptimal, weight: 5 });

  // Has author
  checks.push({ passed: !!post.author && post.author.length > 2, weight: 5 });

  // Is published
  checks.push({ passed: post.status === 'published', weight: 5 });

  // Calculate score
  checks.forEach(check => {
    if (check.passed) {
      score += check.weight;
    }
  });

  return Math.min(100, score);
};

// SEO Score Display Component
interface SEOScoreDisplayProps {
  score: number;
  showDetails?: boolean;
}

export const SEOScoreDisplay: React.FC<SEOScoreDisplayProps> = ({ score, showDetails = false }) => {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-400';
    if (s >= 60) return 'text-yellow-400';
    if (s >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (s: number) => {
    if (s >= 80) return 'bg-green-500/20 border-green-500/30';
    if (s >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    if (s >= 40) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Uitstekend';
    if (s >= 60) return 'Goed';
    if (s >= 40) return 'Matig';
    return 'Zwak';
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded border ${getScoreBgColor(score)}`}>
      <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}</span>
      {showDetails && (
        <span className={`ml-1 text-xs ${getScoreColor(score)}`}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
};
