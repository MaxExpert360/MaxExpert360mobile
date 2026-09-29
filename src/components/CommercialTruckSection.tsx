import React from 'react';
import { 
  Truck, 
  Building2, 
  Sparkles, 
  Check, 
  ArrowRight, 
  PhoneCall, 
  ShieldCheck,
  Award,
  Compass
} from 'lucide-react';
import { 
  TRUCK_RV_SERVICES, 
  COMMERCIAL_SERVICES,
  DYNASTIE_INFO 
} from '../data/dynastieData';
import { Language } from '../types';

interface CommercialTruckSectionProps {
  currentLang: Language;
  onOpenBooking: () => void;
  onOpenCalculator?: () => void;
}

export const CommercialTruckSection: React.FC<CommercialTruckSectionProps> = ({
  currentLang,
  onOpenBooking
}) => {
  const t = {
    fr: {
      eyebrow: 'Flottes & Entreprises',
      title: 'Poids Lourds, VR & Services Commerciaux',
      subtitle: 'Nettoyage professionnel de cabines de camions, véhicules récréatifs et espaces commerciaux (bureaux, restaurants, commerces).',
      truckTitle: '🚛 Camions Lourds & Véhicules Récréatifs',
      truckSub: 'Cabines de dormeur complètes, sièges, couchette et désinfection',
      commTitle: '🏢 Espaces Commerciaux & Entreprises',
      commSub: 'Chaises de bureau, banquettes de restaurant et tapis corporatifs',
      ctaQuote: 'Demander une soumission commerciale',
      callDirect: 'Appel direct pour flottes :'
    },
    ua: {
      eyebrow: 'Автопарки та Бізнес',
      title: 'Вантажівки, VR та Комерційний Клінінг',
      subtitle: 'Професійна хімчистка спальних кабін тягачів, кемперів (VR) та комерційних приміщень (офіси, ресторани).',
      truckTitle: '🚛 Тягачі, Вантажівки та VR',
      truckSub: 'Повна хімчистка спального місця, сидінь, підлоги та панелей',
      commTitle: '🏢 Офіси, Ресторани та Бізнес',
      commSub: 'Офісні крісла, ресторанні диванчики та комерційні ковроліни',
      ctaQuote: 'Отримати комерційний розрахунок',
      callDirect: 'Прямий звʼязок для автопарків :'
    },
    en: {
      eyebrow: 'Fleets & Businesses',
      title: 'Heavy Trucks, RVs & Commercial Cleaning',
      subtitle: 'Professional deep cleaning for semi-truck sleeper cabs, motorhomes, and commercial office spaces.',
      truckTitle: '🚛 Heavy Trucks & RVs',
      truckSub: 'Complete sleeper cabs, driver seats, mattress, floor & sanitization',
      commTitle: '🏢 Commercial Spaces & Offices',
      commSub: 'Office chairs, restaurant booths, and commercial carpets',
      ctaQuote: 'Request a Commercial Estimate',
      callDirect: 'Direct line for fleet managers :'
    }
  }[currentLang];

  return (
    <section id="commercial" className="py-8 sm:py-12 bg-[#080D09] text-white relative border-b border-[#1A261D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header - Compact */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-2">
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

        {/* 2 Columns: Heavy Trucks vs Commercial - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-6" id="heavy-trucks">
          
          {/* Heavy Trucks & RVs */}
          <div className="bg-[#0C1610] border border-[#1E3623] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-md">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2.5 border-b border-[#182C1D] pb-3">
                <div className="w-9 h-9 rounded-lg bg-[#122416] border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E]">
                  <Truck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-heading text-base sm:text-lg font-black text-white uppercase">
                    {t.truckTitle}
                  </h3>
                  <p className="text-[11px] text-[#9CA3AF]">{t.truckSub}</p>
                </div>
              </div>

              <div className="space-y-2">
                {TRUCK_RV_SERVICES.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-[#101E13] border border-[#1A301E] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                    <div>
                      <span className="text-white font-bold block">{item.name[currentLang]}</span>
                      <span className="text-[10px] text-[#9CA3AF]">{item.description[currentLang]}</span>
                    </div>
                    <span className="font-mono font-black text-[#22C55E] bg-[#162D1D] px-2 py-0.5 rounded border border-[#22C55E]/30 shrink-0 self-start sm:self-auto text-xs">
                      {item.priceFrom}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#182C1D]">
              <button
                type="button"
                onClick={onOpenBooking}
                className="w-full py-2.5 rounded-lg bg-[#16A34A] hover:bg-[#22C55E] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>{t.ctaQuote}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Commercial & Offices */}
          <div className="bg-[#0C1610] border border-[#1E3623] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-md">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2.5 border-b border-[#182C1D] pb-3">
                <div className="w-9 h-9 rounded-lg bg-[#122416] border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E]">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-heading text-base sm:text-lg font-black text-white uppercase">
                    {t.commTitle}
                  </h3>
                  <p className="text-[11px] text-[#9CA3AF]">{t.commSub}</p>
                </div>
              </div>

              <div className="space-y-2">
                {COMMERCIAL_SERVICES.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-[#101E13] border border-[#1A301E] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                    <div>
                      <span className="text-white font-bold block">{item.name[currentLang]}</span>
                      <span className="text-[10px] text-[#9CA3AF]">{item.description[currentLang]}</span>
                    </div>
                    <span className="font-mono font-black text-[#22C55E] bg-[#162D1D] px-2 py-0.5 rounded border border-[#22C55E]/30 shrink-0 self-start sm:self-auto text-xs">
                      {item.priceUnit[currentLang]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#182C1D]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase text-[#9CA3AF] block font-mono">
                    {t.callDirect}
                  </span>
                  <a href={`tel:${DYNASTIE_INFO.phones[0].raw}`} className="text-[#22C55E] font-mono text-xs font-black flex items-center gap-1 mt-0.5">
                    <PhoneCall className="w-3 h-3" />
                    {DYNASTIE_INFO.phones[0].number}
                  </a>
                </div>

                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="px-3.5 py-2 rounded-lg bg-[#182F1D] hover:bg-[#203D26] text-[#86EFAC] hover:text-white border border-[#22C55E]/40 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Soumission
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
