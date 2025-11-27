import React from 'react';
import { GrowthItem } from '../types';
import { CursusCard } from './CursusCard';
import { ToolCard } from './ToolCard';

interface FeaturedSectionsProps {
  courses: GrowthItem[];
  tools: GrowthItem[];
  onViewCourse: (item: GrowthItem) => void;
  onViewTool: (item: GrowthItem) => void;
}

export const FeaturedSections: React.FC<FeaturedSectionsProps> = ({ 
  courses, 
  tools, 
  onViewCourse, 
  onViewTool 
}) => {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Popular Courses Section */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3 uppercase tracking-wide">
              <i className="fas fa-graduation-cap mr-2"></i>
              Cursussen
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Populaire Cursussen</h2>
            <p className="text-slate-400 mt-2 max-w-xl">
              Zorgvuldig geselecteerde online cursussen voor professionals en ondernemers.
            </p>
          </div>
          <a 
            href="#/cursussen" 
            className="mt-4 md:mt-0 inline-flex items-center text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Bekijk alle cursussen <i className="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.slice(0, 3).map(course => (
            <CursusCard key={course.id} item={course} onClick={onViewCourse} />
          ))}
        </div>
      </section>

      {/* Popular Tools Section */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-semibold mb-3 uppercase tracking-wide">
              <i className="fas fa-tools mr-2"></i>
              Tools & Software
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Populaire Tools</h2>
            <p className="text-slate-400 mt-2 max-w-xl">
              De beste software en tools om je productiviteit en business te verbeteren.
            </p>
          </div>
          <a 
            href="#/tools" 
            className="mt-4 md:mt-0 inline-flex items-center text-accent-400 hover:text-accent-300 font-medium transition-colors"
          >
            Bekijk alle tools <i className="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.slice(0, 3).map(tool => (
            <ToolCard key={tool.id} item={tool} onClick={onViewTool} />
          ))}
        </div>
      </section>
    </div>
  );
};
