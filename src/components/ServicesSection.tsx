import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Car, 
  Check, 
  ArrowRight, 
  Layers, 
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { DETAILING_SERVICES, DYNASTIE_INFO } from '../data/dynastieData';
import { Language } from '../types';

interface ServicesSectionProps {
  currentLang: Language;
  onOpenBooking: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  currentLang,
  onOpenBooking
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState(DETAILING_SERVICES[0].id);

  const activeService = DETAILING_SERVICES.find(s => s.id === selectedServiceId) || DETAILING_SERVICES[0];

  const t = {
    fr: {
      eyebrow: 'Expertise & Savoir-Faire',
      title: 'Nos Prestations Haute Précision',
      subtitle: 'Chaque surface de votre véhicule reçoit un traitement chimique et mécanique calibré pour restaurer son état neuf.',
      fromPrice: 'À partir de',
      bookThisService: 'Réserver cette prestation',
      highlightsTitle: 'Ce qui fait la différence MaxExpert360mobile :'
    },
    ua: {
      eyebrow: 'Експертний Досвід та Стандарти',
      title: 'Наші Послуги Високої Точності',
      subtitle: 'Кожна деталь автомобіля проходить делікатну хімічну та механічну підготовку для ідеального результату.',
      fromPrice: 'Від',
      bookThisService: 'Замовити цю послугу',
      highlightsTitle: 'Ключові переваги MaxExpert360mobile :'
    },
    en: {
      eyebrow: 'Expertise & Craftsmanship',
      title: 'High-Precision Detailing Services',
      subtitle: 'Every surface receives calibrated chemical and mechanical care to restore it to showroom condition.',
      fromPrice: 'Starting at',
      bookThisService: 'Book this service',
      highlightsTitle: 'The MaxExpert360mobile Difference :'
    }
  }[currentLang];

  return (
    <section id="services" className="py-20 bg-[#0C0E11] text-white relative border-b border-[#22242B]">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold bg-[#17191F] px-3.5 py-1 rounded-full border border-[#D4AF37]/30">
            {t.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-sm text-[#9399A5] font-light leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Interactive Service List Selector (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {DETAILING_SERVICES.map((srv) => {
              const isSelected = srv.id === selectedServiceId;

              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => setSelectedServiceId(srv.id)}
                  className={`w-full p-4 sm:p-5 rounded-xl border text-left transition-all flex items-center justify-between gap-4 cursor-pointer ${
                    isSelected
                      ? 'bg-[#181B22] border-[#D4AF37] shadow-xl shadow-[#D4AF37]/10'
                      : 'bg-[#121418] border-[#252830] hover:border-[#3A3E4A] text-[#8E94A0]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        isSelected ? 'text-white' : 'text-[#CCC]'
                      }`}>
                        {srv.title[currentLang]}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7A808C] line-clamp-1">
                      {srv.shortDesc[currentLang]}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs font-bold text-[#D4AF37]">
                      {srv.priceStart} $
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      isSelected ? 'text-[#D4AF37] translate-x-1' : 'text-[#555]'
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Active Service Deep Dive Card (7 cols) */}
          <div className="lg:col-span-7">
            <div className="h-full bg-[#121418] border border-[#262832] rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl">
              
              {/* Top Image banner */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <img 
                  src={activeService.image} 
                  alt={activeService.title[currentLang]}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121418] via-[#121418]/40 to-transparent"></div>
                
                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] bg-black/70 px-2.5 py-1 rounded border border-[#D4AF37]/40 mb-1 inline-block">
                      Prestation Dynastie
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                      {activeService.title[currentLang]}
                    </h3>
                  </div>

                  <div className="text-right bg-black/80 px-3 py-1.5 rounded-lg border border-[#333]">
                    <span className="text-[9px] uppercase font-mono text-[#888] block">{t.fromPrice}</span>
                    <span className="font-serif text-xl font-bold text-[#D4AF37]">
                      {activeService.priceStart} $
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
                
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-[#A0A6B2] font-light leading-relaxed">
                    {activeService.fullDesc[currentLang]}
                  </p>

                  {/* Highlights checkmarks */}
                  <div className="space-y-2.5 pt-3 border-t border-[#242730]">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#D4AF37] block">
                      {t.highlightsTitle}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeService.highlights[currentLang].map((hl, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[#CCD1DB]">
                          <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="pt-5 border-t border-[#242730] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-[#7A808C] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#D4AF37]" />
                    <span>Produits professionnels allemands & suisses (Koch-Chemie, Gyeon)</span>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenBooking}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3C64F] to-[#C59B27] hover:brightness-110 text-[#0A0B0D] font-bold text-xs uppercase tracking-widest shadow-lg transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2"
                  >
                    <span>{t.bookThisService}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
