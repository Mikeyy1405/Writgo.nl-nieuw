
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: 'HOME' | 'BLOG' | 'BLOG_NEW' | 'TOOL_NEW' | 'LOGIN' | 'ADMIN' | 'CURSUSSEN' | 'TOOLS') => void;
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, user, onLogout }) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => onNavigate('HOME')}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-400 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/20">
            W
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Writgo</span>
        </div>
        
        <nav className="hidden md:flex space-x-6 text-sm font-medium text-slate-400">
          <button 
            onClick={() => onNavigate('HOME')}
            className={`transition-colors hover:text-white ${currentView === 'HOME' ? 'text-white font-bold' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('CURSUSSEN')}
            className={`transition-colors hover:text-white flex items-center ${currentView === 'CURSUSSEN' || currentView === 'CURSUS_DETAIL' ? 'text-brand-400 font-bold' : ''}`}
          >
            <i className="fas fa-graduation-cap mr-2 text-xs"></i>
            Cursussen
          </button>
          <button 
            onClick={() => onNavigate('TOOLS')}
            className={`transition-colors hover:text-white flex items-center ${currentView === 'TOOLS' || currentView === 'TOOL_DETAIL' ? 'text-accent-400 font-bold' : ''}`}
          >
            <i className="fas fa-tools mr-2 text-xs"></i>
            Tools
          </button>
          <button 
            onClick={() => onNavigate('BLOG')}
            className={`transition-colors hover:text-white ${currentView.includes('BLOG') && currentView !== 'BLOG_NEW' ? 'text-white font-bold' : ''}`}
          >
            Kennisbank
          </button>
          
          {/* Admin Link */}
          {user && (
            <button 
              onClick={() => onNavigate('ADMIN')}
              className={`transition-colors flex items-center hover:text-brand-400 ${currentView === 'ADMIN' || currentView === 'BLOG_NEW' || currentView === 'TOOL_NEW' ? 'text-brand-400 font-bold' : ''}`}
            >
              <i className="fas fa-columns mr-2 text-xs"></i> Admin
            </button>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
             <div className="flex items-center space-x-3">
               <div className="flex items-center space-x-2">
                 <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full border border-slate-700" />
                 <span className="hidden lg:block text-xs font-medium text-slate-300">{user.name}</span>
               </div>
               <button 
                onClick={onLogout}
                className="text-slate-400 hover:text-white text-xs border border-slate-700 rounded px-2 py-1 hover:border-slate-500 transition-all"
               >
                 Uitloggen
               </button>
             </div>
          ) : (
             <div className="flex items-center space-x-4">
                <button 
                  onClick={() => onNavigate('LOGIN')}
                  className="hidden sm:block text-slate-400 hover:text-white font-medium text-sm"
                >
                  Admin
                </button>
                <a href="#/tools" className="bg-accent-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-accent-600 transition-all shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30">
                  Top Tools
                </a>
             </div>
          )}
        </div>
      </div>
    </header>
  );
};
