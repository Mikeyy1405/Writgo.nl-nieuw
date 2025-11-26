import React, { useState } from 'react';
import { User, GrowthItem, BlogPost } from '../types';

type AdminTab = 'dashboard' | 'content' | 'users' | 'settings';

interface AdminPanelProps {
  user: User;
  items: GrowthItem[];
  posts: BlogPost[];
  users: User[];
  onNavigate: (view: 'BLOG_NEW' | 'TOOL_NEW' | 'HOME' | 'BLOG') => void;
  onViewItem: (item: GrowthItem) => void;
  onViewPost: (post: BlogPost) => void;
  onDeleteItem: (itemId: string) => void;
  onDeletePost: (postId: string) => void;
  onCreateUser: (email: string, password: string, name: string, role: 'ADMIN' | 'USER') => Promise<void>;
  onUpdateUser: (userId: string, updates: { name?: string; email?: string; role?: 'ADMIN' | 'USER'; password?: string }) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  user,
  items,
  posts,
  users,
  onNavigate,
  onViewItem,
  onViewPost,
  onDeleteItem,
  onDeletePost,
  onCreateUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [contentFilter, setContentFilter] = useState<'all' | 'items' | 'posts'>('all');
  const [userFormVisible, setUserFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState({ email: '', password: '', name: '', role: 'USER' as 'ADMIN' | 'USER' });
  const [userError, setUserError] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'content', label: 'Content', icon: 'fa-file-alt' },
    { id: 'users', label: 'Gebruikers', icon: 'fa-users' },
    { id: 'settings', label: 'Instellingen', icon: 'fa-cog' }
  ];

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserLoading(true);
    
    try {
      await onCreateUser(newUserData.email, newUserData.password, newUserData.name, newUserData.role);
      setNewUserData({ email: '', password: '', name: '', role: 'USER' });
      setUserFormVisible(false);
    } catch (err) {
      setUserError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setUserLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setUserError('');
    setUserLoading(true);
    
    try {
      await onUpdateUser(editingUser.id, {
        name: newUserData.name || undefined,
        email: newUserData.email || undefined,
        role: newUserData.role,
        password: newUserData.password || undefined
      });
      setEditingUser(null);
      setNewUserData({ email: '', password: '', name: '', role: 'USER' });
    } catch (err) {
      setUserError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setUserLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) return;
    
    try {
      await onDeleteUser(userId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Kon gebruiker niet verwijderen');
    }
  };

  const startEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setNewUserData({
      email: userToEdit.email,
      name: userToEdit.name,
      password: '',
      role: userToEdit.role
    });
    setUserFormVisible(false);
  };

  const renderDashboard = () => (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-brand-500/30 transition-all">
          <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-layer-group text-5xl text-white"></i>
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Totaal Items</div>
          <div className="text-3xl font-bold text-white">{items.length}</div>
          <div className="mt-4 text-xs text-brand-400 cursor-pointer hover:underline" onClick={() => onNavigate('HOME')}>
            Bekijk overzicht <i className="fas fa-arrow-right ml-1"></i>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-brand-500/30 transition-all">
          <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-feather-alt text-5xl text-white"></i>
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Blog Artikelen</div>
          <div className="text-3xl font-bold text-white">{posts.length}</div>
          <div className="mt-4 text-xs text-brand-400 cursor-pointer hover:underline" onClick={() => onNavigate('BLOG')}>
            Naar de blog <i className="fas fa-arrow-right ml-1"></i>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-brand-500/30 transition-all">
          <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-users text-5xl text-white"></i>
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Gebruikers</div>
          <div className="text-3xl font-bold text-white">{users.length}</div>
          <div className="mt-4 text-xs text-slate-500">
            {users.filter(u => u.role === 'ADMIN').length} admin(s)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-brand-500/30 transition-all">
          <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-chart-line text-5xl text-white"></i>
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Database Versie</div>
          <div className="text-3xl font-bold text-white">v2.4</div>
          <div className="mt-4 text-xs text-slate-500">
            Lokale opslag actief
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-2">AI Studio</h2>
      
      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
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

      {/* Recent Activity */}
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
      </div>
    </>
  );

  const renderContent = () => (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-white">Content Beheer</h2>
        <div className="flex gap-2">
          {['all', 'items', 'posts'].map(filter => (
            <button
              key={filter}
              onClick={() => setContentFilter(filter as typeof contentFilter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                contentFilter === filter
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {filter === 'all' ? 'Alles' : filter === 'items' ? 'Tools/Cursussen' : 'Blog Posts'}
            </button>
          ))}
        </div>
      </div>

      {(contentFilter === 'all' || contentFilter === 'items') && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <i className="fas fa-layer-group mr-2 text-accent-500"></i> Tools & Cursussen
            </h3>
            <button
              onClick={() => onNavigate('TOOL_NEW')}
              className="text-sm bg-accent-600 hover:bg-accent-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <i className="fas fa-plus mr-2"></i> Nieuwe Tool
            </button>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950 text-slate-200 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Titel</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Categorie</th>
                  <th className="px-6 py-4 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                    <td className="px-6 py-4">{item.type}</td>
                    <td className="px-6 py-4"><span className="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">{item.category}</span></td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onViewItem(item)}
                        className="text-brand-400 hover:text-brand-300 mr-4"
                        title="Bekijken"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Weet je zeker dat je "${item.title}" wilt verwijderen?`)) {
                            onDeleteItem(item.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300"
                        title="Verwijderen"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(contentFilter === 'all' || contentFilter === 'posts') && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <i className="fas fa-feather-alt mr-2 text-brand-500"></i> Blog Posts
            </h3>
            <button
              onClick={() => onNavigate('BLOG_NEW')}
              className="text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <i className="fas fa-plus mr-2"></i> Nieuw Artikel
            </button>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950 text-slate-200 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Titel</th>
                  <th className="px-6 py-4">Auteur</th>
                  <th className="px-6 py-4">Datum</th>
                  <th className="px-6 py-4 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{post.title}</td>
                    <td className="px-6 py-4">{post.author}</td>
                    <td className="px-6 py-4">{post.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onViewPost(post)}
                        className="text-brand-400 hover:text-brand-300 mr-4"
                        title="Bekijken"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Weet je zeker dat je "${post.title}" wilt verwijderen?`)) {
                            onDeletePost(post.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300"
                        title="Verwijderen"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );

  const renderUsers = () => (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-white">Gebruikers Beheer</h2>
        <button
          onClick={() => {
            setUserFormVisible(true);
            setEditingUser(null);
            setNewUserData({ email: '', password: '', name: '', role: 'USER' });
          }}
          className="text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <i className="fas fa-user-plus mr-2"></i> Nieuwe Gebruiker
        </button>
      </div>

      {(userFormVisible || editingUser) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingUser ? 'Gebruiker Bewerken' : 'Nieuwe Gebruiker'}
          </h3>
          
          {userError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i> {userError}
            </div>
          )}
          
          <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Naam *</label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-slate-600"
                  placeholder="Volledige naam"
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">E-mailadres *</label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-slate-600"
                  placeholder="email@voorbeeld.nl"
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Wachtwoord {editingUser ? '(laat leeg om te behouden)' : '*'}
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-slate-600"
                  placeholder="••••••••"
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Rol *</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as 'ADMIN' | 'USER' })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  required
                >
                  <option value="USER">Gebruiker</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={userLoading}
                className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                {userLoading ? <i className="fas fa-circle-notch fa-spin"></i> : (editingUser ? 'Opslaan' : 'Aanmaken')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserFormVisible(false);
                  setEditingUser(null);
                  setUserError('');
                  setNewUserData({ email: '', password: '', name: '', role: 'USER' });
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950 text-slate-200 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Gebruiker</th>
              <th className="px-6 py-4">E-mail</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4 text-right">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full mr-3" />
                    <span className="font-medium text-white">{u.name}</span>
                    {u.id === user.id && (
                      <span className="ml-2 text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded">Jij</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    u.role === 'ADMIN' ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {u.role === 'ADMIN' ? 'Administrator' : 'Gebruiker'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => startEditUser(u)}
                    className="text-brand-400 hover:text-brand-300 mr-4"
                    title="Bewerken"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  {u.id !== user.id && (
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="text-red-400 hover:text-red-300"
                      title="Verwijderen"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderSettings = () => (
    <>
      <h2 className="text-2xl font-bold text-white mb-8">Instellingen</h2>
      
      <div className="space-y-8">
        {/* Site Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <i className="fas fa-globe mr-2 text-brand-500"></i> Site Instellingen
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Site Naam</label>
              <input
                type="text"
                defaultValue="Writgo Academy"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Site Beschrijving</label>
              <textarea
                defaultValue="Vergelijk Cursussen & Tools"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all h-24 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <i className="fas fa-palette mr-2 text-accent-500"></i> Thema
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border-2 border-brand-500 cursor-pointer">
              <div className="w-full h-20 bg-slate-900 rounded-lg mb-2 flex items-center justify-center">
                <span className="text-2xl">🌙</span>
              </div>
              <p className="text-center text-sm text-white">Dark Mode</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-700 cursor-pointer opacity-50">
              <div className="w-full h-20 bg-white rounded-lg mb-2 flex items-center justify-center">
                <span className="text-2xl">☀️</span>
              </div>
              <p className="text-center text-sm text-slate-400">Light Mode</p>
              <p className="text-center text-xs text-slate-600">Binnenkort</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-700 cursor-pointer opacity-50">
              <div className="w-full h-20 bg-gradient-to-r from-slate-900 to-white rounded-lg mb-2 flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
              <p className="text-center text-sm text-slate-400">Systeem</p>
              <p className="text-center text-xs text-slate-600">Binnenkort</p>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <i className="fas fa-key mr-2 text-yellow-500"></i> API Sleutels
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Claude API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  defaultValue="••••••••••••••••"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  readOnly
                />
                <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl transition-colors">
                  <i className="fas fa-eye"></i>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                <i className="fas fa-info-circle mr-1"></i> 
                Deze sleutel wordt beheerd via omgevingsvariabelen
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
            <i className="fas fa-exclamation-triangle mr-2"></i> Gevaarlijke Acties
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Wees voorzichtig met deze acties. Ze kunnen niet ongedaan worden gemaakt.
          </p>
          <div className="flex gap-4">
            <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors text-sm">
              <i className="fas fa-trash mr-2"></i> Database Resetten
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors text-sm">
              <i className="fas fa-download mr-2"></i> Data Exporteren
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Panel
          </h1>
          <p className="text-slate-400">
            Welkom terug, <span className="text-brand-400">{user.name}</span>
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <i className="fas fa-shield-alt mr-2"></i> Admin Modus
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 border-b border-slate-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-all flex items-center ${
              activeTab === tab.id
                ? 'text-brand-400 border-b-2 border-brand-400 -mb-px'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className={`fas ${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'content' && renderContent()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};
