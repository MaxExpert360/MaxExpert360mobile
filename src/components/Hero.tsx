import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  PhoneCall,
  Flame,
  Leaf,
  HeartHandshake,
  Layers,
  Clock,
  Car,
  Armchair,
  Bed,
  MapPin,
  Edit3
} from 'lucide-react';
import { Language } from '../types';
import { DYNASTIE_INFO } from '../data/dynastieData';

interface HeroProps {
  currentLang: Language;
  onOpenBooking: () => void;
  onOpenCalculator: (tab?: 'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck') => void;
  onOpenWriteReview?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentLang,
  onOpenBooking,
  onOpenCalculator,
  onOpenWriteReview
}) => {
  const t = {
    fr: {
      eyebrow: 'Service Mobile à Domicile • Drummondville',
      bigHeadline1: 'NOUS VENONS',
      bigHeadline2: 'CHEZ VOUS !',
      subHeadline: 'Nettoyage Mobile Professionnel : Autos, Sofas, Tapis, Matelas & Camions',
      punchline: '« Vous vous détendez, on s\'occupe du reste ! »',
      description: 'Plus besoin de vous déplacer ni de perdre votre précieux temps. MaxExpert360 se déplace directement à votre résidence ou entreprise avec un équipement professionnel d\'extraction à l\'eau chaude et des produits 100% écologiques sans danger pour vos enfants et vos animaux.',
      badgeEco: 'Produits 100% Écologiques',
      badgeKidsPets: 'Sécuritaire Enfants & Animaux',
      badgeHotWater: 'Extraction Eau Chaude',
      badgeFastDry: 'Séchage Ultra-Rapide',
      ctaBook: 'Calculer & Réserver en ligne',
      ctaPackages: 'Voir les forfaits & tarifs',
      ratingText: '5.0 ★ sur Google & Facebook • Service impeccable garanti',
      serviceZone: 'Desservant Drummondville, St-Cyrille, St-Germain, Wickham et tout le Centre-du-Québec',
      minServiceNote: 'Déplacement local inclus à Drummondville • Sans acompte'
    },
    ua: {
      eyebrow: 'Мобільний Клінінг & Детейлінг • Drummondville',
      bigHeadline1: 'МИ ПРИЇЖДЖАЄМО',
      bigHeadline2: 'ДО ВАС ДОДОМУ !',
      subHeadline: 'Професійна Хімчистка та Детейлінг : Авто, Дивани, Килими, Матраци та Тягачі',
      punchline: '«Ви відпочиваєте — ми дбаємо про ідеальну чистоту!»',
      description: 'Вам більше не потрібно нікуди їхати та витрачати свій час. MaxExpert360 приїжджає прямо до вашого будинку чи офісу з потужним екстрактором гарячої води та екологічною хімією, безпечною для дітей і домашніх улюбленців.',
      badgeEco: '100% Екологічні засоби',
      badgeKidsPets: 'Безпечно для дітей і тварин',
      badgeHotWater: 'Екстракція гарячою водою',
      badgeFastDry: 'Швидке висихання',
      ctaBook: 'Розрахувати та забронювати',
      ctaPackages: 'Переглянути ціни та пакети',
      ratingText: '5.0 ★ Google & Facebook • Гарантія чистоти та якості',
      serviceZone: 'Обслуговуємо Drummondville, St-Cyrille, St-Germain та весь Centre-du-Québec',
      minServiceNote: 'Виїзд по місту включено • Без передплати'
    },
    en: {
      eyebrow: 'Mobile Detailing & Deep Cleaning • Drummondville',
      bigHeadline1: 'WE COME',
      bigHeadline2: 'TO YOUR DOOR !',
      subHeadline: 'Professional Mobile Cleaning: Cars, Sofas, Carpets, Mattresses & Trucks',
      punchline: '“You relax, we take care of the rest!”',
      description: 'No need to drive anywhere or waste valuable hours. MaxExpert360 comes directly to your home or workplace equipped with commercial hot-water extraction and eco-friendly products safe for children and pets.',
      badgeEco: '100% Eco-Friendly Products',
      badgeKidsPets: 'Safe for Kids & Pets',
      badgeHotWater: 'Hot Water Extraction',
      badgeFastDry: 'Ultra-Fast Drying',
      ctaBook: 'Calculate & Book Online',
      ctaPackages: 'View Packages & Pricing',
      ratingText: '5.0 ★ Google & Facebook • 100% Satisfaction Guaranteed',
      serviceZone: 'Serving Drummondville, St-Cyrille, St-Germain, Wickham & surrounding areas',
      minServiceNote: 'Local travel included in Drummondville • No deposit required'
    }
  }[currentLang];

  return (
    <section className="relative bg-[#070B08] text-white pt-10 sm:pt-14 pb-16 sm:pb-24 overflow-hidden border-b border-[#1A261D]">
      {/* Background visual with subtle deep green glow and automotive/interior imagery */}
      <div className="absolute inset-0 z-0 opacity-25">
        <img 
          src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=2000&q=85" 
          alt="Professional Mobile Detailing"
          className="w-full h-full object-cover object-center filter grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070B08] via-[#070B08]/90 to-[#070B08]/75"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B08] via-transparent to-[#070B08]"></div>
      </div>

      {/* Radiant Emerald Glow */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[650px] h-[350px] bg-[#16A34A]/15 rounded-full blur-[130px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#112316] border border-[#22C55E]/50 text-[#86EFAC] text-[11px] font-mono uppercase tracking-wider font-bold">
                <Truck className="w-3.5 h-3.5 text-[#22C55E]" />
                {t.eyebrow}
              </span>

              {/* Clickable Rating Badge linking to Reviews */}
              <a 
                href="#reviews"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F1A12] hover:bg-[#15291A] border border-[#1E3322] hover:border-[#22C55E]/60 text-[11px] text-[#D1D5DB] transition-all cursor-pointer group shadow-sm active:scale-95"
                title={currentLang === 'fr' ? 'Consulter les 28 avis clients' : currentLang === 'ua' ? 'Читати 28 відгуків клієнтів' : 'Read 28 client reviews'}
              >
                <div className="flex text-[#FBBF24]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[#FBBF24]" />
                  ))}
                </div>
                <span className="font-bold text-white font-mono">5.0</span>
                <span className="text-[#86EFAC] font-mono group-hover:underline">
                  {currentLang === 'fr' ? '(28 avis)' : currentLang === 'ua' ? '(28 відгуків)' : '(28 reviews)'}
                </span>
                <span className="text-[#9CA3AF] hidden sm:inline">• Drummondville</span>
              </a>

              {/* Dedicated "Write Review" button right next to rating */}
              <button
                type="button"
                onClick={onOpenWriteReview}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#142918] hover:bg-[#22C55E] text-[#86EFAC] hover:text-black border border-[#22C55E]/50 font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 group"
              >
                <Edit3 className="w-3 h-3 text-[#22C55E] group-hover:text-black" />
                <span>
                  {currentLang === 'fr' ? 'Écrire un avis' : currentLang === 'ua' ? 'Написати відгук' : 'Write a review'}
                </span>
              </button>
            </div>

            {/* Main Headline styled like the flyer */}
            <div className="space-y-2.5">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-heading tracking-tight text-white leading-none uppercase">
                {t.bigHeadline1} <br />
                <span className="bg-gradient-to-r from-[#22C55E] via-[#4ADE80] to-[#86EFAC] bg-clip-text text-transparent italic drop-shadow-sm">
                  {t.bigHeadline2}
                </span>
              </h1>
              
              <div className="inline-block bg-[#122416] border-l-4 border-[#22C55E] px-3.5 py-1.5 rounded-r-md">
                <p className="text-sm sm:text-base font-bold text-[#86EFAC] italic tracking-wide">
                  {t.punchline}
                </p>
              </div>

              <p className="text-sm sm:text-base text-[#9CA3AF] font-normal leading-relaxed pt-1 max-w-2xl">
                {t.description}
              </p>
            </div>

            {/* Core 4 Badges directly from flyer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-[#0E1B11] border border-[#1C3622] flex items-center gap-2">
                <Leaf className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span className="text-[11px] font-bold text-[#E5E7EB] leading-tight">{t.badgeEco}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0E1B11] border border-[#1C3622] flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span className="text-[11px] font-bold text-[#E5E7EB] leading-tight">{t.badgeKidsPets}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0E1B11] border border-[#1C3622] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span className="text-[11px] font-bold text-[#E5E7EB] leading-tight">{t.badgeHotWater}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0E1B11] border border-[#1C3622] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span className="text-[11px] font-bold text-[#E5E7EB] leading-tight">{t.badgeFastDry}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <a
                href="#calculator"
                onClick={() => onOpenCalculator('auto')}
                className="px-7 py-4 rounded-xl bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#15803D] hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#16A34A]/30 flex items-center justify-center gap-2.5 transition-all text-center cursor-pointer border border-[#86EFAC]/40"
              >
                <span>{t.ctaBook}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#forfaits"
                className="px-6 py-4 rounded-xl bg-[#101C13] hover:bg-[#16271A] border border-[#213B27] hover:border-[#22C55E]/60 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-center"
              >
                <span>{t.ctaPackages}</span>
              </a>
            </div>

            {/* Geographic Coverage Notice & Min order */}
            <div className="pt-2 space-y-1 text-xs text-[#9CA3AF]">
              <div className="flex items-center gap-2 text-[#86EFAC] font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-ping shrink-0"></span>
                <span>{t.serviceZone}</span>
              </div>
              <p className="text-[11px] text-[#6B7280]">
                {t.minServiceNote}
              </p>
            </div>
          </div>

          {/* Right Column: Quick Flyer Services Grid */}
          <div className="lg:col-span-5">
            <div className="bg-[#0C150E] border-2 border-[#1E3A24] rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
              
              {/* Header of the Flyer Service Showcase */}
              <div className="flex items-center justify-between border-b border-[#1A301E] pb-3.5 mb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-mono text-[#22C55E] font-bold block">
                    NOS SERVICES À DOMICILE
                  </span>
                  <h3 className="font-heading text-lg sm:text-xl font-black text-white uppercase">
                    Que souhaitez-vous nettoyer ?
                  </h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#142618] border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] shrink-0 font-bold">
                  360°
                </div>
              </div>

              {/* Eye-catching Hand/Finger Pointing Indicator */}
              <div className="mb-3.5 px-3 py-2 rounded-xl bg-[#122416] border border-[#22C55E]/50 flex items-center justify-between gap-2 shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="text-xl animate-bounce shrink-0 select-none">👇</span>
                  <span className="text-xs font-black uppercase text-[#86EFAC] tracking-wider">
                    {currentLang === 'fr' 
                      ? 'Touchez un bouton pour configurer votre prix :' 
                      : currentLang === 'ua' 
                      ? 'Натисніть на послугу, щоб вибрати та порахувати :' 
                      : 'Tap a button to configure your instant quote :'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#22C55E] font-bold bg-[#0A140C] px-2 py-0.5 rounded border border-[#22C55E]/30 shrink-0">
                  {currentLang === 'fr' ? 'Interactif' : currentLang === 'ua' ? 'Натисніть' : 'Clickable'}
                </span>
              </div>

              {/* 6 Grid Service Cards matching flyer top icons */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <button 
                  type="button"
                  onClick={() => onOpenCalculator('auto')}
                  className="bg-[#101D13] hover:bg-[#1A3320] border-2 border-[#1E3622] hover:border-[#22C55E] p-2.5 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer shadow-md hover:scale-105 active:scale-95"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">🚗</span>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">AUTO</span>
                  <span className="text-[9px] font-mono text-[#22C55E] font-bold">dès 99 $</span>
                </button>

                <button 
                  type="button"
                  onClick={() => onOpenCalculator('furniture')}
                  className="bg-[#101D13] hover:bg-[#1A3320] border-2 border-[#1E3622] hover:border-[#22C55E] p-2.5 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer shadow-md hover:scale-105 active:scale-95"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">🛋️</span>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">SOFA</span>
                  <span className="text-[9px] font-mono text-[#22C55E] font-bold">dès 70 $</span>
                </button>

                <button 
                  type="button"
                  onClick={() => onOpenCalculator('carpet')}
                  className="bg-[#101D13] hover:bg-[#1A3320] border-2 border-[#1E3622] hover:border-[#22C55E] p-2.5 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer shadow-md hover:scale-105 active:scale-95"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">🟫</span>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">TAPIS</span>
                  <span className="text-[9px] font-mono text-[#22C55E] font-bold">0,30 $/pi²</span>
                </button>

                <button 
                  type="button"
                  onClick={() => onOpenCalculator('mattress')}
                  className="bg-[#101D13] hover:bg-[#1A3320] border-2 border-[#1E3622] hover:border-[#22C55E] p-2.5 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer shadow-md hover:scale-105 active:scale-95"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">🛏️</span>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">MATELAS</span>
                  <span className="text-[9px] font-mono text-[#22C55E] font-bold">dès 80 $</span>
                </button>

                <button 
                  type="button"
                  onClick={() => onOpenCalculator('truck')}
                  className="bg-[#101D13] hover:bg-[#1A3320] border-2 border-[#1E3622] hover:border-[#22C55E] p-2.5 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer shadow-md hover:scale-105 active:scale-95"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">🚛</span>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">CAMION</span>
                  <span className="text-[9px] font-mono text-[#22C55E] font-bold">Poids lourds</span>
                </button>

                <button 
                  type="button"
                  onClick={() => onOpenCalculator('truck')}
                  className="bg-[#101D13] hover:bg-[#1A3320] border-2 border-[#1E3622] hover:border-[#22C55E] p-2.5 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer shadow-md hover:scale-105 active:scale-95"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">🚐</span>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">VR</span>
                  <span className="text-[9px] font-mono text-[#22C55E] font-bold">Sur mesure</span>
                </button>
              </div>

              {/* Direct Booking Callout inside card */}
              <div className="pt-3 border-t border-[#1A301E] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-[#9CA3AF] block font-mono font-bold">
                    Téléphone direct / SMS
                  </span>
                  <a 
                    href={`tel:${DYNASTIE_INFO.phones[0].raw}`} 
                    className="text-[#22C55E] hover:text-[#4ADE80] font-mono text-sm font-black transition-colors flex items-center gap-1.5 mt-0.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    {DYNASTIE_INFO.phones[0].number}
                  </a>
                </div>

                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="px-4 py-2 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-black font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                >
                  {currentLang === 'fr' ? 'Réserver' : currentLang === 'ua' ? 'Замовити' : 'Book Now'}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
