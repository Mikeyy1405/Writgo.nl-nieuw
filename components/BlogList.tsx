import React from 'react';
import { BlogPost } from '../types';

interface BlogListProps {
  posts: BlogPost[];
  onReadPost: (post: BlogPost) => void;
}

export const BlogList: React.FC<BlogListProps> = ({ posts, onReadPost }) => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Inzichten & <span className="text-brand-400">Verdieping</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Ontdek artikelen over persoonlijke groei, productiviteit en de nieuwste tools.
          Geschreven door experts en samengesteld voor jouw succes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article 
            key={post.id} 
            className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 group flex flex-col cursor-pointer"
            onClick={() => onReadPost(post)}
          >
            <div className="relative h-56 overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-slate-950/80 backdrop-blur text-brand-400 text-xs font-bold px-3 py-1 rounded-full border border-brand-500/30">
                  {post.category}
                </span>
              </div>
            </div>
            
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex items-center text-xs text-slate-500 mb-4 space-x-3">
                <span className="flex items-center"><i className="far fa-calendar mr-2"></i> {post.date}</span>
                <span className="flex items-center"><i className="far fa-clock mr-2"></i> {post.readTime}</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-400 transition-colors line-clamp-2">
                {post.title}
              </h3>
              
              <p className="text-slate-400 text-sm mb-6 line-clamp-3 flex-grow">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-auto">
                <span className="text-xs text-slate-500 font-medium">Door {post.author}</span>
                <span className="text-brand-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                  Lees artikel <i className="fas fa-arrow-right ml-1"></i>
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};