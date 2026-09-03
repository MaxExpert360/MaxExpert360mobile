import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Menu, 
  X, 
  Sparkles, 
  Truck, 
  Globe,
  ChevronDown,
  Facebook,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Star,
  Edit3
} from 'lucide-react';
import { DYNASTIE_INFO } from '../data/dynastieData';
import { Language } from '../types';
import { MaxLogo } from './MaxLogo';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenBooking: () => void;
  onOpenCallback: () => void;
  onOpenWriteReview?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  onOpenBooking,
  onOpenCallback,
  onOpenWriteReview
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const t = {
    fr: {
      slogan: 'NOUS VENONS CHEZ VOUS ! SERVICE MOBILE À DOMICILE',
      forfaits: 'Auto',
      furniture: 'Sofas',
      rugsMattress: 'Tapis',
      commercial: 'Camions',
      calculator: 'Calculateur',
      reviews: 'Avis',
      contact: 'Contact',
      mobileUnit: 'Service Mobile à Domicile',
      cityRegion: 'Drummondville & environs',
      callMax: 'Max',
      instantQuote: 'Réserver / Soumission',
      quickCall: 'Appel Rapide',
      ecoProducts: 'Produits 100% Écologiques'
    },
    ua: {
      slogan: 'МИ ПРИЇЖДЖАЄМО ДО ВАС ! МОБІЛЬНИЙ СЕРВІС',
      forfaits: 'Авто',
      furniture: 'Дивани',
      rugsMattress: 'Килими',
      commercial: 'Вантажівки',
      calculator: 'Калькулятор',
      reviews: 'Відгуки',
      contact: 'Контакти',
      mobileUnit: 'Мобільний виїзд додому',
      cityRegion: 'Драммондвіль та регіон',
      callMax: 'Макс',
      instantQuote: 'Забронювати / Розрахунок',
      quickCall: 'Швидкий Дзвінок',
      ecoProducts: 'Екологічні засоби'
    },
    en: {
      slogan: 'WE COME TO YOU ! MOBILE AT-HOME SERVICE',
      forfaits: 'Auto',
      furniture: 'Sofas',
      rugsMattress: 'Carpets',
      commercial: 'Trucks',
      calculator: 'Calculator',
      reviews: 'Reviews',
      contact: 'Contact',
      mobileUnit: 'Mobile At-Home Service',
      cityRegion: 'Drummondville & area',
      callMax: 'Max',
      instantQuote: 'Book Online / Quote',
      quickCall: 'Quick Call',
      ecoProducts: '100% Eco-Friendly'
    }
  }[currentLang];

  return (
    <header className="sticky top-0 z-40 bg-[#0A0E0B]/95 backdrop-blur-md border-b border-[#1A261E] text-white">
      {/* Top Banner matching flyer's green header bar */}
      <div className="bg-gradient-to-r from-[#0D2818] via-[#166534] to-[#0D2818] text-white py-1.5 px-4 text-xs font-semibold border-b border-[#22C55E]/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto scrollbar-none py-0.5">
            <span className="flex items-center gap-1.5 text-[#86EFAC] font-bold shrink-0">
              <Truck className="w-4 h-4 text-[#4ADE80] animate-pulse" />
              <span className="uppercase tracking-wider">{t.slogan}</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-white/90 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>{DYNASTIE_INFO.region}</span>
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-[#BBF7D0] shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>{t.ecoProducts}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0 pl-2">
            {/* Top Bar Rating & Reviews Link */}
            <div className="hidden sm:flex items-center gap-2 bg-black/30 px-2.5 py-0.5 rounded border border-white/20">
              <a
                href="#reviews"
                className="flex items-center gap-1 text-[11px] text-[#FDE047] hover:text-white font-bold transition-colors"
                title={currentLang === 'fr' ? 'Consulter les avis clients' : currentLang === 'ua' ? 'Переглянути відгуки' : 'Read client reviews'}
              >
                <Star className="w-3 h-3 fill-[#FDE047] text-[#FDE047]" />
                <span>5.0</span>
                <span className="text-[#BBF7D0] font-normal text-[10px]">
                  ({currentLang === 'fr' ? '28 avis' : currentLang === 'ua' ? '28 відгуків' : '28 reviews'})
                </span>
              </a>
              {onOpenWriteReview && (
                <button
                  type="button"
                  onClick={onOpenWriteReview}
                  className="text-[10px] bg-[#22C55E]/20 hover:bg-[#22C55E] text-[#86EFAC] hover:text-black px-2 py-0.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1 border border-[#22C55E]/40"
                >
                  <Edit3 className="w-2.5 h-2.5" />
                  <span>{currentLang === 'fr' ? 'Écrire' : currentLang === 'ua' ? 'Відгук' : 'Write'}</span>
                </button>
              )}
            </div>

            <a 
              href={DYNASTIE_INFO.facebookUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-[11px] font-medium transition-colors"
            >
              <Facebook className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>{DYNASTIE_INFO.facebook}</span>
            </a>

            <a 
              href={`tel:${DYNASTIE_INFO.phones[0].raw}`}
              className="text-white hover:text-[#BBF7D0] font-mono font-bold text-xs flex items-center gap-1.5 bg-black/30 px-2.5 py-0.5 rounded border border-white/20"
            >
              <Phone className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>{DYNASTIE_INFO.phones[0].number}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#" className="flex items-center group">
          <MaxLogo size="md" />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-[#D1D5DB]">
          <a href="#forfaits" className="hover:text-[#22C55E] transition-colors">
            {t.forfaits}
          </a>
          <a href="#residential" className="hover:text-[#22C55E] transition-colors">
            {t.furniture}
          </a>
          <a href="#tapis-matelas" className="hover:text-[#22C55E] transition-colors">
            {t.rugsMattress}
          </a>
          <a href="#commercial" className="hover:text-[#22C55E] transition-colors">
            {t.commercial}
          </a>
          <a href="#calculator" className="hover:text-[#22C55E] transition-colors flex items-center gap-1.5 bg-[#142318] px-2.5 py-1 rounded-md border border-[#22C55E]/30 text-[#86EFAC]">
            <Sparkles className="w-3 h-3 text-[#22C55E]" />
            <span>{t.calculator}</span>
          </a>
          <a href="#reviews" className="hover:text-[#22C55E] transition-colors flex items-center gap-1">
            <span>⭐</span>
            <span>{t.reviews}</span>
          </a>
          <a href="#contact" className="hover:text-[#22C55E] transition-colors">
            {t.contact}
          </a>
        </nav>

        {/* Action Controls & Language Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Facebook Link Button */}
          <a
            id="header-facebook-button"
            href={DYNASTIE_INFO.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md border border-[#223326] bg-[#111A13] text-xs font-semibold text-[#D1D5DB] hover:text-white hover:border-[#22C55E] hover:bg-[#162719] transition-all shadow-sm group"
            title="MaxExpert360 Mobile Facebook"
            aria-label="Facebook MaxExpert360 Mobile"
          >
            <Facebook className="w-3.5 h-3.5 text-[#22C55E] group-hover:scale-110 transition-transform shrink-0" />
            <span className="hidden sm:inline font-medium">Facebook</span>
          </a>

          {/* Language Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#223326] bg-[#111A13] text-xs font-mono text-[#D1D5DB] hover:border-[#22C55E]/60 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#22C55E]" />
              <span className="uppercase font-bold">{currentLang}</span>
              <ChevronDown className="w-3 h-3 text-[#777]" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#121B14] border border-[#223826] rounded-lg shadow-2xl py-1 z-50 animate-fade-in">
                <button
                  onClick={() => { onLanguageChange('fr'); setLangDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    currentLang === 'fr' ? 'text-[#22C55E] bg-[#1A2E1E] font-bold' : 'text-[#BBB] hover:bg-[#1A2E1E]'
                  }`}
                >
                  <span>Français</span>
                  <span className="font-mono text-[10px] text-[#888]">FR</span>
                </button>
                <button
                  onClick={() => { onLanguageChange('ua'); setLangDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    currentLang === 'ua' ? 'text-[#22C55E] bg-[#1A2E1E] font-bold' : 'text-[#BBB] hover:bg-[#1A2E1E]'
                  }`}
                >
                  <span>Українська</span>
                  <span className="font-mono text-[10px] text-[#888]">UA</span>
                </button>
                <button
                  onClick={() => { onLanguageChange('en'); setLangDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    currentLang === 'en' ? 'text-[#22C55E] bg-[#1A2E1E] font-bold' : 'text-[#BBB] hover:bg-[#1A2E1E]'
                  }`}
                >
                  <span>English</span>
                  <span className="font-mono text-[10px] text-[#888]">EN</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Call button */}
          <button
            type="button"
            onClick={onOpenCallback}
            className="hidden md:flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-[#233828] bg-[#101A12] text-xs font-semibold text-white hover:border-[#22C55E] transition-all cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>{t.quickCall}</span>
          </button>

          {/* Online Estimate Booking Button */}
          <button
            type="button"
            onClick={onOpenBooking}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#15803D] hover:brightness-110 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#16A34A]/30 flex items-center gap-2 transition-all cursor-pointer border border-[#86EFAC]/40"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">{t.instantQuote}</span>
            <span className="sm:hidden">Réserver</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-[#999] hover:text-white rounded-lg border border-[#223326] bg-[#111A13] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#22C55E]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0D150F] border-b border-[#1E3022] p-5 space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-2.5 text-xs font-bold uppercase tracking-wider text-[#D1D5DB]">
            <a 
              href="#forfaits" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-[#132016] rounded-lg border border-[#203625] hover:border-[#22C55E] transition-colors flex items-center justify-between"
            >
              <span>{t.forfaits}</span>
              <span className="text-[#22C55E]">🚗</span>
            </a>
            <a 
              href="#residential" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-[#132016] rounded-lg border border-[#203625] hover:border-[#22C55E] transition-colors flex items-center justify-between"
            >
              <span>{t.furniture}</span>
              <span className="text-[#22C55E]">🛋️</span>
            </a>
            <a 
              href="#tapis-matelas" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-[#132016] rounded-lg border border-[#203625] hover:border-[#22C55E] transition-colors flex items-center justify-between"
            >
              <span>{t.rugsMattress}</span>
              <span className="text-[#22C55E]">🛏️</span>
            </a>
            <a 
              href="#commercial" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-[#132016] rounded-lg border border-[#203625] hover:border-[#22C55E] transition-colors flex items-center justify-between"
            >
              <span>{t.commercial}</span>
              <span className="text-[#22C55E]">🏢</span>
            </a>
            <a 
              href="#calculator" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-[#182F1D] rounded-lg border border-[#22C55E]/50 text-[#86EFAC] hover:border-[#22C55E] transition-colors flex items-center justify-between col-span-2"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#22C55E]" />
                {t.calculator}
              </span>
              <span className="text-[10px] bg-[#22C55E] text-black px-2 py-0.5 rounded font-mono font-bold">LIVE</span>
            </a>
            <div className="p-3 bg-[#132016] rounded-lg border border-[#203625] hover:border-[#22C55E] col-span-2 flex items-center justify-between">
              <a 
                href="#reviews" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-white font-bold"
              >
                <span>⭐ 5.0 {t.reviews}</span>
                <span className="text-[10px] text-[#BBF7D0]">(28)</span>
              </a>
              {onOpenWriteReview && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWriteReview();
                  }}
                  className="text-[11px] bg-[#22C55E] text-black font-bold px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{currentLang === 'fr' ? 'Écrire' : currentLang === 'ua' ? 'Написати' : 'Write'}</span>
                </button>
              )}
            </div>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-[#132016] rounded-lg border border-[#203625] hover:border-[#22C55E] transition-colors col-span-2 text-center"
            >
              {t.contact}
            </a>
          </div>

          <div className="pt-3 border-t border-[#1E3022] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#9CA3AF]">
              <span>Direct Max:</span>
              <a href={`tel:${DYNASTIE_INFO.phones[0].raw}`} className="text-[#22C55E] font-mono font-bold flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {DYNASTIE_INFO.phones[0].number}
              </a>
            </div>
            <div className="flex items-center justify-between text-[#9CA3AF]">
              <span>Facebook:</span>
              <a href={DYNASTIE_INFO.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-[#86EFAC] hover:text-white font-medium flex items-center gap-1 transition-colors">
                <Facebook className="w-3.5 h-3.5 text-[#22C55E]" />
                {DYNASTIE_INFO.facebook}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
