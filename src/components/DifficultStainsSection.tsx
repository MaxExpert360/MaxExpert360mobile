import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { Language } from '../types';

interface DifficultStainsSectionProps {
  currentLang: Language;
  onOpenBooking?: () => void;
}

export const DifficultStainsSection: React.FC<DifficultStainsSectionProps> = ({
  currentLang
}) => {
  const t = {
    fr: {
      eyebrow: 'TRAITEMENT SPÉCIFIQUE EN PROFONDEUR',
      title1: 'DES TACHES',
      title2: 'DIFFICILES ?',
      titleGreen: 'ON S’EN OCCUPE !',
      subtitle: 'Des solutions efficaces et écologiques pour vos plus gros défis de nettoyage.',
      disclaimer: 'Chaque type de tissu et de cuir réagit différemment selon la nature et l\'ancienneté de la tache. Nous utilisons les détachants enzymatiques professionnels les plus avancés et l\'extraction thermique pour estomper ou éliminer les dépôts sans abîmer les fibres.',
      stains: [
        {
          emoji: '❄️',
          label: 'Traces de sel',
          sub: '+ 25 $'
        },
        {
          emoji: '🐾',
          label: 'Urine et odeurs',
          sub: 'Neutralisant enzymatique'
        },
        {
          emoji: '☕',
          label: 'Café / chocolat',
          sub: 'Extraction tanins'
        },
        {
          emoji: '💧',
          label: 'Graisse / huile',
          sub: 'Dégraissant actif'
        },
        {
          emoji: '🩹',
          label: 'Sang / maquillage',
          sub: 'Dissolvant ciblé'
        },
        {
          emoji: '🐶',
          label: 'Poils d’animaux',
          sub: 'Brossage & aspiration'
        }
      ]
    },
    ua: {
      eyebrow: 'СПЕЦІАЛІЗОВАНЕ ВИВЕДЕННЯ ЗАБРУДНЕНЬ',
      title1: 'СКЛАДНІ',
      title2: 'ПЛЯМИ?',
      titleGreen: 'МИ ПОДБАЄМО ПРО ЦЕ!',
      subtitle: 'Ефективні екологічні рішення для найскладніших випадків.',
      disclaimer: 'Кожен тип волокна реагує індивідуально залежно від віку плями. Ми застосовуємо передові ензимні препарати та термо-екстракцію для максимального усунення забруднень без пошкодження структури тканини.',
      stains: [
        {
          emoji: '❄️',
          label: 'Сліди солі',
          sub: '+ 25 $'
        },
        {
          emoji: '🐾',
          label: 'Сеча та запахи',
          sub: 'Ензимна нейтралізація'
        },
        {
          emoji: '☕',
          label: 'Кава / шоколад',
          sub: 'Екстракція танінів'
        },
        {
          emoji: '💧',
          label: 'Жир / мастило',
          sub: 'Активне знежирення'
        },
        {
          emoji: '🩹',
          label: 'Кров / косметика',
          sub: 'Цільове розщеплення'
        },
        {
          emoji: '🐶',
          label: 'Шерсть тварин',
          sub: 'Механічне видалення'
        }
      ]
    },
    en: {
      eyebrow: 'DEEP TARGETED STAIN TREATMENT',
      title1: 'TOUGH',
      title2: 'STAINS?',
      titleGreen: 'WE HANDLE THEM!',
      subtitle: 'Effective, specialized eco solutions for your toughest cleaning challenges.',
      disclaimer: 'Different fabrics react uniquely depending on the age and nature of the deposit. We use industrial enzymatic chemistry and commercial hot-water extraction to break down and lift stubborn stains safely.',
      stains: [
        {
          emoji: '❄️',
          label: 'Winter salt marks',
          sub: '+ $25'
        },
        {
          emoji: '🐾',
          label: 'Pet urine & odors',
          sub: 'Enzyme neutralizer'
        },
        {
          emoji: '☕',
          label: 'Coffee / chocolate',
          sub: 'Tannin extraction'
        },
        {
          emoji: '💧',
          label: 'Grease / motor oil',
          sub: 'Active degreaser'
        },
        {
          emoji: '🩹',
          label: 'Blood / cosmetics',
          sub: 'Targeted formula'
        },
        {
          emoji: '🐶',
          label: 'Pet hair & dander',
          sub: 'Deep mechanical lift'
        }
      ]
    }
  }[currentLang];

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

        {/* 6 Round Green Outlined Icons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5 mb-6">
          {t.stains.map((stain, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#D5EAD9] hover:border-[#16A34A] hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group shadow-xs"
            >
              {/* Round Green Outlined Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-[#16A34A] bg-[#EAF6EE] flex items-center justify-center text-lg sm:text-xl group-hover:scale-105 group-hover:bg-[#DCF2E2] transition-all shrink-0 shadow-xs">
                <span>{stain.emoji}</span>
              </div>

              {/* Title & Sub */}
              <div className="space-y-0.5">
                <div className="text-xs sm:text-sm font-bold text-[#0D2818] uppercase tracking-tight leading-tight">
                  {stain.label}
                </div>
                <div className={`text-[10px] sm:text-[11px] font-mono font-bold ${stain.sub.includes('+') ? 'text-[#16A34A]' : 'text-[#4F7A64]'}`}>
                  {stain.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Professional Responsible Disclaimer Card */}
        <div className="max-w-2xl mx-auto p-3.5 sm:p-4 rounded-xl bg-white border border-[#D5EAD9] flex items-start gap-3 shadow-xs">
          <Info className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
          <p className="text-xs sm:text-[13px] text-[#3E6552] leading-relaxed">
            {t.disclaimer}
          </p>
        </div>

      </div>
    </section>
  );
};
