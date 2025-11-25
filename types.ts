
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
  priceLabel: string;
  rating: number; // Overall rating
  imageUrl: string;
  affiliateLink: string;
  tags: string[];
  isAiGenerated?: boolean;
  
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
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl: string;
  category: Category;
  readTime: string;
  keyTakeaways?: string[];
  faq?: FAQItem[];
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