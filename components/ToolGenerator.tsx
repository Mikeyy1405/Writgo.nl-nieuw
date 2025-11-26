
import React, { useState } from 'react';
import { GrowthItem } from '../types';
import { generateToolMetadata } from '../services/geminiService';
import { scrapeURL } from '../services/scraper';

interface ToolGeneratorProps {
  onSave: (item: GrowthItem) => void;
  onCancel: () => void;
}

type ProcessingStep = 'idle' | 'scraping' | 'analyzing' | 'complete';

export const ToolGenerator: React.FC<ToolGeneratorProps> = ({ onSave, onCancel }) => {
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItem, setGeneratedItem] = useState<GrowthItem | null>(null);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);

  const handleAutomaticGenerate = async () => {
    if (!url.trim()) {
      setError('Vul eerst een URL in');
      return;
    }

    setIsGenerating(true);
    setGeneratedItem(null);
    setError(null);
    setProcessingStep('scraping');

    try {
      // Step 1: Scrape the URL
      const scrapedContent = await scrapeURL(url);
      
      // Step 2: Analyze with AI
      setProcessingStep('analyzing');
      const item = await generateToolMetadata(url, scrapedContent.html || scrapedContent.text);
      
      // Step 3: Complete
      setProcessingStep('complete');
      setGeneratedItem(item);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Er ging iets mis bij het ophalen van de pagina.';
      setError(errorMessage);
      setShowManualInput(true);
    } finally {
      setIsGenerating(false);
      setProcessingStep('idle');
    }
  };

  const handleManualGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setIsGenerating(true);
    setGeneratedItem(null);
    setError(null);
    setProcessingStep('analyzing');

    try {
      const item = await generateToolMetadata(url, rawText);
      setProcessingStep('complete');
      setGeneratedItem(item);
    } catch (error) {
      console.error(error);
      setError('Kon de gegevens niet analyseren. Probeer meer tekst toe te voegen.');
    } finally {
      setIsGenerating(false);
      setProcessingStep('idle');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <button 
        onClick={onCancel}
        className="text-slate-400 hover:text-white mb-6 flex items-center transition-colors"
      >
        <i className="fas fa-arrow-left mr-2"></i> Annuleren
      </button>

      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-accent-500/10 rounded-full blur-[80px]"></div>
        
        <div className="flex items-center space-x-4 mb-8 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-brand-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                <i className="fas fa-plus"></i>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white">Nieuwe Cursus/Tool Toevoegen</h2>
                <p className="text-slate-400 text-sm">Laat AI jouw landingspagina scannen en automatisch toevoegen.</p>
            </div>
        </div>

        {!generatedItem ? (
          <div className="relative z-10 space-y-6">
            {/* URL Input - Always visible */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Link naar de cursus/tool <span className="text-accent-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Vul de URL in en klik op "Automatisch Genereren" om de pagina automatisch te laten scannen.
              </p>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                placeholder="https://www.jouwwebsite.nl/cursus"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-all placeholder-slate-600"
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                <i className="fas fa-exclamation-circle mr-2"></i>
                <strong>Fout:</strong> {error}
              </div>
            )}

            {/* Processing Steps Indicator */}
            {isGenerating && (
              <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-6">
                <div className="space-y-4">
                  <div className={`flex items-center ${processingStep === 'scraping' ? 'text-brand-400' : processingStep === 'idle' ? 'text-slate-600' : 'text-green-400'}`}>
                    {processingStep === 'scraping' ? (
                      <i className="fas fa-circle-notch fa-spin mr-3 text-xl"></i>
                    ) : processingStep === 'idle' ? (
                      <i className="fas fa-circle mr-3"></i>
                    ) : (
                      <i className="fas fa-check-circle mr-3 text-xl"></i>
                    )}
                    <span className="font-medium">Pagina ophalen...</span>
                  </div>
                  <div className={`flex items-center ${processingStep === 'analyzing' ? 'text-brand-400' : processingStep === 'complete' ? 'text-green-400' : 'text-slate-600'}`}>
                    {processingStep === 'analyzing' ? (
                      <i className="fas fa-circle-notch fa-spin mr-3 text-xl"></i>
                    ) : processingStep === 'complete' ? (
                      <i className="fas fa-check-circle mr-3 text-xl"></i>
                    ) : (
                      <i className="fas fa-circle mr-3"></i>
                    )}
                    <span className="font-medium">Content analyseren met AI...</span>
                  </div>
                  <div className={`flex items-center ${processingStep === 'complete' ? 'text-green-400' : 'text-slate-600'}`}>
                    {processingStep === 'complete' ? (
                      <i className="fas fa-check-circle mr-3 text-xl"></i>
                    ) : (
                      <i className="fas fa-circle mr-3"></i>
                    )}
                    <span className="font-medium">Review genereren...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Input Section - Only shown on error or by choice */}
            {showManualInput && (
              <form onSubmit={handleManualGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Plak de inhoud van de pagina <span className="text-accent-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    <strong className="text-white">Tip:</strong> Voor het beste resultaat met echte afbeeldingen: klik rechts op de website, kies "Paginabron weergeven" (View Source), selecteer alles (Ctrl+A) en plak de HTML hier. 
                    <br/>Of plak gewoon de leestekst (Ctrl+A, Ctrl+C op de site).
                  </p>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Plak hier de tekst of HTML source..."
                    className="w-full h-48 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-all placeholder-slate-600 font-mono text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !rawText.trim()}
                  className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin mr-2"></i>
                      Analyseren & Structureren...
                    </>
                  ) : (
                    <>
                      Verwerk Handmatig met AI <i className="fas fa-microchip ml-2"></i>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Main action buttons */}
            {!showManualInput && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAutomaticGenerate}
                  disabled={isGenerating || !url.trim()}
                  className="w-full bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-accent-500/20 flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin mr-2"></i>
                      Bezig met genereren...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>
                      Automatisch Genereren
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowManualInput(true)}
                  disabled={isGenerating}
                  className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-medium py-3 rounded-xl transition-all flex items-center justify-center text-sm"
                >
                  <i className="fas fa-keyboard mr-2"></i>
                  Of plak content handmatig
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in relative z-10">
             <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 mb-6 flex items-center text-brand-400 text-sm">
                <i className="fas fa-check-circle mr-2"></i> AI heeft je content succesvol gestructureerd!
             </div>

            <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Preview Card */}
                <div className="w-full md:w-1/2">
                    <h3 className="text-slate-400 text-xs uppercase font-bold mb-4">Preview op site:</h3>
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl h-full flex flex-col">
                        <div className="relative h-48 bg-slate-800">
                             <img src={generatedItem.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                             <div className="absolute top-2 right-2 bg-slate-900/90 text-brand-400 text-xs font-bold px-2 py-1 rounded">Preview</div>
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                             <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold text-accent-500 uppercase">{generatedItem.category}</span>
                                <div className="text-yellow-500 text-xs font-bold"><i className="fas fa-star mr-1"></i>{generatedItem.rating}</div>
                             </div>
                             <h3 className="text-lg font-bold text-white mb-2">{generatedItem.title}</h3>
                             <p className="text-slate-400 text-sm mb-4 line-clamp-3">{generatedItem.description}</p>
                             <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between">
                                <span className="font-bold text-slate-200 text-sm">{generatedItem.priceLabel}</span>
                                <span className="text-brand-400 text-sm font-semibold">Bekijk aanbod <i className="fas fa-arrow-right"></i></span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Data Confirmation */}
                <div className="w-full md:w-1/2 flex flex-col space-y-4">
                    <h3 className="text-slate-400 text-xs uppercase font-bold">Gedetecteerde Gegevens:</h3>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Titel:</span> <span className="text-white text-right">{generatedItem.title}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Type:</span> <span className="text-white text-right">{generatedItem.type}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Prijs:</span> <span className="text-white text-right">{generatedItem.priceLabel}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Tags:</span> <span className="text-white text-right">{generatedItem.tags.join(', ')}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Link:</span> <span className="text-brand-400 text-right truncate max-w-[200px]">{generatedItem.affiliateLink}</span></div>
                    </div>
                    
                    <div className="mt-auto pt-4 flex space-x-4">
                        <button
                            onClick={() => setGeneratedItem(null)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors"
                        >
                            Aanpassen
                        </button>
                        <button
                            onClick={() => onSave(generatedItem)}
                            className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-accent-500/20"
                        >
                            Opslaan & Publiceren
                        </button>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
