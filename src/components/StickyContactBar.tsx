import React from 'react';
import { 
  Phone, 
  Sparkles, 
  MessageCircle,
  Truck,
  Bot
} from 'lucide-react';
import { DYNASTIE_INFO } from '../data/dynastieData';
import { Language } from '../types';

interface StickyContactBarProps {
  currentLang: Language;
  onOpenBooking: () => void;
  onOpenCallback: () => void;
  onOpenChat?: () => void;
}

export const StickyContactBar: React.FC<StickyContactBarProps> = ({
  currentLang,
  onOpenBooking,
  onOpenCallback,
  onOpenChat
}) => {
  const t = {
    fr: {
      callDirect: 'Direct Max',
      mobileService: 'Unité mobile à domicile • Drummondville et environs',
      bookQuote: 'Soumission en ligne',
      callBack: 'Rappel express',
      aiBot: 'Bot IA'
    },
    ua: {
      callDirect: 'Дзвінок: Макс',
      mobileService: 'Мобільний юніт додому • Drummondville',
      bookQuote: 'Замовити онлайн',
      callBack: 'Зворотній дзвінок',
      aiBot: 'AI Бот'
    },
    en: {
      callDirect: 'Call Max',
      mobileService: 'Mobile at-home unit • Drummondville & area',
      bookQuote: 'Instant Quote',
      callBack: 'Quick callback',
      aiBot: 'AI Bot'
    }
  }[currentLang];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D5EAD9] py-2.5 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Quick direct phone call */}
        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href={`tel:${DYNASTIE_INFO.phones[0].raw}`}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#F4FAF6] border border-[#D5EAD9] hover:border-[#16A34A] text-[#0D2818] text-xs font-mono transition-colors shadow-xs group"
          >
            <Phone className="w-3.5 h-3.5 text-[#16A34A] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-bold text-[#15803D]">Max:</span>
            <span className="font-bold">{DYNASTIE_INFO.phones[0].number}</span>
          </a>

          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#EAF6EE] border border-[#16A34A]/30 hover:border-[#16A34A] text-xs font-bold text-[#15803D] transition-colors cursor-pointer shadow-xs active:scale-95"
              title="Відкрити Gemini AI Бот"
            >
              <Bot className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="font-mono text-xs">{t.aiBot}</span>
            </button>
          )}
        </div>

        {/* Center: Mobile availability badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#15803D] font-medium">
          <Truck className="w-4 h-4 text-[#16A34A]" />
          <span>{t.mobileService}</span>
        </div>

        {/* Right: Action triggers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCallback}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F4FAF6] border border-[#D5EAD9] hover:border-[#16A34A] text-xs font-bold text-[#0D2818] transition-colors cursor-pointer shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>{t.callBack}</span>
          </button>

          <button
            type="button"
            onClick={onOpenBooking}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-[#16A34A]/25 flex items-center gap-2 transition-all cursor-pointer border border-[#16A34A]"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
            <span>{t.bookQuote}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
