import React from 'react';
import { 
  Sparkles, 
  Leaf, 
  HeartHandshake, 
  Clock, 
  Droplets, 
  ShieldCheck, 
  ArrowRight,
  Armchair,
  Bed,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { 
  FURNITURE_SERVICES, 
  CARPET_SERVICES, 
  MATTRESS_SERVICES,
  DYNASTIE_INFO 
} from '../data/dynastieData';
import { Language } from '../types';

interface ResidentialSectionProps {
  currentLang: Language;
  onOpenBooking: () => void;
  onOpenCalculator: () => void;
}

export const ResidentialSection: React.FC<ResidentialSectionProps> = ({
  currentLang,
  onOpenBooking,
  onOpenCalculator
}) => {
  const t = {
    fr: {
      eyebrow: 'Service Mobile à Domicile',
      title: 'Nettoyage Résidentiel : Sofas, Tapis & Matelas',
      subtitle: 'Nous redonnons vie à vos meubles rembourrés avec une méthode d\'extraction à l\'eau chaude professionnelle et des produits 100% écologiques.',
      quoteBanner: '« Vous vous détendez, on s\'occupe du reste ! »',
      sofaTitle: '🛋️ Sofas & Divans',
      sofaSub: 'Fauteuils, causeuses, sofas 3 places et sectionnels (tissu et cuir)',
      carpetTitle: '🟫 Tapis & Moquettes',
      carpetSub: 'Carpettes décoratives, grands tapis et escaliers complets',
      mattressTitle: '🛏️ Matelas & Désinfection',
      mattressSub: 'Élimination des acariens, bactéries et taches tenaces',
      ecoBadge: '100% Écologique & Sécuritaire pour enfants et animaux',
      minNote: 'Minimum de service à domicile : 100 $ (Déplacement inclus à Drummondville)',
      ctaEstimate: 'Estimer mes meubles',
      ctaBook: 'Réserver un nettoyage'
    },
    ua: {
      eyebrow: 'Мобільна Хімчистка Вдома',
      title: 'Хімчистка Меблів : Дивани, Килими та Матраци',
      subtitle: 'Повертаємо свіжість та чистоту мʼяким меблям за допомогою професійного гарячого екстрактора та безпечної еко-хімії.',
      quoteBanner: '«Ви відпочиваєте — ми дбаємо про ідеальну чистоту!»',
      sofaTitle: '🛋️ Дивани та Крісла',
      sofaSub: 'Крісла, 2-х та 3-місні дивани, кутові та П-подібні секційні меблі',
      carpetTitle: '🟫 Килими та Сходи',
      carpetSub: 'Килимові покриття від 0,30 $/кв.фут та сходи від 120 $',
      mattressTitle: '🛏️ Матраци та Дезінфекція',
      mattressSub: 'Глибоке очищення від пилових кліщів, алергенів та плям',
      ecoBadge: '100% Еко-засоби, безпечно для дітей та домашніх тварин',
      minNote: 'Мінімальне замовлення з виїздом : 100 $ (Виїзд по місту включено)',
      ctaEstimate: 'Розрахувати меблі',
      ctaBook: 'Замовити чистку'
    },
    en: {
      eyebrow: 'Mobile In-Home Cleaning',
      title: 'Residential Cleaning: Sofas, Carpets & Mattresses',
      subtitle: 'Restore your upholstered furniture with professional hot water deep extraction and 100% eco-friendly products.',
      quoteBanner: '“You relax, we take care of the rest!”',
      sofaTitle: '🛋️ Sofas & Couches',
      sofaSub: 'Armchairs, loveseats, 3-seaters, L-shape and U-shape sectionals',
      carpetTitle: '🟫 Carpets & Rugs',
      carpetSub: 'Area rugs from $0.30/sq.ft and full carpeted stairs from $120',
      mattressTitle: '🛏️ Mattresses & Sanitization',
      mattressSub: 'Deep eradication of dust mites, allergens, and stubborn stains',
      ecoBadge: '100% Eco-friendly & safe for children and pets',
      minNote: 'Mobile minimum service: $100 (Local travel included in Drummondville)',
      ctaEstimate: 'Calculate Furniture Cost',
      ctaBook: 'Book at-home service'
    }
  }[currentLang];

  return (
    <section id="residential" className="py-16 sm:py-20 bg-[#0A100C] text-white relative border-b border-[#1A2A1E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
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

          {/* Slogan Banner matching flyer */}
          <div className="inline-flex items-center gap-2 bg-[#122B19] border border-[#22C55E]/50 px-4 py-2 rounded-xl text-xs font-bold text-[#86EFAC] mt-3">
            <Sparkles className="w-4 h-4 text-[#22C55E]" />
            <span>{t.quoteBanner}</span>
          </div>
        </div>

        {/* 3 Major Residential Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 mb-12">
          
          {/* Pillar 1: Sofas & Divans */}
          <div className="bg-[#0D1810] border border-[#1E3A24] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1A3320] pb-3.5">
                <div>
                  <h3 className="font-heading text-xl font-black text-white uppercase">
                    {t.sofaTitle}
                  </h3>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{t.sofaSub}</p>
                </div>
                <span className="text-2xl">🛋️</span>
              </div>

              <div className="space-y-2.5">
                {FURNITURE_SERVICES.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#112115] border border-[#1C3622] text-xs">
                    <span className="text-[#E5E7EB] font-medium">{item.name[currentLang]}</span>
                    <span className="font-mono font-black text-[#22C55E] bg-[#162D1D] px-2 py-0.5 rounded border border-[#22C55E]/30">
                      {item.price} $
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-[#1A3320]">
              <button
                type="button"
                onClick={onOpenBooking}
                className="w-full py-3 rounded-xl bg-[#16A34A] hover:bg-[#22C55E] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>{t.ctaBook}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pillar 2: Tapis & Moquettes */}
          <div id="tapis-matelas" className="bg-[#0D1810] border border-[#1E3A24] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1A3320] pb-3.5">
                <div>
                  <h3 className="font-heading text-xl font-black text-white uppercase">
                    {t.carpetTitle}
                  </h3>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{t.carpetSub}</p>
                </div>
                <span className="text-2xl">🟫</span>
              </div>

              <div className="space-y-2.5">
                {CARPET_SERVICES.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-[#112115] border border-[#1C3622] text-xs flex flex-col justify-between gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">{item.name[currentLang]}</span>
                      <span className="font-mono font-black text-[#22C55E] bg-[#162D1D] px-2 py-0.5 rounded border border-[#22C55E]/30">
                        {item.price ? `${item.price} $` : item.pricePerSqFt ? `${item.pricePerSqFt} $/pi²` : ''}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#9CA3AF]">{item.description[currentLang]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-[#1A3320]">
              <button
                type="button"
                onClick={onOpenCalculator}
                className="w-full py-3 rounded-xl bg-[#142618] hover:bg-[#1B3622] text-[#86EFAC] hover:text-white border border-[#22C55E]/40 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>{t.ctaEstimate}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pillar 3: Matelas & Désinfection */}
          <div className="bg-[#0D1810] border border-[#1E3A24] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1A3320] pb-3.5">
                <div>
                  <h3 className="font-heading text-xl font-black text-white uppercase">
                    {t.mattressTitle}
                  </h3>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{t.mattressSub}</p>
                </div>
                <span className="text-2xl">🛏️</span>
              </div>

              <div className="space-y-2.5">
                {MATTRESS_SERVICES.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#112115] border border-[#1C3622] text-xs">
                    <span className="text-[#E5E7EB] font-medium">{item.name[currentLang]}</span>
                    <span className="font-mono font-black text-[#22C55E] bg-[#162D1D] px-2 py-0.5 rounded border border-[#22C55E]/30">
                      {item.price} $
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-[#1A3320]">
              <button
                type="button"
                onClick={onOpenBooking}
                className="w-full py-3 rounded-xl bg-[#16A34A] hover:bg-[#22C55E] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>{t.ctaBook}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* 4 Feature Points Bar */}
        <div className="bg-[#0C1610] border border-[#1E3523] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full text-xs">
            <div className="flex items-center gap-2 text-[#D1D5DB]">
              <Leaf className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>Produits 100% Écologiques</span>
            </div>
            <div className="flex items-center gap-2 text-[#D1D5DB]">
              <HeartHandshake className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>Sécuritaire enfants et animaux</span>
            </div>
            <div className="flex items-center gap-2 text-[#D1D5DB]">
              <Droplets className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>Extraction à l'eau chaude</span>
            </div>
            <div className="flex items-center gap-2 text-[#D1D5DB]">
              <Clock className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>Séchage rapide et garanti</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
