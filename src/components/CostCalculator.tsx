import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Car, 
  Truck, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  MapPin, 
  Info,
  Calendar,
  Armchair,
  Bed,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { 
  AutoCalculatorState, 
  Language, 
  VehicleCategory 
} from '../types';
import { 
  DETAILING_PACKAGES, 
  EXTRA_SERVICES, 
  FURNITURE_SERVICES,
  CARPET_SERVICES,
  MATTRESS_SERVICES,
  TRUCK_RV_SERVICES,
  DYNASTIE_INFO 
} from '../data/dynastieData';

interface CostCalculatorProps {
  currentLang: Language;
  onOpenBookingWithDetails: (state: AutoCalculatorState, estimatedPrice: number) => void;
  activeCategoryTab?: 'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck';
  onCategoryTabChange?: (tab: 'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck') => void;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  currentLang,
  onOpenBookingWithDetails,
  activeCategoryTab,
  onCategoryTabChange
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck'>('auto');
  const activeTab = activeCategoryTab || internalActiveTab;
  
  const handleTabSelect = (tab: 'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck') => {
    setInternalActiveTab(tab);
    if (onCategoryTabChange) {
      onCategoryTabChange(tab);
    }
  };

  // Auto state
  const [calcState, setCalcState] = useState<AutoCalculatorState>({
    vehicleCategory: 'suv',
    packageId: 'interieur_exterieur_complet',
    feetLength: 22,
    selectedExtras: ['poils_animaux'],
    serviceLocation: 'mobile',
    frequencyDiscount: 'once'
  });

  // Residential state
  const [selectedFurniture, setSelectedFurniture] = useState<{ [id: string]: number }>({
    'sofa_3': 1
  });
  const [carpetSqFt, setCarpetSqFt] = useState<number>(200);
  const [carpetStairsCount, setCarpetStairsCount] = useState<number>(0);
  const [selectedMattress, setSelectedMattress] = useState<{ [id: string]: number }>({
    'queen': 1
  });
  const [selectedTruckId, setSelectedTruckId] = useState<string>('truck_sleeper');

  const t = {
    fr: {
      eyebrow: 'Transparence Totale & Prix Immédiat',
      title: 'Calculateur de Soumission en Ligne',
      subtitle: 'Sélectionnez ce que vous souhaitez faire nettoyer (Auto, Sofa, Tapis, Matelas ou Camion) pour obtenir une estimation instantanée.',
      tabAuto: '🚗 Auto',
      tabFurniture: '🛋️ Sofa',
      tabCarpet: '🟫 Tapis',
      tabMattress: '🛏️ Matelas',
      tabTruck: '🚛 Camion',
      step1Auto: '1. Catégorie de véhicule',
      step2Auto: '2. Choix du forfait',
      step3Extras: 'Options & Suppléments éventuels',
      catAuto: 'Auto / Berline',
      catSuv: 'VUS / SUV',
      catTruckVan: 'Camionnette / Van',
      carpetSlider: 'Superficie du tapis (pi²) à 0,30 $/pi² :',
      stairsLabel: 'Escalier complet avec contremarches (120 $ / escalier) :',
      summaryTitle: 'Votre Estimation Instantanée',
      basePackage: 'Prestation principale',
      extrasLabel: 'Options ajoutées',
      totalEstimated: 'Total estimé :',
      estimatedTime: 'Durée indicative :',
      btnBookThis: 'Réserver cette prestation',
      minNotice: 'Minimum de service à domicile : 100 $ (Déplacement à Drummondville inclus)',
      disclaimer: 'Paiement sans surprise après l\'inspection de votre satisfaction. Produits 100% écologiques.'
    },
    ua: {
      eyebrow: 'Повна Прозорість та Швидкий Розрахунок',
      title: 'Онлайн-Калькулятор Вартості',
      subtitle: 'Оберіть потрібну послугу (Auto, Sofa, Tapis, Matelas чи Camion) для миттєвого розрахунку вартості.',
      tabAuto: '🚗 Auto',
      tabFurniture: '🛋️ Sofa',
      tabCarpet: '🟫 Tapis',
      tabMattress: '🛏️ Matelas',
      tabTruck: '🚛 Camion',
      step1Auto: '1. Категорія автомобіля',
      step2Auto: '2. Вибір пакету',
      step3Extras: 'Додаткові опції за потреби',
      catAuto: 'Легкове авто / Седан',
      catSuv: 'Кросовер / VUS',
      catTruckVan: 'Пікап / Вен',
      carpetSlider: 'Площа килима (кв.фути) по 0,30 $/кв.ф :',
      stairsLabel: 'Килимові сходи (120 $ за сходовий проліт) :',
      summaryTitle: 'Ваш Розрахунок Вартості',
      basePackage: 'Основна послуга',
      extrasLabel: 'Додаткові опції',
      totalEstimated: 'Разом до сплати :',
      estimatedTime: 'Орієнтовний час :',
      btnBookThis: 'Забронювати замовлення',
      minNotice: 'Мінімальне замовлення з виїздом : 100 $ (Виїзд по місту включено)',
      disclaimer: 'Оплата після перевірки результату. 100% екологічні та безпечні засоби.'
    },
    en: {
      eyebrow: 'Total Transparency & Upfront Pricing',
      title: 'Online Instant Quote Calculator',
      subtitle: 'Select what you need cleaned (Auto, Sofa, Tapis, Mattress or Truck) for an instant detailed estimate.',
      tabAuto: '🚗 Auto',
      tabFurniture: '🛋️ Sofa',
      tabCarpet: '🟫 Tapis',
      tabMattress: '🛏️ Mattress',
      tabTruck: '🚛 Truck',
      step1Auto: '1. Vehicle Category',
      step2Auto: '2. Choose Package',
      step3Extras: 'Optional Add-ons & Surcharges',
      catAuto: 'Car / Sedan',
      catSuv: 'SUV / Crossover',
      catTruckVan: 'Truck / Van',
      carpetSlider: 'Carpet area (sq.ft) at $0.30/sq.ft :',
      stairsLabel: 'Full carpeted stairs ($120 / flight) :',
      summaryTitle: 'Your Instant Estimate',
      basePackage: 'Main Service',
      extrasLabel: 'Selected add-ons',
      totalEstimated: 'Total Estimate :',
      estimatedTime: 'Estimated time :',
      btnBookThis: 'Book this service',
      minNotice: 'Mobile service minimum: $100 (Drummondville local travel included)',
      disclaimer: 'Payment upon satisfaction inspection. 100% eco-friendly and pet-safe products.'
    }
  }[currentLang];

  // Calculations
  const calculation = useMemo(() => {
    let mainName = '';
    let basePrice = 0;
    let duration = '2 - 3 h';
    let extrasSum = 0;

    if (activeTab === 'auto') {
      const selectedPkg = DETAILING_PACKAGES.find(p => p.id === calcState.packageId) || DETAILING_PACKAGES[1];
      mainName = selectedPkg.title[currentLang];
      const vehicleKey = calcState.vehicleCategory as 'auto' | 'suv' | 'truck_van';
      basePrice = selectedPkg.prices[vehicleKey] || selectedPkg.prices.auto;
      duration = selectedPkg.duration[currentLang];

      extrasSum = calcState.selectedExtras.reduce((sum, extraId) => {
        const extra = EXTRA_SERVICES.find(e => e.id === extraId);
        return sum + (extra ? extra.price : 0);
      }, 0);
    } else if (activeTab === 'furniture') {
      mainName = currentLang === 'fr' ? 'Nettoyage Meubles Rembourrés' : currentLang === 'ua' ? 'Хімчистка мʼяких меблів' : 'Upholstered Furniture Cleaning';
      basePrice = Object.entries(selectedFurniture).reduce((sum, [id, qty]) => {
        const item = FURNITURE_SERVICES.find(f => f.id === id);
        const quantity = Number(qty) || 0;
        return sum + (item ? item.price * quantity : 0);
      }, 0);
      duration = '1.5 - 3 h';
    } else if (activeTab === 'carpet') {
      mainName = currentLang === 'fr' ? 'Nettoyage Tapis & Escaliers' : currentLang === 'ua' ? 'Хімчистка килимів та сходів' : 'Carpet & Stairs Deep Extraction';
      const carpetCost = Math.round(carpetSqFt * 0.30);
      const stairsCost = carpetStairsCount * 120;
      basePrice = carpetCost + stairsCost;
      duration = '1 - 2.5 h';
    } else if (activeTab === 'mattress') {
      mainName = currentLang === 'fr' ? 'Désinfection & Nettoyage Matelas' : currentLang === 'ua' ? 'Хімчистка та дезінфекція матраців' : 'Mattress Deep Sanitization';
      basePrice = Object.entries(selectedMattress).reduce((sum, [id, qty]) => {
        const item = MATTRESS_SERVICES.find(m => m.id === id);
        const quantity = Number(qty) || 0;
        return sum + (item ? item.price * quantity : 0);
      }, 0);
      duration = '1 - 2 h';
    } else if (activeTab === 'truck') {
      const truckItem = TRUCK_RV_SERVICES.find(t => t.id === selectedTruckId) || TRUCK_RV_SERVICES[0];
      mainName = truckItem.name[currentLang];
      basePrice = truckItem.id === 'truck_sleeper' ? 220 : truckItem.id === 'truck_daycab' ? 140 : 180;
      duration = '2.5 - 4 h';
    }

    const calculatedTotal = basePrice + extrasSum;
    const finalDisplayTotal = activeTab === 'auto' ? calculatedTotal : Math.max(100, calculatedTotal);
    const hasMinApplied = activeTab !== 'auto' && calculatedTotal < 100 && calculatedTotal > 0;

    return {
      mainName,
      basePrice,
      extrasSum,
      calculatedTotal,
      finalDisplayTotal,
      hasMinApplied,
      duration
    };
  }, [activeTab, calcState, selectedFurniture, carpetSqFt, carpetStairsCount, selectedMattress, selectedTruckId, currentLang]);

  const handleToggleExtra = (extraId: string) => {
    setCalcState(prev => {
      const exists = prev.selectedExtras.includes(extraId);
      return {
        ...prev,
        selectedExtras: exists 
          ? prev.selectedExtras.filter(id => id !== extraId)
          : [...prev.selectedExtras, extraId]
      };
    });
  };

  const handleBook = () => {
    onOpenBookingWithDetails(calcState, calculation.finalDisplayTotal);
  };

  return (
    <section id="calculator" className="py-16 sm:py-20 bg-[#070B08] text-white relative border-b border-[#1A261D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
          <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-[#22C55E] font-mono font-bold bg-[#112417] px-3.5 py-1 rounded-full border border-[#22C55E]/40">
            {t.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-white tracking-tight uppercase">
            {t.title}
          </h2>
          <p className="text-sm text-[#9CA3AF] font-normal leading-relaxed">
            {t.subtitle}
          </p>

          {/* Animated Hand/Finger Pointing Cue */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="inline-flex items-center gap-2 bg-[#122616] border border-[#22C55E]/60 px-4 py-2 rounded-full shadow-lg shadow-[#22C55E]/10 animate-pulse">
              <span className="text-2xl animate-bounce select-none">👆</span>
              <span className="text-xs sm:text-sm font-black uppercase text-[#86EFAC] tracking-wider">
                {currentLang === 'fr' 
                  ? 'Cliquez pour choisir votre service (Auto, Sofa, Tapis, Matelas, Camion) :' 
                  : currentLang === 'ua' 
                  ? 'Натисніть нижче, щоб обрати послугу (Auto, Sofa, Tapis, Matelas, Camion) :' 
                  : 'Click below to select your service (Auto, Sofa, Tapis, Mattress, Truck) :'}
              </span>
            </div>
          </div>

          {/* Service Category Switcher Tabs */}
          <div className="flex flex-wrap justify-center gap-2 p-2 rounded-2xl bg-[#0F1A12] border-2 border-[#1E3A23] shadow-2xl mt-4">
            <button
              type="button"
              onClick={() => handleTabSelect('auto')}
              className={`px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'auto'
                  ? 'bg-[#22C55E] text-black shadow-lg shadow-[#22C55E]/30 scale-105 ring-2 ring-white/50'
                  : 'text-[#9CA3AF] hover:text-white bg-[#132216] border border-[#1A3320] hover:border-[#22C55E]/50'
              }`}
            >
              <span>{t.tabAuto}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSelect('furniture')}
              className={`px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'furniture'
                  ? 'bg-[#22C55E] text-black shadow-lg shadow-[#22C55E]/30 scale-105 ring-2 ring-white/50'
                  : 'text-[#9CA3AF] hover:text-white bg-[#132216] border border-[#1A3320] hover:border-[#22C55E]/50'
              }`}
            >
              <span>{t.tabFurniture}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSelect('carpet')}
              className={`px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'carpet'
                  ? 'bg-[#22C55E] text-black shadow-lg shadow-[#22C55E]/30 scale-105 ring-2 ring-white/50'
                  : 'text-[#9CA3AF] hover:text-white bg-[#132216] border border-[#1A3320] hover:border-[#22C55E]/50'
              }`}
            >
              <span>{t.tabCarpet}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSelect('mattress')}
              className={`px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'mattress'
                  ? 'bg-[#22C55E] text-black shadow-lg shadow-[#22C55E]/30 scale-105 ring-2 ring-white/50'
                  : 'text-[#9CA3AF] hover:text-white bg-[#132216] border border-[#1A3320] hover:border-[#22C55E]/50'
              }`}
            >
              <span>{t.tabMattress}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSelect('truck')}
              className={`px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'truck'
                  ? 'bg-[#22C55E] text-black shadow-lg shadow-[#22C55E]/30 scale-105 ring-2 ring-white/50'
                  : 'text-[#9CA3AF] hover:text-white bg-[#132216] border border-[#1A3320] hover:border-[#22C55E]/50'
              }`}
            >
              <span>{t.tabTruck}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Configurator Interactive Box (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* TAB 1: AUTO */}
            {activeTab === 'auto' && (
              <div className="space-y-6 animate-fade-in">
                {/* Vehicle Category */}
                <div className="bg-[#0D1810] border-2 border-[#1E3623] rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Car className="w-4 h-4 text-[#22C55E]" />
                      <span>{t.step1Auto}</span>
                    </h3>
                    <span className="text-[11px] font-mono text-[#22C55E] font-bold flex items-center gap-1">
                      <span className="text-sm animate-bounce">👉</span>
                      {currentLang === 'fr' ? 'Touchez pour choisir :' : currentLang === 'ua' ? 'Оберіть модель :' : 'Select model :'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setCalcState(prev => ({ ...prev, vehicleCategory: 'auto' }))}
                      className={`p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        calcState.vehicleCategory === 'auto'
                          ? 'bg-[#18301E] border-[#22C55E] text-white font-bold shadow-lg shadow-[#22C55E]/20 scale-102 ring-1 ring-[#22C55E]'
                          : 'bg-[#112015] border-[#1C3321] text-[#9CA3AF] hover:text-white hover:border-[#22C55E]/50'
                      }`}
                    >
                      <span className="text-2xl block mb-1">🚗</span>
                      <span className="text-xs font-black block leading-tight text-white">{t.catAuto}</span>
                      <span className="text-[10px] font-mono text-[#22C55E] block mt-1">dès 99 $</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcState(prev => ({ ...prev, vehicleCategory: 'suv' }))}
                      className={`p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        calcState.vehicleCategory === 'suv'
                          ? 'bg-[#18301E] border-[#22C55E] text-white font-bold shadow-lg shadow-[#22C55E]/20 scale-102 ring-1 ring-[#22C55E]'
                          : 'bg-[#112015] border-[#1C3321] text-[#9CA3AF] hover:text-white hover:border-[#22C55E]/50'
                      }`}
                    >
                      <span className="text-2xl block mb-1">🚙</span>
                      <span className="text-xs font-black block leading-tight text-white">{t.catSuv}</span>
                      <span className="text-[10px] font-mono text-[#22C55E] block mt-1">dès 119 $</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcState(prev => ({ ...prev, vehicleCategory: 'truck_van' }))}
                      className={`p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        calcState.vehicleCategory === 'truck_van'
                          ? 'bg-[#18301E] border-[#22C55E] text-white font-bold shadow-lg shadow-[#22C55E]/20 scale-102 ring-1 ring-[#22C55E]'
                          : 'bg-[#112015] border-[#1C3321] text-[#9CA3AF] hover:text-white hover:border-[#22C55E]/50'
                      }`}
                    >
                      <span className="text-2xl block mb-1">🛻</span>
                      <span className="text-xs font-black block leading-tight text-white">{t.catTruckVan}</span>
                      <span className="text-[10px] font-mono text-[#22C55E] block mt-1">dès 139 $</span>
                    </button>
                  </div>
                </div>

                {/* Detailing Packages */}
                <div className="bg-[#0D1810] border border-[#1E3623] rounded-2xl p-5 sm:p-6 space-y-3.5">
                  <h3 className="font-heading text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#22C55E]" />
                    <span>{t.step2Auto}</span>
                  </h3>
                  <div className="space-y-2.5">
                    {DETAILING_PACKAGES.map((pkg) => {
                      const isSelected = calcState.packageId === pkg.id;
                      const price = pkg.prices[calcState.vehicleCategory as 'auto' | 'suv' | 'truck_van'] || pkg.prices.auto;

                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setCalcState(prev => ({ ...prev, packageId: pkg.id }))}
                          className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-[#162D1D] border-[#22C55E] text-white shadow-md'
                              : 'bg-[#101E14] border-[#1B3020] text-[#9CA3AF] hover:border-[#22C55E]/40'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white uppercase">{pkg.title[currentLang]}</span>
                              {pkg.popular && (
                                <span className="text-[9px] bg-[#22C55E] text-black px-1.5 py-0.5 rounded font-black">RECOMMANDÉ</span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#9CA3AF] block mt-0.5">{pkg.tagline[currentLang]}</span>
                          </div>
                          <span className="font-mono font-black text-sm text-[#22C55E] shrink-0 bg-[#0C150E] px-2.5 py-1 rounded border border-[#22C55E]/30">
                            {price} $
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add-ons */}
                <div className="bg-[#0D1810] border border-[#1E3623] rounded-2xl p-5 sm:p-6 space-y-3.5">
                  <h3 className="font-heading text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-[#22C55E]" />
                    <span>{t.step3Extras}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {EXTRA_SERVICES.map((extra) => {
                      const isChecked = calcState.selectedExtras.includes(extra.id);
                      return (
                        <button
                          key={extra.id}
                          type="button"
                          onClick={() => handleToggleExtra(extra.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            isChecked
                              ? 'bg-[#152B1B] border-[#22C55E] text-white'
                              : 'bg-[#101E14] border-[#1B3020] text-[#9CA3AF]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded flex items-center justify-center ${
                              isChecked ? 'bg-[#22C55E] text-black' : 'border border-[#333]'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-bold text-white">{extra.name[currentLang]}</span>
                          </div>
                          <span className="text-xs font-mono text-[#22C55E] font-bold">+{extra.price} $</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FURNITURE (SOFAS) */}
            {activeTab === 'furniture' && (
              <div className="bg-[#0D1810] border border-[#1E3623] rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in">
                <h3 className="font-heading text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-[#22C55E]" />
                  <span>Sélectionnez vos sofas & meubles</span>
                </h3>
                <div className="space-y-3">
                  {FURNITURE_SERVICES.map((item) => {
                    const count = selectedFurniture[item.id] || 0;
                    return (
                      <div key={item.id} className="p-3.5 rounded-xl bg-[#112115] border border-[#1C3622] flex items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-white block">{item.name[currentLang]}</span>
                          <span className="text-xs font-mono font-bold text-[#22C55E]">{item.price} $ / unité</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedFurniture(prev => ({
                              ...prev,
                              [item.id]: Math.max(0, (prev[item.id] || 0) - 1)
                            }))}
                            className="w-7 h-7 rounded-lg bg-[#182C1D] border border-[#22C55E]/40 text-white font-bold flex items-center justify-center hover:bg-[#22C55E] hover:text-black transition-colors"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-sm text-white">{count}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedFurniture(prev => ({
                              ...prev,
                              [item.id]: (prev[item.id] || 0) + 1
                            }))}
                            className="w-7 h-7 rounded-lg bg-[#182C1D] border border-[#22C55E]/40 text-white font-bold flex items-center justify-center hover:bg-[#22C55E] hover:text-black transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CARPETS & STAIRS */}
            {activeTab === 'carpet' && (
              <div className="bg-[#0D1810] border border-[#1E3623] rounded-2xl p-5 sm:p-6 space-y-6 animate-fade-in">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-bold uppercase">{t.carpetSlider}</span>
                    <span className="text-[#22C55E] font-mono font-black text-sm bg-[#112417] px-3 py-1 rounded border border-[#22C55E]/40">
                      {carpetSqFt} pi² ({Math.round(carpetSqFt * 0.30)} $)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1500"
                    step="25"
                    value={carpetSqFt}
                    onChange={(e) => setCarpetSqFt(parseInt(e.target.value))}
                    className="w-full cursor-pointer accent-[#22C55E]"
                  />
                  <div className="flex justify-between text-[10px] text-[#6B7280] font-mono">
                    <span>50 pi² (15 $)</span>
                    <span>500 pi² (150 $)</span>
                    <span>1500 pi² (450 $)</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1A3320] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{t.stairsLabel}</span>
                    <span className="text-[11px] text-[#9CA3AF]">Extraction complète marches & contremarches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCarpetStairsCount(prev => Math.max(0, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-[#182C1D] border border-[#22C55E]/40 text-white font-bold flex items-center justify-center hover:bg-[#22C55E] hover:text-black transition-colors"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-sm text-white">{carpetStairsCount}</span>
                    <button
                      type="button"
                      onClick={() => setCarpetStairsCount(prev => prev + 1)}
                      className="w-7 h-7 rounded-lg bg-[#182C1D] border border-[#22C55E]/40 text-white font-bold flex items-center justify-center hover:bg-[#22C55E] hover:text-black transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MATTRESS */}
            {activeTab === 'mattress' && (
              <div className="bg-[#0D1810] border border-[#1E3623] rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in">
                <h3 className="font-heading text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Bed className="w-4 h-4 text-[#22C55E]" />
                  <span>Sélectionnez vos matelas à désinfecter</span>
                </h3>
                <div className="space-y-3">
                  {MATTRESS_SERVICES.map((item) => {
                    const count = selectedMattress[item.id] || 0;
                    return (
                      <div key={item.id} className="p-3.5 rounded-xl bg-[#112115] border border-[#1C3622] flex items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-white block">{item.name[currentLang]}</span>
                          <span className="text-xs font-mono font-bold text-[#22C55E]">{item.price} $ / unité</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedMattress(prev => ({
                              ...prev,
                              [item.id]: Math.max(0, (prev[item.id] || 0) - 1)
                            }))}
                            className="w-7 h-7 rounded-lg bg-[#182C1D] border border-[#22C55E]/40 text-white font-bold flex items-center justify-center hover:bg-[#22C55E] hover:text-black transition-colors"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-sm text-white">{count}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedMattress(prev => ({
                              ...prev,
                              [item.id]: (prev[item.id] || 0) + 1
                            }))}
                            className="w-7 h-7 rounded-lg bg-[#182C1D] border border-[#22C55E]/40 text-white font-bold flex items-center justify-center hover:bg-[#22C55E] hover:text-black transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: TRUCKS & RVS */}
            {activeTab === 'truck' && (
              <div className="bg-[#0D1810] border border-[#1E3623] rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in">
                <h3 className="font-heading text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#22C55E]" />
                  <span>Poids Lourds & Véhicules Récréatifs</span>
                </h3>
                <div className="space-y-3">
                  {TRUCK_RV_SERVICES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedTruckId(item.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        selectedTruckId === item.id
                          ? 'bg-[#18301E] border-[#22C55E] text-white shadow-md'
                          : 'bg-[#112115] border-[#1C3622] text-[#9CA3AF]'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-white block">{item.name[currentLang]}</span>
                        <span className="text-[11px] text-[#9CA3AF]">{item.description[currentLang]}</span>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#22C55E] shrink-0 bg-[#0C150E] px-2 py-1 rounded border border-[#22C55E]/30">
                        {item.priceFrom}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right / Instant Summary Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[#0C150F] border-2 border-[#1E3A24] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 sticky top-28">
              
              <div className="border-b border-[#1A301E] pb-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#22C55E] font-bold block">
                    SOUMISSION DIRECTE
                  </span>
                  <h3 className="font-heading text-lg font-black text-white uppercase">
                    {t.summaryTitle}
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#142618] border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] text-xs font-bold">
                  360°
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#112115] border border-[#1C3622]">
                  <span className="text-[#9CA3AF]">{t.basePackage} :</span>
                  <span className="text-white font-bold text-right">{calculation.mainName}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#112115] border border-[#1C3622]">
                  <span className="text-[#9CA3AF]">{t.estimatedTime}</span>
                  <span className="text-[#22C55E] font-mono font-bold">{calculation.duration}</span>
                </div>

                {calculation.extrasSum > 0 && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#112115] border border-[#1C3622]">
                    <span className="text-[#9CA3AF]">{t.extrasLabel} :</span>
                    <span className="text-[#22C55E] font-mono font-bold">+{calculation.extrasSum} $</span>
                  </div>
                )}
              </div>

              {/* Total display */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#122618] to-[#0A160E] border border-[#22C55E]/50 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#86EFAC] block font-bold">
                    {t.totalEstimated}
                  </span>
                  <span className="font-heading text-4xl font-black text-white">
                    {calculation.finalDisplayTotal} $
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] block font-mono">
                    CAD • Déplacement local inclus
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-mono text-[#22C55E] bg-black/50 px-2 py-1 rounded border border-[#22C55E]/30">
                    Sans acompte
                  </span>
                </div>
              </div>

              {/* Minimum note notice if adjusted */}
              <div className="p-2.5 rounded-lg bg-[#0F1C13] border border-[#1B3521] text-[11px] text-[#86EFAC] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span>{t.minNotice}</span>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={handleBook}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#15803D] hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#16A34A]/30 border border-[#86EFAC]/40"
              >
                <span>{t.btnBookThis}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-[#6B7280] text-center leading-relaxed">
                {t.disclaimer}
              </p>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
