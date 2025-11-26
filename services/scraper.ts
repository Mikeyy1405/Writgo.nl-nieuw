/**
 * Scraper Service
 * Handles URL fetching and content extraction with CORS proxy support
 */

export interface ScrapedContent {
  html: string;
  text: string;
  title?: string;
  metaDescription?: string;
  images?: string[];
}

/**
 * Maximum size for extracted text content
 */
const MAX_TEXT_SIZE = 50000;

/**
 * CORS proxies to try in order of preference
 * WARNING: Using third-party CORS proxies has security and reliability implications.
 * These services can log requests, go offline, or potentially inject content.
 * For production use, consider implementing server-side scraping.
 */
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

/**
 * Extracts text content from HTML
 */
const extractTextFromHTML = (html: string): string => {
  // Create a temporary DOM element to parse HTML
  const doc = new DOMParser().parseFromString(html, 'text/html');
  
  // Remove script and style tags
  const scripts = doc.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());
  
  // Get text content
  return doc.body.textContent || doc.body.innerText || '';
};

/**
 * Extracts metadata from HTML
 */
const extractMetadata = (html: string): { title?: string; description?: string; images: string[] } => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  
  // Extract title
  const titleEl = doc.querySelector('title');
  const ogTitle = doc.querySelector('meta[property="og:title"]');
  const title = ogTitle?.getAttribute('content') || titleEl?.textContent || undefined;
  
  // Extract description
  const metaDesc = doc.querySelector('meta[name="description"]');
  const ogDesc = doc.querySelector('meta[property="og:description"]');
  const description = ogDesc?.getAttribute('content') || metaDesc?.getAttribute('content') || undefined;
  
  // Extract images
  const images: string[] = [];
  const ogImage = doc.querySelector('meta[property="og:image"]');
  const twitterImage = doc.querySelector('meta[name="twitter:image"]');
  
  const ogImageContent = ogImage?.getAttribute('content');
  if (ogImageContent) {
    images.push(ogImageContent);
  }
  
  const twitterImgContent = twitterImage?.getAttribute('content');
  if (twitterImgContent && !images.includes(twitterImgContent)) {
    images.push(twitterImgContent);
  }
  
  // Get regular img tags (limit to first 5)
  const imgElements = doc.querySelectorAll('img[src]');
  imgElements.forEach((img, idx) => {
    if (idx < 5) {
      const src = img.getAttribute('src');
      if (src && !images.includes(src) && (src.startsWith('http') || src.startsWith('//'))) {
        images.push(src);
      }
    }
  });
  
  return { title, description, images };
};

/**
 * Attempts to fetch URL content with CORS proxy fallback
 */
export const scrapeURL = async (url: string): Promise<ScrapedContent> => {
  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error('Ongeldige URL. Zorg ervoor dat de URL begint met http:// of https://');
  }
  
  let lastError: Error | null = null;
  
  // Try direct fetch first (will work if CORS is enabled)
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      },
    });
    
    if (response.ok) {
      const html = await response.text();
      const text = extractTextFromHTML(html);
      const metadata = extractMetadata(html);
      
      return {
        html,
        text: text.substring(0, MAX_TEXT_SIZE),
        title: metadata.title,
        metaDescription: metadata.description,
        images: metadata.images,
      };
    }
  } catch (error) {
    lastError = error as Error;
    console.warn('Direct fetch failed, trying CORS proxies...', error);
  }
  
  // Try CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyURL = `${proxy}${encodeURIComponent(url)}`;
      const response = await fetch(proxyURL, {
        method: 'GET',
      });
      
      if (response.ok) {
        const html = await response.text();
        const text = extractTextFromHTML(html);
        const metadata = extractMetadata(html);
        
        return {
          html,
          text: text.substring(0, MAX_TEXT_SIZE),
          title: metadata.title,
          metaDescription: metadata.description,
          images: metadata.images,
        };
      }
    } catch (error) {
      lastError = error as Error;
      console.warn(`Proxy ${proxy} failed:`, error);
      continue;
    }
  }
  
  // All methods failed
  throw new Error(
    `Kan de pagina niet ophalen. Mogelijke oorzaken:\n` +
    `- De website blokkeert geautomatiseerde toegang\n` +
    `- CORS-problemen\n` +
    `- Netwerk problemen\n\n` +
    `Gebruik de handmatige methode door de pagina-inhoud te kopiëren en plakken.`
  );
};
