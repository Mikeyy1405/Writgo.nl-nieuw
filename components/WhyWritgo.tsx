
import React from 'react';

export const WhyWritgo: React.FC = () => {
    const features = [
        {
            icon: 'fas fa-balance-scale',
            title: '100% Onafhankelijke Reviews',
            description: 'Onze experts testen en analyseren elke cursus en tool grondig, zodat jij een eerlijk en gebalanceerd oordeel krijgt.'
        },
        {
            icon: 'fas fa-search-plus',
            title: 'Diepgaande Analyse',
            description: 'We kijken verder dan de marketingpraat. Verwacht gedetailleerde analyses van features, prijzen en de kleine lettertjes.'
        },
        {
            icon: 'fas fa-layer-group',
            title: 'Alles op Één Plek',
            description: 'Stop met eindeloos Googlen. Van marketing tot mindfulness, je vindt de beste educatieve content hier, overzichtelijk gerangschikt.'
        }
    ];

    return (
        <div className="bg-slate-900 py-20 my-16 border-y border-slate-800">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Waarom kiezen voor Writgo Academy?</h2>
                    <p className="text-slate-400">
                        In een wereld vol online cursussen en software is het moeilijk kiezen. Wij maken het simpel.
                        Writgo is jouw gids naar de beste tools en kennis om te groeien.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                         <div key={index} className="text-center p-8 rounded-2xl bg-slate-800/50 border border-slate-800 hover:border-brand-500/30 transition-colors transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-brand-500 text-2xl border border-slate-700">
                                <i className={feature.icon}></i>
                            </div>
                            <h3 className="font-bold text-lg text-white mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
