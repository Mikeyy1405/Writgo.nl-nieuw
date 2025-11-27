-- Migration: 002_rls_policies
-- Description: Row Level Security policies for courses and blog posts
-- Created: 2024

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COURSES POLICIES
-- ============================================================================

-- Public read access: Anyone can read courses
CREATE POLICY "Anyone can read courses" 
    ON courses 
    FOR SELECT 
    USING (true);

-- Authenticated write access: Only authenticated users can insert
CREATE POLICY "Authenticated users can insert courses" 
    ON courses 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated update access: Only authenticated users can update
CREATE POLICY "Authenticated users can update courses" 
    ON courses 
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

-- Authenticated delete access: Only authenticated users can delete
CREATE POLICY "Authenticated users can delete courses" 
    ON courses 
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- ============================================================================
-- BLOG POSTS POLICIES
-- ============================================================================

-- Public read access: Anyone can read published posts
CREATE POLICY "Anyone can read published posts" 
    ON blog_posts 
    FOR SELECT 
    USING (status = 'published');

-- Authenticated full read access: Authenticated users can read all posts (including drafts)
CREATE POLICY "Authenticated users can read all posts" 
    ON blog_posts 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Authenticated write access: Authenticated users can manage all posts
CREATE POLICY "Authenticated users can insert posts" 
    ON blog_posts 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update posts" 
    ON blog_posts 
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete posts" 
    ON blog_posts 
    FOR DELETE 
    USING (auth.role() = 'authenticated');
