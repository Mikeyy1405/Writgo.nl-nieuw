// Supabase Database Types
// These types match the database schema defined in supabase/migrations/001_initial_schema.sql

export interface DbCourse {
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
  review_content: {
    introduction?: string;
    featuresAnalysis?: string;
    easeOfUse?: string;
    supportQuality?: string;
    verdict?: string;
  } | null;
  executive_summary: string | null;
  scores: {
    usability?: number;
    priceValue?: number;
    features?: number;
    support?: number;
  } | null;
  review_conclusion: string | null;
  review_author: {
    name?: string;
    role?: string;
    avatarUrl?: string;
    summary?: string;
  } | null;
  video_url: string | null;
  gallery_images: string[];
  screenshots: string[];
  pricing_tiers: Array<{
    name: string;
    price: string;
    features: string[];
  }>;
  alternatives: string[];
  alternatives_analysis: string | null;
  specifications: Array<{
    label: string;
    value: string;
  }>;
  user_testimonials: Array<{
    name: string;
    role?: string;
    text: string;
    rating: number;
    avatarUrl?: string;
  }>;
  best_for: string[];
  not_for: string[];
  seo_description: string | null;
  seo_title: string | null;
  seo_keywords: string[];
  target_audience: string[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
  is_free: boolean;
  long_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbBlogPost {
  id: string;
  slug: string;
  title: string;
  seo_title: string | null;
  meta_description: string | null;
  excerpt: string | null;
  content: string | null;
  author: string;
  author_id: string | null;
  date: string | null;
  image_url: string | null;
  featured_image: {
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  } | null;
  content_image: {
    url?: string;
    alt?: string;
    caption?: string;
    position?: 'auto' | 'custom';
    customPosition?: number;
  } | null;
  category: string;
  categories: string[];
  tags: string[];
  read_time: string | null;
  key_takeaways: string[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
  internal_links: {
    blogs?: string[];
    products?: string[];
  } | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  view_count: number;
  seo_score: number;
  created_at: string;
  updated_at: string;
}

// Type for insert operations (without id and timestamps)
export type DbCourseInsert = Omit<DbCourse, 'id' | 'created_at' | 'updated_at'>;
export type DbBlogPostInsert = Omit<DbBlogPost, 'id' | 'created_at' | 'updated_at'>;

// Type for update operations
export type DbCourseUpdate = Partial<DbCourseInsert>;
export type DbBlogPostUpdate = Partial<DbBlogPostInsert>;
