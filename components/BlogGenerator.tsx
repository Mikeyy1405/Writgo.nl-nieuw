
import React, { useState } from 'react';
import { BlogPost } from '../types';
import { generateBlogPost } from '../services/claudeService';

interface BlogGeneratorProps {
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

export const BlogGenerator: React.FC<BlogGeneratorProps> = ({ onSave, onCancel }) => {
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keywords, setKeywords] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<BlogPost | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGeneratedPost(null);

    try {
      const post = await generateBlogPost({ topic, targetAudience, keywords });
      setGeneratedPost(post);
    } catch (error) {
      console.error(error);
      alert('Er ging iets mis bij het genereren. Probeer het opnieuw.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setGeneratedPost(null);
    setTopic('');
    setTargetAudience('');
    setKeywords('');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <button 
        onClick={onCancel}
        className="text-slate-400 hover:text-white mb-6 flex items-center transition-colors"
      >
        <i className="fas fa-arrow-left mr-2"></i> Terug naar Dashboard
      </button>

      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl">
        <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-accent-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                <i className="fas fa-feather-alt"></i>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white">AI Redactie Studio</h2>
                <p className="text-slate-400 text-sm">Genereer volwaardige, SEO-rijke artikelen.</p>
            </div>
        </div>

        {!generatedPost ? (
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Onderwerp van het artikel <span className="text-accent-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Bijv. 'Wat is SEO?' of 'De voordelen van een ochtendroutine'"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-all placeholder-slate-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Voor wie is dit? (Doelgroep)
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Bijv. 'Beginnende ondernemers'"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-all placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Belangrijkste zoekwoorden
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Bijv. 'SEO, Google, Zoekmachine'"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-all placeholder-slate-600"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2"></i>
                  Artikel wordt geschreven...
                </>
              ) : (
                <>
                  Genereer Volledig Artikel <i className="fas fa-wand-magic-sparkles ml-2"></i>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="animate-fade-in">
             <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center text-green-400 text-sm">
                <i className="fas fa-check-circle mr-2"></i> Conceptartikel is klaar! Controleer de inhoud hieronder.
             </div>

            <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-950/50 mb-8">
                <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                     <h3 className="text-3xl font-bold text-white mb-6">{generatedPost.title}</h3>
                     
                     {/* Render new structured content for preview */}
                     {generatedPost.keyTakeaways && (
                       <div className="bg-slate-800/50 rounded-lg p-4 my-6 border border-slate-700 text-sm">
                         <h4 className="font-bold text-white mb-2">In het kort:</h4>
                         <ul className="list-disc list-inside space-y-1 text-slate-300">
                           {generatedPost.keyTakeaways.map((t, i) => <li key={i}>{t}</li>)}
                         </ul>
                       </div>
                     )}

                     <div 
                        className="prose prose-invert max-w-none prose-headings:text-brand-100 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white"
                        dangerouslySetInnerHTML={{ __html: generatedPost.content }}
                    />

                    {generatedPost.faq && (
                       <div className="mt-8">
                         <h3 className="text-xl font-bold text-white mb-4">Veelgestelde Vragen</h3>
                         <div className="space-y-2 text-sm">
                           {generatedPost.faq.map((f, i) => (
                             <div key={i} className="border-t border-slate-700 pt-2">
                               <p className="font-semibold text-white">{f.question}</p>
                               <p className="text-slate-400">{f.answer}</p>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                </div>
            </div>

            <div className="flex space-x-4">
                <button
                    onClick={resetForm}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors"
                >
                    <i className="fas fa-undo mr-2"></i> Opnieuw
                </button>
                <button
                    onClick={() => onSave(generatedPost)}
                    className="flex-1 bg-gradient-to-r from-brand-600 to-accent-500 hover:from-brand-500 hover:to-accent-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20"
                >
                    Publiceren & Bekijken <i className="fas fa-arrow-right ml-2"></i>
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};