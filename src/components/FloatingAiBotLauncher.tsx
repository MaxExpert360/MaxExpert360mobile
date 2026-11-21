import React from 'react';
import { Sparkles, Bot } from 'lucide-react';
import { Language } from '../types';

interface FloatingAiBotLauncherProps {
  currentLang: Language;
  onOpenChat: () => void;
}

export const FloatingAiBotLauncher: React.FC<FloatingAiBotLauncherProps> = ({
  currentLang,
  onOpenChat
}) => {
  const label = {
    ua: 'AI Бот (Відеомонтаж & Чат)',
    fr: 'Bot IA (Montage & Conseils)',
    en: 'AI Bot (Video & Chat)'
  }[currentLang];

  return (
    <div className="fixed bottom-22 right-3 sm:bottom-20 sm:right-6 z-40 pointer-events-auto">
      <button
        type="button"
        onClick={onOpenChat}
        className="group relative flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:from-[#15803D] hover:to-[#0E5C2C] text-white shadow-xl shadow-[#16A34A]/30 border border-[#86EFAC]/40 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 animate-fade-in"
        title={label}
      >
        {/* Pulsing indicator */}
        <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-[#86EFAC]"></span>
        </span>

        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
          <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform" />
        </div>

        <span className="font-heading font-black text-xs uppercase tracking-wider hidden sm:inline">
          {label}
        </span>
        <span className="font-heading font-black text-[11px] uppercase tracking-wider sm:hidden">
          {currentLang === 'fr' ? 'Bot IA' : currentLang === 'ua' ? 'AI Бот' : 'AI Bot'}
        </span>

        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#86EFAC] group-hover:scale-125 transition-transform" />
      </button>
    </div>
  );
};
