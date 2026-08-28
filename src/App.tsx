import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PricingPackages } from './components/PricingPackages';
import { ResidentialSection } from './components/ResidentialSection';
import { CommercialTruckSection } from './components/CommercialTruckSection';
import { CostCalculator } from './components/CostCalculator';
import { ProcessSection } from './components/ProcessSection';
import { ReviewsSection } from './components/ReviewsSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { StickyContactBar } from './components/StickyContactBar';
import { BookingModal } from './components/BookingModal';
import { QuickCallbackModal } from './components/QuickCallbackModal';
import { WriteReviewModal } from './components/WriteReviewModal';
import { 
  AutoCalculatorState, 
  Language, 
  VehicleCategory,
  BookingCart,
  CartItem,
  AutoReviewItem
} from './types';
import { DETAILING_PACKAGES } from './data/dynastieData';
import { createDefaultCart, calculateCartSummary } from './services/squareBookings';
import { calculateServicePrice } from './config/promotions';

export function App() {
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  
  const [activeCategoryTab, setActiveCategoryTab] = useState<'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck'>('auto');
  
  // Unified cart state across the entire session
  const [cart, setCart] = useState<BookingCart>(createDefaultCart);

  // Custom calculator state passed to booking modal
  const [activeCalculatorState, setActiveCalculatorState] = useState<AutoCalculatorState>({
    vehicleCategory: 'suv',
    packageId: 'interieur_exterieur_complet',
    feetLength: 22,
    selectedExtras: ['poils_animaux'],
    serviceLocation: 'mobile',
    frequencyDiscount: 'once'
  });
  const [activeEstimatedPrice, setActiveEstimatedPrice] = useState<number>(199);

  const handleOpenBooking = () => {
    setIsBookingOpen(true);
  };

  const handleOpenCallback = () => {
    setIsCallbackOpen(true);
  };

  const handleOpenWriteReview = () => {
    setIsWriteReviewOpen(true);
  };

  const handleSelectPackageFromCards = (pkgId: string, category: VehicleCategory) => {
    setActiveCalculatorState(prev => ({
      ...prev,
      packageId: pkgId,
      vehicleCategory: category
    }));

    const pkg = DETAILING_PACKAGES.find(p => p.id === pkgId) || DETAILING_PACKAGES[1];
    const catKey = category as 'auto' | 'suv' | 'truck_van';
    const rawPrice = pkg.prices[catKey] || pkg.prices.auto;
    const priceInfo = calculateServicePrice(rawPrice, category);
    const price = priceInfo.finalPrice;
    const catLabel = {
      fr: category === 'auto' ? 'Auto / Berline' : category === 'suv' ? 'VUS / SUV' : 'Camionnette / Van',
      ua: category === 'auto' ? 'Легкове авто / Седан' : category === 'suv' ? 'Кросовер / VUS' : 'Пікап / Вен',
      en: category === 'auto' ? 'Car / Sedan' : category === 'suv' ? 'SUV / Crossover' : 'Truck / Van'
    };

    // Update auto package item in cart while preserving extras
    const nonAutoItems = cart.items.filter(it => it.category !== 'auto');
    const autoItem: CartItem = {
      id: `${pkg.id}_${category}`,
      category: 'auto',
      name: pkg.title,
      details: catLabel,
      quantity: 1,
      unitPrice: price,
      totalPrice: price
    };

    const newCart = calculateCartSummary([autoItem, ...nonAutoItems], 'auto');
    setCart(newCart);
    setActiveEstimatedPrice(newCart.totalPrice);
    setIsBookingOpen(true);
  };

  const handleSelectServiceFromSection = (serviceItem: any, category: 'furniture' | 'carpet' | 'mattress') => {
    const cartItem: CartItem = {
      id: serviceItem.id,
      category,
      name: serviceItem.name,
      details: {
        fr: category === 'furniture' ? 'Meuble / Divan' : category === 'carpet' ? 'Tapis / Moquette' : 'Matelas',
        ua: category === 'furniture' ? 'Меблі / Диван' : category === 'carpet' ? 'Килим' : 'Матрац',
        en: category === 'furniture' ? 'Furniture / Sofa' : category === 'carpet' ? 'Carpet' : 'Mattress'
      },
      quantity: 1,
      unitPrice: serviceItem.price,
      totalPrice: serviceItem.price
    };

    const newCart = calculateCartSummary([cartItem], category);
    setCart(newCart);
    setActiveEstimatedPrice(newCart.totalPrice);
    setIsBookingOpen(true);
  };

  const handleOpenBookingWithCart = (newCart: BookingCart, state: AutoCalculatorState) => {
    setCart(newCart);
    setActiveCalculatorState(state);
    setActiveEstimatedPrice(newCart.totalPrice);
    setIsBookingOpen(true);
  };

  const handleOpenBookingWithDetails = (state: AutoCalculatorState, estimatedPrice: number) => {
    setActiveCalculatorState(state);
    setActiveEstimatedPrice(estimatedPrice);
    setIsBookingOpen(true);
  };

  const scrollToCalculator = (tab?: 'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck') => {
    if (tab) {
      setActiveCategoryTab(tab);
    }
    const el = document.getElementById('calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070B08] text-white flex flex-col selection:bg-[#22C55E] selection:text-black">
      
      {/* Top Fixed Header with MaxExpert360 Branding */}
      <Header 
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenBooking={handleOpenBooking}
        onOpenCallback={handleOpenCallback}
        onOpenWriteReview={handleOpenWriteReview}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        
        {/* Dynamic Hero Banner with Emerald Accents & Phone 873-657-5102 */}
        <Hero 
          currentLang={currentLang}
          onOpenBooking={handleOpenBooking}
          onOpenCalculator={scrollToCalculator}
          onOpenWriteReview={handleOpenWriteReview}
        />

        {/* TOP PRIORITY: Interactive Booking Configurator & Instant Price Calculator */}
        <CostCalculator 
          currentLang={currentLang}
          activeCategoryTab={activeCategoryTab}
          onCategoryTabChange={setActiveCategoryTab}
          onOpenBookingWithCart={handleOpenBookingWithCart}
          onOpenBookingWithDetails={handleOpenBookingWithDetails}
          onCartChange={setCart}
        />

        {/* 1. Automotive Packages (Express 99/119/139, Complet 149/179/209, Remise à Neuf 199/239/269) */}
        <PricingPackages 
          currentLang={currentLang}
          onSelectPackage={handleSelectPackageFromCards}
        />

        {/* 2. Residential Section: Sofas (from 70$), Carpets (0.30$/sq.ft), Mattresses (80$-150$), Stairs (120$) */}
        <ResidentialSection 
          currentLang={currentLang}
          onOpenBooking={handleOpenBooking}
          onOpenCalculator={() => scrollToCalculator('furniture')}
          onSelectService={handleSelectServiceFromSection}
        />

        {/* 3. Commercial & Heavy Trucks Section (Sleeper cab 220$, RVs 180$, Fleets) */}
        <CommercialTruckSection 
          currentLang={currentLang}
          onOpenBooking={handleOpenBooking}
          onOpenCalculator={() => scrollToCalculator('truck')}
        />

        {/* 4. 4-Step Mobile At-Home Process */}
        <ProcessSection 
          currentLang={currentLang}
          onOpenBooking={handleOpenBooking}
        />

        {/* 7. Verified Client Reviews in Drummondville */}
        <ReviewsSection 
          currentLang={currentLang}
          onOpenWriteReview={handleOpenWriteReview}
        />

        {/* 8. FAQ Accordion */}
        <FaqSection 
          currentLang={currentLang}
          onOpenCallback={handleOpenCallback}
        />

        {/* 9. Contact Coordinates (873-657-5102, Facebook, Drummondville) & Quote Form */}
        <ContactSection 
          currentLang={currentLang}
        />

      </main>

      {/* Footer with MaxLogo & Coordinates */}
      <Footer currentLang={currentLang} />

      {/* Floating Bottom Quick Action Bar */}
      <StickyContactBar 
        currentLang={currentLang}
        onOpenBooking={handleOpenBooking}
        onOpenCallback={handleOpenCallback}
      />

      {/* Multi-Step Mobile Booking & Quote Modal */}
      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        currentLang={currentLang}
        initialCart={cart}
        onCartUpdate={setCart}
        initialState={activeCalculatorState}
        initialEstimatedPrice={activeEstimatedPrice}
      />

      {/* 30-Minute Fast Callback Request Modal */}
      <QuickCallbackModal 
        isOpen={isCallbackOpen}
        onClose={() => setIsCallbackOpen(false)}
        currentLang={currentLang}
      />

      {/* Write Client Review Modal */}
      <WriteReviewModal 
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        currentLang={currentLang}
        onReviewSubmitted={(newRev: AutoReviewItem) => {
          // Broadcast so ReviewsSection updates instantly
          window.dispatchEvent(new CustomEvent('new_review_submitted', { detail: newRev }));
        }}
      />

    </div>
  );
}

export default App;
