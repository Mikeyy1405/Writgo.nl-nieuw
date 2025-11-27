-- Migration: 001_initial_schema
-- Description: Create initial database schema for courses and blog posts
-- Created: 2024

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- COURSES TABLE
-- Stores both courses (cursussen) and tools
-- ============================================================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL CHECK (content_type IN ('cursus', 'tool')),
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    price_label TEXT,
    rating NUMERIC(2,1) DEFAULT 0.0,
    image_url TEXT,
    affiliate_link TEXT,
    tags TEXT[] DEFAULT '{}',
    is_ai_generated BOOLEAN DEFAULT false,
    provider TEXT,
    
    -- Rich Review Fields
    pros TEXT[] DEFAULT '{}',
    cons TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    review_content JSONB DEFAULT '{}',
    executive_summary TEXT,
    scores JSONB DEFAULT '{}',
    review_conclusion TEXT,
    review_author JSONB DEFAULT '{}',
    
    -- Media & Interaction
    video_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    screenshots TEXT[] DEFAULT '{}',
    
    -- Commercial Data
    pricing_tiers JSONB DEFAULT '[]',
    alternatives TEXT[] DEFAULT '{}',
    alternatives_analysis TEXT,
    specifications JSONB DEFAULT '[]',
    user_testimonials JSONB DEFAULT '[]',
    
    -- Advice
    best_for TEXT[] DEFAULT '{}',
    not_for TEXT[] DEFAULT '{}',
    
    -- SEO & Content Fields
    seo_description TEXT,
    seo_title TEXT,
    seo_keywords TEXT[] DEFAULT '{}',
    target_audience TEXT[] DEFAULT '{}',
    faq JSONB DEFAULT '[]',
    is_free BOOLEAN DEFAULT false,
    long_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_courses_content_type ON courses(content_type);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- ============================================================================
-- BLOG POSTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    seo_title TEXT,
    meta_description TEXT,
    excerpt TEXT,
    content TEXT,
    author TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id),
    date TEXT,
    image_url TEXT,
    featured_image JSONB DEFAULT '{}',
    content_image JSONB DEFAULT '{}',
    category TEXT NOT NULL,
    categories TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    read_time TEXT,
    key_takeaways TEXT[] DEFAULT '{}',
    faq JSONB DEFAULT '[]',
    internal_links JSONB DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    seo_score INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- Automatically update the updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to courses table
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to blog_posts table
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
