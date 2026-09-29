import React from 'react';
import { 
  MapPin, 
  ArrowRight, 
  Check, 
  Home, 
  Clock, 
  ShieldCheck, 
  Phone, 
  Sparkles,
  Truck,
  Leaf
} from 'lucide-react';
import { Language } from '../types';
import { DYNASTIE_INFO } from '../data/dynastieData';
import detailingVanHero from '../assets/images/detailing_van_hero_1789747671511.jpg';

interface HeroProps {
  currentLang: Language;
  onOpenBooking: () => void;
  onOpenCalculator?: (tab?: 'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck') => void;
  onOpenWriteReview?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentLang,
  onOpenBooking
}) => {
  const t = {
    fr: {
      location: '📍 DRUMMONDVILLE ET ENVIRONS',
      title1: 'NETTOYAGE MOBILE',
      title2: 'PROFESSIONNEL',
      servicesList: 'Autos • Meubles • Tapis • Matelas',
      description: 'Service mobile à domicile à Drummondville et environs. Un nettoyage professionnel en profondeur directement chez vous.',
      btnBook: 'RÉSERVER MAINTENANT →',
      btnServices: 'VOIR NOS SERVICES',
      adv1Title: 'Service mobile',
      adv1Sub: 'à domicile',
      adv2Title: 'Horaire flexible',
      adv2Sub: 'soir et week-end',
      adv3Title: 'Nettoyage',
      adv3Sub: 'professionnel',
      vanTitle: 'UNITÉ MOBILE GMC SAVANA',
      vanSub: 'Tout équipé pour l\'extraction à l\'eau chaude professionnelle',
      vanCall: 'Appel direct :'
    },
    ua: {
      location: '📍 ДРАММОНДВІЛЬ ТА РЕГІОН',
      title1: 'МОБІЛЬНИЙ КЛІНІНГ',
      title2: 'ПРОФЕСІЙНИЙ',
      servicesList: 'Авто • Меблі • Килими • Матраци',
      description: 'Мобільний сервіс додому в Драммондвілі та околицях. Професійне глибоке очищення безпосередньо у вас вдома.',
      btnBook: 'ЗАБРОНЮВАТИ ЗАРАЗ →',
      btnServices: 'НАШІ ПОСЛУГИ',
      adv1Title: 'Мобільний сервіс',
      adv1Sub: 'прямо додому',
      adv2Title: 'Гнучкий графік',
      adv2Sub: 'вечір та вихідні',
      adv3Title: 'Професійне',
      adv3Sub: 'глибоке очищення',
      vanTitle: 'МОБІЛЬНИЙ ЮНІТ GMC SAVANA',
      vanSub: 'Повністю обладнаний професійним екстрактором гарячої води',
      vanCall: 'Прямий дзвінок :'
    },
    en: {
      location: '📍 DRUMMONDVILLE & AREA',
      title1: 'PROFESSIONAL MOBILE',
      title2: 'CLEANING',
      servicesList: 'Cars • Furniture • Carpets • Mattresses',
      description: 'Mobile at-home service in Drummondville and surrounding area. Professional deep cleaning directly at your door.',
      btnBook: 'BOOK NOW →',
      btnServices: 'VIEW OUR SERVICES',
      adv1Title: 'Mobile service',
      adv1Sub: 'at your home',
      adv2Title: 'Flexible schedule',
      adv2Sub: 'evenings & weekends',
      adv3Title: 'Professional',
      adv3Sub: 'deep extraction',
      vanTitle: 'MOBILE UNIT GMC SAVANA',
      vanSub: 'Fully equipped for commercial hot water extraction',
      vanCall: 'Direct line :'
    }
  }[currentLang];

  const scrollToServices = () => {
    const el = document.getElementById('services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="accueil" className="relative bg-gradient-to-b from-[#EBF6EE] via-[#F4FAF6] to-[#EEF8F1] text-[#122B1E] pt-8 sm:pt-12 pb-10 sm:pb-14 overflow-hidden border-b border-[#D8EBDD] scroll-mt-16">
      {/* Subtle brand glow on background */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[450px] h-[300px] bg-[#22C55E]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-6 right-6 w-[350px] h-[250px] bg-[#16A34A]/8 rounded-full blur-[110px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT SIDE: Hero content */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            
            {/* Small location line */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#BEE7CB] text-[#15803D] font-mono text-[11px] font-bold uppercase tracking-wider shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{t.location}</span>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight leading-[1.15] uppercase text-[#0C2417]">
                {t.title1} <br />
                <span className="text-[#16A34A] drop-shadow-xs">
                  {t.title2}
                </span>
              </h1>

              {/* Below: Autos • Meubles • Tapis • Matelas */}
              <p className="text-sm sm:text-base font-bold text-[#15803D] tracking-wide pt-0.5">
                {t.servicesList}
              </p>

              {/* Text */}
              <p className="text-xs sm:text-sm text-[#2E5440] font-normal leading-relaxed pt-1 max-w-xl">
                {t.description}
              </p>
            </div>

            {/* BUTTON 1 & BUTTON 2 */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* BUTTON 1: bright green, calls existing booking modal */}
              <button
                type="button"
                onClick={onOpenBooking}
                className="px-6 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-[#16A34A]/25 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#16A34A]"
              >
                <span>{t.btnBook}</span>
              </button>

              {/* BUTTON 2: crisp white with green border, scrolls to #services */}
              <button
                type="button"
                onClick={scrollToServices}
                className="px-5 py-3 rounded-xl bg-white hover:bg-[#F0FAF3] border-2 border-[#BEE7CB] hover:border-[#16A34A] text-[#166534] font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span>{t.btnServices}</span>
              </button>
            </div>

            {/* UNDER BUTTONS: 3 Advantages */}
            <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-[#D8EBDD]">
              {/* Advantage 1 */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-[#D8EBDD] flex items-center gap-2 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#EAF6EE] border border-[#BEE7CB] flex items-center justify-center text-sm shrink-0">
                  🏠
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs font-bold text-[#0D2818] leading-tight truncate">
                    {t.adv1Title}
                  </div>
                  <div className="text-[10px] text-[#4F7A64] leading-tight truncate">
                    {t.adv1Sub}
                  </div>
                </div>
              </div>

              {/* Advantage 2 */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-[#D8EBDD] flex items-center gap-2 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#EAF6EE] border border-[#BEE7CB] flex items-center justify-center text-sm shrink-0">
                  🕒
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs font-bold text-[#0D2818] leading-tight truncate">
                    {t.adv2Title}
                  </div>
                  <div className="text-[10px] text-[#4F7A64] leading-tight truncate">
                    {t.adv2Sub}
                  </div>
                </div>
              </div>

              {/* Advantage 3 */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-[#D8EBDD] flex items-center gap-2 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#EAF6EE] border border-[#BEE7CB] flex items-center justify-center text-xs font-black text-[#16A34A] shrink-0">
                  ✓
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs font-bold text-[#0D2818] leading-tight truncate">
                    {t.adv3Title}
                  </div>
                  <div className="text-[10px] text-[#4F7A64] leading-tight truncate">
                    {t.adv3Sub}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: White GMC Savana Showcase with Real Image */}
          <div className="lg:col-span-5">
            <div className="bg-white border-2 border-[#D8EBDD] hover:border-[#16A34A] rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group transition-all">
              
              {/* Top Unit Banner */}
              <div className="flex items-center justify-between border-b border-[#EAF5ED] pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
                  <span className="text-xs font-black font-mono text-[#15803D] uppercase tracking-wider">
                    {t.vanTitle}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF6EE] text-[#15803D] border border-[#C6ECCF]">
                  DRUMMONDVILLE
                </span>
              </div>

              {/* Real Generated Van Image Container */}
              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#F0FAF3] border border-[#D8EBDD] shadow-inner">
                <img 
                  src={detailingVanHero} 
                  alt="Max Expert 360 GMC Savana - Unité Mobile Drummondville" 
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Floating badge over image */}
                <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#BEE7CB] text-[10px] font-bold text-[#15803D] flex items-center gap-1.5 shadow-sm">
                  <Truck className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Unité 100% Autonome</span>
                </div>
              </div>

              {/* Van Highlights under image */}
              <div className="mt-3 space-y-2.5">
                <p className="text-xs text-[#355B46] leading-relaxed font-medium">
                  {t.vanSub}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EAF5ED] text-xs">
                  <span className="text-[#5B826C] text-xs">{t.vanCall}</span>
                  <a 
                    href="tel:+18736575102" 
                    className="font-mono font-black text-[#16A34A] hover:text-[#15803D] hover:underline flex items-center gap-1.5 text-xs bg-[#EAF6EE] px-2.5 py-1 rounded-full border border-[#C6ECCF]"
                  >
                    <Phone className="w-3 h-3 text-[#16A34A]" />
                    <span>873-657-5102</span>
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
