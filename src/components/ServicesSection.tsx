import React from 'react';
import { 
  Car, 
  Armchair, 
  Layers, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { Language } from '../types';

// High resolution images for each service category
import autoDetailingService from '../assets/images/auto_detailing_service_1789747720987.jpg';
import sofaCleaningService from '../assets/images/sofa_cleaning_service_1789747685197.jpg';
import carpetCleaningService from '../assets/images/carpet_cleaning_service_1789747708901.jpg';
import truckCabClean from '../assets/images/truck_cab_clean_1787364002946.jpg';

interface ServicesSectionProps {
  currentLang: Language;
  onSelectCategory: (category: 'auto' | 'furniture' | 'carpet' | 'mattress') => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  currentLang,
  onSelectCategory
}) => {
  const t = {
    fr: {
      eyebrow: 'SERVICE MOBILE DE NETTOYAGE',
      titleNos: 'NOS',
      titleServices: 'SERVICES',
      subtitle: 'Un intérieur plus sain, plus propre, directement chez vous à Drummondville et environs.',
      btnTarifs: 'VOIR LES TARIFS →',
      cards: [
        {
          id: 'auto',
          title: 'Nettoyage d’auto',
          description: 'Intérieur, sièges, tapis, élimination des odeurs et traces de sel.',
          category: 'auto' as const,
          icon: Car,
          image: autoDetailingService,
          tag: 'Véhicules & VUS'
        },
        {
          id: 'furniture',
          title: 'Nettoyage de meubles',
          description: 'Nettoyage en profondeur des divans et fauteuils. Taches, odeurs et poils d’animaux.',
          category: 'furniture' as const,
          icon: Armchair,
          image: sofaCleaningService,
          tag: 'Divans & Fauteuils'
        },
        {
          id: 'carpet',
          title: 'Nettoyage de tapis',
          description: 'Nettoyage professionnel des tapis et carpettes. Élimination des taches tenaces.',
          category: 'carpet' as const,
          icon: Layers,
          image: carpetCleaningService,
          tag: 'Tapis & Carpettes'
        },
        {
          id: 'mattress',
          title: 'Nettoyage de matelas',
          description: 'Nettoyage en profondeur pour éliminer taches, odeurs et allergènes.',
          category: 'mattress' as const,
          icon: Sparkles,
          image: truckCabClean,
          tag: 'Literie & Matelas'
        }
      ]
    },
    ua: {
      eyebrow: 'МОБІЛЬНИЙ КЛІНІНГОВИЙ СЕРВІС',
      titleNos: 'НАШІ',
      titleServices: 'ПОСЛУГИ',
      subtitle: 'Здоровий, свіжий та бездоганно чистий простір прямо біля вашого дому.',
      btnTarifs: 'ДИВИТИСЯ ТАРИФИ →',
      cards: [
        {
          id: 'auto',
          title: 'Хімчистка авто',
          description: 'Салон, сидіння, ковролін, усунення запахів та слідів зимової солі.',
          category: 'auto' as const,
          icon: Car,
          image: autoDetailingService,
          tag: 'Авто та кросовери'
        },
        {
          id: 'furniture',
          title: 'Хімчистка меблів',
          description: 'Глибока екстракція диванів та крісел. Плями, запахи та шерсть тварин.',
          category: 'furniture' as const,
          icon: Armchair,
          image: sofaCleaningService,
          tag: 'Дивани та крісла'
        },
        {
          id: 'carpet',
          title: 'Чистка килимів',
          description: 'Професійне очищення килимів та доріжок. Виведення стійких забруднень.',
          category: 'carpet' as const,
          icon: Layers,
          image: carpetCleaningService,
          tag: 'Килими та покриття'
        },
        {
          id: 'mattress',
          title: 'Хімчистка матраців',
          description: 'Глибока дезінфекція від плям, неприємних запахів та алергенів.',
          category: 'mattress' as const,
          icon: Sparkles,
          image: truckCabClean,
          tag: 'Матраци та текстиль'
        }
      ]
    },
    en: {
      eyebrow: 'MOBILE CLEANING SERVICE',
      titleNos: 'OUR',
      titleServices: 'SERVICES',
      subtitle: 'A healthier, fresher, cleaner interior, right at your location.',
      btnTarifs: 'VIEW PRICING →',
      cards: [
        {
          id: 'auto',
          title: 'Auto Detailing',
          description: 'Interior, seats, carpets, odor and winter salt stain removal.',
          category: 'auto' as const,
          icon: Car,
          image: autoDetailingService,
          tag: 'Cars & SUVs'
        },
        {
          id: 'furniture',
          title: 'Furniture Cleaning',
          description: 'Deep extraction cleaning for sofas and armchairs. Stains, odors and pet hair.',
          category: 'furniture' as const,
          icon: Armchair,
          image: sofaCleaningService,
          tag: 'Couches & Sofas'
        },
        {
          id: 'carpet',
          title: 'Carpet Cleaning',
          description: 'Professional cleaning for rugs and carpets. Stubborn stain treatment.',
          category: 'carpet' as const,
          icon: Layers,
          image: carpetCleaningService,
          tag: 'Rugs & Carpets'
        },
        {
          id: 'mattress',
          title: 'Mattress Sanitization',
          description: 'Deep extraction to eliminate stains, lingering odors, and allergens.',
          category: 'mattress' as const,
          icon: Sparkles,
          image: truckCabClean,
          tag: 'Beds & Mattresses'
        }
      ]
    }
  }[currentLang];

  return (
    <section id="services" className="py-10 sm:py-14 bg-[#F4FAF6] text-[#122B1E] relative scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="inline-block text-[11px] font-black uppercase tracking-[0.2em] text-[#15803D] bg-white px-3.5 py-1 rounded-full border border-[#BEE7CB] shadow-xs">
            {t.eyebrow}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading tracking-tight uppercase">
            <span className="text-[#0D2818]">{t.titleNos}</span>{' '}
            <span className="text-[#16A34A]">{t.titleServices}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#3E6552] font-medium leading-relaxed max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* 4 Equal Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
          {t.cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-[#D5EAD9] shadow-xs hover:shadow-lg hover:border-[#16A34A] transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#EAF5ED]">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md text-[#15803D] text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md border border-[#BEE7CB] shadow-xs">
                    {card.tag}
                  </div>

                  {/* Icon badge */}
                  <div className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-xl bg-[#16A34A] text-white flex items-center justify-center shadow-md">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-heading font-black text-base sm:text-lg text-[#0D2818] uppercase tracking-tight group-hover:text-[#16A34A] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#3E6552] leading-relaxed line-clamp-2">
                      {card.description}
                    </p>
                  </div>

                  {/* Green Button: VOIR LES TARIFS → */}
                  <button
                    type="button"
                    onClick={() => onSelectCategory(card.category)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#16A34A]"
                  >
                    <span>{t.btnTarifs}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
