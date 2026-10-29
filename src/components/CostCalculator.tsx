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
  CartItem,
  ExtraDetailingService
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
import { calculateCartSummary, openOfficialSquareBooking } from '../services/squareBookings';
import { formatDurationLocalized, formatSingleDuration } from '../utils/durationFormatter';
import { 
  AUTO_LAUNCH_PROMO, 
  isAutoPromoActive, 
  calculateServicePrice 
} from '../config/promotions';

interface CostCalculatorProps {
  currentLang: Language;
  onOpenBookingWithDetails?: (state: AutoCalculatorState, estimatedPrice: number) => void;
  onOpenBookingWithCart?: (cart: BookingCart, state: AutoCalculatorState) => void;
  onCartChange?: (cart: BookingCart, state?: AutoCalculatorState) => void;
  activeCategoryTab?: 'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck';
  onCategoryTabChange?: (tab: 'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck') => void;
  calcState?: AutoCalculatorState;
  onCalcStateChange?: React.Dispatch<React.SetStateAction<AutoCalculatorState>> | ((updater: (prev: AutoCalculatorState) => AutoCalculatorState) => void) | ((state: AutoCalculatorState) => void);
}

// Pure calculation helper for detailing auto packages
export function calculateAutoTotal(
  category: string,
  packageId: string,
  selectedExtras: string[] = [],
  extraQuantities: Record<string, number> = {}
) {
  const selectedPkg = DETAILING_PACKAGES.find(p => p.id === packageId) || DETAILING_PACKAGES[1];
  const vehicleKey: 'auto' | 'suv' | 'truck_van' = (category === 'suv' || category === 'truck_van') ? category : 'auto';
  const basePrice = selectedPkg.prices[vehicleKey] ?? selectedPkg.prices.auto;

  // Deduplicate extras to prevent duplicate counting
  const uniqueExtraIds = Array.from(new Set(selectedExtras));
  const extrasList = uniqueExtraIds
    .map(extraId => EXTRA_SERVICES.find(e => e.id === extraId))
    .filter(Boolean) as ExtraDetailingService[];

  const extrasSum = extrasList.reduce((sum, extra) => {
    const qty = Math.max(1, extraQuantities[extra.id] || 1);
    return sum + (extra.price * qty);
  }, 0);

  const extraMinutes = extrasList.reduce((sum, extra) => {
    const qty = Math.max(1, extraQuantities[extra.id] || 1);
    const durHours = extra.durationHours ?? 1;
    return sum + Math.round(durHours * 60 * qty);
  }, 0);

  const baseMinutesRange = selectedPkg.id === 'express'
    ? { min: 90, max: 120 }
    : selectedPkg.id === 'remise_a_neuf'
    ? { min: 240, max: 360 }
    : { min: 180, max: 240 };

  const totalMinMinutes = baseMinutesRange.min + extraMinutes;
  const totalMaxMinutes = baseMinutesRange.max + extraMinutes;

  return {
    selectedPkg,
    vehicleKey,
    basePrice,
    extrasSum,
    extraMinutes,
    extraHours: extraMinutes / 60,
    extrasList,
    totalPrice: basePrice + extrasSum,
    durationMinutesRange: { min: totalMinMinutes, max: totalMaxMinutes },
    durationHoursRange: { min: totalMinMinutes / 60, max: totalMaxMinutes / 60 },
    duration: {
      fr: formatDurationLocalized(totalMinMinutes, totalMaxMinutes, 'fr'),
      ua: formatDurationLocalized(totalMinMinutes, totalMaxMinutes, 'ua'),
      en: formatDurationLocalized(totalMinMinutes, totalMaxMinutes, 'en')
    }
  };
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  currentLang,
  onOpenBookingWithDetails,
  onOpenBookingWithCart,
  onCartChange,
  activeCategoryTab,
  onCategoryTabChange,
  calcState: propCalcState,
  onCalcStateChange
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck'>('auto');
  const activeTab = activeCategoryTab || internalActiveTab;
  
  const handleTabSelect = (tab: 'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck') => {
    setInternalActiveTab(tab);
    if (onCategoryTabChange) {
      onCategoryTabChange(tab);
    }
  };

  // Auto state (internal or controlled via props)
  const [internalCalcState, setInternalCalcState] = useState<AutoCalculatorState>({
    vehicleCategory: 'suv',
    packageId: 'complet',
    feetLength: 22,
    selectedExtras: [],
    extraQuantities: {},
    serviceLocation: 'mobile',
    frequencyDiscount: 'once'
  });

  const calcState = propCalcState || internalCalcState;

  const setCalcState = (updater: (prev: AutoCalculatorState) => AutoCalculatorState) => {
    if (onCalcStateChange) {
      (onCalcStateChange as any)(updater);
    } else {
      setInternalCalcState(updater);
    }
  };

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
      subtitle: 'Sélectionnez ce que vous souhaitez faire nettoyer pour obtenir une estimation instantanée.',
      tabAuto: '🚗 Auto',
      tabFurniture: '🛋️ Sofa',
      tabCarpet: '🟫 Tapis',
      tabMattress: '🛏️ Matelas',
      tabTruck: '🚛 Camion',
      step1Auto: '1. Catégorie de véhicule',
      step2Auto: '2. Choix du forfait',
      step3Extras: 'Options et suppléments',
      catAuto: 'Auto / Berline',
      catSuv: 'VUS / SUV',
      catTruckVan: 'Camionnette / Van',
      carpetSlider: 'Superficie du tapis (pi²) à 0,30 $/pi² :',
      stairsLabel: "Marches d'escalier moquettées (6,00 $ / marche - marches et contremarches) :",
      summaryTitle: 'Votre estimation instantanée',
      selectedPackageLabel: 'Forfait sélectionné',
      packagePriceLabel: 'Prix du forfait',
      selectedOptionsLabel: 'Options sélectionnées',
      noOptionsLabel: 'Aucune option sélectionnée',
      totalEstimated: 'Prix total estimé :',
      estimatedTime: 'Durée totale estimée :',
      btnBookThis: 'Réserver un rendez-vous',
      btnQuote: 'Obtenir une soumission',
      btnModify: 'Modifier ma sélection',
      minNotice: 'Déplacement local inclus à Drummondville • Sans acompte',
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
      stairsLabel: 'Килимові сходинки (6,00 $ за сходинку - сходинки та підсходинки) :',
      summaryTitle: 'Ваш Розрахунок Вартості',
      selectedPackageLabel: 'Обраний пакет',
      packagePriceLabel: 'Вартість пакета',
      selectedOptionsLabel: 'Обрані опції',
      noOptionsLabel: 'Опції не обрано',
      totalEstimated: 'Разом до сплати :',
      estimatedTime: 'Орієнтовний час :',
      btnBookThis: 'Забронювати замовлення',
      btnQuote: 'Отримати кошторис',
      btnModify: 'Змінити вибір',
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
      step3Extras: 'Options and Add-ons',
      catAuto: 'Car / Sedan',
      catSuv: 'SUV / Crossover',
      catTruckVan: 'Truck / Van',
      carpetSlider: 'Carpet area (sq.ft) at $0.30/sq.ft :',
      stairsLabel: 'Carpeted stairs ($6.00 / step - steps and risers) :',
      summaryTitle: 'Your Instant Estimate',
      selectedPackageLabel: 'Selected Package',
      packagePriceLabel: 'Package Price',
      selectedOptionsLabel: 'Selected Options',
      noOptionsLabel: 'No options selected',
      totalEstimated: 'Estimated Total :',
      estimatedTime: 'Estimated Total Duration :',
      btnBookThis: 'Book an Appointment',
      btnQuote: 'Get an Instant Quote',
      btnModify: 'Modify Selection',
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

    let selectedExtrasList: ExtraDetailingService[] = [];

    if (activeTab === 'auto') {
      const autoData = calculateAutoTotal(
        calcState.vehicleCategory,
        calcState.packageId,
        calcState.selectedExtras,
        calcState.extraQuantities || {}
      );
      mainName = autoData.selectedPkg.title[currentLang];
      basePrice = autoData.basePrice;
      duration = autoData.duration[currentLang];
      extrasSum = autoData.extrasSum;
      selectedExtrasList = autoData.extrasList;
    } else if (activeTab === 'furniture') {
      mainName = currentLang === 'fr' ? 'Nettoyage Meubles Rembourrés' : currentLang === 'ua' ? 'Хімчистка мʼяких меблів' : 'Upholstered Furniture Cleaning';
      basePrice = Object.entries(selectedFurniture).reduce((sum, [id, qty]) => {
        const item = FURNITURE_SERVICES.find(f => f.id === id);
        const quantity = Number(qty) || 0;
        return sum + (item ? item.price * quantity : 0);
      }, 0);
      duration = currentLang === 'fr' ? '1 h 30 min à 3 h' : '1.5 - 3 h';
    } else if (activeTab === 'carpet') {
      mainName = currentLang === 'fr' ? 'Nettoyage Tapis & Escaliers' : currentLang === 'ua' ? 'Хімчистка килимів та сходів' : 'Carpet & Stairs Deep Extraction';
      const carpetCost = Math.round(carpetSqFt * 0.30 * 100) / 100;
      const stairsCost = Math.round(carpetStairsCount * 6.00 * 100) / 100;
      basePrice = Math.round((carpetCost + stairsCost) * 100) / 100;
      duration = currentLang === 'fr' ? '1 h à 2 h 30 min' : '1 - 2.5 h';
    } else if (activeTab === 'mattress') {
      mainName = currentLang === 'fr' ? 'Désinfection & Nettoyage Matelas' : currentLang === 'ua' ? 'Хімчистка та дезінфекція матраців' : 'Mattress Deep Sanitization';
      basePrice = Object.entries(selectedMattress).reduce((sum, [id, qty]) => {
        const item = MATTRESS_SERVICES.find(m => m.id === id);
        const quantity = Number(qty) || 0;
        return sum + (item ? item.price * quantity : 0);
      }, 0);
      duration = currentLang === 'fr' ? '1 h à 2 h' : '1 - 2 h';
    } else if (activeTab === 'truck') {
      const truckItem = TRUCK_RV_SERVICES.find(t => t.id === selectedTruckId) || TRUCK_RV_SERVICES[0];
      mainName = truckItem.name[currentLang];
      basePrice = truckItem.id === 'truck_sleeper' ? 220 : truckItem.id === 'truck_daycab' ? 140 : 180;
      duration = currentLang === 'fr' ? '2 h 30 min à 4 h' : '2.5 - 4 h';
    }

    const calculatedTotal = basePrice + extrasSum;
    const finalDisplayTotal = calculatedTotal;
    const hasMinApplied = false;

    return {
      mainName,
      basePrice,
      extrasSum,
      selectedExtrasList,
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
      const autoData = calculateAutoTotal(
        calcState.vehicleCategory,
        calcState.packageId,
        calcState.selectedExtras,
        calcState.extraQuantities || {}
      );
      const catLabel = {
        fr: calcState.vehicleCategory === 'auto' ? 'Auto / Berline' : calcState.vehicleCategory === 'suv' ? 'VUS / SUV' : 'Camionnette / Van',
        ua: calcState.vehicleCategory === 'auto' ? 'Легкове авто / Седан' : calcState.vehicleCategory === 'suv' ? 'Кросовер / VUS' : 'Пікап / Вен',
        en: calcState.vehicleCategory === 'auto' ? 'Car / Sedan' : calcState.vehicleCategory === 'suv' ? 'SUV / Crossover' : 'Truck / Van'
      };

      items.push({
        id: `${autoData.selectedPkg.id}_${calcState.vehicleCategory}`,
        category: 'auto',
        name: autoData.selectedPkg.title,
        details: catLabel,
        quantity: 1,
        unitPrice: autoData.basePrice,
        totalPrice: autoData.basePrice
      });

      const uniqueExtraIds = Array.from(new Set(calcState.selectedExtras));
      uniqueExtraIds.forEach(extraId => {
        const extra = EXTRA_SERVICES.find(e => e.id === extraId);
        if (extra) {
          const qty = Math.max(1, calcState.extraQuantities?.[extra.id] || 1);
          items.push({
            id: extra.id,
            category: 'extra',
            name: extra.name,
            details: {
              fr: extra.unit.fr,
              ua: extra.unit.ua,
              en: extra.unit.en
            },
            quantity: qty,
            unitPrice: extra.price,
            totalPrice: extra.price * qty
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
        const stairsTotal = Math.round(carpetStairsCount * 6.00 * 100) / 100;
        items.push({
          id: 'carpet_stairs',
          category: 'carpet',
          name: {
            fr: "Marches d'escalier moquettées",
            ua: 'Килимові сходинки',
            en: 'Carpeted stairs (steps)'
          },
          details: {
            fr: `${carpetStairsCount} marche(s) à 6,00 $/marche (marches et contremarches)`,
            ua: `${carpetStairsCount} сходинок(ки) по 6,00 $/сходинка (сходинки та підсходинки)`,
            en: `${carpetStairsCount} step(s) at $6.00/step (steps and risers)`
          },
          quantity: carpetStairsCount,
          unitPrice: 6.00,
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

  // Keep parent cart state in sync without stale calcState loop
  React.useEffect(() => {
    if (onCartChange) {
      onCartChange(currentCart);
    }
  }, [currentCart, onCartChange]);

  const handleToggleExtra = (extraId: string) => {
    setCalcState(prev => {
      const currentList = prev.selectedExtras || [];
      const exists = currentList.includes(extraId);
      const nextExtras = exists 
        ? currentList.filter(id => id !== extraId)
        : [...currentList, extraId];
      const nextQuantities = { ...(prev.extraQuantities || {}) };
      if (!exists) {
        if (!nextQuantities[extraId]) {
          nextQuantities[extraId] = 1;
        }
      } else {
        delete nextQuantities[extraId];
      }
      return {
        ...prev,
        selectedExtras: Array.from(new Set(nextExtras)),
        extraQuantities: nextQuantities
      };
    });
  };

  const handleUpdateExtraQuantity = (extraId: string, quantity: number) => {
    const cleanQty = Math.max(1, quantity);
    setCalcState(prev => ({
      ...prev,
      extraQuantities: {
        ...(prev.extraQuantities || {}),
        [extraId]: cleanQty
      }
    }));
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
                      <span className="text-[10px] font-mono text-[#16A34A] block mt-1 font-bold">dès 99 $ CAD</span>
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
                      <span className="text-[10px] font-mono text-[#16A34A] block mt-1 font-bold">dès 139 $ CAD</span>
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
                      <span className="text-[10px] font-mono text-[#16A34A] block mt-1 font-bold">dès 119 $ CAD</span>
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
                            {price} $ CAD
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
                      const isUnitBased = extra.id === 'difficult_stains' || extra.id === 'odor_treatment';
                      const qty = Math.max(1, calcState.extraQuantities?.[extra.id] || 1);
                      const totalExtraPrice = extra.price * qty;
                      const totalExtraHours = (extra.durationHours ?? 1) * qty;

                      return (
                        <div
                          key={extra.id}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isChecked
                              ? 'bg-[#EAF6EE] border-[#16A34A] text-[#0D2818] shadow-xs ring-1 ring-[#16A34A]'
                              : 'bg-white border-[#D5EAD9] text-[#3E6552] hover:border-[#16A34A]'
                          }`}
                        >
                          <div 
                            role="checkbox"
                            aria-checked={isChecked}
                            tabIndex={0}
                            onClick={() => handleToggleExtra(extra.id)}
                            onKeyDown={(e) => {
                              if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault();
                                handleToggleExtra(extra.id);
                              }
                            }}
                            className="flex items-start justify-between gap-2.5 cursor-pointer select-none"
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                                isChecked ? 'bg-[#16A34A] text-white' : 'border border-[#C6ECCF] bg-white'
                              }`}>
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-[#0D2818] leading-snug block">
                                  {extra.name[currentLang]}
                                </span>
                                <span className="text-[11px] font-mono font-bold text-[#15803D] block mt-0.5">
                                  {extra.unit[currentLang]}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stepper for unit-based items when checked */}
                          {isChecked && isUnitBased && (
                            <div className="mt-2.5 pt-2 border-t border-[#BEE7CB] flex items-center justify-between text-xs">
                              <span className="font-bold text-[#0D2818] text-[11px]">
                                {extra.id === 'difficult_stains' 
                                  ? (currentLang === 'fr' ? 'Nombre de taches :' : currentLang === 'ua' ? 'Кількість плям :' : 'Number of stains :')
                                  : (currentLang === 'fr' ? "Nombre d'interventions :" : currentLang === 'ua' ? 'Кількість процедур :' : 'Number of treatments :')}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateExtraQuantity(extra.id, qty - 1);
                                  }}
                                  className="w-6 h-6 rounded bg-white border border-[#BEE7CB] text-[#15803D] font-bold flex items-center justify-center hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
                                  aria-label="Diminuer"
                                >
                                  -
                                </button>
                                <span className="font-mono font-bold text-xs text-[#0D2818] min-w-[20px] text-center">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateExtraQuantity(extra.id, qty + 1);
                                  }}
                                  className="w-6 h-6 rounded bg-white border border-[#BEE7CB] text-[#15803D] font-bold flex items-center justify-center hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
                                  aria-label="Augmenter"
                                >
                                  +
                                </button>
                                <span className="font-mono font-bold text-[#15803D] text-[11px] ml-1 bg-white px-1.5 py-0.5 rounded border border-[#BEE7CB]">
                                  +{totalExtraPrice} $ · +{formatSingleDuration(Math.round((extra.durationHours ?? 1) * 60) * qty, currentLang)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
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
                        {(carpetStairsCount * 6.00).toFixed(2)} $
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

              <div className="space-y-2.5 text-xs">
                {/* Forfait sélectionné */}
                <div className="p-3 rounded-xl bg-white border border-[#D5EAD9] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#3E6552] font-semibold">{t.selectedPackageLabel} :</span>
                    <span className="text-[#0D2818] font-bold text-right">{calculation.mainName}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#F0F7F2] text-[11px]">
                    <span className="text-[#648B75]">{t.packagePriceLabel} :</span>
                    <span className="font-mono font-bold text-[#15803D]">{calculation.basePrice} $ CAD</span>
                  </div>
                </div>

                {/* Options sélectionnées */}
                <div className="p-3 rounded-xl bg-white border border-[#D5EAD9] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#3E6552] font-semibold">{t.selectedOptionsLabel} :</span>
                    {calculation.extrasSum > 0 ? (
                      <span className="font-mono font-bold text-[#15803D]">+{calculation.extrasSum} $ CAD</span>
                    ) : (
                      <span className="text-[11px] text-[#648B75] italic">{t.noOptionsLabel}</span>
                    )}
                  </div>
                  {calculation.selectedExtrasList && calculation.selectedExtrasList.length > 0 && (
                    <ul className="space-y-1.5 pt-1.5 border-t border-[#F0F7F2]">
                      {calculation.selectedExtrasList.map(opt => {
                        const qty = Math.max(1, calcState.extraQuantities?.[opt.id] || 1);
                        const itemTotalPrice = opt.price * qty;
                        const itemTotalMinutes = Math.round((opt.durationHours ?? 1) * 60) * qty;
                        const durBadge = `+${formatSingleDuration(itemTotalMinutes, currentLang)}`;
                        const unitName = opt.id === 'difficult_stains'
                          ? (currentLang === 'fr' 
                              ? (qty > 1 ? ` (${qty} taches)` : ' (1 tache)')
                              : currentLang === 'ua'
                              ? (qty > 1 ? ` (${qty} плям)` : ' (1 пляма)')
                              : (qty > 1 ? ` (${qty} stains)` : ' (1 stain)'))
                          : opt.id === 'odor_treatment'
                          ? (currentLang === 'fr'
                              ? (qty > 1 ? ` (${qty} interventions)` : ' (1 intervention)')
                              : currentLang === 'ua'
                              ? (qty > 1 ? ` (${qty} процедур)` : ' (1 процедура)')
                              : (qty > 1 ? ` (${qty} treatments)` : ' (1 treatment)'))
                          : (qty > 1 ? ` (${qty}x)` : '');

                        return (
                          <li key={opt.id} className="flex items-center justify-between text-[11px] text-[#0D2818]">
                            <span className="truncate pr-2 font-medium">• {opt.name[currentLang]}{unitName} :</span>
                            <span className="font-mono text-[#15803D] font-bold shrink-0">
                              +{itemTotalPrice} $ CAD <span className="text-[#648B75] font-normal">({durBadge})</span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Durée totale estimée */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#D5EAD9]">
                  <span className="text-[#3E6552] font-semibold">{t.estimatedTime}</span>
                  <span className="text-[#15803D] font-mono font-bold text-sm">{calculation.duration}</span>
                </div>
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
                      : calculation.finalDisplayTotal} $ CAD
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
