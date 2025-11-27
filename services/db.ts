/**
 * Database Service Layer
 * 
 * This module provides a unified interface for data access.
 * It supports both Supabase (when configured) and LocalStorage (fallback).
 * 
 * When Supabase is configured via environment variables, all data operations
 * will use the Supabase database. Otherwise, it falls back to LocalStorage
 * for backward compatibility and local development.
 */

import { GrowthItem, BlogPost, ContentType } from '../types';
import { STATIC_ITEMS, STATIC_BLOG_POSTS } from '../constants';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { DbCourse, DbBlogPost } from '../database';

// Versiebeheer voor LocalStorage (used as fallback)
const DB_VERSION = '4.0';

// ============================================================================
// TYPE CONVERSION HELPERS
// Convert between database schema and application types
// ============================================================================

/**
 * Convert database course record to GrowthItem
 */
const dbCourseToGrowthItem = (dbCourse: DbCourse): GrowthItem => {
  // Convert review content with proper type handling
  const reviewContent = dbCourse.review_content ? {
    introduction: dbCourse.review_content.introduction || '',
    featuresAnalysis: dbCourse.review_content.featuresAnalysis || '',
    easeOfUse: dbCourse.review_content.easeOfUse || '',
    supportQuality: dbCourse.review_content.supportQuality || '',
    verdict: dbCourse.review_content.verdict || '',
  } : undefined;

  // Convert scores with proper type handling
  const scores = dbCourse.scores ? {
    usability: dbCourse.scores.usability || 0,
    priceValue: dbCourse.scores.priceValue || 0,
    features: dbCourse.scores.features || 0,
    support: dbCourse.scores.support || 0,
  } : undefined;

  // Convert review author with proper type handling
  const reviewAuthor = dbCourse.review_author ? {
    name: dbCourse.review_author.name || '',
    role: dbCourse.review_author.role || '',
    avatarUrl: dbCourse.review_author.avatarUrl || '',
    summary: dbCourse.review_author.summary || '',
  } : undefined;

  return {
    id: dbCourse.id,
    slug: dbCourse.slug,
    title: dbCourse.title,
    description: dbCourse.description || '',
    category: dbCourse.category as GrowthItem['category'],
    type: dbCourse.type as GrowthItem['type'],
    contentType: dbCourse.content_type === 'cursus' ? ContentType.CURSUS : ContentType.TOOL,
    priceLabel: dbCourse.price_label || '',
    isFree: dbCourse.is_free,
    rating: dbCourse.rating || 0,
    imageUrl: dbCourse.image_url || '',
    affiliateLink: dbCourse.affiliate_link || '',
    tags: dbCourse.tags || [],
    isAiGenerated: dbCourse.is_ai_generated,
    provider: dbCourse.provider || undefined,
    reviewContent,
    executiveSummary: dbCourse.executive_summary || undefined,
    scores,
    pros: dbCourse.pros || undefined,
    cons: dbCourse.cons || undefined,
    features: dbCourse.features || undefined,
    reviewConclusion: dbCourse.review_conclusion || undefined,
    reviewAuthor,
    videoUrl: dbCourse.video_url || undefined,
    galleryImages: dbCourse.gallery_images || undefined,
    screenshots: dbCourse.screenshots || undefined,
    pricingTiers: dbCourse.pricing_tiers || undefined,
    alternatives: dbCourse.alternatives || undefined,
    alternativesAnalysis: dbCourse.alternatives_analysis || undefined,
    specifications: dbCourse.specifications || undefined,
    userTestimonials: dbCourse.user_testimonials || undefined,
    bestFor: dbCourse.best_for || undefined,
    notFor: dbCourse.not_for || undefined,
    targetAudience: dbCourse.target_audience || undefined,
    faq: dbCourse.faq || undefined,
    seoDescription: dbCourse.seo_description || undefined,
    seoTitle: dbCourse.seo_title || undefined,
    seoKeywords: dbCourse.seo_keywords || undefined,
    longDescription: dbCourse.long_description || undefined,
    updatedAt: dbCourse.updated_at,
  };
};

/**
 * Convert GrowthItem to database course record
 */
const growthItemToDbCourse = (item: GrowthItem): Partial<DbCourse> => {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.description,
    content_type: item.contentType === ContentType.CURSUS ? 'cursus' : 'tool',
    category: item.category,
    type: item.type,
    price_label: item.priceLabel,
    rating: item.rating,
    image_url: item.imageUrl,
    affiliate_link: item.affiliateLink,
    tags: item.tags,
    is_ai_generated: item.isAiGenerated || false,
    provider: item.provider || null,
    pros: item.pros || [],
    cons: item.cons || [],
    features: item.features || [],
    review_content: item.reviewContent || null,
    executive_summary: item.executiveSummary || null,
    scores: item.scores || null,
    review_conclusion: item.reviewConclusion || null,
    review_author: item.reviewAuthor || null,
    video_url: item.videoUrl || null,
    gallery_images: item.galleryImages || [],
    screenshots: item.screenshots || [],
    pricing_tiers: item.pricingTiers || [],
    alternatives: item.alternatives || [],
    alternatives_analysis: item.alternativesAnalysis || null,
    specifications: item.specifications || [],
    user_testimonials: item.userTestimonials || [],
    best_for: item.bestFor || [],
    not_for: item.notFor || [],
    seo_description: item.seoDescription || null,
    seo_title: item.seoTitle || null,
    seo_keywords: item.seoKeywords || [],
    target_audience: item.targetAudience || [],
    faq: item.faq || [],
    is_free: item.isFree || false,
    long_description: item.longDescription || null,
  };
};

/**
 * Convert database blog post record to BlogPost
 */
const dbBlogPostToBlogPost = (dbPost: DbBlogPost): BlogPost => {
  // Convert featured image with proper type handling
  const featuredImage = dbPost.featured_image ? {
    url: dbPost.featured_image.url || '',
    alt: dbPost.featured_image.alt || '',
    width: dbPost.featured_image.width,
    height: dbPost.featured_image.height,
  } : undefined;

  // Convert content image with proper type handling
  const contentImage = dbPost.content_image ? {
    url: dbPost.content_image.url || '',
    alt: dbPost.content_image.alt || '',
    caption: dbPost.content_image.caption,
    position: dbPost.content_image.position || 'auto',
    customPosition: dbPost.content_image.customPosition,
  } : undefined;

  // Convert internal links with proper type handling
  const internalLinks = dbPost.internal_links ? {
    blogs: dbPost.internal_links.blogs || [],
    products: dbPost.internal_links.products || [],
  } : undefined;

  return {
    id: dbPost.id,
    slug: dbPost.slug,
    title: dbPost.title,
    seoTitle: dbPost.seo_title || undefined,
    metaDescription: dbPost.meta_description || undefined,
    excerpt: dbPost.excerpt || '',
    content: dbPost.content || '',
    author: dbPost.author,
    date: dbPost.date || '',
    imageUrl: dbPost.image_url || '',
    featuredImage,
    contentImage,
    category: dbPost.category as BlogPost['category'],
    categories: dbPost.categories || undefined,
    tags: dbPost.tags || undefined,
    readTime: dbPost.read_time || '',
    keyTakeaways: dbPost.key_takeaways || undefined,
    faq: dbPost.faq || undefined,
    internalLinks,
    status: dbPost.status,
    publishedAt: dbPost.published_at || undefined,
    updatedAt: dbPost.updated_at,
    createdAt: dbPost.created_at,
    viewCount: dbPost.view_count,
    seoScore: dbPost.seo_score,
  };
};

/**
 * Convert BlogPost to database blog post record
 */
const blogPostToDbBlogPost = (post: BlogPost): Partial<DbBlogPost> => {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    seo_title: post.seoTitle || null,
    meta_description: post.metaDescription || null,
    excerpt: post.excerpt,
    content: post.content,
    author: post.author,
    date: post.date,
    image_url: post.imageUrl,
    featured_image: post.featuredImage || null,
    content_image: post.contentImage || null,
    category: post.category,
    categories: post.categories || [],
    tags: post.tags || [],
    read_time: post.readTime,
    key_takeaways: post.keyTakeaways || [],
    faq: post.faq || [],
    internal_links: post.internalLinks || null,
    status: post.status || 'draft',
    published_at: post.publishedAt || null,
    view_count: post.viewCount || 0,
    seo_score: post.seoScore || 0,
  };
};

// ============================================================================
// LOCALSTORAGE HELPERS (Fallback)
// ============================================================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const checkVersion = () => {
  const currentVersion = localStorage.getItem('writgo_db_version');
  if (currentVersion !== DB_VERSION) {
    localStorage.setItem('writgo_items', JSON.stringify(STATIC_ITEMS));
    localStorage.setItem('writgo_posts', JSON.stringify(STATIC_BLOG_POSTS));
    localStorage.setItem('writgo_db_version', DB_VERSION);
    return true;
  }
  return false;
};

// ============================================================================
// ITEMS (Tools/Cursussen) - Supabase with LocalStorage Fallback
// ============================================================================

/**
 * Get all items (both courses and tools)
 */
export const getItems = async (): Promise<GrowthItem[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching items:', error);
        throw error;
      }

      return (data || []).map(dbCourseToGrowthItem);
    } catch (error) {
      console.error('Failed to fetch from Supabase, falling back to LocalStorage:', error);
      // Fallback to LocalStorage
    }
  }

  // LocalStorage fallback
  await delay(300);
  checkVersion();
  const stored = localStorage.getItem('writgo_items');
  return stored ? JSON.parse(stored) : STATIC_ITEMS;
};

/**
 * Get only courses (contentType = 'cursus')
 */
export const getCourses = async (): Promise<GrowthItem[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('content_type', 'cursus')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching courses:', error);
        throw error;
      }

      return (data || []).map(dbCourseToGrowthItem);
    } catch (error) {
      console.error('Failed to fetch courses from Supabase, falling back to LocalStorage:', error);
    }
  }

  // LocalStorage fallback
  const items = await getItems();
  return items.filter(i => i.contentType === ContentType.CURSUS);
};

/**
 * Get only tools (contentType = 'tool')
 */
export const getTools = async (): Promise<GrowthItem[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('content_type', 'tool')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching tools:', error);
        throw error;
      }

      return (data || []).map(dbCourseToGrowthItem);
    } catch (error) {
      console.error('Failed to fetch tools from Supabase, falling back to LocalStorage:', error);
    }
  }

  // LocalStorage fallback
  const items = await getItems();
  return items.filter(i => i.contentType === ContentType.TOOL);
};

/**
 * Get course by slug
 */
export const getCourseBySlug = async (slug: string): Promise<GrowthItem | undefined> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('content_type', 'cursus')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Supabase error fetching course by slug:', error);
        throw error;
      }

      return data ? dbCourseToGrowthItem(data) : undefined;
    } catch (error) {
      console.error('Failed to fetch course from Supabase:', error);
    }
  }

  // LocalStorage fallback
  const courses = await getCourses();
  return courses.find(c => c.slug === slug);
};

/**
 * Get tool by slug
 */
export const getToolBySlug = async (slug: string): Promise<GrowthItem | undefined> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('content_type', 'tool')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error fetching tool by slug:', error);
        throw error;
      }

      return data ? dbCourseToGrowthItem(data) : undefined;
    } catch (error) {
      console.error('Failed to fetch tool from Supabase:', error);
    }
  }

  // LocalStorage fallback
  const tools = await getTools();
  return tools.find(t => t.slug === slug);
};

/**
 * Get item by ID
 */
export const getItemById = async (id: string): Promise<GrowthItem | undefined> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error fetching item by id:', error);
        throw error;
      }

      return data ? dbCourseToGrowthItem(data) : undefined;
    } catch (error) {
      console.error('Failed to fetch item from Supabase:', error);
    }
  }

  // LocalStorage fallback
  const items = await getItems();
  return items.find(i => i.id === id);
};

/**
 * Get item by slug (any content type)
 */
export const getItemBySlug = async (slug: string): Promise<GrowthItem | undefined> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error fetching item by slug:', error);
        throw error;
      }

      return data ? dbCourseToGrowthItem(data) : undefined;
    } catch (error) {
      console.error('Failed to fetch item from Supabase:', error);
    }
  }

  // LocalStorage fallback
  const items = await getItems();
  return items.find(i => i.slug === slug);
};

/**
 * Save item (upsert - insert or update)
 */
export const saveItem = async (item: GrowthItem): Promise<GrowthItem[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const dbCourse = growthItemToDbCourse(item);
      
      const { error } = await supabase
        .from('courses')
        .upsert(dbCourse, { onConflict: 'id' });

      if (error) {
        console.error('Supabase error saving item:', error);
        throw error;
      }

      // Return updated list
      return await getItems();
    } catch (error) {
      console.error('Failed to save item to Supabase:', error);
    }
  }

  // LocalStorage fallback
  await delay(600);
  const items = await getItems();
  const existingIndex = items.findIndex(i => i.id === item.id);
  
  let newItems: GrowthItem[];
  if (existingIndex >= 0) {
    newItems = [...items];
    newItems[existingIndex] = item;
  } else {
    newItems = [item, ...items];
  }
  
  localStorage.setItem('writgo_items', JSON.stringify(newItems));
  return newItems;
};

/**
 * Delete item by ID
 */
export const deleteItem = async (itemId: string): Promise<GrowthItem[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Supabase error deleting item:', error);
        throw error;
      }

      // Return updated list
      return await getItems();
    } catch (error) {
      console.error('Failed to delete item from Supabase:', error);
    }
  }

  // LocalStorage fallback
  await delay(400);
  const items = await getItems();
  const filteredItems = items.filter(i => i.id !== itemId);
  localStorage.setItem('writgo_items', JSON.stringify(filteredItems));
  return filteredItems;
};

// ============================================================================
// BLOG POSTS - Supabase with LocalStorage Fallback
// ============================================================================

/**
 * Get all blog posts
 */
export const getPosts = async (): Promise<BlogPost[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching posts:', error);
        throw error;
      }

      return (data || []).map(dbBlogPostToBlogPost);
    } catch (error) {
      console.error('Failed to fetch posts from Supabase, falling back to LocalStorage:', error);
    }
  }

  // LocalStorage fallback
  await delay(300);
  checkVersion();
  const stored = localStorage.getItem('writgo_posts');
  return stored ? JSON.parse(stored) : STATIC_BLOG_POSTS;
};

/**
 * Get blog post by slug
 */
export const getPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error fetching post by slug:', error);
        throw error;
      }

      return data ? dbBlogPostToBlogPost(data) : undefined;
    } catch (error) {
      console.error('Failed to fetch post from Supabase:', error);
    }
  }

  // LocalStorage fallback
  const posts = await getPosts();
  return posts.find(p => p.slug === slug);
};

/**
 * Save blog post (upsert - insert or update)
 */
export const savePost = async (post: BlogPost): Promise<BlogPost[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const dbPost = blogPostToDbBlogPost(post);
      
      const { error } = await supabase
        .from('blog_posts')
        .upsert(dbPost, { onConflict: 'id' });

      if (error) {
        console.error('Supabase error saving post:', error);
        throw error;
      }

      // Return updated list
      return await getPosts();
    } catch (error) {
      console.error('Failed to save post to Supabase:', error);
    }
  }

  // LocalStorage fallback
  await delay(600);
  const posts = await getPosts();
  const existingIndex = posts.findIndex(p => p.id === post.id);
  
  let newPosts: BlogPost[];
  if (existingIndex >= 0) {
    newPosts = [...posts];
    newPosts[existingIndex] = post;
  } else {
    newPosts = [post, ...posts];
  }
  
  localStorage.setItem('writgo_posts', JSON.stringify(newPosts));
  return newPosts;
};

/**
 * Delete blog post by ID
 */
export const deletePost = async (postId: string): Promise<BlogPost[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Supabase error deleting post:', error);
        throw error;
      }

      // Return updated list
      return await getPosts();
    } catch (error) {
      console.error('Failed to delete post from Supabase:', error);
    }
  }

  // LocalStorage fallback
  await delay(400);
  const posts = await getPosts();
  const filteredPosts = posts.filter(p => p.id !== postId);
  localStorage.setItem('writgo_posts', JSON.stringify(filteredPosts));
  return filteredPosts;
};

// ============================================================================
// REAL-TIME SUBSCRIPTIONS (Supabase only)
// ============================================================================

export type SubscriptionCallback<T> = (data: T[]) => void;

/**
 * Subscribe to real-time course/tool updates
 */
export const subscribeToItems = (callback: SubscriptionCallback<GrowthItem>) => {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase not configured, real-time subscriptions disabled');
    return { unsubscribe: () => {} };
  }

  const channel = supabase
    .channel('courses-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'courses' },
      async () => {
        // Refetch all items when any change occurs
        const items = await getItems();
        callback(items);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
};

/**
 * Subscribe to real-time blog post updates
 */
export const subscribeToPosts = (callback: SubscriptionCallback<BlogPost>) => {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase not configured, real-time subscriptions disabled');
    return { unsubscribe: () => {} };
  }

  const channel = supabase
    .channel('blog-posts-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'blog_posts' },
      async () => {
        // Refetch all posts when any change occurs
        const posts = await getPosts();
        callback(posts);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
};

// ============================================================================
// DATABASE UTILITIES
// ============================================================================

/**
 * Reset database (clears LocalStorage, Supabase tables are not affected)
 */
export const resetDatabase = async () => {
  if (isSupabaseConfigured() && supabase) {
    console.warn('resetDatabase only clears LocalStorage. Supabase data is not affected.');
  }
  
  localStorage.removeItem('writgo_items');
  localStorage.removeItem('writgo_posts');
  localStorage.removeItem('writgo_db_version');
  return true;
};

/**
 * Check if using Supabase or LocalStorage
 */
export const getDatabaseStatus = () => {
  return {
    usingSupabase: isSupabaseConfigured(),
    supabaseConfigured: isSupabaseConfigured(),
  };
};