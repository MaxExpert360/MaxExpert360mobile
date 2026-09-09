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
  const [carpetLength, setCarpetLength] = useState<number>(12);
  const [carpetWidth, setCarpetWidth] = useState<number>(10);
  const [carpetSurfaceType, setCarpetSurfaceType] = useState<'room' | 'corridor' | 'rug'>('room');
  const [carpetStairsCount, setCarpetStairsCount] = useState<number>(0);
  const [carpetLandingsCount, setCarpetLandingsCount] = useState<number>(0);
  const carpetSqFt = Math.max(0, Math.round(carpetLength * carpetWidth));
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
      carpetSlider: 'Dimensions de la surface à nettoyer',
      stairsLabel: 'Escaliers — 4 $ / marche',
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
      carpetSlider: 'Розміри поверхні для чищення',
      stairsLabel: 'Сходи — 4 $ / сходинка',
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
      carpetSlider: 'Surface dimensions to clean',
      stairsLabel: 'Stairs — $4 / step',
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
      const rate = carpetSurfaceType === 'rug' ? 1.00 : 0.40;
      const areaCost = carpetSqFt > 0 ? Math.max(carpetSurfaceType === 'rug' ? 0 : 40, Math.round(carpetSqFt * rate)) : 0;
      const stairsCost = carpetStairsCount * 4;
      const landingsCost = carpetLandingsCount * 20;
      basePrice = areaCost + stairsCost + landingsCost;
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
  }, [activeTab, calcState, selectedFurniture, carpetSqFt, carpetSurfaceType, carpetStairsCount, carpetLandingsCount, selectedMattress, selectedTruckId, currentLang]);

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
        const rate = carpetSurfaceType === 'rug' ? 1.00 : 0.40;
        const carpetCost = Math.max(carpetSurfaceType === 'rug' ? 0 : 40, Math.round(carpetSqFt * rate));
        const typeLabel = carpetSurfaceType === 'room'
          ? { fr: 'Pièce complète / moquette', ua: 'Кімната / ковролін', en: 'Full room / carpet' }
          : carpetSurfaceType === 'corridor'
          ? { fr: 'Corridor / passage', ua: 'Коридор / прохід', en: 'Corridor / hallway' }
          : { fr: 'Carpette / tapis amovible', ua: 'Окремий килим', en: 'Area rug' };
        items.push({
          id: `carpet_sqft_${carpetSurfaceType}`,
          category: 'carpet',
          name: typeLabel,
          details: {
            fr: `${carpetLength} × ${carpetWidth} pi = ${carpetSqFt} pi² à ${rate.toFixed(2).replace('.', ',')} $/pi²`,
            ua: `${carpetLength} × ${carpetWidth} фут = ${carpetSqFt} кв.фут по ${rate.toFixed(2)} $/кв.фут`,
            en: `${carpetLength} × ${carpetWidth} ft = ${carpetSqFt} sq.ft at $${rate.toFixed(2)}/sq.ft`
          },
          quantity: 1,
          unitPrice: carpetCost,
          totalPrice: carpetCost
        });
      }
      if (carpetStairsCount > 0) {
        items.push({
          id: 'carpet_stairs', category: 'carpet',
          name: { fr: 'Marches d’escalier moquettées', ua: 'Килимові сходинки', en: 'Carpeted stair steps' },
          details: { fr: `${carpetStairsCount} marche(s) × 4 $`, ua: `${carpetStairsCount} сход. × 4 $`, en: `${carpetStairsCount} steps × $4` },
          quantity: carpetStairsCount, unitPrice: 4, totalPrice: 4 * carpetStairsCount
        });
      }
      if (carpetLandingsCount > 0) {
        items.push({
          id: 'carpet_landings', category: 'carpet',
          name: { fr: 'Palier d’escalier', ua: 'Сходова площадка', en: 'Stair landing' },
          details: { fr: `${carpetLandingsCount} palier(s) × 20 $`, ua: `${carpetLandingsCount} площад. × 20 $`, en: `${carpetLandingsCount} landing(s) × $20` },
          quantity: carpetLandingsCount, unitPrice: 20, totalPrice: 20 * carpetLandingsCount
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
  }, [activeTab, calcState, selectedFurniture, carpetSqFt, carpetLength, carpetWidth, carpetSurfaceType, carpetStairsCount, carpetLandingsCount, selectedMattress, selectedTruckId]);

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
              <div className="bg-[#0D1810] border border-[#1E3623] rounded-2xl p-5 sm:p-6 space-y-5 animate-fade-in">
                <div>
                  <h3 className="font-heading text-sm font-black text-white uppercase tracking-wider mb-3">{t.carpetSlider}</h3>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {(['room','corridor','rug'] as const).map(type => {
                      const labels = {
                        room: currentLang === 'fr' ? 'Pièce' : currentLang === 'ua' ? 'Кімната' : 'Room',
                        corridor: currentLang === 'fr' ? 'Corridor' : currentLang === 'ua' ? 'Коридор' : 'Corridor',
                        rug: currentLang === 'fr' ? 'Carpette' : currentLang === 'ua' ? 'Килим' : 'Area rug'
                      };
                      return <button key={type} type="button" onClick={() => setCarpetSurfaceType(type)} className={`p-2.5 rounded-xl border text-xs font-bold ${carpetSurfaceType===type?'bg-[#162D1D] border-[#22C55E] text-white':'bg-[#101E14] border-[#1B3020] text-[#9CA3AF]'}`}>{labels[type]}</button>;
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs text-[#D1D5DB]">{currentLang==='fr'?'Longueur (pi)':currentLang==='ua'?'Довжина (фут)':'Length (ft)'}
                      <input type="number" min="0" step="0.5" value={carpetLength} onChange={e=>setCarpetLength(Math.max(0,Number(e.target.value)))} className="mt-1 w-full bg-[#080E0A] rounded-xl px-3 py-2.5 text-white border border-[#203926] focus:border-[#22C55E] focus:outline-none" />
                    </label>
                    <label className="text-xs text-[#D1D5DB]">{currentLang==='fr'?'Largeur (pi)':currentLang==='ua'?'Ширина (фут)':'Width (ft)'}
                      <input type="number" min="0" step="0.5" value={carpetWidth} onChange={e=>setCarpetWidth(Math.max(0,Number(e.target.value)))} className="mt-1 w-full bg-[#080E0A] rounded-xl px-3 py-2.5 text-white border border-[#203926] focus:border-[#22C55E] focus:outline-none" />
                    </label>
                  </div>
                  <div className="mt-3 flex justify-between items-center p-3 rounded-xl bg-[#112115] border border-[#1C3622]">
                    <span className="text-xs text-[#9CA3AF]">{carpetSqFt} pi² • {carpetSurfaceType==='rug'?'1,00':'0,40'} $/pi²</span>
                    <span className="text-[#22C55E] font-mono font-black">{carpetSqFt > 0 ? Math.max(carpetSurfaceType==='rug'?0:40, Math.round(carpetSqFt*(carpetSurfaceType==='rug'?1:0.4))) : 0} $</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#1A3320] space-y-3">
                  <div className="flex items-center justify-between"><div><span className="text-xs font-bold text-white block">{t.stairsLabel}</span><span className="text-[11px] text-[#9CA3AF]">{currentLang==='fr'?'Entrez le nombre réel de marches':currentLang==='ua'?'Вкажіть точну кількість сходинок':'Enter the actual number of steps'}</span></div><input type="number" min="0" value={carpetStairsCount} onChange={e=>setCarpetStairsCount(Math.max(0,parseInt(e.target.value)||0))} className="w-20 bg-[#080E0A] rounded-xl px-3 py-2 text-center text-white border border-[#203926]" /></div>
                  <div className="flex items-center justify-between"><div><span className="text-xs font-bold text-white block">{currentLang==='fr'?'Palier — 20 $ / unité':currentLang==='ua'?'Площадка — 20 $ / шт.':'Landing — $20 each'}</span></div><input type="number" min="0" value={carpetLandingsCount} onChange={e=>setCarpetLandingsCount(Math.max(0,parseInt(e.target.value)||0))} className="w-20 bg-[#080E0A] rounded-xl px-3 py-2 text-center text-white border border-[#203926]" /></div>
                </div>
                <div className="text-[11px] text-[#9CA3AF] p-3 bg-[#0A120C] rounded-xl border border-[#1A3320]">{currentLang==='fr'?'Minimum de commande mobile : 80 $. Petite surface de moquette : minimum 40 $. Le prix final peut varier selon les taches et l’état.':currentLang==='ua'?'Мінімальне мобільне замовлення: 80 $. Мала площа ковроліну: мінімум 40 $. Фінальна ціна може змінитися через сильні плями або стан.':'Mobile order minimum: $80. Small carpeted surface minimum: $40. Final price may vary for heavy stains/condition.'}</div>
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
