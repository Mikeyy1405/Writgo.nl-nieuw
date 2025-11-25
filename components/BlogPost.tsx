

import React from 'react';
import { BlogPost as BlogPostType } from '../types';

// FIX: Added missing props interface for BlogPost component.
interface BlogPostProps {
  post: BlogPostType;
  onBack: () => void;
}

export const BlogPost: React.FC<BlogPostProps> = ({ post, onBack }) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <button 
        onClick={onBack}
        className="text-slate-400 hover:text-white mb-8 flex items-center transition-colors group"
      >
        <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
        Terug naar overzicht
      </button>

      <article className="max-w-4xl mx-auto bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="h-64 md:h-96 w-full relative">
            <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 md:p-12">
                <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block shadow-lg shadow-brand-500/20">
                    {post.category}
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-md">
                    {post.title}
                </h1>
                <div className="flex items-center space-x-6 text-sm text-slate-300">
                    <span className="flex items-center"><i className="far fa-user mr-2"></i> {post.author}</span>
                    <span className="flex items-center"><i className="far fa-calendar mr-2"></i> {post.date}</span>
                    <span className="flex items-center"><i className="far fa-clock mr-2"></i> {post.readTime}</span>
                </div>
            </div>
        </div>

        <div className="p-8 md:p-12">
          {/* Key Takeaways */}
          {post.keyTakeaways && post.keyTakeaways.length > 0 && (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center"><i className="fas fa-bolt text-yellow-400 mr-2"></i>In het kort</h3>
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
          />

          {/* FAQ Section */}
          {post.faq && post.faq.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-brand-500 pl-4">Veelgestelde Vragen</h2>
              <div className="space-y-4">
                {post.faq.map((item, index) => (
                  <details key={index} className="bg-slate-800/50 border border-slate-800 rounded-lg p-4 group" open={index === 0}>
                    <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-center">
                      {item.question}
                      <i className="fas fa-chevron-down transition-transform duration-300 group-open:rotate-180"></i>
                    </summary>
                    <div className="text-slate-400 mt-4 pt-4 border-t border-slate-700">
                      <p>{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-center">
             <div className="text-slate-500 text-sm">
                Vond je dit interessant? Deel het artikel:
             </div>
             <div className="flex space-x-4">
                <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all">
                    <i className="fab fa-twitter"></i>
                </button>
                <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                    <i className="fab fa-linkedin-in"></i>
                </button>
                <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-green-600 hover:text-white transition-all">
                    <i className="fab fa-whatsapp"></i>
                </button>
             </div>
          </div>
        </div>
      </article>
    </div>
  );
};