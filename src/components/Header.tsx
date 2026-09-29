import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MapPin, 
  Globe, 
  Menu, 
  X, 
  ChevronDown, 
  Sparkles,
  CheckCircle2,
  Truck,
  Facebook,
  Bot
} from 'lucide-react';
import { MaxLogo } from './MaxLogo';
import { DYNASTIE_INFO } from '../data/dynastieData';
import { Language } from '../types';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenBooking: () => void;
  onOpenCallback?: () => void;
  onOpenWriteReview?: () => void;
  onOpenChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  onOpenBooking,
  onOpenCallback,
  onOpenWriteReview,
  onOpenChat
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('accueil');

  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ['contact', 'tarifs', 'avis', 'avant-apres', 'taches-difficiles', 'services', 'accueil'];
      const scrollPos = window.scrollY + 120;
      
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = {
    fr: {
      slogan: 'SERVICE MOBILE À DOMICILE • DRUMMONDVILLE ET ENVIRONS',
      home: 'Accueil',
      services: 'Services',
      difficultStains: 'Taches difficiles',
      beforeAfter: 'Avant / Après',
      reviews: 'Avis',
      tarifs: 'Tarifs',
      contact: 'Contact',
      bookNow: 'Réserver',
      callMax: 'Appelez Max',
      ecoGuarantee: '100% Écologique'
    },
    ua: {
      slogan: 'МОБІЛЬНИЙ СЕРВІС ДОДОМУ • ДРАММОНДВІЛЬ ТА РЕГІОН',
      home: 'Головна',
      services: 'Послуги',
      difficultStains: 'Складні плями',
      beforeAfter: 'До / Після',
      reviews: 'Відгуки',
      tarifs: 'Тарифи',
      contact: 'Контакти',
      bookNow: 'Замовити',
      callMax: 'Подзвонити Максу',
      ecoGuarantee: '100% Екологічно'
    },
    en: {
      slogan: 'MOBILE AT-HOME SERVICE • DRUMMONDVILLE & SURROUNDING AREA',
      home: 'Home',
      services: 'Services',
      difficultStains: 'Difficult Stains',
      beforeAfter: 'Before / After',
      reviews: 'Reviews',
      tarifs: 'Pricing',
      contact: 'Contact',
      bookNow: 'Book Now',
      callMax: 'Call Max',
      ecoGuarantee: '100% Eco-Friendly'
    }
  }[currentLang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D8EBDD] text-[#122B1E] transition-colors shadow-xs">
      {/* Top Banner with GMC Van Advertisement Info */}
      <div className="bg-[#EAF6EE] text-[#166534] py-1 px-4 text-[11px] font-semibold border-b border-[#CBEAD2]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-0.5">
            <span className="flex items-center gap-1.5 text-[#15803D] font-bold shrink-0">
              <Truck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="uppercase tracking-wider text-[10px] sm:text-[11px]">{t.slogan}</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-[#376449] text-[10px] shrink-0">
              <MapPin className="w-3 h-3 text-[#16A34A]" />
              <span>{DYNASTIE_INFO.region}</span>
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-[#15803D] text-[10px] shrink-0 font-bold">
              <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
              <span>{t.ecoGuarantee}</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 pl-2">
            <a 
              href={DYNASTIE_INFO.facebookUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-[#166534] hover:text-[#0D381E] bg-[#D7EFE0] hover:bg-[#C5E8D1] px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
            >
              <Facebook className="w-3 h-3 text-[#16A34A]" />
              <span>Facebook</span>
            </a>

            <span className="hidden sm:inline-block text-[10px] text-[#4F7A64] font-mono font-bold">
              MaxExpert360.ca
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        
        {/* LEFT: Compact Max Expert 360 Logo */}
        <a href="#accueil" className="flex items-center gap-2.5 group shrink-0 select-none">
          <MaxLogo size="sm" showSubtitle={false} theme="light" />
          <div className="hidden sm:flex flex-col border-l border-[#D8EBDD] pl-2.5">
            <span className="text-[10px] font-black tracking-widest text-[#0F291E] uppercase font-heading leading-tight">
              NETTOYAGE MOBILE
            </span>
            <span className="text-[10px] font-black tracking-wider text-[#16A34A] uppercase font-heading leading-tight">
              PROFESSIONNEL
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-4.5 text-[11px] font-bold uppercase tracking-wider">
          <a 
            href="#accueil" 
            className={`transition-colors py-1 border-b-2 ${
              activeSection === 'accueil'
                ? 'text-[#16A34A] border-[#16A34A]'
                : 'text-[#335643] border-transparent hover:text-[#16A34A]'
            }`}
          >
            {t.home}
          </a>
          <a 
            href="#services" 
            className={`transition-colors py-1 border-b-2 ${
              activeSection === 'services'
                ? 'text-[#16A34A] border-[#16A34A]'
                : 'text-[#335643] border-transparent hover:text-[#16A34A]'
            }`}
          >
            {t.services}
          </a>
          <a 
            href="#taches-difficiles" 
            className={`transition-colors py-1 border-b-2 ${
              activeSection === 'taches-difficiles'
                ? 'text-[#16A34A] border-[#16A34A]'
                : 'text-[#335643] border-transparent hover:text-[#16A34A]'
            }`}
          >
            {t.difficultStains}
          </a>
          <a 
            href="#avant-apres" 
            className={`transition-colors py-1 border-b-2 ${
              activeSection === 'avant-apres'
                ? 'text-[#16A34A] border-[#16A34A]'
                : 'text-[#335643] border-transparent hover:text-[#16A34A]'
            }`}
          >
            {t.beforeAfter}
          </a>
          <a 
            href="#avis" 
            className={`transition-colors py-1 border-b-2 ${
              activeSection === 'avis'
                ? 'text-[#16A34A] border-[#16A34A]'
                : 'text-[#335643] border-transparent hover:text-[#16A34A]'
            }`}
          >
            {t.reviews}
          </a>
          <a 
            href="#tarifs" 
            className={`transition-colors py-1 border-b-2 ${
              activeSection === 'tarifs'
                ? 'text-[#16A34A] border-[#16A34A]'
                : 'text-[#335643] border-transparent hover:text-[#16A34A]'
            }`}
          >
            {t.tarifs}
          </a>
          <a 
            href="#contact" 
            className={`transition-colors py-1 border-b-2 ${
              activeSection === 'contact'
                ? 'text-[#16A34A] border-[#16A34A]'
                : 'text-[#335643] border-transparent hover:text-[#16A34A]'
            }`}
          >
            {t.contact}
          </a>
        </nav>

        {/* RIGHT: Compact green rounded phone button + Language + Booking */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Language Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D8EBDD] bg-[#F4FAF6] text-[11px] font-mono text-[#163827] hover:border-[#16A34A] transition-colors"
              aria-label="Sélectionner la langue"
            >
              <Globe className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="uppercase font-bold">{currentLang}</span>
              <ChevronDown className="w-2.5 h-2.5 text-[#4F7A64]" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white border border-[#D8EBDD] rounded-xl shadow-xl py-1 z-50 animate-fade-in">
                <button
                  type="button"
                  onClick={() => { onLanguageChange('fr'); setLangDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    currentLang === 'fr' ? 'text-[#16A34A] bg-[#F0FAF3] font-bold' : 'text-[#375846] hover:bg-[#F4FAF6]'
                  }`}
                >
                  <span>Français</span>
                  <span className="font-mono text-[10px] text-[#7A9C87]">FR</span>
                </button>
                <button
                  type="button"
                  onClick={() => { onLanguageChange('ua'); setLangDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    currentLang === 'ua' ? 'text-[#16A34A] bg-[#F0FAF3] font-bold' : 'text-[#375846] hover:bg-[#F4FAF6]'
                  }`}
                >
                  <span>Українська</span>
                  <span className="font-mono text-[10px] text-[#7A9C87]">UA</span>
                </button>
                <button
                  type="button"
                  onClick={() => { onLanguageChange('en'); setLangDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    currentLang === 'en' ? 'text-[#16A34A] bg-[#F0FAF3] font-bold' : 'text-[#375846] hover:bg-[#F4FAF6]'
                  }`}
                >
                  <span>English</span>
                  <span className="font-mono text-[10px] text-[#7A9C87]">EN</span>
                </button>
              </div>
            )}
          </div>

          {/* AI Bot Button */}
          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[#EAF6EE] hover:bg-[#D5EAD9] text-[#15803D] border border-[#16A34A]/30 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
              title="Відкрити Gemini AI Бот"
            >
              <Bot className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="hidden md:inline font-mono">AI Бот</span>
            </button>
          )}

          {/* COMPACT GREEN ROUNDED PHONE BUTTON */}
          <a 
            href="tel:+18736575102"
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xs font-mono tracking-wide shadow-sm shadow-[#16A34A]/25 hover:scale-105 active:scale-95 transition-all shrink-0 border border-[#16A34A]"
            title="Appelez MaxExpert360 au 873-657-5102"
          >
            <Phone className="w-3.5 h-3.5 fill-white shrink-0" />
            <span className="whitespace-nowrap font-bold">873-657-5102</span>
          </a>

          {/* Online Estimate / Booking Button */}
          <button
            type="button"
            onClick={onOpenBooking}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#F0FAF3] hover:bg-[#E1F5E7] text-[#15803D] border border-[#BEE7CB] hover:border-[#16A34A] font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>{t.bookNow}</span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#244634] hover:text-[#16A34A] rounded-lg border border-[#D8EBDD] bg-[#F4FAF6] transition-colors shrink-0"
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-[#16A34A]" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#D8EBDD] px-4 py-5 space-y-3 animate-fade-in shadow-xl">
          <nav className="flex flex-col space-y-1.5 text-xs font-bold uppercase tracking-wider text-[#2D543F]">
            <a 
              href="#accueil" 
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-lg border transition-colors flex items-center justify-between ${
                activeSection === 'accueil'
                  ? 'bg-[#EAF6EE] border-[#16A34A] text-[#16A34A]'
                  : 'bg-[#F8FCF9] border-[#E2F0E6] hover:border-[#16A34A] hover:text-[#16A34A]'
              }`}
            >
              <span>{t.home}</span>
              {activeSection === 'accueil' && <span className="w-2 h-2 rounded-full bg-[#16A34A]" />}
            </a>
            <a 
              href="#services" 
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-lg border transition-colors flex items-center justify-between ${
                activeSection === 'services'
                  ? 'bg-[#EAF6EE] border-[#16A34A] text-[#16A34A]'
                  : 'bg-[#F8FCF9] border-[#E2F0E6] hover:border-[#16A34A] hover:text-[#16A34A]'
              }`}
            >
              <span>{t.services}</span>
              {activeSection === 'services' && <span className="w-2 h-2 rounded-full bg-[#16A34A]" />}
            </a>
            <a 
              href="#taches-difficiles" 
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-lg border transition-colors flex items-center justify-between ${
                activeSection === 'taches-difficiles'
                  ? 'bg-[#EAF6EE] border-[#16A34A] text-[#16A34A]'
                  : 'bg-[#F8FCF9] border-[#E2F0E6] hover:border-[#16A34A] hover:text-[#16A34A]'
              }`}
            >
              <span>{t.difficultStains}</span>
              {activeSection === 'taches-difficiles' && <span className="w-2 h-2 rounded-full bg-[#16A34A]" />}
            </a>
            <a 
              href="#avant-apres" 
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-lg border transition-colors flex items-center justify-between ${
                activeSection === 'avant-apres'
                  ? 'bg-[#EAF6EE] border-[#16A34A] text-[#16A34A]'
                  : 'bg-[#F8FCF9] border-[#E2F0E6] hover:border-[#16A34A] hover:text-[#16A34A]'
              }`}
            >
              <span>{t.beforeAfter}</span>
              {activeSection === 'avant-apres' && <span className="w-2 h-2 rounded-full bg-[#16A34A]" />}
            </a>
            <a 
              href="#avis" 
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-lg border transition-colors flex items-center justify-between ${
                activeSection === 'avis'
                  ? 'bg-[#EAF6EE] border-[#16A34A] text-[#16A34A]'
                  : 'bg-[#F8FCF9] border-[#E2F0E6] hover:border-[#16A34A] hover:text-[#16A34A]'
              }`}
            >
              <span>{t.reviews}</span>
              {activeSection === 'avis' && <span className="w-2 h-2 rounded-full bg-[#16A34A]" />}
            </a>
            <a 
              href="#tarifs" 
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-lg border transition-colors flex items-center justify-between ${
                activeSection === 'tarifs'
                  ? 'bg-[#EAF6EE] border-[#16A34A] text-[#16A34A]'
                  : 'bg-[#F8FCF9] border-[#E2F0E6] hover:border-[#16A34A] hover:text-[#16A34A]'
              }`}
            >
              <span>{t.tarifs}</span>
              {activeSection === 'tarifs' && <span className="w-2 h-2 rounded-full bg-[#16A34A]" />}
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-lg border transition-colors flex items-center justify-between ${
                activeSection === 'contact'
                  ? 'bg-[#EAF6EE] border-[#16A34A] text-[#16A34A]'
                  : 'bg-[#F8FCF9] border-[#E2F0E6] hover:border-[#16A34A] hover:text-[#16A34A]'
              }`}
            >
              <span>{t.contact}</span>
              {activeSection === 'contact' && <span className="w-2 h-2 rounded-full bg-[#16A34A]" />}
            </a>
          </nav>

          <div className="pt-2 flex flex-col gap-2.5">
            {onOpenChat && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenChat();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#EAF6EE] text-[#15803D] border border-[#16A34A]/30 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Bot className="w-4 h-4 text-[#16A34A]" />
                <span>AI Бот (Відеомонтаж & Чат)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3 rounded-xl bg-[#16A34A] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#16A34A]/25 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>{t.bookNow}</span>
            </button>

            <a
              href="tel:+18736575102"
              className="w-full py-3 rounded-xl bg-[#F0FAF3] border border-[#16A34A] text-[#16A34A] font-black text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>☎ 873-657-5102</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
