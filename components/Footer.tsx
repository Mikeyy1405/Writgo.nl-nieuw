
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold text-white mb-4">Writgo</div>
            <p className="text-sm text-slate-500">
              Het meest complete overzicht van online cursussen en software tools. Vergelijk alles in elke niche, van business tot hobby.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Cursussen</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#/cursussen" className="hover:text-brand-400 transition-colors">Alle Cursussen</a></li>
              <li><a href="#/cursussen" className="hover:text-brand-400 transition-colors">Marketing Cursussen</a></li>
              <li><a href="#/cursussen" className="hover:text-brand-400 transition-colors">Development Cursussen</a></li>
              <li><a href="#/cursussen" className="hover:text-brand-400 transition-colors">Design Cursussen</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Tools & Software</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#/tools" className="hover:text-accent-400 transition-colors">Alle Tools</a></li>
              <li><a href="#/tools" className="hover:text-accent-400 transition-colors">Productiviteit Tools</a></li>
              <li><a href="#/tools" className="hover:text-accent-400 transition-colors">Design Tools</a></li>
              <li><a href="#/tools" className="hover:text-accent-400 transition-colors">Marketing Software</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Blijf up-to-date</h4>
            <p className="text-sm text-slate-500 mb-4">
              Ontvang de beste cursus en tool tips direct in je inbox.
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Je e-mailadres" 
                className="bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-l-md w-full focus:ring-1 focus:ring-brand-500 focus:border-brand-500 focus:outline-none text-sm placeholder-slate-600"
              />
              <button className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-r-md text-sm font-bold transition-colors border border-brand-600 hover:border-brand-500">
                Start
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} Writgo. Alle rechten voorbehouden.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Voorwaarden</a>
            <a href="#/blog" className="hover:text-white">Kennisbank</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
