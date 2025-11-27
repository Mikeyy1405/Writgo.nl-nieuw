
export enum Category {
  BUSINESS = 'Business & Ondernemen',
  MARKETING = 'Marketing & Sales',
  FINANCE = 'Geld & Crypto',
  DEVELOPMENT = 'Development & Data',
  DESIGN = 'Design & Creatief',
  LIFESTYLE = 'Lifestyle & Gezondheid',
  PRODUCTIVITY = 'Productiviteit & Tools',
  OTHER = 'Overig'
}

export enum ItemType {
  COURSE = 'Cursus',
  APP = 'App/Tool',
  BOOK = 'E-book',
  PLATFORM = 'Community'
}

// New: Content type for routing distinction between courses and tools
export enum ContentType {
  CURSUS = 'cursus',
  TOOL = 'tool'
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ReviewScores {
  usability: number;
  priceValue: number;
  features: number;
  support: number;
}

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
}

export interface ReviewAuthor {
  name: string;
  role: string;
  avatarUrl: string;
  summary: string;
}

export interface Specification {
  label: string;
  value: string;
}

export interface Testimonial {
  name: string;
  role?: string;
  text: string;
  rating: number;
  avatarUrl?: string;
}

export interface ReviewContent {
  introduction: string;
  featuresAnalysis: string;
  easeOfUse: string;
  supportQuality: string;
  verdict: string;
}

export interface GrowthItem {
  id: string;
  slug: string; // URL friendly ID
  title: string;
  description: string;
  longDescription?: string; // Deprecated
  category: Category;
  type: ItemType;
  contentType: ContentType; // New: distinguishes between cursus and tool for routing
  priceLabel: string;
  rating: number; // Overall rating
  imageUrl: string;
  affiliateLink: string;
  tags: string[];
  isAiGenerated?: boolean;
  provider?: string; // New: platform/provider name (e.g., "IMU", "Udemy")
  
  // Rich Review Fields
  reviewContent?: ReviewContent;
  executiveSummary?: string; // New: Elevator pitch summary
  scores?: ReviewScores;
  pros?: string[];
  cons?: string[];
  features?: string[];
  reviewConclusion?: string;
  reviewAuthor?: ReviewAuthor;
  updatedAt?: string;
  
  // Media & Interaction
  videoUrl?: string;
  galleryImages?: string[];
  screenshots?: string[];

  // Commercial Data
  pricingTiers?: PricingTier[];
  alternatives?: string[]; 
  alternativesAnalysis?: string; // New: Why choose this over others?
  specifications?: Specification[];
  userTestimonials?: Testimonial[];

  // Advice
  bestFor?: string[]; // New: "Perfect for..."
  notFor?: string[]; // New: "Skip if..."

  // SEO & Content Fields
  targetAudience?: string[];
  faq?: FAQItem[];
  seoDescription?: string;
  seoTitle?: string; // New: SEO meta title
  seoKeywords?: string[]; // New: SEO keywords
}

export type BlogStatus = 'draft' | 'published' | 'archived';

export interface FeaturedImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ContentImage {
  url: string;
  alt: string;
  caption?: string;
  position: 'auto' | 'custom';
  customPosition?: number; // percentage of content
}

export interface InternalLinks {
  blogs: string[]; // blog IDs
  products: string[]; // product IDs (GrowthItem IDs)
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  seoTitle?: string; // max 60 characters
  metaDescription?: string; // max 160 characters
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl: string;
  featuredImage?: FeaturedImage;
  contentImage?: ContentImage;
  category: Category;
  categories?: string[]; // multiple categories support
  tags?: string[];
  readTime: string;
  keyTakeaways?: string[];
  faq?: FAQItem[];
  internalLinks?: InternalLinks;
  status?: BlogStatus;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  viewCount?: number;
  seoScore?: number; // optional SEO score (0-100)
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  avatarUrl?: string;
}

export interface FilterState {
  category: Category | 'ALL';
  search: string;
  maxPrice: string;
}