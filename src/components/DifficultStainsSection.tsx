import React from 'react';
import { Info, Check, Plus, Minus, ArrowDown } from 'lucide-react';
import { Language } from '../types';

export interface DifficultStainsSectionProps {
  currentLang: Language;
  onOpenBooking?: () => void;
  selectedExtras?: string[];
  extraQuantities?: Record<string, number>;
  onToggleExtra?: (extraId: string) => void;
  onUpdateExtraQuantity?: (extraId: string, quantity: number) => void;
  selectedStainTypes?: string[];
  onToggleStainType?: (stainKey: string) => void;
  onScrollToCalculator?: () => void;
}

export const DifficultStainsSection: React.FC<DifficultStainsSectionProps> = ({
  currentLang,
  selectedExtras = [],
  extraQuantities = {},
  onToggleExtra,
  onUpdateExtraQuantity,
  selectedStainTypes = [],
  onToggleStainType,
  onScrollToCalculator
}) => {
  const t = {
    fr: {
      eyebrow: 'TRAITEMENT SPÉCIFIQUE EN PROFONDEUR',
      title1: 'DES TACHES',
      title2: 'DIFFICILES ?',
      titleGreen: 'ON S’EN OCCUPE !',
      subtitle: 'Des solutions efficaces et écologiques pour vos plus gros défis de nettoyage.',
      disclaimer: 'Chaque type de tissu et de cuir réagit différemment selon la nature et l\'ancienneté de la tache. Nous utilisons les détachants enzymatiques professionnels les plus avancés et l\'extraction thermique pour estomper ou éliminer les dépôts sans abîmer les fibres.',
      btnAdd: 'Ajouter',
      btnAdded: 'Sélectionné',
      syncedNote: 'Vos sélections sont automatiquement synchronisées avec le calculateur de prix et de durée.',
      btnSeeEstimate: 'Voir mon estimation'
    },
    ua: {
      eyebrow: 'СПЕЦІАЛІЗОВАНЕ ВИВЕДЕННЯ ЗАБРУДНЕНЬ',
      title1: 'СКЛАДНІ',
      title2: 'ПЛЯМИ?',
      titleGreen: 'МИ ПОДБАЄМО ПРО ЦЕ!',
      subtitle: 'Ефективні екологічні рішення для найскладніших випадків.',
      disclaimer: 'Кожен тип волокна реагує індивідуально залежно від віку плями. Ми застосовуємо передові ензимні препарати та термо-екстракцію для максимального усунення забруднень без пошкодження структури тканини.',
      btnAdd: 'Додати',
      btnAdded: 'Обрано',
      syncedNote: 'Вибір автоматично синхронізується з калькулятором вартості та тривалості.',
      btnSeeEstimate: 'Переглянути розрахунок'
    },
    en: {
      eyebrow: 'DEEP TARGETED STAIN TREATMENT',
      title1: 'TOUGH',
      title2: 'STAINS?',
      titleGreen: 'WE HANDLE THEM!',
      subtitle: 'Effective, specialized eco solutions for your toughest cleaning challenges.',
      disclaimer: 'Different fabrics react uniquely depending on the age and nature of the deposit. We use industrial enzymatic chemistry and commercial hot-water extraction to break down and lift stubborn stains safely.',
      btnAdd: 'Add',
      btnAdded: 'Selected',
      syncedNote: 'Selections are automatically synchronized with the quote calculator below.',
      btnSeeEstimate: 'View Instant Estimate'
    }
  }[currentLang];

  // 6 contamination cards with exact French specifications
  const stainCards = [
    {
      id: 'salt',
      emoji: '❄️',
      title: 'TRACES DE SEL',
      priceDuration: '+25 $ CAD · +1 h',
      category: 'stain' as const,
      extraId: 'difficult_stains',
      stainKey: 'salt'
    },
    {
      id: 'odor',
      emoji: '🐾',
      title: 'URINE ET ODEURS',
      priceDuration: '35 $ CAD / intervention · +1 h / intervention',
      category: 'odor' as const,
      extraId: 'odor_treatment',
      stainKey: 'odor'
    },
    {
      id: 'coffee',
      emoji: '☕',
      title: 'CAFÉ / CHOCOLAT',
      priceDuration: '25 $ CAD / tache · +1 h / tache',
      category: 'stain' as const,
      extraId: 'difficult_stains',
      stainKey: 'coffee'
    },
    {
      id: 'grease',
      emoji: '💧',
      title: 'GRAISSE / HUILE',
      priceDuration: '25 $ CAD / tache · +1 h / tache',
      category: 'stain' as const,
      extraId: 'difficult_stains',
      stainKey: 'grease'
    },
    {
      id: 'blood',
      emoji: '🩹',
      title: 'SANG / MAQUILLAGE',
      priceDuration: '25 $ CAD / tache · +1 h / tache',
      category: 'stain' as const,
      extraId: 'difficult_stains',
      stainKey: 'blood'
    },
    {
      id: 'pet_hair',
      emoji: '🐶',
      title: 'POILS D’ANIMAUX',
      priceDuration: '50 $ CAD · +1 h',
      category: 'pet_hair' as const,
      extraId: 'pet_hair',
      stainKey: 'pet_hair'
    }
  ];

  const handleCardClick = (card: typeof stainCards[0]) => {
    if (card.category === 'pet_hair') {
      onToggleExtra?.('pet_hair');
    } else if (card.category === 'odor') {
      onToggleExtra?.('odor_treatment');
    } else {
      // Stain cards
      if (onToggleStainType) {
        onToggleStainType(card.stainKey);
      } else {
        onToggleExtra?.('difficult_stains');
      }
    }
  };

  const isCardActive = (card: typeof stainCards[0]) => {
    if (card.category === 'pet_hair') {
      return selectedExtras.includes('pet_hair');
    }
    if (card.category === 'odor') {
      return selectedExtras.includes('odor_treatment');
    }
    // Stain category
    if (selectedStainTypes && selectedStainTypes.length > 0) {
      return selectedStainTypes.includes(card.stainKey);
    }
    return selectedExtras.includes('difficult_stains');
  };

  return (
    <section id="taches-difficiles" className="py-10 sm:py-14 bg-[#EEF7F0] text-[#122B1E] relative border-y border-[#D5EAD9] scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="inline-block text-[11px] font-black uppercase tracking-[0.2em] text-[#15803D] bg-white px-3.5 py-1 rounded-full border border-[#BEE7CB] shadow-xs">
            {t.eyebrow}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading tracking-tight uppercase leading-tight">
            <span className="text-[#0D2818]">{t.title1} {t.title2}</span>{' '}
            <span className="text-[#16A34A]">
              {t.titleGreen}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#3E6552] font-medium leading-relaxed max-w-lg mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* 6 Contamination Cards Grid - Equal style, size & structure */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-3.5 mb-6">
          {stainCards.map((card) => {
            const active = isCardActive(card);
            const isOdor = card.category === 'odor';
            const odorQty = Math.max(1, extraQuantities['odor_treatment'] || 1);

            return (
              <div 
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`bg-white rounded-2xl p-4 border transition-all duration-200 flex flex-col items-center text-center justify-between group shadow-xs cursor-pointer select-none ${
                  active
                    ? 'border-[#16A34A] ring-2 ring-[#16A34A] bg-[#F4FAF6] shadow-sm scale-[1.01]'
                    : 'border-[#D5EAD9] hover:border-[#16A34A] hover:shadow-md'
                }`}
              >
                {/* Top Section: Icon & Active Indicator */}
                <div className="w-full flex flex-col items-center space-y-3">
                  <div className="relative">
                    {/* Round Green Outlined Icon */}
                    <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 border-[#16A34A] flex items-center justify-center text-xl sm:text-2xl transition-all shrink-0 shadow-xs ${
                      active ? 'bg-[#DCF2E2] scale-105' : 'bg-[#EAF6EE] group-hover:bg-[#DCF2E2]'
                    }`}>
                      <span>{card.emoji}</span>
                    </div>

                    {/* Active Checkmark Pill */}
                    {active && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Title & Exact Price / Duration Dedicated Line */}
                  <div className="space-y-1 w-full">
                    <h3 className="text-xs sm:text-sm font-black text-[#0D2818] uppercase tracking-tight leading-tight">
                      {card.title}
                    </h3>
                    
                    {/* Dedicated Price & Time Line in French */}
                    <div className="text-[11px] font-mono font-bold text-[#15803D] bg-white py-1 px-2 rounded-lg border border-[#D5EAD9] inline-block shadow-2xs">
                      {card.priceDuration}
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Action Button / Stepper */}
                <div className="w-full pt-3 mt-2 border-t border-[#EAF2EC]">
                  {active && isOdor ? (
                    <div 
                      className="flex items-center justify-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (odorQty <= 1) {
                            onToggleExtra?.('odor_treatment');
                          } else {
                            onUpdateExtraQuantity?.('odor_treatment', odorQty - 1);
                          }
                        }}
                        className="w-6 h-6 rounded bg-white border border-[#BEE7CB] text-[#15803D] font-bold flex items-center justify-center hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
                        aria-label="Diminuer interventions"
                      >
                        <Minus className="w-3 h-3 stroke-[3]" />
                      </button>
                      <span className="font-mono font-bold text-xs text-[#0D2818] min-w-[20px] text-center">
                        {odorQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateExtraQuantity?.('odor_treatment', odorQty + 1)}
                        className="w-6 h-6 rounded bg-white border border-[#BEE7CB] text-[#15803D] font-bold flex items-center justify-center hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
                        aria-label="Augmenter interventions"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                  ) : (
                    <div className={`text-[11px] font-bold py-1 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      active 
                        ? 'bg-[#16A34A] text-white' 
                        : 'bg-[#EAF6EE] text-[#15803D] group-hover:bg-[#16A34A] group-hover:text-white'
                    }`}>
                      {active ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>{t.btnAdded}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>{t.btnAdd}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Real-time synchronization banner */}
        <div className="max-w-3xl mx-auto mb-4 p-3 rounded-xl bg-white border border-[#BEE7CB] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs text-[#15803D] font-medium text-center sm:text-left">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] shrink-0 animate-pulse" />
            <span>{t.syncedNote}</span>
          </div>
          {onScrollToCalculator && (
            <button
              type="button"
              onClick={onScrollToCalculator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAF6EE] hover:bg-[#16A34A] text-[#15803D] hover:text-white text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 border border-[#BEE7CB]"
            >
              <span>{t.btnSeeEstimate}</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Professional Responsible Disclaimer Card */}
        <div className="max-w-3xl mx-auto p-3.5 sm:p-4 rounded-xl bg-white border border-[#D5EAD9] flex items-start gap-3 shadow-xs">
          <Info className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
          <p className="text-xs sm:text-[13px] text-[#3E6552] leading-relaxed">
            {t.disclaimer}
          </p>
        </div>

      </div>
    </section>
  );
};
