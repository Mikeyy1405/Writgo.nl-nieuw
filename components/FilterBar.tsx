
import React from 'react';
import { Category } from '../types';

interface FilterBarProps {
  selectedCategory: Category | 'ALL';
  onSelectCategory: (cat: Category | 'ALL') => void;
  resultCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({ selectedCategory, onSelectCategory, resultCount }) => {
  const categories = ['ALL', ...Object.values(Category)];

  return (
    <div className="bg-slate-950/80 backdrop-blur border-b border-slate-800 sticky top-16 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-center gap-4 md:relative">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat as Category | 'ALL')}
                className={`
                  whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all border
                  ${selectedCategory === cat 
                    ? 'bg-slate-800 border-brand-500 text-brand-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                    : 'bg-transparent border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'}
                `}
              >
                {cat === 'ALL' ? 'Alles tonen' : cat}
              </button>
            ))}
          </div>
          <div className="text-sm text-slate-500 font-medium whitespace-nowrap pt-2 md:pt-0 text-center md:absolute md:right-0">
            <span className="text-white">{resultCount}</span> {resultCount === 1 ? 'resultaat' : 'resultaten'} gevonden
          </div>
        </div>
      </div>
    </div>
  );
};
