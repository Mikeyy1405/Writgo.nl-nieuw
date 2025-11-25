import React from 'react';
import { User, GrowthItem, BlogPost } from '../types';

interface DashboardProps {
  user: User;
  items: GrowthItem[];
  posts: BlogPost[];
  onNavigate: (view: 'BLOG_NEW' | 'TOOL_NEW' | 'HOME' | 'BLOG') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, items, posts, onNavigate }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welkom terug, <span className="text-brand-400">{user.name}</span>
          </h1>
          <p className="text-slate-400">
            Beheer je content en gebruik AI om nieuwe cursussen en artikelen toe te voegen.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <i className="fas fa-shield-alt mr-2"></i> Admin Modus
            </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-brand-500/30 transition-all">
          <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-layer-group text-6xl text-white"></i>
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Totaal Items</div>
          <div className="text-3xl font-bold text-white">{items.length}</div>
          <div className="mt-4 text-xs text-brand-400 cursor-pointer hover:underline" onClick={() => onNavigate('HOME')}>
            Bekijk overzicht <i className="fas fa-arrow-right ml-1"></i>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-brand-500/30 transition-all">
          <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-feather-alt text-6xl text-white"></i>
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Blog Artikelen</div>
          <div className="text-3xl font-bold text-white">{posts.length}</div>
          <div className="mt-4 text-xs text-brand-400 cursor-pointer hover:underline" onClick={() => onNavigate('BLOG')}>
            Naar de blog <i className="fas fa-arrow-right ml-1"></i>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-brand-500/30 transition-all">
           <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-chart-line text-6xl text-white"></i>
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Database Versie</div>
          <div className="text-3xl font-bold text-white">v0.9.2</div>
          <div className="mt-4 text-xs text-slate-500">
             Lokale opslag actief
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-2">AI Studio</h2>
      
      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Tool Generator Card */}
        <div 
            onClick={() => onNavigate('TOOL_NEW')}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-accent-500/50 rounded-3xl p-8 cursor-pointer transition-all duration-300 group shadow-lg hover:shadow-accent-500/10 flex flex-col md:flex-row items-center gap-6"
        >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-500 to-orange-600 flex items-center justify-center text-white text-3xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-plus"></i>
            </div>
            <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-400 transition-colors">Nieuwe Cursus/Tool</h3>
                <p className="text-slate-400 text-sm mb-4">
                    Plak een URL of tekst van een landingspagina. De AI analyseert het en maakt een complete review-pagina.
                </p>
                <span className="text-accent-500 text-sm font-bold uppercase tracking-wide">Start Generator <i className="fas fa-chevron-right ml-1 text-xs"></i></span>
            </div>
        </div>

        {/* Blog Generator Card */}
        <div 
            onClick={() => onNavigate('BLOG_NEW')}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/50 rounded-3xl p-8 cursor-pointer transition-all duration-300 group shadow-lg hover:shadow-brand-500/10 flex flex-col md:flex-row items-center gap-6"
        >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-blue-400 flex items-center justify-center text-white text-3xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-pen-nib"></i>
            </div>
            <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">Nieuw Blog Artikel</h3>
                <p className="text-slate-400 text-sm mb-4">
                    Geef een onderwerp op en laat AI een volledig geformatteerd artikel schrijven voor je kennisbank.
                </p>
                <span className="text-brand-400 text-sm font-bold uppercase tracking-wide">Start Writer <i className="fas fa-chevron-right ml-1 text-xs"></i></span>
            </div>
        </div>
      </div>

      {/* Recent Activity Mini-Table */}
      <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-2">Recent Toegevoegd</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase text-xs font-semibold">
                <tr>
                    <th className="px-6 py-4">Titel</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Categorie</th>
                    <th className="px-6 py-4 text-right">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {items.slice(0, 5).map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                        <td className="px-6 py-4">{item.type}</td>
                        <td className="px-6 py-4"><span className="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">{item.category}</span></td>
                        <td className="px-6 py-4 text-right">
                            <span className="text-green-500 text-xs font-bold uppercase"><i className="fas fa-check-circle mr-1"></i> Live</span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 text-center text-xs text-slate-500">
            Toon alles in database
        </div>
      </div>
    </div>
  );
};