import React from 'react';
import { 
  Phone, 
  Sparkles, 
  Calendar, 
  MessageCircle,
  Truck
} from 'lucide-react';
import { DYNASTIE_INFO } from '../data/dynastieData';
import { Language } from '../types';

interface StickyContactBarProps {
  currentLang: Language;
  onOpenBooking: () => void;
  onOpenCallback: () => void;
}

export const StickyContactBar: React.FC<StickyContactBarProps> = ({
  currentLang,
  onOpenBooking,
  onOpenCallback
}) => {
  const t = {
    fr: {
      callDirect: 'Direct Max',
      mobileService: 'Nous venons chez vous • Drummondville',
      bookQuote: 'Soumission en ligne'
    },
    ua: {
      callDirect: 'Дзвінок: Макс',
      mobileService: 'Виїзд додому • Drummondville',
      bookQuote: 'Замовити онлайн'
    },
    en: {
      callDirect: 'Call Max',
      mobileService: 'We come to your door • Drummondville',
      bookQuote: 'Get Instant Quote'
    }
  }[currentLang];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#080D0A]/95 backdrop-blur-md border-t border-[#1B3020] py-2.5 px-4 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Quick direct calls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href={`tel:${DYNASTIE_INFO.phones[0].raw}`}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#112115] border border-[#1E3A24] hover:border-[#22C55E] text-white text-xs font-mono transition-colors shadow-sm"
          >
            <Phone className="w-3.5 h-3.5 text-[#22C55E]" />
            <span className="hidden sm:inline font-bold">Max:</span>
            <span className="font-bold">{DYNASTIE_INFO.phones[0].number}</span>
          </a>
        </div>

        {/* Center: Mobile availability badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#86EFAC] font-medium">
          <Truck className="w-4 h-4 text-[#22C55E]" />
          <span>{t.mobileService}</span>
        </div>

        {/* Right: Action triggers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCallback}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#112115] border border-[#1E3A24] hover:border-[#22C55E] text-xs font-bold text-white transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Rappel express</span>
          </button>

          <button
            type="button"
            onClick={onOpenBooking}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#15803D] hover:brightness-110 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#16A34A]/25 flex items-center gap-2 transition-all cursor-pointer border border-[#86EFAC]/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>{t.bookQuote}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
