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
import { 
  AutoCalculatorState, 
  Language, 
  VehicleCategory 
} from './types';

export function App() {
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  
  const [activeCategoryTab, setActiveCategoryTab] = useState<'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck'>('auto');
  
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

  const handleSelectPackageFromCards = (pkgId: string, category: VehicleCategory) => {
    setActiveCalculatorState(prev => ({
      ...prev,
      packageId: pkgId,
      vehicleCategory: category
    }));
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
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        
        {/* Dynamic Hero Banner with Emerald Accents & Phone 873-657-5102 */}
        <Hero 
          currentLang={currentLang}
          onOpenBooking={handleOpenBooking}
          onOpenCalculator={scrollToCalculator}
        />

        {/* TOP PRIORITY: Interactive Booking Configurator & Instant Price Calculator */}
        <CostCalculator 
          currentLang={currentLang}
          activeCategoryTab={activeCategoryTab}
          onCategoryTabChange={setActiveCategoryTab}
          onOpenBookingWithDetails={handleOpenBookingWithDetails}
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
        initialState={activeCalculatorState}
        initialEstimatedPrice={activeEstimatedPrice}
      />

      {/* 30-Minute Fast Callback Request Modal */}
      <QuickCallbackModal 
        isOpen={isCallbackOpen}
        onClose={() => setIsCallbackOpen(false)}
        currentLang={currentLang}
      />

    </div>
  );
}

export default App;
