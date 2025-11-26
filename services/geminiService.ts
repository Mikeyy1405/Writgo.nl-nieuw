

// FIX: Corrected import path for Google GenAI SDK.
import { GoogleGenAI, Type } from "@google/genai";
import { GrowthItem, Category, ItemType, BlogPost, FAQItem } from "../types";

// Helper to create URL friendly slugs
const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// Helper to map string to enum loosely
const mapCategory = (cat: string): Category => {
  const normalized = cat.toLowerCase();
  if (normalized.includes('market') || normalized.includes('sale')) return Category.MARKETING;
  if (normalized.includes('bedrijf') || normalized.includes('busin') || normalized.includes('onderneem')) return Category.BUSINESS;
  if (normalized.includes('geld') || normalized.includes('finan') || normalized.includes('crypto')) return Category.FINANCE;
  if (normalized.includes('code') || normalized.includes('dev') || normalized.includes('prog') || normalized.includes('data')) return Category.DEVELOPMENT;
  if (normalized.includes('design') || normalized.includes('ontwerp') || normalized.includes('media')) return Category.DESIGN;
  if (normalized.includes('prod') || normalized.includes('plan')) return Category.PRODUCTIVITY;
  if (normalized.includes('gezond') || normalized.includes('health') || normalized.includes('life') || normalized.includes('sport')) return Category.LIFESTYLE;
  
  return Category.OTHER;
};

const mapType = (type: string): ItemType => {
  const normalized = type.toLowerCase();
  if (normalized.includes('cursus') || normalized.includes('course')) return ItemType.COURSE;
  if (normalized.includes('app') || normalized.includes('tool') || normalized.includes('soft')) return ItemType.APP;
  if (normalized.includes('boek') || normalized.includes('book')) return ItemType.BOOK;
  return ItemType.PLATFORM;
};

export const searchAiRecommendations = async (query: string): Promise<GrowthItem[]> => {
  if (!process.env.API_KEY) {
    console.warn("No API KEY found");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    Je bent de AI-assistent van Writgo Academy, de grootste vergelijker van online cursussen en software in Nederland.
    Je taak is om concrete, bestaande tools, cursussen of platforms aan te raden op basis van de zoekopdracht.
    
    Jouw bereik is breed:
    - Business & Marketing (SEO, Social, Startups)
    - Tech & Development (Coding, No-Code, AI)
    - Creatief (Design, Fotografie, Video)
    - Lifestyle (Sport, Voeding, Honden training, Hobby's)
    - Financiën (Beleggen, Crypto, Boekhouding)

    Geef alleen resultaten van hoge kwaliteit die relevant zijn voor de Nederlandse markt.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Zoekopdracht: "${query}". Geef me 4 tot 6 specifieke aanbevelingen.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              type: { type: Type.STRING },
              priceLabel: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              tags: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "description", "category", "type", "priceLabel", "rating", "tags"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");

    // Map raw data to application types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawData.map((item: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      slug: createSlug(item.title),
      title: item.title,
      description: item.description,
      category: mapCategory(item.category),
      type: mapType(item.type),
      priceLabel: item.priceLabel,
      rating: item.rating,
      imageUrl: `https://ui-avatars.com/api/?name=${item.title.replace(/ /g, '+')}&background=0f172a&color=3b82f6&size=400&font-size=0.33`, 
      affiliateLink: `https://www.google.com/search?q=${encodeURIComponent(item.title + ' ' + item.type)}`,
      tags: item.tags || [],
      isAiGenerated: true
    }));

  } catch (error) {
    console.error("Error fetching AI recommendations:", error);
    return [];
  }
};

interface BlogPostInput {
  topic: string;
  targetAudience: string;
  keywords: string;
}

export const generateBlogPost = async ({ topic, targetAudience, keywords }: BlogPostInput): Promise<BlogPost | null> => {
    if (!process.env.API_KEY) return null;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `
        Je bent Hoofdredacteur van Writgo Academy. Je schrijft een "volwaardig", diepgaand en SEO-geoptimaliseerd artikel.
        - De toon is deskundig, maar toegankelijk.
        - Gebruik de opgegeven keywords op een natuurlijke manier.
        - De content moet in het Nederlands zijn.
        
        STRUCTUUR:
        1. Schrijf een pakkende introductie.
        2. Verdeel de body in logische secties met <h2> en <h3> koppen.
        3. Formuleer 3-4 'Key Takeaways' die het artikel samenvatten.
        4. Bedenk en beantwoord 2-3 relevante vragen voor een FAQ-sectie aan het einde.

        HTML OPMAAK:
        - De 'content' moet valide HTML zijn, maar ZONDER <html>, <head> of <body> tags.
        - Gebruik: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <blockquote>.
        - **BELANGRIJK**: Gebruik een <table> voor vergelijkingen of data.
        - **BELANGRIJK**: Voeg 1-2 interne links toe naar andere relevante onderwerpen met het formaat <a href="#/blog/relevant-onderwerp">relevante tekst</a>.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "Een SEO-vriendelijke titel die de keywords bevat" },
            excerpt: { type: Type.STRING, description: "Pakkende inleiding (max 160 karakters)" },
            content: { type: Type.STRING, description: "De volledige artikel inhoud in HTML, inclusief H2/H3, lijsten, een tabel en interne links." },
            category: { type: Type.STRING, description: "Kies de meest relevante categorie: Marketing, Business, Development, Design, Lifestyle, Finance, Productivity" },
            readTime: { type: Type.STRING },
            author: { type: Type.STRING, description: "Gebruik 'Writgo Redactie' of een expert-naam" },
            keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Een lijst van 3-4 belangrijkste punten." },
            faq: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        answer: { type: Type.STRING }
                    }
                },
                description: "Een lijst van 2-3 veelgestelde vragen en antwoorden."
            }
        },
        required: ["title", "excerpt", "content", "category", "readTime", "author", "keyTakeaways", "faq"]
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Schrijf een diepgaand artikel.
            Onderwerp: "${topic}"
            Doelgroep: "${targetAudience}"
            Keywords: "${keywords}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema
            }
        });

        const data = JSON.parse(response.text || "{}");

        if (!data.title) throw new Error("Incomplete generation");

        return {
            id: `generated-${Date.now()}`,
            slug: createSlug(data.title),
            title: data.title,
            excerpt: data.excerpt,
            content: data.content,
            category: mapCategory(data.category),
            readTime: data.readTime,
            author: data.author,
            imageUrl: `https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80`, // Generic tech/data image
            date: new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }),
            keyTakeaways: data.keyTakeaways,
            faq: data.faq
        };

    } catch (error) {
        console.error("Blog generation failed:", error);
        return null;
    }
};

export const generateToolMetadata = async (url: string, rawText: string): Promise<GrowthItem | null> => {
    if (!process.env.API_KEY) return null;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `
        Je bent de Hoofdredacteur van Writgo.nl, dé autoriteit op het gebied van online cursussen en software reviews.
        Je ontvangt content van een landingspagina (cursus, software, tool, e-book).
        
        Genereer een ZEER UITGEBREIDE en PROFESSIONELE review pagina zoals de voorbeelden van Plug & Pay, Heijsen en The Huddle.
        Het moet lijken op een artikel van Tweakers, Frankwatching of The Verge - diepgaand, eerlijk en volledig.
        
        KRITIEKE VEREISTEN - Zorg ervoor dat ALLE velden volledig zijn ingevuld:
        
        1. executiveSummary: Schrijf een krachtige "Bottom Line" samenvatting van 3-4 zinnen die de essentie vat.
        
        2. reviewContent: Schrijf 5 unieke, diepgaande paragrafen van minimaal 100 woorden elk:
           - introduction: Introduceer het probleem dat deze tool/cursus oplost
           - featuresAnalysis: Diepgaande analyse van de belangrijkste functies en wat ze uniek maakt
           - easeOfUse: Hoe gebruiksvriendelijk is het? Voor wie is het geschikt?
           - supportQuality: Kwaliteit van support, documentatie en community
           - verdict: Eindoordeel en aanbeveling
        
        3. scores: Geef realistische scores (0-10) voor:
           - usability, priceValue, features, support
        
        4. pros en cons: Minimaal 3-4 concrete, specifieke voor- en nadelen
        
        5. features: Minimaal 4-5 belangrijke features of modules
        
        6. specifications: Minimaal 4-5 technische specs (Type, Taal, Platform, etc.)
        
        7. userTestimonials: Genereer 2-3 realistische gebruikers-reviews met naam, rol, rating en tekst
        
        8. pricingTiers: Als prijsinformatie beschikbaar is, geef 2-3 pakketten met features
        
        9. faq: Minimaal 3-4 veelgestelde vragen met uitgebreide antwoorden
        
        10. alternatives en alternativesAnalysis: Noem 2-3 concurrenten en schrijf een vergelijking van 100+ woorden
        
        11. bestFor: Minimaal 3 doelgroepen die perfect passen
        
        12. notFor: Minimaal 2 groepen voor wie dit niet geschikt is
        
        13. targetAudience: Minimaal 3 specifieke doelgroepen
        
        14. reviewAuthor: Genereer een passende expert met naam, rol en expertise samenvatting
        
        15. rating: Realistische beoordeling tussen 4.5 en 5.0 voor goede producten, lager voor mindere
        
        16. tags: Minimaal 4-5 relevante tags
        
        17. category: Kies uit: Marketing, Business, Development, Design, Lifestyle, Finance, Productivity
        
        18. type: Cursus, App/Tool, E-book, of Community/Platform
        
        BELANGRIJKE STIJLRICHTLIJNEN:
        - Schrijf in het Nederlands
        - Wees specifiek en concreet, geen vage algemene statements
        - Gebruik cijfers en feiten waar mogelijk
        - Schrijf alsof je een echte expert bent die het product kent
        - Maak het levendig en boeiend om te lezen
        
        Media:
        - videoUrl: Zoek naar YouTube embed URLs in de HTML
        - detectedImageUrls: Extract afbeelding URLs uit de broncode (img src, og:image)
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            seoDescription: { type: Type.STRING },
            category: { type: Type.STRING },
            type: { type: Type.STRING },
            priceLabel: { type: Type.STRING },
            rating: { type: Type.NUMBER },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            features: { type: Type.ARRAY, items: { type: Type.STRING } },
            executiveSummary: { type: Type.STRING },
            videoUrl: { type: Type.STRING },
            detectedImageUrls: { type: Type.ARRAY, items: { type: Type.STRING } },
            
            reviewContent: {
                type: Type.OBJECT,
                properties: {
                    introduction: { type: Type.STRING },
                    featuresAnalysis: { type: Type.STRING },
                    easeOfUse: { type: Type.STRING },
                    supportQuality: { type: Type.STRING },
                    verdict: { type: Type.STRING }
                }
            },
            specifications: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.STRING }
                    }
                }
            },
            alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
            alternativesAnalysis: { type: Type.STRING },
            bestFor: { type: Type.ARRAY, items: { type: Type.STRING } },
            notFor: { type: Type.ARRAY, items: { type: Type.STRING } },

            userTestimonials: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        role: { type: Type.STRING },
                        text: { type: Type.STRING },
                        rating: { type: Type.NUMBER }
                    }
                }
            },

            targetAudience: { type: Type.ARRAY, items: { type: Type.STRING } },
            faq: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        answer: { type: Type.STRING }
                    }
                } 
            },
            scores: {
                type: Type.OBJECT,
                properties: {
                    usability: { type: Type.NUMBER },
                    priceValue: { type: Type.NUMBER },
                    features: { type: Type.NUMBER },
                    support: { type: Type.NUMBER }
                }
            },
            pricingTiers: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        price: { type: Type.STRING },
                        features: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            },
            reviewAuthor: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    role: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    avatarUrl: { type: Type.STRING }
                }
            }
        },
        required: ["title", "description", "category", "type", "priceLabel", "rating", "tags", "pros", "cons", "reviewContent", "specifications", "targetAudience", "faq", "scores"]
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `URL: ${url}\n\nCONTENT:\n${rawText}`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema
            }
        });

        const data = JSON.parse(response.text || "{}");
        if (!data.title) throw new Error("Incomplete tool generation");

        if (data.reviewAuthor && !data.reviewAuthor.avatarUrl) {
            const safeName = data.reviewAuthor.name.replace(/ /g, '+');
            data.reviewAuthor.avatarUrl = `https://ui-avatars.com/api/?name=${safeName}&background=random&color=fff`;
        }

        if (data.userTestimonials) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.userTestimonials = data.userTestimonials.map((t: any) => ({
                ...t,
                avatarUrl: `https://ui-avatars.com/api/?name=${t.name.replace(/ /g, '+')}&background=random&color=fff`
            }));
        }

        let mainImageUrl = `https://ui-avatars.com/api/?name=${data.title.replace(/ /g, '+')}&background=0f172a&color=3b82f6&size=800&font-size=0.33`;
        let encodedUrl = '';

        const ogImageMatch = rawText.match(/<meta property="og:image" content="([^"]+)"/i) || rawText.match(/<meta name="twitter:image" content="([^"]+)"/i);
        
        if (ogImageMatch && ogImageMatch[1]) {
            mainImageUrl = ogImageMatch[1];
        } 
        else if (url) {
            try {
                encodedUrl = encodeURIComponent(url);
                mainImageUrl = `https://s0.wp.com/mshots/v1/${encodedUrl}?w=1280&h=800`;
            } catch (e) {
                console.warn("Could not generate screenshot URL", e);
            }
        } 
        else if (data.detectedImageUrls && data.detectedImageUrls.length > 0) {
            mainImageUrl = data.detectedImageUrls[0];
        }

        let gallery: string[] = [];
        
        if (data.detectedImageUrls && data.detectedImageUrls.length > 1) {
            gallery = data.detectedImageUrls.filter((img: string) => img !== mainImageUrl).slice(0, 4);
        }
        
        if (gallery.length === 0 && url && encodedUrl) {
            gallery = [
                `https://s0.wp.com/mshots/v1/${encodedUrl}?w=1280&h=900`, 
                `https://s0.wp.com/mshots/v1/${encodedUrl}?w=390&h=844`, 
                `https://s0.wp.com/mshots/v1/${encodedUrl}?w=768&h=1024` 
            ];
        }

        return {
            id: `custom-${Date.now()}`,
            slug: createSlug(data.title),
            title: data.title,
            description: data.description,
            seoDescription: data.seoDescription || data.description,
            category: mapCategory(data.category),
            type: mapType(data.type),
            priceLabel: data.priceLabel,
            rating: data.rating,
            imageUrl: mainImageUrl,
            galleryImages: gallery,
            affiliateLink: url || '#',
            tags: data.tags,
            isAiGenerated: false,
            pros: data.pros,
            cons: data.cons,
            features: data.features,
            reviewContent: data.reviewContent,
            reviewConclusion: data.reviewContent?.verdict,
            specifications: data.specifications,
            userTestimonials: data.userTestimonials,
            targetAudience: data.targetAudience,
            faq: data.faq,
            updatedAt: new Date().toLocaleDateString('nl-NL'),
            scores: data.scores,
            pricingTiers: data.pricingTiers,
            reviewAuthor: data.reviewAuthor,
            executiveSummary: data.executiveSummary,
            bestFor: data.bestFor,
            notFor: data.notFor,
            alternatives: data.alternatives,
            alternativesAnalysis: data.alternativesAnalysis,
            videoUrl: data.videoUrl
        };

    } catch (error) {
        console.error("Tool generation failed:", error);
        return null;
    }
};