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
    <section id="commercial" className="py-16 sm:py-20 bg-[#080D09] text-white relative border-b border-[#1A261D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-[#22C55E] font-mono font-bold bg-[#112417] px-3.5 py-1 rounded-full border border-[#22C55E]/40">
            {t.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-white tracking-tight uppercase">
            {t.title}
          </h2>
          <p className="text-sm text-[#9CA3AF] font-normal leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* 2 Columns: Heavy Trucks vs Commercial */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10" id="heavy-trucks">
          
          {/* Heavy Trucks & RVs */}
          <div className="bg-[#0C1610] border border-[#1E3623] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-[#182C1D] pb-4">
                <div className="w-12 h-12 rounded-xl bg-[#122416] border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E]">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-black text-white uppercase">
                    {t.truckTitle}
                  </h3>
                  <p className="text-xs text-[#9CA3AF]">{t.truckSub}</p>
                </div>
              </div>

              <div className="space-y-3">
                {TRUCK_RV_SERVICES.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-[#101E13] border border-[#1A301E] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-white font-bold block">{item.name[currentLang]}</span>
                      <span className="text-[11px] text-[#9CA3AF]">{item.description[currentLang]}</span>
                    </div>
                    <span className="font-mono font-black text-[#22C55E] bg-[#162D1D] px-2.5 py-1 rounded border border-[#22C55E]/30 shrink-0 self-start sm:self-auto">
                      {item.priceFrom}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#182C1D]">
              <button
                type="button"
                onClick={onOpenBooking}
                className="w-full py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#22C55E] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>{t.ctaQuote}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Commercial & Offices */}
          <div className="bg-[#0C1610] border border-[#1E3623] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-[#182C1D] pb-4">
                <div className="w-12 h-12 rounded-xl bg-[#122416] border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E]">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-black text-white uppercase">
                    {t.commTitle}
                  </h3>
                  <p className="text-xs text-[#9CA3AF]">{t.commSub}</p>
                </div>
              </div>

              <div className="space-y-3">
                {COMMERCIAL_SERVICES.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-[#101E13] border border-[#1A301E] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-white font-bold block">{item.name[currentLang]}</span>
                      <span className="text-[11px] text-[#9CA3AF]">{item.description[currentLang]}</span>
                    </div>
                    <span className="font-mono font-black text-[#22C55E] bg-[#162D1D] px-2.5 py-1 rounded border border-[#22C55E]/30 shrink-0 self-start sm:self-auto">
                      {item.priceUnit[currentLang]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#182C1D]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-[#9CA3AF] block font-mono">
                    {t.callDirect}
                  </span>
                  <a href={`tel:${DYNASTIE_INFO.phones[0].raw}`} className="text-[#22C55E] font-mono text-sm font-black flex items-center gap-1.5 mt-0.5">
                    <PhoneCall className="w-3.5 h-3.5" />
                    {DYNASTIE_INFO.phones[0].number}
                  </a>
                </div>

                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="px-5 py-3 rounded-xl bg-[#182F1D] hover:bg-[#203D26] text-[#86EFAC] hover:text-white border border-[#22C55E]/40 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
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
