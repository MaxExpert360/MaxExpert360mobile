import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

// Importing real project photos
import carInteriorDirty from '../assets/images/car_interior_dirty_1787363587019.jpg';
import carInteriorClean from '../assets/images/car_interior_clean_1787363600214.jpg';
import sofaDirty from '../assets/images/sofa_dirty_1787363609878.jpg';
import sofaClean from '../assets/images/sofa_clean_1787363621465.jpg';
import truckCabDirty from '../assets/images/truck_cab_dirty_1787363991231.jpg';
import truckCabClean from '../assets/images/truck_cab_clean_1787364002946.jpg';
import carFloorDirty from '../assets/images/car_floor_dirty_1787363633146.jpg';
import carFloorClean from '../assets/images/car_floor_clean_1787363645656.jpg';

interface BeforeAfterSectionProps {
  currentLang: Language;
  onOpenBooking: () => void;
}

export const BeforeAfterSection: React.FC<BeforeAfterSectionProps> = ({
  currentLang,
  onOpenBooking
}) => {
  // State to track toggle for each card ('before' or 'after')
  const [activeViews, setActiveViews] = useState<{ [key: string]: 'before' | 'after' }>({
    auto: 'after',
    furniture: 'after',
    mattress: 'after',
    carpet: 'after'
  });

  const toggleView = (id: string, view: 'before' | 'after') => {
    setActiveViews(prev => ({ ...prev, [id]: view }));
  };

  const t = {
    fr: {
      eyebrow: 'TRANSFORMATIONS RÉELLES',
      titleResults: 'RÉSULTATS',
      titleAvantApres: 'AVANT / APRÈS',
      subtitle: 'Voyez la différence par vous-même.',
      labelBefore: 'Avant',
      labelAfter: 'Après',
      initialStateLabel: 'État initial',
      viewBeforeBtn: "Voir l'Avant",
      viewAfterBtn: "Voir l'Après",
      ctaText: 'Obtenir le même résultat chez vous',
      ctaSub: "Nos unités mobiles interviennent directement chez vous avec nos équipements professionnels d'extraction.",
      ctaBtn: 'RÉSERVER MON NETTOYAGE',
      cards: [
        {
          id: 'auto',
          title: 'Sièges d’auto',
          subtitle: 'Extraction des auréoles et poussières incrustées',
          dirtyImg: carInteriorDirty,
          cleanImg: carInteriorClean,
          highlight: 'Tissu ravivé à 100%'
        },
        {
          id: 'furniture',
          title: 'Meubles & Divans',
          subtitle: 'Détachage en profondeur et neutralisation des odeurs',
          dirtyImg: sofaDirty,
          cleanImg: sofaClean,
          highlight: 'Fibres saines et désodorisées'
        },
        {
          id: 'mattress',
          title: 'Matelas & Cabines',
          subtitle: 'Assainissement thermique et élimination des taches',
          dirtyImg: truckCabDirty,
          cleanImg: truckCabClean,
          highlight: 'Hygiène maximale'
        },
        {
          id: 'carpet',
          title: 'Tapis & Carpettes',
          subtitle: 'Dissolution des traces de sel et saletés de rue',
          dirtyImg: carFloorDirty,
          cleanImg: carFloorClean,
          highlight: 'Couleurs et texture restaurées'
        }
      ]
    },
    ua: {
      eyebrow: 'РЕАЛЬНІ РЕЗУЛЬТАТИ РОБОТИ',
      titleResults: 'РЕЗУЛЬТАТИ',
      titleAvantApres: 'ДО / ПІСЛЯ',
      subtitle: 'Переконайтеся у високій якості на власні очі.',
      labelBefore: 'До',
      labelAfter: 'Після',
      initialStateLabel: 'Початковий стан',
      viewBeforeBtn: 'Дивитися До',
      viewAfterBtn: 'Дивитися Після',
      ctaText: 'Бажаєте такий самий бездоганний результат?',
      ctaSub: 'Наш мобільний юніт приїжджає прямо до вашого дому з професійним екстракційним обладнанням.',
      ctaBtn: 'ЗАМОВИТИ ХІМЧИСТКУ',
      cards: [
        {
          id: 'auto',
          title: 'Сидіння авто',
          subtitle: 'Видалення застарілих плям та глибинного пилу',
          dirtyImg: carInteriorDirty,
          cleanImg: carInteriorClean,
          highlight: '100% відновлення текстилю'
        },
        {
          id: 'furniture',
          title: 'Меблі та дивани',
          subtitle: 'Глибоке очищення та дезінфекція від запахів',
          dirtyImg: sofaDirty,
          cleanImg: sofaClean,
          highlight: 'Свіжість та чисті волокна'
        },
        {
          id: 'mattress',
          title: 'Матраци та текстиль',
          subtitle: 'Термічна екстракція плям та алергенів',
          dirtyImg: truckCabDirty,
          cleanImg: truckCabClean,
          highlight: 'Повна гігієнічність'
        },
        {
          id: 'carpet',
          title: 'Килими та доріжки',
          subtitle: 'Розчинення в\'їденої солі та бруду',
          dirtyImg: carFloorDirty,
          cleanImg: carFloorClean,
          highlight: 'Відновлена текстура'
        }
      ]
    },
    en: {
      eyebrow: 'REAL WORK TRANSFORMATIONS',
      titleResults: 'RESULTS',
      titleAvantApres: 'BEFORE / AFTER',
      subtitle: 'See the visible difference for yourself.',
      labelBefore: 'Before',
      labelAfter: 'After',
      initialStateLabel: 'Initial condition',
      viewBeforeBtn: 'View Before',
      viewAfterBtn: 'View After',
      ctaText: 'Get the exact same fresh result at your place',
      ctaSub: 'Our mobile units come directly to your driveway with commercial hot-water extraction equipment.',
      ctaBtn: 'BOOK YOUR CLEANING',
      cards: [
        {
          id: 'auto',
          title: 'Car Seats',
          subtitle: 'Deep extraction of water marks and ingrained dust',
          dirtyImg: carInteriorDirty,
          cleanImg: carInteriorClean,
          highlight: '100% fabric revived'
        },
        {
          id: 'furniture',
          title: 'Furniture & Sofas',
          subtitle: 'Targeted stain removal and odor neutralizing',
          dirtyImg: sofaDirty,
          cleanImg: sofaClean,
          highlight: 'Fresh, sanitized fibers'
        },
        {
          id: 'mattress',
          title: 'Mattresses & Cabs',
          subtitle: 'Hot water thermal sanitation and allergen removal',
          dirtyImg: truckCabDirty,
          cleanImg: truckCabClean,
          highlight: 'Maximum hygiene'
        },
        {
          id: 'carpet',
          title: 'Carpets & Rugs',
          subtitle: 'Deep breakdown of salt stains and street grime',
          dirtyImg: carFloorDirty,
          cleanImg: carFloorClean,
          highlight: 'Restored pile & color'
        }
      ]
    }
  }[currentLang];

  return (
    <section id="avant-apres" className="py-10 sm:py-14 bg-[#F4FAF6] text-[#122B1E] relative scroll-mt-16 border-b border-[#D5EAD9]">
      <div id="resultats" className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="inline-block text-[11px] font-black uppercase tracking-[0.2em] text-[#15803D] bg-white px-3.5 py-1 rounded-full border border-[#BEE7CB] shadow-xs">
            {t.eyebrow}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading tracking-tight uppercase">
            <span className="text-[#0D2818]">{t.titleResults}</span>{' '}
            <span className="text-[#16A34A]">
              {t.titleAvantApres}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#3E6552] font-medium leading-relaxed max-w-lg mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {t.cards.map((card) => {
            const currentView = activeViews[card.id] || 'after';
            const displayImg = currentView === 'after' ? card.cleanImg : card.dirtyImg;

            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-[#D5EAD9] overflow-hidden shadow-sm flex flex-col group hover:border-[#16A34A] hover:shadow-md transition-all"
              >
                {/* Image Showcase Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#EAF5ED]">
                  <img
                    src={displayImg}
                    alt={`${card.title} - ${currentView === 'after' ? t.labelAfter : t.labelBefore}`}
                    className="w-full h-full object-cover object-center transition-all duration-300"
                    loading="lazy"
                  />

                  {/* Dual Top Badges / Switcher */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    {/* Fixed Card Title Badge */}
                    <span className="bg-white/95 backdrop-blur-md text-[#0D2818] text-[11px] font-black uppercase px-3 py-1 rounded-lg border border-[#BEE7CB] shadow-xs">
                      {card.title}
                    </span>

                    {/* Interactive Before / After Selector */}
                    <div className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#BEE7CB] shadow-sm">
                      <button
                        type="button"
                        onClick={() => toggleView(card.id, 'before')}
                        className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                          currentView === 'before'
                            ? 'bg-[#EAF6EE] text-[#166534] border border-[#BEE7CB] font-black'
                            : 'text-[#4F7A64] hover:text-[#0D2818]'
                        }`}
                      >
                        {t.labelBefore}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleView(card.id, 'after')}
                        className={`px-2.5 py-1 text-[11px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                          currentView === 'after'
                            ? 'bg-[#16A34A] text-white shadow-xs'
                            : 'text-[#4F7A64] hover:text-[#16A34A]'
                        }`}
                      >
                        {t.labelAfter}
                      </button>
                    </div>
                  </div>

                  {/* Active Status Badge at bottom */}
                  <div className="absolute bottom-3 left-3">
                    {currentView === 'after' ? (
                      <span className="inline-flex items-center gap-1.5 bg-[#16A34A] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.labelAfter} : {card.highlight}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-[#555] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-gray-200 shadow-sm">
                        <span>{t.labelBefore} : {t.initialStateLabel}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Description Footer */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-t border-[#EAF5ED]">
                  <div className="min-w-0">
                    <h3 className="font-heading font-black text-base text-[#0D2818] uppercase truncate">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#3E6552] truncate">
                      {card.subtitle}
                    </p>
                  </div>

                  {/* Interactive toggle hint button */}
                  <button
                    type="button"
                    onClick={() => toggleView(card.id, currentView === 'after' ? 'before' : 'after')}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-[#EAF6EE] hover:bg-[#DCF2E2] border border-[#BEE7CB] text-[#15803D] text-xs font-bold transition-colors cursor-pointer"
                  >
                    {currentView === 'after' ? t.viewBeforeBtn : t.viewAfterBtn}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Booking Callout */}
        <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-white border border-[#D5EAD9] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-black font-heading text-[#0D2818] uppercase">
              {t.ctaText}
            </h4>
            <p className="text-xs sm:text-sm text-[#3E6552]">
              {t.ctaSub}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenBooking}
            className="shrink-0 px-6 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-[#16A34A]/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-[#16A34A]"
          >
            {t.ctaBtn}
          </button>
        </div>

      </div>
    </section>
  );
};
