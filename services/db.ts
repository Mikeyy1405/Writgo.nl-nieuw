

import { GrowthItem, BlogPost } from '../types';
import { STATIC_ITEMS, STATIC_BLOG_POSTS } from '../constants';

// Versiebeheer voor LocalStorage.
// Als we de constante data veranderen, hogen we dit op om de cache te overschrijven.
const DB_VERSION = '3.0';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper om te checken of data verouderd is
const checkVersion = () => {
    const currentVersion = localStorage.getItem('writgo_db_version');
    if (currentVersion !== DB_VERSION) {
        // Reset data als versie niet matcht
        localStorage.setItem('writgo_items', JSON.stringify(STATIC_ITEMS));
        localStorage.setItem('writgo_posts', JSON.stringify(STATIC_BLOG_POSTS));
        localStorage.setItem('writgo_db_version', DB_VERSION);
        return true; // Was reset
    }
    return false; // Was not reset
};

// --- ITEMS (Tools/Cursussen) ---

export const getItems = async (): Promise<GrowthItem[]> => {
  await delay(300);
  checkVersion(); // Ensure data is up to date
  const stored = localStorage.getItem('writgo_items');
  return stored ? JSON.parse(stored) : STATIC_ITEMS;
};

export const getItemById = async (id: string): Promise<GrowthItem | undefined> => {
  const items = await getItems();
  return items.find(i => i.id === id);
};

export const getItemBySlug = async (slug: string): Promise<GrowthItem | undefined> => {
  const items = await getItems();
  return items.find(i => i.slug === slug);
};

export const saveItem = async (item: GrowthItem): Promise<GrowthItem[]> => {
  await delay(600);
  const items = await getItems();
  const existingIndex = items.findIndex(i => i.id === item.id);
  
  let newItems: GrowthItem[];
  if (existingIndex >= 0) {
    // Update existing item
    newItems = [...items];
    newItems[existingIndex] = item;
  } else {
    // Add new item
    newItems = [item, ...items];
  }
  
  localStorage.setItem('writgo_items', JSON.stringify(newItems));
  return newItems;
};

export const deleteItem = async (itemId: string): Promise<GrowthItem[]> => {
  await delay(400);
  const items = await getItems();
  const filteredItems = items.filter(i => i.id !== itemId);
  localStorage.setItem('writgo_items', JSON.stringify(filteredItems));
  return filteredItems;
};

// --- BLOG POSTS ---

export const getPosts = async (): Promise<BlogPost[]> => {
  await delay(300);
  checkVersion();
  const stored = localStorage.getItem('writgo_posts');
  return stored ? JSON.parse(stored) : STATIC_BLOG_POSTS;
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  const posts = await getPosts();
  return posts.find(p => p.slug === slug);
};

export const savePost = async (post: BlogPost): Promise<BlogPost[]> => {
  await delay(600);
  const posts = await getPosts();
  const existingIndex = posts.findIndex(p => p.id === post.id);
  
  let newPosts: BlogPost[];
  if (existingIndex >= 0) {
    // Update existing post
    newPosts = [...posts];
    newPosts[existingIndex] = post;
  } else {
    // Add new post
    newPosts = [post, ...posts];
  }
  
  localStorage.setItem('writgo_posts', JSON.stringify(newPosts));
  return newPosts;
};

export const deletePost = async (postId: string): Promise<BlogPost[]> => {
  await delay(400);
  const posts = await getPosts();
  const filteredPosts = posts.filter(p => p.id !== postId);
  localStorage.setItem('writgo_posts', JSON.stringify(filteredPosts));
  return filteredPosts;
};

// --- RESET (Dev only) ---
export const resetDatabase = async () => {
    localStorage.removeItem('writgo_items');
    localStorage.removeItem('writgo_posts');
    localStorage.removeItem('writgo_db_version');
    return true;
};