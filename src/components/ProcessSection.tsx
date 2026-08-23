import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Search, 
  Layers, 
  Sun, 
  KeyRound, 
  Flame,
  Truck,
  Droplets,
  CheckCircle2,
  Check
} from 'lucide-react';
import { Language } from '../types';

interface ProcessSectionProps {
  currentLang: Language;
  onOpenBooking: () => void;
}

export const ProcessSection: React.FC<ProcessSectionProps> = ({
  currentLang,
  onOpenBooking
}) => {
  const steps = [
    {
      num: '01',
      title: {
        fr: 'Arrivée à Domicile & Préparation',
        ua: 'Прибуття Додому та Підготовка',
        en: 'At-Home Arrival & Setup'
      },
      desc: {
        fr: 'Nous venons directement chez vous avec notre équipement professionnel. Vous vous détendez, on s\'occupe de tout.',
        ua: 'Приїжджаємо до вашого будинку з усім необхідним автономним обладнанням. Ви відпочиваєте — ми працюємо.',
        en: 'We arrive directly at your location with heavy-duty extraction machinery and supplies. You relax, we take care of everything.'
      },
      icon: Truck
    },
    {
      num: '02',
      title: {
        fr: 'Dépoussiérage & Prétraitement Taches',
        ua: 'Глибоке Знепилення та Обробка Плям',
        en: 'Deep Vacuuming & Stain Pre-Treatment'
      },
      desc: {
        fr: 'Aspiration industrielle haute puissance et application ciblée de détergents biodégradables sur les taches tenaces et odeurs.',
        ua: 'Потужне промислове знепилення та нанесення екологічних засобів проти складних плям і запахів.',
        en: 'Industrial high-lift vacuuming and targeted bio-enzyme pre-spray on stubborn stains, spills and pet odors.'
      },
      icon: Search
    },
    {
      num: '03',
      title: {
        fr: 'Injection-Extraction à Chaud',
        ua: 'Глибока Екстракція та Шампунь',
        en: 'Hot Water Deep Injection-Extraction'
      },
      desc: {
        fr: 'Nettoyage en profondeur des fibres et tissus à l\'eau chaude pour dissoudre la saleté incrustée et détruire 99.9% des bactéries.',
        ua: 'Глибоке промивання волокон під тиском гарячою водою для видалення бруду з глибини та знищення бактерій.',
        en: 'Deep hot-water fiber flush lifting deep-seated grime, dust mites and allergens without leaving sticky residues.'
      },
      icon: Droplets
    },
    {
      num: '04',
      title: {
        fr: 'Inspection Finale de Satisfaction',
        ua: 'Фінальна Перевірка та Здача',
        en: 'Final Inspection & Approval'
      },
      desc: {
        fr: 'Contrôle minutieux de la propreté avec vous. Paiement uniquement après validation complète de votre satisfaction.',
        ua: 'Ретельна перевірка результату разом із вами. Оплата тільки після того, як ви повністю задоволені чистотою.',
        en: 'Thorough quality check with you. Zero advance deposit, payment only when you are 100% satisfied.'
      },
      icon: CheckCircle2
    }
  ];

  const t = {
    fr: {
      eyebrow: 'Processus Sans Tracas',
      title: 'Comment Fonctionne Notre Service Mobile',
      subtitle: 'Une méthode éprouvée pour un résultat impeccable sans que vous ayez à quitter le confort de votre maison.'
    },
    ua: {
      eyebrow: 'Простота та Комфорт',
      title: 'Як Працює Наш Мобільний Сервіс',
      subtitle: 'Перевірений алгоритм для бездоганної чистоти без потреби кудись везти автомобіль чи меблі.'
    },
    en: {
      eyebrow: 'Hassle-Free Process',
      title: 'How Our Mobile Service Works',
      subtitle: 'A proven workflow delivering immaculate cleaning while you relax at home.'
    }
  }[currentLang];

  return (
    <section className="py-16 sm:py-20 bg-[#070B08] text-white relative border-b border-[#1A261D]">
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

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, idx) => {
            const Icon = st.icon;

            return (
              <div 
                key={idx}
                className="bg-[#0C150F] border border-[#1E3623] hover:border-[#22C55E]/60 rounded-2xl p-6 relative transition-all duration-300 flex flex-col justify-between group shadow-xl"
              >
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between border-b border-[#182C1D] pb-4">
                    <span className="font-heading text-3xl font-black text-[#22C55E]">
                      {st.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#142618] border border-[#223B27] flex items-center justify-center text-[#22C55E] group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-heading text-base font-bold text-white group-hover:text-[#86EFAC] transition-colors">
                      {st.title[currentLang]}
                    </h3>
                    <p className="text-xs text-[#9CA3AF] font-normal leading-relaxed">
                      {st.desc[currentLang]}
                    </p>
                  </div>

                </div>

                <div className="pt-4 mt-6 border-t border-[#142317] flex items-center gap-1.5 text-[11px] text-[#22C55E] font-mono font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>100% Garanti</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
