import React, { useState, useEffect } from 'react';
import { GrowthItem, Category } from '../types';
import { ToolCard } from './ToolCard';
import { Breadcrumbs } from './Breadcrumbs';

interface ToolsOverviewProps {
  tools: GrowthItem[];
  onViewTool: (item: GrowthItem) => void;
}

export const ToolsOverview: React.FC<ToolsOverviewProps> = ({ tools, onViewTool }) => {
  const [filteredTools, setFilteredTools] = useState<GrowthItem[]>(tools);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');

  // SEO: Update document title
  useEffect(() => {
    document.title = 'Alle Tools - Vergelijk de Beste Software & Apps | Writgo';
    return () => {
      document.title = 'Writgo - Cursussen & Tools voor Groei';
    };
  }, []);

  // Filter tools based on category, search and price
  useEffect(() => {
    let results = tools;
    
    if (selectedCategory !== 'ALL') {
      results = results.filter(t => t.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (priceFilter === 'FREE') {
      results = results.filter(t => 
        t.priceLabel.toLowerCase().includes('gratis') || 
        t.priceLabel.toLowerCase().includes('free')
      );
    } else if (priceFilter === 'PAID') {
      results = results.filter(t => 
        !t.priceLabel.toLowerCase().includes('gratis') && 
        !t.priceLabel.toLowerCase().includes('free')
      );
    }
    
    setFilteredTools(results);
  }, [tools, selectedCategory, searchQuery, priceFilter]);

  // Get unique categories from tools
  const categories = ['ALL', ...Object.values(Category)];

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Software & Tools Vergelijken",
    "description": "Vergelijk de beste software en tools voor ondernemers. Van design tools tot productiviteit apps.",
    "url": "https://writgo.nl/tools",
    "numberOfItems": tools.length
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      <Breadcrumbs 
        items={[
          { label: 'Home', href: '#/' },
          { label: 'Tools' }
        ]} 
      />

      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-block py-1 px-3 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-semibold mb-4 uppercase tracking-wide">
          <i className="fas fa-tools mr-2"></i>
          Tools & Software
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Alle Tools & Software
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Ontdek de beste software en tools voor ondernemers. Van design tools tot productiviteit apps, 
          wij vergelijken ze allemaal.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900/50 rounded-2xl p-6 mb-8 border border-slate-800">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="fas fa-search text-slate-500"></i>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek tools..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 focus:outline-none"
            />
          </div>
          
          {/* Category Filter */}
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'ALL')}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 focus:outline-none appearance-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'Alle categorieën' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div className="md:w-48">
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as 'ALL' | 'FREE' | 'PAID')}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">Alle prijzen</option>
              <option value="FREE">Gratis</option>
              <option value="PAID">Betaald</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-slate-500">
          <span className="text-white font-medium">{filteredTools.length}</span> {filteredTools.length === 1 ? 'tool' : 'tools'} gevonden
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
          <div className="text-6xl text-slate-800 mb-4">
            <i className="fas fa-search"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Geen tools gevonden</h3>
          <p className="text-slate-500">Probeer een andere zoekterm of categorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTools.map(tool => (
            <ToolCard key={tool.id} item={tool} onClick={onViewTool} />
          ))}
        </div>
      )}
    </div>
  );
};
