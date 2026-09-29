import React, { useState } from 'react';
import { 
  ChevronDown, 
  HelpCircle, 
  Phone, 
  Sparkles, 
  MessageSquare 
} from 'lucide-react';
import { FAQ_DETAILING, DYNASTIE_INFO } from '../data/dynastieData';
import { Language } from '../types';

interface FaqSectionProps {
  currentLang: Language;
  onOpenCallback: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  currentLang,
  onOpenCallback
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const t = {
    fr: {
      eyebrow: 'Foire Aux Questions',
      title: 'Questions Fréquentes',
      subtitle: 'Tout ce que vous devez savoir sur notre unité mobile autonome, nos produits écologiques et les tarifs.',
      moreQuestions: 'Vous avez une question spécifique sur vos meubles ou votre véhicule ?',
      callUs: 'Parler directement à Max'
    },
    ua: {
      eyebrow: 'Поширені Запитання',
      title: 'Часті Запитання та Відповіді',
      subtitle: 'Все про виїзд додому, безпеку засобів, час висихання та оплату.',
      moreQuestions: 'Маєте індивідуальне запитання щодо чистки чи розрахунку?',
      callUs: 'Прямий звʼязок із Максом'
    },
    en: {
      eyebrow: 'Frequently Asked Questions',
      title: 'Common Questions & Answers',
      subtitle: 'Everything you need to know about our mobile service, eco products and pricing.',
      moreQuestions: 'Have a specific question about your furniture or car?',
      callUs: 'Speak directly with Max'
    }
  }[currentLang];

  return (
    <section className="py-8 sm:py-12 bg-[#070B08] text-white relative border-b border-[#1A261D]">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header - Compact */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-[#22C55E] font-mono font-bold bg-[#112417] px-3 py-0.5 rounded-full border border-[#22C55E]/40">
            {t.eyebrow}
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight uppercase">
            {t.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#9CA3AF] font-normal leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Accordion list - Compact */}
        <div className="space-y-2">
          {FAQ_DETAILING.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="bg-[#0C150F] border border-[#1E3623] hover:border-[#22C55E]/60 rounded-lg overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span className="font-heading text-xs sm:text-sm font-bold text-white pr-2">
                    {item.question[currentLang]}
                  </span>
                  <div className={`w-6 h-6 rounded bg-[#142618] border border-[#223B27] flex items-center justify-center text-[#22C55E] shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 bg-[#22C55E] text-black font-black' : ''
                  }`}>
                    <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-[#9CA3AF] font-normal leading-relaxed border-t border-[#162719] animate-fade-in">
                    {item.answer[currentLang]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Help callout - Compact */}
        <div className="mt-6 p-4 rounded-xl bg-[#0C150F] border border-[#1E3623] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="text-xs font-bold text-white block">
              {t.moreQuestions}
            </span>
            <span className="text-xs font-mono text-[#86EFAC]">
              Max: {DYNASTIE_INFO.phones[0].number} (Appel & SMS)
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenCallback}
            className="px-4 py-2 rounded-lg bg-[#142618] hover:bg-[#1B3622] text-[#86EFAC] border border-[#22C55E]/40 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Phone className="w-3 h-3 text-[#22C55E]" />
            <span>{t.callUs}</span>
          </button>
        </div>

      </div>
    </section>
  );
};
