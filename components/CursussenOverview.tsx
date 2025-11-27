import React, { useState, useEffect } from 'react';
import { GrowthItem, Category } from '../types';
import { CursusCard } from './CursusCard';
import { Breadcrumbs } from './Breadcrumbs';

interface CursussenOverviewProps {
  courses: GrowthItem[];
  onViewCourse: (item: GrowthItem) => void;
}

export const CursussenOverview: React.FC<CursussenOverviewProps> = ({ courses, onViewCourse }) => {
  const [filteredCourses, setFilteredCourses] = useState<GrowthItem[]>(courses);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // SEO: Update document title
  useEffect(() => {
    document.title = 'Alle Cursussen - Vergelijk de Beste Online Cursussen | Writgo';
    return () => {
      document.title = 'Writgo - Cursussen & Tools voor Groei';
    };
  }, []);

  // Filter courses based on category and search
  useEffect(() => {
    let results = courses;
    
    if (selectedCategory !== 'ALL') {
      results = results.filter(c => c.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredCourses(results);
  }, [courses, selectedCategory, searchQuery]);

  // Get unique categories from courses
  const categories = ['ALL', ...Object.values(Category)];

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Online Cursussen Vergelijken",
    "description": "Vergelijk de beste online cursussen in Nederland. Van marketing tot programmeren, vind de cursus die bij jou past.",
    "url": "https://writgo.nl/cursussen",
    "numberOfItems": courses.length
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
          { label: 'Cursussen' }
        ]} 
      />

      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-block py-1 px-3 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-4 uppercase tracking-wide">
          <i className="fas fa-graduation-cap mr-2"></i>
          Cursussen
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Alle Online Cursussen
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Vergelijk de beste online cursussen in Nederland. Van marketing tot programmeren, 
          vind de cursus die bij jou past.
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
              placeholder="Zoek cursussen..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          
          {/* Category Filter */}
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'ALL')}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none appearance-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'Alle categorieën' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-slate-500">
          <span className="text-white font-medium">{filteredCourses.length}</span> {filteredCourses.length === 1 ? 'cursus' : 'cursussen'} gevonden
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
          <div className="text-6xl text-slate-800 mb-4">
            <i className="fas fa-search"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Geen cursussen gevonden</h3>
          <p className="text-slate-500">Probeer een andere zoekterm of categorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <CursusCard key={course.id} item={course} onClick={onViewCourse} />
          ))}
        </div>
      )}
    </div>
  );
};
