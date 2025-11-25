
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FilterBar } from './components/FilterBar';
import { CourseCard } from './components/CourseCard';
import { CourseDetail } from './components/CourseDetail';
import { Footer } from './components/Footer';
import { BlogList } from './components/BlogList';
import { BlogPost as BlogPostView } from './components/BlogPost';
import { BlogGenerator } from './components/BlogGenerator';
import { ToolGenerator } from './components/ToolGenerator';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { WhyWritgo } from './components/WhyWritgo';
import { CategoryGrid } from './components/CategoryGrid';
import { LatestArticlesPreview } from './components/LatestArticlesPreview';

import { Category, GrowthItem, BlogPost, User } from './types';
import { searchAiRecommendations } from './services/geminiService';
import * as db from './services/db';
import * as auth from './services/auth';

type ViewState = 'HOME' | 'ITEM_DETAIL' | 'BLOG' | 'BLOG_DETAIL' | 'BLOG_NEW' | 'TOOL_NEW' | 'LOGIN' | 'DASHBOARD';

const App: React.FC = () => {
  // Application Data
  const [items, setItems] = useState<GrowthItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [user, setUser] = useState<User | null>(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState<GrowthItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [isSearching, setIsSearching] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>('');
  
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedItem, setSelectedItem] = useState<GrowthItem | null>(null);

  // Initial Load (Backend Simulation)
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const [fetchedItems, fetchedPosts] = await Promise.all([
        db.getItems(),
        db.getPosts()
      ]);
      setItems(fetchedItems);
      setBlogPosts(fetchedPosts);
      setUser(auth.getCurrentUser());
      setIsLoading(false);
    };
    init();
  }, []);

  // Filter effect
  useEffect(() => {
    let results = items;

    if (lastQuery) {
        results = results.filter(item => 
            item.title.toLowerCase().includes(lastQuery.toLowerCase()) || 
            item.tags.some(tag => tag.toLowerCase().includes(lastQuery.toLowerCase())) ||
            item.category.toLowerCase().includes(lastQuery.toLowerCase())
        );
    }

    if (selectedCategory !== 'ALL') {
      results = results.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(results);
  }, [selectedCategory, items, lastQuery]);

  // --- ROUTER LOGIC ---
  const handleHashChange = async () => {
      const hash = window.location.hash;
      
      if (!hash || hash === '#/') {
          setCurrentView('HOME');
          setSelectedItem(null);
          setSelectedPost(null);
          window.scrollTo(0, 0);
          return;
      }

      if (hash.startsWith('#/tool/')) {
          const slug = hash.replace('#/tool/', '');
          const foundItem = await db.getItemBySlug(slug);
          if (foundItem) {
              setSelectedItem(foundItem);
              setCurrentView('ITEM_DETAIL');
              window.scrollTo(0, 0);
          } else {
              window.location.hash = '#/';
          }
      } else if (hash.startsWith('#/blog/')) {
          const slug = hash.replace('#/blog/', '');
          const foundPost = await db.getPostBySlug(slug);
          if (foundPost) {
              setSelectedPost(foundPost);
              setCurrentView('BLOG_DETAIL');
              window.scrollTo(0, 0);
          } else {
               window.location.hash = '#/blog';
          }
      } else if (hash === '#/blog') {
          setCurrentView('BLOG');
          window.scrollTo(0, 0);
      } else if (hash === '#/dashboard') {
          setCurrentView('DASHBOARD');
      } else if (hash === '#/login') {
          setCurrentView('LOGIN');
      } else if (hash === '#/admin/tool/new') {
          setCurrentView('TOOL_NEW');
      } else if (hash === '#/admin/blog/new') {
          setCurrentView('BLOG_NEW');
      }
  };

  useEffect(() => {
      if (!isLoading) {
          handleHashChange();
          window.addEventListener('hashchange', handleHashChange);
          return () => window.removeEventListener('hashchange', handleHashChange);
      }
  }, [isLoading]); 

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    window.location.hash = '#/dashboard';
  };

  const handleLogout = async () => {
    await auth.logout();
    setUser(null);
    window.location.hash = '#/';
  };

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setLastQuery(query);
    setSelectedCategory('ALL');
    
    if (currentView !== 'HOME') {
        window.location.hash = '#/';
    }

    try {
      const aiResults = await searchAiRecommendations(query);
      
      const newItems = [...items];
      aiResults.forEach(aiItem => {
         if (!newItems.find(i => i.title === aiItem.title)) {
            newItems.push(aiItem);
         }
      });
      setItems(newItems);

    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNavigate = (page: ViewState) => {
    if ((page === 'BLOG_NEW' || page === 'TOOL_NEW' || page === 'DASHBOARD') && !user) {
      window.location.hash = '#/login';
      return;
    }

    switch(page) {
        case 'HOME': window.location.hash = '#/'; break;
        case 'BLOG': window.location.hash = '#/blog'; break;
        case 'DASHBOARD': window.location.hash = '#/dashboard'; break;
        case 'LOGIN': window.location.hash = '#/login'; break;
        case 'BLOG_NEW': window.location.hash = '#/admin/blog/new'; break;
        case 'TOOL_NEW': window.location.hash = '#/admin/tool/new'; break;
        default: window.location.hash = '#/';
    }
  };

  const handleReadPost = (post: BlogPost) => {
     window.location.hash = `#/blog/${post.slug}`;
  };

  const handleViewItem = (item: GrowthItem) => {
     window.location.hash = `#/tool/${item.slug}`;
  };

  const handleSaveBlogPost = async (newPost: BlogPost) => {
      const updatedPosts = await db.savePost(newPost);
      setBlogPosts(updatedPosts);
      window.location.hash = `#/blog/${newPost.slug}`;
  };

  const handleSaveTool = async (newTool: GrowthItem) => {
      const updatedItems = await db.saveItem(newTool);
      setItems(updatedItems);
      window.location.hash = `#/tool/${newTool.slug}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-brand-500 text-4xl animate-pulse">
           <i className="fas fa-circle-notch fa-spin"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans">
      <Header 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="flex-grow">
        
        {currentView === 'LOGIN' && (
          <Login onLoginSuccess={handleLogin} onCancel={() => handleNavigate('HOME')} />
        )}

        {currentView === 'DASHBOARD' && user && (
            <Dashboard 
                user={user} 
                items={items} 
                posts={blogPosts}
                onNavigate={handleNavigate}
            />
        )}

        {currentView === 'HOME' && (
          <>
            <Hero onSearch={handleSearch} isSearching={isSearching} />
            
            <FilterBar 
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory}
              resultCount={filteredItems.length}
            />

            <div className="container mx-auto px-4 py-12">
              {lastQuery ? (
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    Resultaten voor <span className="text-brand-400">"{lastQuery}"</span>
                  </h2>
                  <button 
                    onClick={() => {
                        setLastQuery('');
                        setSelectedCategory('ALL');
                    }}
                    className="text-sm text-slate-500 hover:text-red-400 underline decoration-slate-700 hover:decoration-red-400 transition-all"
                  >
                    Wis zoekopdracht
                  </button>
                </div>
              ) : (
                <div className="text-center mb-12">
                   <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Uitgelicht door de Redactie</h2>
                   <p className="text-slate-400 max-w-2xl mx-auto">
                     Zorgvuldig geselecteerde software, cursussen en opleidingen voor professionals en ondernemers.
                   </p>
                </div>
              )}

              {filteredItems.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                  <div className="text-6xl text-slate-800 mb-4">
                    <i className="fas fa-search"></i>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Geen resultaten gevonden</h3>
                  <p className="text-slate-500">Probeer een andere zoekterm of categorie.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                  {filteredItems.map(item => (
                    <CourseCard key={item.id} item={item} onClick={handleViewItem} />
                  ))}
                </div>
              )}
            </div>

            <CategoryGrid onCategorySelect={(cat) => setSelectedCategory(cat)} />
            <WhyWritgo />
            <LatestArticlesPreview posts={blogPosts.slice(0, 3)} onReadPost={handleReadPost} />
          </>
        )}

        {currentView === 'ITEM_DETAIL' && selectedItem && (
            <CourseDetail item={selectedItem} onBack={() => handleNavigate('HOME')} />
        )}

        {currentView === 'BLOG' && (
          <BlogList 
            posts={blogPosts} 
            onReadPost={handleReadPost}
          />
        )}

        {currentView === 'BLOG_NEW' && (
            <BlogGenerator 
                onSave={handleSaveBlogPost}
                onCancel={() => handleNavigate('DASHBOARD')}
            />
        )}

        {currentView === 'TOOL_NEW' && (
            <ToolGenerator
                onSave={handleSaveTool}
                onCancel={() => handleNavigate('DASHBOARD')}
            />
        )}

        {currentView === 'BLOG_DETAIL' && selectedPost && (
          <BlogPostView 
            post={selectedPost} 
            onBack={() => handleNavigate('BLOG')} 
          />
        )}

      </main>

      <Footer />
      
      {currentView === 'DASHBOARD' && user && (
          <div className="flex justify-center pb-8 opacity-40 hover:opacity-100 transition-opacity">
              <button onClick={async () => {
                  if(confirm("Weet je het zeker? De database wordt volledig gereset.")) {
                      await db.resetDatabase();
                      window.location.reload();
                  }
              }} className="text-xs text-red-500 border border-red-900 px-4 py-2 rounded bg-slate-900 hover:bg-red-900/20">
                  <i className="fas fa-trash mr-2"></i> Database Resetten
              </button>
          </div>
      )}
    </div>
  );
};

export default App;
