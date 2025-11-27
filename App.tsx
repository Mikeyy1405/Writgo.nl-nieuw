
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FilterBar } from './components/FilterBar';
import { CourseCard } from './components/CourseCard';
import { CourseDetail } from './components/CourseDetail';
import { Footer } from './components/Footer';
import { BlogList } from './components/BlogList';
import { BlogPost as BlogPostView } from './components/BlogPost';
import { BlogEditor } from './components/BlogEditor';
import { ToolGenerator } from './components/ToolGenerator';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { WhyWritgo } from './components/WhyWritgo';
import { CategoryGrid } from './components/CategoryGrid';
import { LatestArticlesPreview } from './components/LatestArticlesPreview';

import { Category, GrowthItem, BlogPost, User } from './types';
import { searchAiRecommendations } from './services/claudeService';
import { Category, GrowthItem, BlogPost, User, BlogStatus } from './types';
import { searchAiRecommendations } from './services/geminiService';
import * as db from './services/db';
import * as auth from './services/auth';

type ViewState = 'HOME' | 'ITEM_DETAIL' | 'BLOG' | 'BLOG_DETAIL' | 'BLOG_NEW' | 'BLOG_EDIT' | 'TOOL_NEW' | 'LOGIN' | 'ADMIN';

const App: React.FC = () => {
  // Application Data
  const [items, setItems] = useState<GrowthItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
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
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Convert path-based routes to hash-based routes on initial load
  // This handles cases where users navigate directly to /admin, /blog, etc.
  useEffect(() => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    
    // Only convert if there's a path but no hash
    if (pathname !== '/' && !hash) {
      // Remove leading slash and convert to hash route
      window.location.replace(`${window.location.origin}/#${pathname}`);
    }
  }, []);

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
      setAllUsers(auth.getUsersForDisplay());
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
      } else if (hash === '#/admin' || hash.startsWith('#/admin/')) {
          // Handle all admin routes - require authentication
          const currentUser = auth.getCurrentUser();
          if (!currentUser) {
              // Redirect unauthenticated users to login
              window.location.hash = '#/login';
              return;
          }
          if (hash === '#/admin/blog/new') {
              setEditingPost(null);
              setCurrentView('BLOG_NEW');
          } else if (hash.startsWith('#/admin/blog/edit/')) {
              const postId = hash.replace('#/admin/blog/edit/', '');
              const postToEdit = blogPosts.find(p => p.id === postId);
              if (postToEdit) {
                  setEditingPost(postToEdit);
                  setCurrentView('BLOG_EDIT');
              } else {
                  window.location.hash = '#/admin';
              }
          } else if (hash === '#/admin/tool/new') {
              setCurrentView('TOOL_NEW');
          } else {
              setCurrentView('ADMIN');
          }
          window.scrollTo(0, 0);
      } else if (hash === '#/login') {
          setCurrentView('LOGIN');
      }
  };

  useEffect(() => {
      if (!isLoading) {
          handleHashChange();
          window.addEventListener('hashchange', handleHashChange);
          return () => window.removeEventListener('hashchange', handleHashChange);
      }
  }, [isLoading, blogPosts]); 

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setAllUsers(auth.getUsersForDisplay());
    window.location.hash = '#/admin';
  };

  const handleLogout = async () => {
    await auth.logout();
    setUser(null);
    window.location.hash = '#/';
  };

  const handleDeleteItem = async (itemId: string) => {
    const updatedItems = await db.deleteItem(itemId);
    setItems(updatedItems);
  };

  const handleDeletePost = async (postId: string) => {
    const updatedPosts = await db.deletePost(postId);
    setBlogPosts(updatedPosts);
  };

  const handleEditPost = (post: BlogPost) => {
    window.location.hash = `#/admin/blog/edit/${post.id}`;
  };

  const handleUpdatePostStatus = async (postId: string, status: BlogStatus) => {
    const posts = await db.getPosts();
    const postToUpdate = posts.find(p => p.id === postId);
    if (postToUpdate) {
      const updatedPost = { ...postToUpdate, status, updatedAt: new Date().toISOString() };
      const updatedPosts = await db.savePost(updatedPost);
      setBlogPosts(updatedPosts);
    }
  };

  const handleCreateUser = async (email: string, password: string, name: string, role: 'ADMIN' | 'USER') => {
    await auth.createUser(email, password, name, role);
    setAllUsers(auth.getUsersForDisplay());
  };

  const handleUpdateUser = async (userId: string, updates: { name?: string; email?: string; role?: 'ADMIN' | 'USER'; password?: string }) => {
    await auth.updateUser(userId, updates);
    setAllUsers(auth.getUsersForDisplay());
  };

  const handleDeleteUser = async (userId: string) => {
    await auth.deleteUser(userId);
    setAllUsers(auth.getUsersForDisplay());
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
    if ((page === 'BLOG_NEW' || page === 'BLOG_EDIT' || page === 'TOOL_NEW' || page === 'ADMIN') && !user) {
      window.location.hash = '#/login';
      return;
    }

    switch(page) {
        case 'HOME': window.location.hash = '#/'; break;
        case 'BLOG': window.location.hash = '#/blog'; break;
        case 'ADMIN': window.location.hash = '#/admin'; break;
        case 'LOGIN': window.location.hash = '#/login'; break;
        case 'BLOG_NEW': window.location.hash = '#/admin/blog/new'; break;
        case 'BLOG_EDIT': window.location.hash = '#/admin'; break;
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
      setEditingPost(null);
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

        {currentView === 'ADMIN' && user && (
            <AdminPanel 
                user={user} 
                items={items} 
                posts={blogPosts}
                users={allUsers}
                onNavigate={handleNavigate}
                onViewItem={handleViewItem}
                onViewPost={handleReadPost}
                onEditPost={handleEditPost}
                onDeleteItem={handleDeleteItem}
                onDeletePost={handleDeletePost}
                onUpdatePostStatus={handleUpdatePostStatus}
                onCreateUser={handleCreateUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
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
            posts={blogPosts.filter(p => (p.status || 'published') === 'published')} 
            onReadPost={handleReadPost}
          />
        )}

        {currentView === 'BLOG_NEW' && (
            <BlogEditor 
                onSave={handleSaveBlogPost}
                onCancel={() => handleNavigate('ADMIN')}
                allPosts={blogPosts}
            />
        )}

        {currentView === 'BLOG_EDIT' && editingPost && (
            <BlogEditor 
                onSave={handleSaveBlogPost}
                onCancel={() => handleNavigate('ADMIN')}
                existingPost={editingPost}
                allPosts={blogPosts}
            />
        )}

        {currentView === 'TOOL_NEW' && (
            <ToolGenerator
                onSave={handleSaveTool}
                onCancel={() => handleNavigate('ADMIN')}
            />
        )}

        {currentView === 'BLOG_DETAIL' && selectedPost && (
          <BlogPostView 
            post={selectedPost} 
            onBack={() => handleNavigate('BLOG')}
            relatedPosts={blogPosts}
            onReadPost={handleReadPost}
          />
        )}

      </main>

      <Footer />
      
      {currentView === 'ADMIN' && user && (
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
