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
  VehicleCategory,
  BookingCart,
  CartItem
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
import { calculateCartSummary } from '../services/squareBookings';
import { 
  AUTO_LAUNCH_PROMO, 
  isAutoPromoActive, 
  calculateServicePrice 
} from '../config/promotions';

interface CostCalculatorProps {
  currentLang: Language;
  onOpenBookingWithDetails?: (state: AutoCalculatorState, estimatedPrice: number) => void;
  onOpenBookingWithCart?: (cart: BookingCart, state: AutoCalculatorState) => void;
  onCartChange?: (cart: BookingCart) => void;
  activeCategoryTab?: 'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck';
  onCategoryTabChange?: (tab: 'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck') => void;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  currentLang,
  onOpenBookingWithDetails,
  onOpenBookingWithCart,
  onCartChange,
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
      stairsLabel: "Marches d'escalier moquettées (5,30 $ / marche) :",
      summaryTitle: 'Votre Estimation Instantanée',
      basePackage: 'Prestation principale',
      extrasLabel: 'Options ajoutées',
      totalEstimated: 'Total estimé :',
      estimatedTime: 'Durée indicative :',
      btnBookThis: 'Réserver cette prestation',
      minNotice: 'Déplacement à Drummondville inclus • Sans frais cachés ni acompte',
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
      stairsLabel: 'Килимові сходинки (5,30 $ за сходинку) :',
      summaryTitle: 'Ваш Розрахунок Вартості',
      basePackage: 'Основна послуга',
      extrasLabel: 'Додаткові опції',
      totalEstimated: 'Разом до сплати :',
      estimatedTime: 'Орієнтовний час :',
      btnBookThis: 'Забронювати замовлення',
      minNotice: 'Виїзд по Драммондвілю включено • Без передплати та прихованих доплат',
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
      stairsLabel: 'Carpeted stairs ($5.30 / step) :',
      summaryTitle: 'Your Instant Estimate',
      basePackage: 'Main Service',
      extrasLabel: 'Selected add-ons',
      totalEstimated: 'Total Estimate :',
      estimatedTime: 'Estimated time :',
      btnBookThis: 'Book this service',
      minNotice: 'Local travel included in Drummondville • No deposit required',
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
      const rawPrice = selectedPkg.prices[vehicleKey] || selectedPkg.prices.auto;
      const priceInfo = calculateServicePrice(rawPrice, calcState.vehicleCategory);
      basePrice = priceInfo.finalPrice;
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
      const carpetCost = Math.round(carpetSqFt * 0.30 * 100) / 100;
      const stairsCost = Math.round(carpetStairsCount * 5.30 * 100) / 100;
      basePrice = Math.round((carpetCost + stairsCost) * 100) / 100;
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
    const finalDisplayTotal = calculatedTotal;
    const hasMinApplied = false;

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

  // Compute unified BookingCart
  const currentCart = useMemo<BookingCart>(() => {
    const items: CartItem[] = [];

    if (activeTab === 'auto') {
      const selectedPkg = DETAILING_PACKAGES.find(p => p.id === calcState.packageId) || DETAILING_PACKAGES[1];
      const vehicleKey = calcState.vehicleCategory as 'auto' | 'suv' | 'truck_van';
      const catLabel = {
        fr: calcState.vehicleCategory === 'auto' ? 'Auto / Berline' : calcState.vehicleCategory === 'suv' ? 'VUS / SUV' : 'Camionnette / Van',
        ua: calcState.vehicleCategory === 'auto' ? 'Легкове авто / Седан' : calcState.vehicleCategory === 'suv' ? 'Кросовер / VUS' : 'Пікап / Вен',
        en: calcState.vehicleCategory === 'auto' ? 'Car / Sedan' : calcState.vehicleCategory === 'suv' ? 'SUV / Crossover' : 'Truck / Van'
      };
      const rawPrice = selectedPkg.prices[vehicleKey] || selectedPkg.prices.auto;
      const priceInfo = calculateServicePrice(rawPrice, calcState.vehicleCategory);
      const pkgPrice = priceInfo.finalPrice;

      items.push({
        id: `${selectedPkg.id}_${calcState.vehicleCategory}`,
        category: 'auto',
        name: selectedPkg.title,
        details: catLabel,
        quantity: 1,
        unitPrice: pkgPrice,
        totalPrice: pkgPrice
      });

      calcState.selectedExtras.forEach(extraId => {
        const extra = EXTRA_SERVICES.find(e => e.id === extraId);
        if (extra) {
          items.push({
            id: extra.id,
            category: 'extra',
            name: extra.name,
            details: {
              fr: 'Option supplémentaire',
              ua: 'Додаткова опція',
              en: 'Add-on option'
            },
            quantity: 1,
            unitPrice: extra.price,
            totalPrice: extra.price
          });
        }
      });
    } else if (activeTab === 'furniture') {
      Object.entries(selectedFurniture).forEach(([id, qty]) => {
        const quantity = Number(qty) || 0;
        if (quantity > 0) {
          const item = FURNITURE_SERVICES.find(f => f.id === id);
          if (item) {
            items.push({
              id: item.id,
              category: 'furniture',
              name: item.name,
              details: {
                fr: 'Nettoyage & Extraction à l\'eau chaude',
                ua: 'Хімчистка та гаряча екстракція',
                en: 'Hot water deep extraction'
              },
              quantity,
              unitPrice: item.price,
              totalPrice: item.price * quantity
            });
          }
        }
      });
    } else if (activeTab === 'carpet') {
      if (carpetSqFt > 0) {
        const carpetCost = Math.round(carpetSqFt * 0.30);
        items.push({
          id: 'carpet_sqft',
          category: 'carpet',
          name: {
            fr: `Nettoyage Tapis & Moquette (${carpetSqFt} pi²)`,
            ua: `Хімчистка килима (${carpetSqFt} кв.фут)`,
            en: `Carpet Deep Cleaning (${carpetSqFt} sq.ft)`
          },
          details: {
            fr: `${carpetSqFt} pi² à 0,30 $/pi²`,
            ua: `${carpetSqFt} кв.ф по 0,30 $/кв.ф`,
            en: `${carpetSqFt} sq.ft at $0.30/sq.ft`
          },
          quantity: 1,
          unitPrice: carpetCost,
          totalPrice: carpetCost
        });
      }
      if (carpetStairsCount > 0) {
        const stairsTotal = Math.round(carpetStairsCount * 5.30 * 100) / 100;
        items.push({
          id: 'carpet_stairs',
          category: 'carpet',
          name: {
            fr: "Marches d'escalier moquettées",
            ua: 'Килимові сходинки',
            en: 'Carpeted stairs (steps)'
          },
          details: {
            fr: `${carpetStairsCount} marche(s) à 5,30 $/marche`,
            ua: `${carpetStairsCount} сходинок(ки) по 5,30 $/сходинка`,
            en: `${carpetStairsCount} step(s) at $5.30/step`
          },
          quantity: carpetStairsCount,
          unitPrice: 5.30,
          totalPrice: stairsTotal
        });
      }
    } else if (activeTab === 'mattress') {
      Object.entries(selectedMattress).forEach(([id, qty]) => {
        const quantity = Number(qty) || 0;
        if (quantity > 0) {
          const item = MATTRESS_SERVICES.find(m => m.id === id);
          if (item) {
            items.push({
              id: item.id,
              category: 'mattress',
              name: item.name,
              details: {
                fr: 'Désinfection & Élimination acariens',
                ua: 'Дезінфекція та захист від пилових кліщів',
                en: 'Deep sanitization & anti-mite'
              },
              quantity,
              unitPrice: item.price,
              totalPrice: item.price * quantity
            });
          }
        }
      });
    } else if (activeTab === 'truck') {
      const truckItem = TRUCK_RV_SERVICES.find(t => t.id === selectedTruckId) || TRUCK_RV_SERVICES[0];
      const truckPrice = truckItem.id === 'truck_sleeper' ? 220 : truckItem.id === 'truck_daycab' ? 140 : 180;
      items.push({
        id: truckItem.id,
        category: 'truck',
        name: truckItem.name,
        details: truckItem.description,
        quantity: 1,
        unitPrice: truckPrice,
        totalPrice: truckPrice
      });
    }

    return calculateCartSummary(items, activeTab);
  }, [activeTab, calcState, selectedFurniture, carpetSqFt, carpetStairsCount, selectedMattress, selectedTruckId]);

  // Keep parent cart state in sync
  React.useEffect(() => {
    if (onCartChange) {
      onCartChange(currentCart);
    }
  }, [currentCart, onCartChange]);

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
    if (onOpenBookingWithCart) {
      onOpenBookingWithCart(currentCart, calcState);
    } else if (onOpenBookingWithDetails) {
      onOpenBookingWithDetails(calcState, calculation.finalDisplayTotal);
    }
  };

  return (
    <section id="tarifs" className="scroll-mt-16">
      <div id="calculator" className="py-10 sm:py-14 bg-white text-[#122B1E] relative border-b border-[#D5EAD9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-[#15803D] font-mono font-bold bg-[#EAF6EE] px-3.5 py-1 rounded-full border border-[#BEE7CB] shadow-xs">
            {t.eyebrow}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-[#0D2818] tracking-tight uppercase">
            {t.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#3E6552] font-normal leading-relaxed">
            {t.subtitle}
          </p>

          {/* Animated Hand/Finger Pointing Cue */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="inline-flex items-center gap-2 bg-[#EAF6EE] border border-[#BEE7CB] px-4 py-1.5 rounded-full shadow-xs animate-pulse">
              <span className="text-xl animate-bounce select-none">👆</span>
              <span className="text-xs font-black uppercase text-[#15803D] tracking-wider">
                {currentLang === 'fr' 
                  ? 'Cliquez pour choisir votre service (Auto, Sofa, Tapis, Matelas, Camion) :' 
                  : currentLang === 'ua' 
                  ? 'Натисніть нижче, щоб обрати послугу (Auto, Sofa, Tapis, Matelas, Camion) :' 
                  : 'Click below to select your service (Auto, Sofa, Tapis, Mattress, Truck) :'}
              </span>
            </div>
          </div>

          {/* Service Category Switcher Tabs */}
          <div className="flex flex-wrap justify-center gap-2 p-2 rounded-2xl bg-[#F4FAF6] border border-[#D5EAD9] shadow-xs mt-4">
            <button
              type="button"
              onClick={() => handleTabSelect('auto')}
              className={`px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'auto'
                  ? 'bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25 scale-102 ring-2 ring-[#BEE7CB]'
                  : 'text-[#3E6552] hover:text-[#0D2818] bg-white border border-[#D5EAD9] hover:border-[#16A34A]'
              }`}
            >
              <span>{t.tabAuto}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSelect('furniture')}
              className={`px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'furniture'
                  ? 'bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25 scale-102 ring-2 ring-[#BEE7CB]'
                  : 'text-[#3E6552] hover:text-[#0D2818] bg-white border border-[#D5EAD9] hover:border-[#16A34A]'
              }`}
            >
              <span>{t.tabFurniture}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSelect('carpet')}
              className={`px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'carpet'
                  ? 'bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25 scale-102 ring-2 ring-[#BEE7CB]'
                  : 'text-[#3E6552] hover:text-[#0D2818] bg-white border border-[#D5EAD9] hover:border-[#16A34A]'
              }`}
            >
              <span>{t.tabCarpet}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSelect('mattress')}
              className={`px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'mattress'
                  ? 'bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25 scale-102 ring-2 ring-[#BEE7CB]'
                  : 'text-[#3E6552] hover:text-[#0D2818] bg-white border border-[#D5EAD9] hover:border-[#16A34A]'
              }`}
            >
              <span>{t.tabMattress}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSelect('truck')}
              className={`px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'truck'
                  ? 'bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25 scale-102 ring-2 ring-[#BEE7CB]'
                  : 'text-[#3E6552] hover:text-[#0D2818] bg-white border border-[#D5EAD9] hover:border-[#16A34A]'
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
                <div className="bg-[#F8FCF9] border border-[#D5EAD9] rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-sm sm:text-base font-black text-[#0D2818] uppercase tracking-wider flex items-center gap-2">
                      <Car className="w-4 h-4 text-[#16A34A]" />
                      <span>{t.step1Auto}</span>
                    </h3>
                    <span className="text-[11px] font-mono text-[#15803D] font-bold flex items-center gap-1">
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
                          ? 'bg-[#EAF6EE] border-[#16A34A] text-[#0D2818] font-bold shadow-xs scale-102 ring-1 ring-[#16A34A]'
                          : 'bg-white border-[#D5EAD9] text-[#3E6552] hover:text-[#0D2818] hover:border-[#16A34A]'
                      }`}
                    >
                      <span className="text-2xl block mb-1">🚗</span>
                      <span className="text-xs font-black block leading-tight text-[#0D2818]">{t.catAuto}</span>
                      <span className="text-[10px] font-mono text-[#16A34A] block mt-1 font-bold">dès 99 $</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcState(prev => ({ ...prev, vehicleCategory: 'suv' }))}
                      className={`p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        calcState.vehicleCategory === 'suv'
                          ? 'bg-[#EAF6EE] border-[#16A34A] text-[#0D2818] font-bold shadow-xs scale-102 ring-1 ring-[#16A34A]'
                          : 'bg-white border-[#D5EAD9] text-[#3E6552] hover:text-[#0D2818] hover:border-[#16A34A]'
                      }`}
                    >
                      <span className="text-2xl block mb-1">🚙</span>
                      <span className="text-xs font-black block leading-tight text-[#0D2818]">{t.catSuv}</span>
                      <span className="text-[10px] font-mono text-[#16A34A] block mt-1 font-bold">dès 119 $</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcState(prev => ({ ...prev, vehicleCategory: 'truck_van' }))}
                      className={`p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        calcState.vehicleCategory === 'truck_van'
                          ? 'bg-[#EAF6EE] border-[#16A34A] text-[#0D2818] font-bold shadow-xs scale-102 ring-1 ring-[#16A34A]'
                          : 'bg-white border-[#D5EAD9] text-[#3E6552] hover:text-[#0D2818] hover:border-[#16A34A]'
                      }`}
                    >
                      <span className="text-2xl block mb-1">🛻</span>
                      <span className="text-xs font-black block leading-tight text-[#0D2818]">{t.catTruckVan}</span>
                      <span className="text-[10px] font-mono text-[#16A34A] block mt-1 font-bold">dès 139 $</span>
                    </button>
                  </div>
                </div>

                {/* Detailing Packages */}
                <div className="bg-[#F8FCF9] border border-[#D5EAD9] rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-xs">
                  <h3 className="font-heading text-sm font-black text-[#0D2818] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#16A34A]" />
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
                              ? 'bg-[#EAF6EE] border-[#16A34A] text-[#0D2818] shadow-xs'
                              : 'bg-white border-[#D5EAD9] text-[#3E6552] hover:border-[#16A34A]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#0D2818] uppercase">{pkg.title[currentLang]}</span>
                              {pkg.popular && (
                                <span className="text-[9px] bg-[#16A34A] text-white px-2 py-0.5 rounded font-black">RECOMMANDÉ</span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#4F7A64] block mt-0.5">{pkg.tagline[currentLang]}</span>
                          </div>
                          <span className="font-mono font-black text-sm text-[#15803D] shrink-0 bg-white px-2.5 py-1 rounded border border-[#BEE7CB]">
                            {price} $
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add-ons */}
                <div className="bg-[#F8FCF9] border border-[#D5EAD9] rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-xs">
                  <h3 className="font-heading text-sm font-black text-[#0D2818] uppercase tracking-wider flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-[#16A34A]" />
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
                              ? 'bg-[#EAF6EE] border-[#16A34A] text-[#0D2818]'
                              : 'bg-white border-[#D5EAD9] text-[#3E6552]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded flex items-center justify-center ${
                              isChecked ? 'bg-[#16A34A] text-white' : 'border border-[#C6ECCF]'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-bold text-[#0D2818]">{extra.name[currentLang]}</span>
                          </div>
                          <span className="text-xs font-mono text-[#15803D] font-bold">+{extra.price} $</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FURNITURE (SOFAS) */}
            {activeTab === 'furniture' && (
              <div className="bg-[#F8FCF9] border border-[#D5EAD9] rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in shadow-xs">
                <h3 className="font-heading text-sm font-black text-[#0D2818] uppercase tracking-wider flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-[#16A34A]" />
                  <span>Sélectionnez vos sofas & meubles</span>
                </h3>
                <div className="space-y-3">
                  {FURNITURE_SERVICES.map((item) => {
                    const count = selectedFurniture[item.id] || 0;
                    return (
                      <div key={item.id} className="p-3.5 rounded-xl bg-white border border-[#D5EAD9] flex items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-[#0D2818] block">{item.name[currentLang]}</span>
                          <span className="text-xs font-mono font-bold text-[#15803D]">{item.price} $ / unité</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedFurniture(prev => ({
                              ...prev,
                              [item.id]: Math.max(0, (prev[item.id] || 0) - 1)
                            }))}
                            className="w-7 h-7 rounded-lg bg-[#EAF6EE] border border-[#BEE7CB] text-[#15803D] font-bold flex items-center justify-center hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-sm text-[#0D2818]">{count}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedFurniture(prev => ({
                              ...prev,
                              [item.id]: (prev[item.id] || 0) + 1
                            }))}
                            className="w-7 h-7 rounded-lg bg-[#EAF6EE] border border-[#BEE7CB] text-[#15803D] font-bold flex items-center justify-center hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
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
              <div className="bg-[#F8FCF9] border border-[#D5EAD9] rounded-2xl p-5 sm:p-6 space-y-6 animate-fade-in shadow-xs">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#0D2818] font-bold uppercase">{t.carpetSlider}</span>
                    <span className="text-[#15803D] font-mono font-black text-sm bg-white px-3 py-1 rounded border border-[#BEE7CB]">
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
                    className="w-full cursor-pointer accent-[#16A34A]"
                  />
                  <div className="flex justify-between text-[10px] text-[#527964] font-mono">
                    <span>50 pi² (15 $)</span>
                    <span>500 pi² (150 $)</span>
                    <span>1500 pi² (450 $)</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EAF5ED] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0D2818] block">{t.stairsLabel}</span>
                    <span className="text-[11px] text-[#4F7A64]">
                      {currentLang === 'fr' 
                        ? 'Extraction complète marches & contremarches' 
                        : currentLang === 'ua' 
                        ? 'Повна хімчистка сходинок та підсходинок' 
                        : 'Full deep extraction steps & risers'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCarpetStairsCount(prev => Math.max(0, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-[#EAF6EE] border border-[#BEE7CB] text-[#15803D] font-bold flex items-center justify-center hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-sm text-[#0D2818]">{carpetStairsCount}</span>
                    <button
                      type="button"
                      onClick={() => setCarpetStairsCount(prev => prev + 1)}
                      className="w-7 h-7 rounded-lg bg-[#EAF6EE] border border-[#BEE7CB] text-[#15803D] font-bold flex items-center justify-center hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
                    >
                      +
                    </button>
                    {carpetStairsCount > 0 && (
                      <span className="text-xs font-mono font-bold text-[#15803D] bg-white px-2 py-1 rounded border border-[#BEE7CB] ml-1">
                        {(carpetStairsCount * 5.30).toFixed(2)} $
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MATTRESS */}
            {activeTab === 'mattress' && (
              <div className="bg-[#F8FCF9] border border-[#D5EAD9] rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in shadow-xs">
                <h3 className="font-heading text-sm font-black text-[#0D2818] uppercase tracking-wider flex items-center gap-2">
                  <Bed className="w-4 h-4 text-[#16A34A]" />
                  <span>Sélectionnez vos matelas à désinfecter</span>
                </h3>
                <div className="space-y-3">
                  {MATTRESS_SERVICES.map((item) => {
                    const count = selectedMattress[item.id] || 0;
                    return (
                      <div key={item.id} className="p-3.5 rounded-xl bg-white border border-[#D5EAD9] flex items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-[#0D2818] block">{item.name[currentLang]}</span>
                          <span className="text-xs font-mono font-bold text-[#15803D]">{item.price} $ / unité</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedMattress(prev => ({
                              ...prev,
                              [item.id]: Math.max(0, (prev[item.id] || 0) - 1)
                            }))}
                            className="w-7 h-7 rounded-lg bg-[#EAF6EE] border border-[#BEE7CB] text-[#15803D] font-bold flex items-center justify-center hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-sm text-[#0D2818]">{count}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedMattress(prev => ({
                              ...prev,
                              [item.id]: (prev[item.id] || 0) + 1
                            }))}
                            className="w-7 h-7 rounded-lg bg-[#EAF6EE] border border-[#BEE7CB] text-[#15803D] font-bold flex items-center justify-center hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
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
              <div className="bg-[#F8FCF9] border border-[#D5EAD9] rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in shadow-xs">
                <h3 className="font-heading text-sm font-black text-[#0D2818] uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#16A34A]" />
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
                          ? 'bg-[#EAF6EE] border-[#16A34A] text-[#0D2818] shadow-xs'
                          : 'bg-white border-[#D5EAD9] text-[#3E6552]'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-[#0D2818] block">{item.name[currentLang]}</span>
                        <span className="text-[11px] text-[#4F7A64]">{item.description[currentLang]}</span>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#15803D] shrink-0 bg-white px-2.5 py-1 rounded border border-[#BEE7CB]">
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
            <div className="bg-[#F8FCF9] border-2 border-[#16A34A] rounded-2xl p-6 sm:p-7 shadow-lg space-y-5 sticky top-28">
              
              <div className="border-b border-[#D5EAD9] pb-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#15803D] font-bold block">
                    SOUMISSION DIRECTE
                  </span>
                  <h3 className="font-heading text-lg font-black text-[#0D2818] uppercase">
                    {t.summaryTitle}
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#EAF6EE] border border-[#BEE7CB] flex items-center justify-center text-[#15803D] text-xs font-bold">
                  360°
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#D5EAD9]">
                  <span className="text-[#3E6552]">{t.basePackage} :</span>
                  <span className="text-[#0D2818] font-bold text-right">{calculation.mainName}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#D5EAD9]">
                  <span className="text-[#3E6552]">{t.estimatedTime}</span>
                  <span className="text-[#15803D] font-mono font-bold">{calculation.duration}</span>
                </div>

                {calculation.extrasSum > 0 && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#D5EAD9]">
                    <span className="text-[#3E6552]">{t.extrasLabel} :</span>
                    <span className="text-[#15803D] font-mono font-bold">+{calculation.extrasSum} $</span>
                  </div>
                )}
              </div>

              {/* Total display */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#EAF6EE] to-[#DCF2E2] border border-[#BEE7CB] flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#15803D] block font-bold">
                    {t.totalEstimated}
                  </span>
                  <span className="font-heading text-4xl font-black text-[#0D2818]">
                    {typeof calculation.finalDisplayTotal === 'number'
                      ? (calculation.finalDisplayTotal % 1 === 0
                          ? calculation.finalDisplayTotal
                          : calculation.finalDisplayTotal.toFixed(2))
                      : calculation.finalDisplayTotal} $
                  </span>
                  <span className="text-[10px] text-[#3E6552] block font-mono">
                    CAD • Déplacement local inclus
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-mono text-[#15803D] bg-white/80 px-2 py-1 rounded border border-[#BEE7CB]">
                    Sans acompte
                  </span>
                </div>
              </div>

              {/* Minimum note notice if adjusted */}
              <div className="p-2.5 rounded-lg bg-[#EAF6EE] border border-[#BEE7CB] text-[11px] text-[#15803D] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>{t.minNotice}</span>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={handleBook}
                className="w-full py-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#16A34A]/25 border border-[#16A34A]"
              >
                <span>{t.btnBookThis}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-[#527964] text-center leading-relaxed">
                {t.disclaimer}
              </p>

            </div>
          </div>

        </div>

      </div>
      </div>
    </section>
  );
};
