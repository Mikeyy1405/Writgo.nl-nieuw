
import React from 'react';
import { Category } from '../types';

interface CategoryGridProps {
    onCategorySelect: (category: Category) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategorySelect }) => {
    const categoryDetails = [
        { name: Category.BUSINESS, icon: 'fas fa-briefcase' },
        { name: Category.MARKETING, icon: 'fas fa-bullhorn' },
        { name: Category.FINANCE, icon: 'fas fa-chart-line' },
        { name: Category.DEVELOPMENT, icon: 'fas fa-code' },
        { name: Category.DESIGN, icon: 'fas fa-paint-brush' },
        { name: Category.LIFESTYLE, icon: 'fas fa-heartbeat' },
        { name: Category.PRODUCTIVITY, icon: 'fas fa-rocket' },
        { name: Category.OTHER, icon: 'fas fa-ellipsis-h' },
    ];

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white">Ontdek per Categorie</h2>
                <p className="text-slate-400 mt-2">Vind direct wat je zoekt in onze belangrijkste kennisgebieden.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {categoryDetails.map(({ name, icon }) => (
                    <div 
                        key={name}
                        onClick={() => onCategorySelect(name)}
                        className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center cursor-pointer group hover:bg-slate-800 hover:border-brand-500/50 transition-all transform hover:scale-105"
                    >
                        <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-brand-500/20 text-brand-400 flex items-center justify-center text-2xl mb-4 transition-all border border-slate-700 group-hover:border-brand-500/30">
                            <i className={icon}></i>
                        </div>
                        <h3 className="font-bold text-sm text-white transition-colors">{name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};
