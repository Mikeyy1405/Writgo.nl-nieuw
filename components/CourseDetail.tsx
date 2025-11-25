import React, { useEffect, useState } from 'react';
import { GrowthItem } from '../types';

interface CourseDetailProps {
  item: GrowthItem;
  onBack: () => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ item, onBack }) => {
  const [activeSection, setActiveSection] = useState('intro');

  // SEO: Update Document Title and Meta (Simulated)
  useEffect(() => {
    document.title = `${item.title} Review & Ervaringen - Writgo Media`;
    return () => {
        document.title = 'Writgo Media - Tools & Cursussen voor Groei';
    }
  }, [item]);

  // SEO: Structured Data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": item.title,
    "image": item.imageUrl,
    "description": item.seoDescription || item.description,
    "brand": {
      "@type": "Brand",
      "name": "Writgo Selection"
    },
    "review": {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": item.rating,
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": item.reviewAuthor?.name || "Writgo Redactie"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": item.rating,
      "reviewCount": "12" // Mock count
    }
  };

  const ScoreBar = ({ label, score }: { label: string, score: number }) => (
    <div className="mb-4 last:mb-0">
        <div className="flex justify-between text-xs uppercase font-bold text-slate-400 mb-1">
            <span>{label}</span>
            <span className="text-white">{score}/10</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
                className="bg-gradient-to-r from-brand-600 to-brand-400 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${score * 10}%` }}
            ></div>
        </div>
    </div>
  );

  const SectionHeading = ({ id, title }: { id: string, title: string }) => (
      <h2 id={id} className="text-2xl font-bold text-white mb-6 mt-12 scroll-mt-24 border-l-4 border-brand-500 pl-4">
          {title}
      </h2>
  );

  const TocLink = ({ id, label }: { id: string, label: string }) => (
      <a 
        href={`#${id}`} 
        className={`block text-sm py-2 px-4 border-l-2 transition-colors ${activeSection === id ? 'border-brand-500 text-brand-400 font-bold bg-brand-500/10' : 'border-slate-800 text-slate-500 hover:text-white hover:border-slate-600'}`}
        onClick={(e) => {
            e.preventDefault();
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
        }}
      >
          {label}
      </a>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Inject Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Nav Back */}
      <button 
        onClick={onBack}
        className="text-slate-400 hover:text-white mb-6 flex items-center transition-colors group"
      >
        <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
        Terug naar overzicht
      </button>

      {/* HERO HEADER - Magazine Style */}
      <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/20 to-accent-900/20 blur-3xl rounded-full opacity-30"></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              <img src={item.imageUrl} alt={item.title} className="w-32 h-32 md:w-48 md:h-48 rounded-2xl object-cover shadow-2xl border-2 border-slate-700/50" />
              <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                      <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{item.category}</span>
                      <span className="text-slate-500 text-sm font-medium">{item.type}</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">{item.title}</h1>
                  <p className="text-xl text-slate-400 max-w-2xl">{item.description}</p>
                  
                  {item.reviewAuthor && (
                      <div className="flex items-center mt-6 pt-6 border-t border-slate-800/50">
                          <img src={item.reviewAuthor.avatarUrl} className="w-10 h-10 rounded-full mr-3 border border-slate-700" alt={item.reviewAuthor.name} />
                          <div className="text-sm">
                              <span className="text-slate-500">Review door</span> <span className="text-white font-bold">{item.reviewAuthor.name}</span>
                              <span className="text-slate-600 mx-2">•</span>
                              <span className="text-slate-500">{item.updatedAt || 'Recent geüpdatet'}</span>
                          </div>
                      </div>
                  )}
              </div>
              <div className="hidden lg:block w-64 shrink-0 text-right">
                  <div className="inline-block bg-slate-900 rounded-2xl p-4 border border-slate-800 text-center shadow-lg">
                      <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">{item.rating}</div>
                      <div className="text-xs font-bold text-slate-500 uppercase mt-1">Writgo Score</div>
                      <div className="flex justify-center text-yellow-500 text-xs mt-2">
                          {[...Array(5)].map((_, i) => <i key={i} className={`fas fa-star ${i < Math.floor(item.rating) ? '' : 'opacity-30'}`}></i>)}
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        
        {/* LEFT COLUMN - Sticky TOC (Desktop only) */}
        <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-24">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Inhoud</div>
                <nav className="space-y-1 border-l border-slate-800">
                    <TocLink id="summary" label="Samenvatting" />
                    {item.videoUrl && <TocLink id="video" label="Video Review" />}
                    <TocLink id="features" label="Features" />
                    <TocLink id="proscons" label="Plus & Min" />
                    <TocLink id="pricing" label="Prijzen" />
                    <TocLink id="comparison" label="Vergelijking" />
                    <TocLink id="faq" label="FAQ" />
                    <TocLink id="verdict" label="Conclusie" />
                </nav>
            </div>
        </div>
        
        {/* CENTER COLUMN - Main Content */}
        <div className="lg:col-span-7 space-y-8">
            
            {/* EXECUTIVE SUMMARY BOX */}
            {item.executiveSummary && (
                <div id="summary" className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                        <i className="fas fa-bolt text-yellow-500 mr-2"></i> Key Takeaways
                    </h3>
                    <p className="text-slate-300 leading-relaxed font-medium">
                        {item.executiveSummary}
                    </p>
                </div>
            )}

            {/* VIDEO SECTION */}
            {item.videoUrl && (
                <div id="video">
                    <SectionHeading id="video_head" title="Video Impressie" />
                    <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black aspect-video relative group">
                        <iframe 
                            src={item.videoUrl} 
                            title="YouTube video player" 
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 flex justify-center">
                        <i className="fab fa-youtube mr-2 text-red-500"></i> Bekijk gerelateerde video
                    </div>
                </div>
            )}

            {/* MAIN REVIEW CONTENT */}
            {item.reviewContent && (
                <div className="prose prose-invert prose-lg max-w-none prose-p:text-slate-400 prose-headings:text-white prose-strong:text-white">
                    <SectionHeading id="intro" title="Introductie" />
                    <p>{item.reviewContent.introduction}</p>

                    {/* Gallery Grid */}
                    {item.galleryImages && item.galleryImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 my-8 not-prose">
                            {item.galleryImages.slice(0, 2).map((img, idx) => (
                                <img key={idx} src={img} className="rounded-xl border border-slate-800 shadow-lg w-full h-48 object-cover" alt="Screenshot" />
                            ))}
                        </div>
                    )}

                    <SectionHeading id="features" title="Diepte Analyse" />
                    <p>{item.reviewContent.featuresAnalysis}</p>
                    
                    <h3 className="text-white font-bold mt-8 mb-4">Gebruiksgemak</h3>
                    <p>{item.reviewContent.easeOfUse}</p>
                    
                    <h3 className="text-white font-bold mt-8 mb-4">Kwaliteit van Support</h3>
                    <p>{item.reviewContent.supportQuality}</p>
                </div>
            )}

            {/* PROS & CONS - Visual Redesign */}
            <div id="proscons" className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-700 rounded-2xl overflow-hidden">
                 <div className="bg-slate-900/80 p-8 border-b md:border-b-0 md:border-r border-slate-700">
                     <div className="flex items-center mb-6">
                         <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mr-3"><i className="fas fa-check"></i></div>
                         <h3 className="text-lg font-bold text-white">Sterke Punten</h3>
                     </div>
                     <ul className="space-y-4">
                        {item.pros?.map((pro, i) => (
                            <li key={i} className="flex items-start text-sm text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 mr-3 shrink-0"></span>
                                {pro}
                            </li>
                        ))}
                     </ul>
                 </div>
                 <div className="bg-slate-900/80 p-8">
                     <div className="flex items-center mb-6">
                         <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mr-3"><i className="fas fa-times"></i></div>
                         <h3 className="text-lg font-bold text-white">Aandachtspunten</h3>
                     </div>
                     <ul className="space-y-4">
                        {item.cons?.map((con, i) => (
                            <li key={i} className="flex items-start text-sm text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 mr-3 shrink-0"></span>
                                {con}
                            </li>
                        ))}
                     </ul>
                 </div>
            </div>

            {/* BUYING ADVICE */}
            {(item.bestFor || item.notFor) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {item.bestFor && (
                        <div className="bg-slate-900 rounded-xl p-6 border-l-4 border-brand-500">
                            <div className="text-brand-400 font-bold text-sm uppercase mb-3">Koop dit als...</div>
                            <ul className="space-y-2">
                                {item.bestFor.map((t, i) => <li key={i} className="text-sm text-slate-300 flex items-center"><i className="fas fa-check mr-2 text-brand-500 text-xs"></i> {t}</li>)}
                            </ul>
                        </div>
                    )}
                    {item.notFor && (
                        <div className="bg-slate-900 rounded-xl p-6 border-l-4 border-slate-600">
                             <div className="text-slate-400 font-bold text-sm uppercase mb-3">Kijk verder als...</div>
                             <ul className="space-y-2">
                                {item.notFor.map((t, i) => <li key={i} className="text-sm text-slate-300 flex items-center"><i className="fas fa-arrow-right mr-2 text-slate-500 text-xs"></i> {t}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* COMPARISON */}
            {item.alternativesAnalysis && (
                <div id="comparison">
                    <SectionHeading id="comp" title="Concurrentie Analyse" />
                    <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
                        <p className="text-slate-300 leading-relaxed mb-6">
                            {item.alternativesAnalysis}
                        </p>
                        {item.alternatives && (
                            <div className="text-sm">
                                <span className="text-slate-500 font-bold mr-2">Belangrijkste alternatieven:</span>
                                {item.alternatives.map((alt, i) => (
                                    <span key={i} className="inline-block bg-slate-800 text-slate-300 px-2 py-1 rounded mr-2 mb-2 border border-slate-700">{alt}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* PRICING */}
            {item.pricingTiers && (
                <div id="pricing">
                    <SectionHeading id="price" title="Kosten & Pakketten" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {item.pricingTiers.map((tier, idx) => (
                            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <div className="text-slate-500 font-bold text-xs uppercase">{tier.name}</div>
                                <div className="text-2xl font-bold text-white my-2">{tier.price}</div>
                                <ul className="space-y-2 text-xs text-slate-400">
                                    {tier.features.map((f, i) => <li key={i} className="flex items-start"><i className="fas fa-check text-slate-600 mr-2"></i> {f}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FAQ */}
             {item.faq && (
                <div id="faq">
                    <SectionHeading id="faq_head" title="Veelgestelde Vragen" />
                    <div className="space-y-4">
                        {item.faq.map((q, idx) => (
                            <div key={idx} className="border-b border-slate-800 pb-4 last:border-0">
                                <h4 className="text-white font-semibold mb-2">{q.question}</h4>
                                <p className="text-slate-400 text-sm">{q.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* VERDICT BOX */}
            <div id="verdict" className="mt-12 bg-gradient-to-br from-brand-900/40 to-slate-900 border border-brand-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-500/20 blur-[100px] rounded-full"></div>
                
                <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-950 rounded-full border-4 border-brand-500 flex flex-col items-center justify-center shrink-0 shadow-2xl shadow-brand-500/20">
                        <span className="text-4xl md:text-5xl font-extrabold text-white">{item.rating}</span>
                        <span className="text-xs font-bold text-brand-500 uppercase mt-1">Excellent</span>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ons Eindoordeel</h2>
                        <p className="text-lg text-slate-300 italic mb-6">
                            "{item.reviewContent?.verdict || item.reviewConclusion}"
                        </p>
                        <a 
                            href={item.affiliateLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-brand-500/30 transition-all transform hover:scale-105"
                        >
                            Bekijk aanbod <i className="fas fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                </div>
            </div>

        </div>

        {/* RIGHT COLUMN - Sticky Sidebar */}
        <div className="lg:col-span-3 space-y-6">
             <div className="sticky top-24">
                 {/* CTA Card */}
                 <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl mb-6">
                    <div className="text-center mb-6">
                        <div className="text-slate-500 text-xs font-bold uppercase mb-2">Beste Deal</div>
                        <div className="text-3xl font-bold text-white">{item.priceLabel}</div>
                    </div>
                    <a 
                        href={item.affiliateLink}
                        target="_blank"
                        className="block w-full bg-accent-600 hover:bg-accent-500 text-white font-bold py-3 rounded-xl text-center transition-all shadow-lg shadow-accent-500/20 mb-4"
                    >
                        Ga naar Website
                    </a>
                    <div className="text-center text-[10px] text-slate-600">
                        Link opent in nieuw venster
                    </div>
                 </div>

                 {/* Specifications */}
                 {item.specifications && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                        <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Specs</h4>
                        <ul className="space-y-3">
                             {item.specifications.map((spec, idx) => (
                                <li key={idx} className="flex justify-between text-xs">
                                   <span className="text-slate-500">{spec.label}</span>
                                   <span className="text-slate-300 font-medium text-right ml-2">{spec.value}</span>
                                </li>
                             ))}
                        </ul>
                    </div>
                 )}

                 {/* Scores */}
                 {item.scores && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                        <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Scorekaart</h4>
                        <ScoreBar label="Gebruik" score={item.scores.usability} />
                        <ScoreBar label="Features" score={item.scores.features} />
                        <ScoreBar label="Support" score={item.scores.support} />
                        <ScoreBar label="Prijs" score={item.scores.priceValue} />
                    </div>
                 )}
             </div>
        </div>

      </div>
    </div>
  );
};