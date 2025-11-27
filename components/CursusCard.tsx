import React from 'react';
import { GrowthItem } from '../types';

interface CursusCardProps {
  item: GrowthItem;
  onClick: (item: GrowthItem) => void;
}

export const CursusCard: React.FC<CursusCardProps> = ({ item, onClick }) => {
  return (
    <div 
      onClick={() => onClick(item)}
      className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 group flex flex-col h-full cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden bg-slate-800">
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        {item.isAiGenerated && (
          <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur border border-brand-500/30 text-brand-400 text-xs font-bold px-2 py-1 rounded-md shadow-lg">
            <i className="fas fa-robot mr-1"></i> AI Tip
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-brand-500/90 backdrop-blur-sm border border-brand-400 px-2 py-1 rounded text-xs font-bold text-white">
          <i className="fas fa-graduation-cap mr-1"></i> Cursus
        </div>
        {item.provider && (
          <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-sm border border-slate-700 px-2 py-1 rounded text-xs text-slate-300">
            {item.provider}
          </div>
        )}
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-brand-500 uppercase tracking-wide">
            {item.category}
          </span>
          <div className="flex items-center text-yellow-500 text-xs font-bold">
            <i className="fas fa-star mr-1"></i>
            <span className="text-slate-300">{item.rating}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-brand-400 transition-colors">
          {item.title}
        </h3>
        
        <p className="text-slate-400 text-sm mb-4 line-clamp-3 flex-grow">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {item.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="font-bold text-slate-200 text-sm">
            {item.priceLabel}
          </span>
          <span 
            className="inline-flex items-center text-sm font-semibold text-brand-400 group-hover:translate-x-1 transition-transform"
          >
            Bekijk Cursus <i className="fas fa-arrow-right ml-1 text-xs"></i>
          </span>
        </div>
      </div>
    </div>
  );
};
