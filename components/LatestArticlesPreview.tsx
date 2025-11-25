
import React from 'react';
import { BlogPost } from '../types';

interface LatestArticlesPreviewProps {
    posts: BlogPost[];
    onReadPost: (post: BlogPost) => void;
}

const BlogPostCard: React.FC<{ post: BlogPost; onReadPost: (post: BlogPost) => void; }> = ({ post, onReadPost }) => (
    <article 
        className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden group cursor-pointer"
        onClick={() => onReadPost(post)}
    >
        <div className="h-40 overflow-hidden">
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-5">
            <span className="text-xs font-bold uppercase text-brand-400">{post.category}</span>
            <h3 className="font-bold text-white mt-1 mb-2 line-clamp-2 group-hover:text-brand-300">{post.title}</h3>
            <div className="text-xs text-slate-500">
                <span>{post.date}</span> &bull; <span>{post.readTime}</span>
            </div>
        </div>
    </article>
);


export const LatestArticlesPreview: React.FC<LatestArticlesPreviewProps> = ({ posts, onReadPost }) => {
    if (posts.length === 0) return null;

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white">Uit onze Kennisbank</h2>
                <p className="text-slate-400 mt-2">De nieuwste artikelen en inzichten van onze experts.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {posts.map(post => (
                    <BlogPostCard key={post.id} post={post} onReadPost={onReadPost} />
                ))}
            </div>
        </div>
    );
};
