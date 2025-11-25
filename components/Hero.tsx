
import React, { useState } from 'react';

interface HeroProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, isSearching }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  return (
    <div className="relative pt-20 pb-28 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px] opacity-50"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent-500/20 rounded-full blur-[100px] opacity-40"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <span className="inline-block py-1 px-3 rounded-full bg-slate-800 border border-slate-700 text-brand-400 text-xs font-semibold mb-6 tracking-wide uppercase shadow-sm">
          De #1 Cursus Vergelijker van NL
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
          Vind de beste cursus voor <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">elke vaardigheid</span>
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
          Van marketing en crypto tot honden trainen en programmeren. Wij vergelijken duizenden cursussen en tools zodat jij de juiste keuze maakt.
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className={`fas fa-search ${isSearching ? 'text-accent-500 animate-pulse' : 'text-slate-500'}`}></i>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Wat wil je leren? (bijv. 'Photoshop', 'Beleggen', 'Spaans')"
              className="block w-full pl-12 pr-36 py-4 text-white placeholder-slate-500 bg-slate-900/80 border border-slate-700 rounded-2xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none shadow-xl transition-all"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-medium rounded-xl px-6 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-70 disabled:cursor-wait"
            >
              {isSearching ? 'Zoeken...' : <span>Zoeken <i className="fas fa-arrow-right ml-1 text-xs opacity-70"></i></span>}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            <i className="fas fa-check-circle mr-1 text-green-500"></i>
            Onafhankelijke reviews & deep-dives
          </p>
        </form>

        <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm text-slate-500">
          <span>Populair:</span>
          <button onClick={() => onSearch('Marketing')} className="hover:text-brand-400 underline decoration-dotted decoration-slate-600 hover:decoration-brand-400 transition-colors">Marketing</button>
          <button onClick={() => onSearch('Programmeren')} className="hover:text-brand-400 underline decoration-dotted decoration-slate-600 hover:decoration-brand-400 transition-colors">Programmeren</button>
          <button onClick={() => onSearch('Crypto')} className="hover:text-brand-400 underline decoration-dotted decoration-slate-600 hover:decoration-brand-400 transition-colors">Crypto</button>
          <button onClick={() => onSearch('Fotografie')} className="hover:text-brand-400 underline decoration-dotted decoration-slate-600 hover:decoration-brand-400 transition-colors">Fotografie</button>
        </div>
      </div>
    </div>
  );
};
