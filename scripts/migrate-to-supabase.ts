/**
 * Migration Script: Upload Static Data to Supabase
 * 
 * This script migrates the static sample data (STATIC_ITEMS and STATIC_BLOG_POSTS)
 * from constants.ts to the Supabase database.
 * 
 * Usage:
 * 1. Ensure your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set
 * 2. Import this module in your browser console or run via a build script
 * 
 * Example (browser console):
 *   import { runMigration } from './scripts/migrate-to-supabase';
 *   runMigration();
 */

import { supabase, isSupabaseConfigured } from '../config/supabase';
import { STATIC_ITEMS, STATIC_BLOG_POSTS } from '../constants';
import { GrowthItem, BlogPost, ContentType } from '../types';

// Type definitions for database records
interface DbCourse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content_type: 'cursus' | 'tool';
  category: string;
  type: string;
  price_label: string | null;
  rating: number | null;
  image_url: string | null;
  affiliate_link: string | null;
  tags: string[];
  is_ai_generated: boolean;
  provider: string | null;
  pros: string[];
  cons: string[];
  features: string[];
  review_content: object | null;
  executive_summary: string | null;
  scores: object | null;
  review_conclusion: string | null;
  review_author: object | null;
  video_url: string | null;
  gallery_images: string[];
  screenshots: string[];
  pricing_tiers: object[];
  alternatives: string[];
  alternatives_analysis: string | null;
  specifications: object[];
  user_testimonials: object[];
  best_for: string[];
  not_for: string[];
  seo_description: string | null;
  seo_title: string | null;
  seo_keywords: string[];
  target_audience: string[];
  faq: object[];
  is_free: boolean;
  long_description: string | null;
}

interface DbBlogPost {
  id: string;
  slug: string;
  title: string;
  seo_title: string | null;
  meta_description: string | null;
  excerpt: string | null;
  content: string | null;
  author: string;
  date: string | null;
  image_url: string | null;
  featured_image: object | null;
  content_image: object | null;
  category: string;
  categories: string[];
  tags: string[];
  read_time: string | null;
  key_takeaways: string[];
  faq: object[];
  internal_links: object | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  view_count: number;
  seo_score: number;
}

/**
 * Convert GrowthItem to database format
 */
function itemToDbCourse(item: GrowthItem): DbCourse {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.description || null,
    content_type: item.contentType === ContentType.CURSUS ? 'cursus' : 'tool',
    category: item.category,
    type: item.type,
    price_label: item.priceLabel || null,
    rating: item.rating || null,
    image_url: item.imageUrl || null,
    affiliate_link: item.affiliateLink || null,
    tags: item.tags || [],
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
}

/**
 * Convert BlogPost to database format
 */
function postToDbBlogPost(post: BlogPost): DbBlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    seo_title: post.seoTitle || null,
    meta_description: post.metaDescription || null,
    excerpt: post.excerpt || null,
    content: post.content || null,
    author: post.author,
    date: post.date || null,
    image_url: post.imageUrl || null,
    featured_image: post.featuredImage || null,
    content_image: post.contentImage || null,
    category: post.category,
    categories: post.categories || [],
    tags: post.tags || [],
    read_time: post.readTime || null,
    key_takeaways: post.keyTakeaways || [],
    faq: post.faq || [],
    internal_links: post.internalLinks || null,
    status: post.status || 'published',
    published_at: post.publishedAt || null,
    view_count: post.viewCount || 0,
    seo_score: post.seoScore || 0,
  };
}

/**
 * Migrate courses/tools to Supabase
 */
export async function migrateItems(): Promise<{ success: number; failed: number }> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  console.log(`📦 Migrating ${STATIC_ITEMS.length} items to Supabase...`);

  let success = 0;
  let failed = 0;

  for (const item of STATIC_ITEMS) {
    try {
      const dbCourse = itemToDbCourse(item);
      
      const { error } = await supabase
        .from('courses')
        .upsert(dbCourse, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Failed to migrate item "${item.title}":`, error.message);
        failed++;
      } else {
        console.log(`✅ Migrated: ${item.title} (${item.contentType})`);
        success++;
      }
    } catch (err) {
      console.error(`❌ Error migrating item "${item.title}":`, err);
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Migrate blog posts to Supabase
 */
export async function migratePosts(): Promise<{ success: number; failed: number }> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  console.log(`📝 Migrating ${STATIC_BLOG_POSTS.length} blog posts to Supabase...`);

  let success = 0;
  let failed = 0;

  for (const post of STATIC_BLOG_POSTS) {
    try {
      const dbPost = postToDbBlogPost(post);
      
      const { error } = await supabase
        .from('blog_posts')
        .upsert(dbPost, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Failed to migrate post "${post.title}":`, error.message);
        failed++;
      } else {
        console.log(`✅ Migrated: ${post.title}`);
        success++;
      }
    } catch (err) {
      console.error(`❌ Error migrating post "${post.title}":`, err);
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Migrate existing LocalStorage data to Supabase
 */
export async function migrateLocalStorage(): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  console.log('📱 Checking for LocalStorage data to migrate...');

  // Get items from LocalStorage
  const storedItems = localStorage.getItem('writgo_items');
  const storedPosts = localStorage.getItem('writgo_posts');

  if (storedItems) {
    const items: GrowthItem[] = JSON.parse(storedItems);
    console.log(`Found ${items.length} items in LocalStorage`);

    for (const item of items) {
      try {
        const dbCourse = itemToDbCourse(item);
        
        const { error } = await supabase
          .from('courses')
          .upsert(dbCourse, { onConflict: 'slug' });

        if (error) {
          console.error(`❌ Failed to migrate LocalStorage item "${item.title}":`, error.message);
        } else {
          console.log(`✅ Migrated from LocalStorage: ${item.title}`);
        }
      } catch (err) {
        console.error(`❌ Error migrating LocalStorage item "${item.title}":`, err);
      }
    }
  }

  if (storedPosts) {
    const posts: BlogPost[] = JSON.parse(storedPosts);
    console.log(`Found ${posts.length} posts in LocalStorage`);

    for (const post of posts) {
      try {
        const dbPost = postToDbBlogPost(post);
        
        const { error } = await supabase
          .from('blog_posts')
          .upsert(dbPost, { onConflict: 'slug' });

        if (error) {
          console.error(`❌ Failed to migrate LocalStorage post "${post.title}":`, error.message);
        } else {
          console.log(`✅ Migrated from LocalStorage: ${post.title}`);
        }
      } catch (err) {
        console.error(`❌ Error migrating LocalStorage post "${post.title}":`, err);
      }
    }
  }
}

/**
 * Main migration function
 */
export async function runMigration(): Promise<void> {
  console.log('🚀 Starting Supabase Migration...');
  console.log('================================');

  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase is not configured!');
    console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    return;
  }

  try {
    // Migrate static items
    const itemsResult = await migrateItems();
    console.log(`\n📦 Items Migration Complete: ${itemsResult.success} success, ${itemsResult.failed} failed`);

    // Migrate static posts
    const postsResult = await migratePosts();
    console.log(`\n📝 Posts Migration Complete: ${postsResult.success} success, ${postsResult.failed} failed`);

    // Migrate LocalStorage data (if any)
    if (typeof localStorage !== 'undefined') {
      await migrateLocalStorage();
    }

    console.log('\n================================');
    console.log('✅ Migration Complete!');
    console.log('\nSummary:');
    console.log(`  - Items: ${itemsResult.success}/${STATIC_ITEMS.length} migrated`);
    console.log(`  - Posts: ${postsResult.success}/${STATIC_BLOG_POSTS.length} migrated`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
