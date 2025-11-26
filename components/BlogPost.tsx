import React from 'react';
import { BlogPost as BlogPostType } from '../types';
import { SEOSchema, SEOMeta } from './SEOSchema';

interface BlogPostProps {
  post: BlogPostType;
  onBack: () => void;
  relatedPosts?: BlogPostType[];
  onReadPost?: (post: BlogPostType) => void;
}

export const BlogPost: React.FC<BlogPostProps> = ({ post, onBack, relatedPosts = [], onReadPost }) => {
  // Get image URL and alt text with fallbacks
  const imageUrl = post.featuredImage?.url || post.imageUrl;
  const imageAlt = post.featuredImage?.alt || post.title;

  // Filter related posts based on internal links
  const linkedPosts = relatedPosts.filter(p => 
    post.internalLinks?.blogs?.includes(p.id)
  );

  return (
    <>
      {/* SEO Meta Tags and Schema.org Structured Data */}
      <SEOMeta post={post} />
      <SEOSchema post={post} />

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-slate-500">
            <li>
              <a href="#/" className="hover:text-brand-400 transition-colors">Home</a>
            </li>
            <li><i className="fas fa-chevron-right text-xs mx-2"></i></li>
            <li>
              <a href="#/blog" className="hover:text-brand-400 transition-colors">Blog</a>
            </li>
            <li><i className="fas fa-chevron-right text-xs mx-2"></i></li>
            <li className="text-slate-300 truncate max-w-xs" aria-current="page">{post.title}</li>
          </ol>
        </nav>

        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-white mb-8 flex items-center transition-colors group"
        >
          <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
          Terug naar overzicht
        </button>

        <article 
          className="max-w-4xl mx-auto bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl"
          itemScope 
          itemType="https://schema.org/Article"
        >
          {/* Featured Image */}
          <div className="h-64 md:h-96 w-full relative">
            <img 
              src={imageUrl} 
              alt={imageAlt}
              width={post.featuredImage?.width || 800}
              height={post.featuredImage?.height || 533}
              className="w-full h-full object-cover"
              loading="eager"
              itemProp="image"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 md:p-12">
              <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block shadow-lg shadow-brand-500/20">
                <span itemProp="articleSection">{post.category}</span>
              </span>
              <h1 
                className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-md"
                itemProp="headline"
              >
                {post.title}
              </h1>
              <div className="flex items-center space-x-6 text-sm text-slate-300">
                <span className="flex items-center" itemProp="author" itemScope itemType="https://schema.org/Person">
                  <i className="far fa-user mr-2"></i>
                  <span itemProp="name">{post.author}</span>
                </span>
                <span className="flex items-center">
                  <i className="far fa-calendar mr-2"></i>
                  <time itemProp="datePublished" dateTime={post.publishedAt || post.date}>
                    {post.date}
                  </time>
                </span>
                <span className="flex items-center">
                  <i className="far fa-clock mr-2"></i>
                  {post.readTime}
                </span>
                {post.viewCount !== undefined && post.viewCount > 0 && (
                  <span className="flex items-center">
                    <i className="far fa-eye mr-2"></i>
                    {post.viewCount.toLocaleString('nl-NL')} weergaven
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-full border border-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Key Takeaways */}
            {post.keyTakeaways && post.keyTakeaways.length > 0 && (
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <i className="fas fa-bolt text-yellow-400 mr-2"></i>
                  In het kort
                </h3>
                <ul className="space-y-3">
                  {post.keyTakeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start text-slate-300">
                      <i className="fas fa-check-circle text-brand-400 mr-3 mt-1"></i>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main Content */}
            <div 
              className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-slate-400 prose-a:text-brand-400 hover:prose-a:text-brand-300 prose-strong:text-slate-200"
              dangerouslySetInnerHTML={{ __html: post.content }}
              itemProp="articleBody"
            />

            {/* Content Image (if available) */}
            {post.contentImage?.url && (
              <figure className="my-10">
                <img 
                  src={post.contentImage.url}
                  alt={post.contentImage.alt || 'Artikel afbeelding'}
                  className="w-full rounded-xl"
                  loading="lazy"
                />
                {post.contentImage.caption && (
                  <figcaption className="text-center text-slate-500 text-sm mt-3">
                    {post.contentImage.caption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* FAQ Section */}
            {post.faq && post.faq.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-brand-500 pl-4">
                  Veelgestelde Vragen
                </h2>
                <div className="space-y-4" itemScope itemType="https://schema.org/FAQPage">
                  {post.faq.map((item, index) => (
                    <details 
                      key={index} 
                      className="bg-slate-800/50 border border-slate-800 rounded-lg p-4 group" 
                      open={index === 0}
                      itemScope
                      itemProp="mainEntity"
                      itemType="https://schema.org/Question"
                    >
                      <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-center">
                        <span itemProp="name">{item.question}</span>
                        <i className="fas fa-chevron-down transition-transform duration-300 group-open:rotate-180"></i>
                      </summary>
                      <div 
                        className="text-slate-400 mt-4 pt-4 border-t border-slate-700"
                        itemScope
                        itemProp="acceptedAnswer"
                        itemType="https://schema.org/Answer"
                      >
                        <p itemProp="text">{item.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Related Posts */}
            {linkedPosts.length > 0 && onReadPost && (
              <div className="mt-16 pt-8 border-t border-slate-800">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <i className="fas fa-link mr-3 text-brand-400"></i>
                  Gerelateerde Artikelen
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {linkedPosts.slice(0, 4).map((relatedPost) => (
                    <div 
                      key={relatedPost.id}
                      onClick={() => onReadPost(relatedPost)}
                      className="flex gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-brand-500/50 cursor-pointer transition-all group"
                    >
                      <img 
                        src={relatedPost.featuredImage?.url || relatedPost.imageUrl}
                        alt={relatedPost.featuredImage?.alt || relatedPost.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm group-hover:text-brand-400 transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-slate-500 text-xs mt-1">{relatedPost.readTime} • {relatedPost.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="text-slate-500 text-sm">
                Vond je dit interessant? Deel het artikel:
              </div>
              <div className="flex space-x-4">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.seoTitle || post.title)}&url=${encodeURIComponent(`https://writgo.nl/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all"
                  aria-label="Deel op Twitter"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://writgo.nl/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all"
                  aria-label="Deel op LinkedIn"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`${post.seoTitle || post.title} - https://writgo.nl/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-green-600 hover:text-white transition-all"
                  aria-label="Deel op WhatsApp"
                >
                  <i className="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>

            {/* Last Updated */}
            {post.updatedAt && (
              <div className="mt-6 text-xs text-slate-600">
                Laatst bijgewerkt: <time dateTime={post.updatedAt}>{new Date(post.updatedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
              </div>
            )}
          </div>
        </article>
      </div>
    </>
  );
};