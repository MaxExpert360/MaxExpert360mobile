import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Car, 
  Truck, 
  Star,
  Flame,
  PlusCircle,
  AlertCircle,
  Dog,
  Wind
} from 'lucide-react';
import { 
  DETAILING_PACKAGES, 
  EXTRA_SERVICES,
  DYNASTIE_INFO
} from '../data/dynastieData';
import { 
  Language, 
  VehicleCategory 
} from '../types';

interface PricingPackagesProps {
  currentLang: Language;
  onSelectPackage: (pkgId: string, category: VehicleCategory) => void;
}

export const PricingPackages: React.FC<PricingPackagesProps> = ({
  currentLang,
  onSelectPackage
}) => {
  const [selectedVehicleType, setSelectedVehicleType] = useState<'auto' | 'suv' | 'truck_van'>('suv');

  const t = {
    fr: {
      eyebrow: 'Nos Forfaits Mobiles à Domicile',
      title: 'Tarifs & Forfaits Esthétique Auto',
      subtitle: 'Nous venons directement chez vous à Drummondville et ses environs. Équipement 100% autonome et produits écologiques.',
      btnAuto: 'Auto / Berline',
      btnSuv: 'VUS / SUV',
      btnTruckVan: 'Camionnette / Van / Pick-up',
      ctaSelect: 'Réserver ce forfait',
      recommendedBadge: 'LE CHOIX RECOMMANDÉ ★',
      priceFinalNote: 'Prix final selon l\'état du véhicule',
      optionsTitle: 'Options & Suppléments Disponibles',
      optionsNote: 'Les suppléments sont toujours validés avec vous avant le début des travaux.',
      minServiceBadge: 'Minimum de service à domicile : 100 $ (Déplacement local inclus)'
    },
    ua: {
      eyebrow: 'Пакети Обслуговування з Виїздом',
      title: 'Ціни та Пакети Детейлінгу Авто',
      subtitle: 'Ми приїжджаємо до вашого будинку в Драммондвілі та передмісті. Власний запас води, живлення та екологічні засоби.',
      btnAuto: 'Легкове авто / Седан',
      btnSuv: 'Кросовер / VUS',
      btnTruckVan: 'Пікап / Вен / Мінівен',
      ctaSelect: 'Обрати цей пакет',
      recommendedBadge: 'РЕКОМЕНДОВАНИЙ ВИБІР ★',
      priceFinalNote: 'Кінцева ціна залежить від стану авто',
      optionsTitle: 'Додаткові Опції та Послуги',
      optionsNote: 'Усі доплати обовʼязково узгоджуються з вами до початку робіт.',
      minServiceBadge: 'Мінімальне замовлення з виїздом : 100 $ (Виїзд включено)'
    },
    en: {
      eyebrow: 'Mobile At-Home Packages',
      title: 'Auto Detailing Packages & Pricing',
      subtitle: 'We come directly to your driveway in Drummondville and surrounding areas. Self-contained rigs and eco-safe products.',
      btnAuto: 'Car / Sedan',
      btnSuv: 'SUV / Crossover',
      btnTruckVan: 'Truck / Van / Minivan',
      ctaSelect: 'Book this package',
      recommendedBadge: 'RECOMMENDED CHOICE ★',
      priceFinalNote: 'Final price according to vehicle condition',
      optionsTitle: 'Available Options & Add-ons',
      optionsNote: 'All extra surcharges are confirmed with you before work begins.',
      minServiceBadge: 'Mobile service minimum: $100 (Local travel included)'
    }
  }[currentLang];

  return (
    <section id="forfaits" className="py-16 sm:py-20 bg-[#080D09] text-white relative border-b border-[#1A261D]">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
          <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-[#22C55E] font-mono font-bold bg-[#0F1E13] px-3.5 py-1 rounded-full border border-[#22C55E]/40">
            {t.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-white tracking-tight uppercase">
            {t.title}
          </h2>
          <p className="text-sm text-[#9CA3AF] font-normal leading-relaxed">
            {t.subtitle}
          </p>

          {/* Vehicle Category Switcher Tabs matching the flyer (Auto, VUS, Camionnette/Van) */}
          <div className="inline-flex flex-wrap justify-center p-1.5 rounded-xl bg-[#0F1A12] border border-[#1E3322] shadow-inner mt-4 gap-1">
            <button
              type="button"
              onClick={() => setSelectedVehicleType('auto')}
              className={`px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                selectedVehicleType === 'auto'
                  ? 'bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white shadow-md'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>{t.btnAuto}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedVehicleType('suv')}
              className={`px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                selectedVehicleType === 'suv'
                  ? 'bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white shadow-md'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>{t.btnSuv}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedVehicleType('truck_van')}
              className={`px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                selectedVehicleType === 'truck_van'
                  ? 'bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white shadow-md'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{t.btnTruckVan}</span>
            </button>
          </div>
        </div>

        {/* 3 Package Cards Grid directly matching flyer cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          {DETAILING_PACKAGES.map((pkg) => {
            const price = pkg.prices[selectedVehicleType] || pkg.prices.auto;
            const isFeatured = pkg.popular;
            const isRejuvenation = pkg.id === 'remise_a_neuf';

            return (
              <div
                key={pkg.id}
                className={`rounded-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                  isFeatured
                    ? 'bg-gradient-to-b from-[#112316] to-[#0A140D] border-2 border-[#22C55E] shadow-2xl shadow-[#22C55E]/15 lg:-translate-y-2'
                    : isRejuvenation
                    ? 'bg-[#0E1711] border border-[#F97316]/50 hover:border-[#F97316] shadow-xl'
                    : 'bg-[#0B130E] border border-[#1D2E20] hover:border-[#22C55E]/40'
                }`}
              >
                {/* Header Tag / Badge */}
                <div className="p-6 sm:p-7 space-y-4">
                  
                  <div className="flex items-center justify-between">
                    {pkg.badge ? (
                      <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-mono font-black ${
                        isFeatured
                          ? 'bg-[#22C55E] text-black'
                          : isRejuvenation
                          ? 'bg-[#F97316] text-black font-bold'
                          : 'bg-[#16271B] text-[#86EFAC] border border-[#22C55E]/30'
                      }`}>
                        {pkg.badge[currentLang]}
                      </span>
                    ) : <div></div>}

                    <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF] font-mono">
                      <Clock className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>{pkg.duration[currentLang]}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading text-xl sm:text-2xl font-black text-white uppercase">
                      {pkg.title[currentLang]}
                    </h3>
                    <p className="text-xs text-[#9CA3AF] mt-1.5 leading-relaxed min-h-[36px]">
                      {pkg.tagline[currentLang]}
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="pt-3 border-t border-[#1A2D1F] flex items-baseline justify-between">
                    <div>
                      {isRejuvenation && (
                        <span className="text-[11px] text-[#F97316] uppercase font-mono font-bold block">
                          À partir de
                        </span>
                      )}
                      <span className="font-heading text-4xl sm:text-5xl font-black text-white">
                        {price} $
                      </span>
                      <span className="text-[10px] text-[#6B7280] block font-mono">
                        CAD • {selectedVehicleType === 'auto' ? 'Auto' : selectedVehicleType === 'suv' ? 'VUS' : 'Camionnette / Van'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono text-[#86EFAC] bg-[#112417] px-2 py-1 rounded border border-[#22C55E]/30">
                        {isFeatured ? 'Extraction Pro' : isRejuvenation ? 'Nettoyage Intensif' : 'Lavage Rapide'}
                      </span>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2.5 pt-4 border-t border-[#1A2D1F]">
                    <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-mono font-bold block">
                      Services inclus :
                    </span>
                    {pkg.features[currentLang].map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#D1D5DB]">
                        <Check className="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Card Bottom CTA */}
                <div className="p-6 sm:p-7 pt-0">
                  <button
                    type="button"
                    onClick={() => onSelectPackage(pkg.id, selectedVehicleType)}
                    className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                      isFeatured
                        ? 'bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#15803D] hover:brightness-110 text-white shadow-[#16A34A]/25 border border-[#86EFAC]/40'
                        : isRejuvenation
                        ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-[#EA580C]/20'
                        : 'bg-[#152319] hover:bg-[#1D3223] text-white border border-[#253D2B] hover:border-[#22C55E]/50'
                    }`}
                  >
                    <span>{t.ctaSelect}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Add-ons & Options Section (Matching Flyer Bottom Left Card) */}
        <div className="mt-12 bg-[#0C150F] border border-[#1E3623] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A301E] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#122316] border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E]">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg sm:text-xl font-black text-white uppercase">
                  {t.optionsTitle}
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  {t.optionsNote}
                </p>
              </div>
            </div>

            <div className="text-xs font-mono text-[#86EFAC] bg-[#122617] px-3 py-1.5 rounded-lg border border-[#22C55E]/40 self-start sm:self-auto">
              {t.minServiceBadge}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EXTRA_SERVICES.map((extra) => (
              <div key={extra.id} className="p-4 rounded-xl bg-[#0F1B12] border border-[#1A301E] flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {extra.name[currentLang]}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] mt-1 leading-snug">
                    {extra.description[currentLang]}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#172B1B] flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-[#22C55E]">
                    {extra.unit[currentLang]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
