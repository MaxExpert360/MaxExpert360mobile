import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { DifficultStainsSection } from './components/DifficultStainsSection';
import { AvantApresVideos } from './components/AvantApresVideos';
import { ReviewsSection } from './components/ReviewsSection';
import { CostCalculator } from './components/CostCalculator';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { StickyContactBar } from './components/StickyContactBar';
import { BookingModal } from './components/BookingModal';
import { QuickCallbackModal } from './components/QuickCallbackModal';
import { WriteReviewModal } from './components/WriteReviewModal';
import { GeminiChatModal } from './components/GeminiChatModal';
import { FloatingAiBotLauncher } from './components/FloatingAiBotLauncher';
import FacebookBanner from './components/FacebookBanner';
import { 
  AutoCalculatorState, 
  Language, 
  BookingCart 
} from './types';
import { createDefaultCart, openOfficialSquareBooking } from './services/squareBookings';

export function App() {
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [activeCategoryTab, setActiveCategoryTab] = useState<'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck'>('auto');
  
  // Unified cart state across the entire session
  const [cart, setCart] = useState<BookingCart>(createDefaultCart);

  // Custom calculator state passed to booking modal
  const [activeCalculatorState, setActiveCalculatorState] = useState<AutoCalculatorState>({
    vehicleCategory: 'suv',
    packageId: 'complet',
    feetLength: 22,
    selectedExtras: [],
    extraQuantities: {},
    serviceLocation: 'mobile',
    frequencyDiscount: 'once'
  });
  const [activeEstimatedPrice, setActiveEstimatedPrice] = useState<number>(209);
  const [selectedStainTypes, setSelectedStainTypes] = useState<string[]>([]);

  const handleOpenBooking = () => {
    setIsBookingOpen(true);
  };

  const handleOpenCallback = () => {
    setIsCallbackOpen(true);
  };

  const handleOpenWriteReview = () => {
    setIsWriteReviewOpen(true);
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCartChange = useCallback((newCart: BookingCart) => {
    setCart(newCart);
    setActiveEstimatedPrice(newCart.totalPrice);
  }, []);

  const handleOpenBookingWithCart = useCallback((newCart: BookingCart, state: AutoCalculatorState) => {
    setCart(newCart);
    setActiveCalculatorState(state);
    setActiveEstimatedPrice(newCart.totalPrice);
    setIsBookingOpen(true);
  }, []);

  const handleOpenBookingWithDetails = useCallback((state: AutoCalculatorState, estimatedPrice: number) => {
    setActiveCalculatorState(state);
    setActiveEstimatedPrice(estimatedPrice);
    setIsBookingOpen(true);
  }, []);

  const handleToggleStainType = useCallback((stainKey: string) => {
    setSelectedStainTypes(prev => {
      const exists = prev.includes(stainKey);
      const next = exists ? prev.filter(k => k !== stainKey) : [...prev, stainKey];

      setActiveCalculatorState(calcPrev => {
        const hasStains = next.length > 0;
        const currentExtras = calcPrev.selectedExtras || [];
        const nextExtras = hasStains
          ? Array.from(new Set([...currentExtras, 'difficult_stains']))
          : currentExtras.filter(id => id !== 'difficult_stains');

        const nextQuantities = {
          ...(calcPrev.extraQuantities || {})
        };

        if (hasStains) {
          nextQuantities.difficult_stains = next.length;
        } else {
          delete nextQuantities.difficult_stains;
        }

        return {
          ...calcPrev,
          selectedExtras: nextExtras,
          extraQuantities: nextQuantities
        };
      });

      return next;
    });
  }, []);

  const handleToggleExtraFromStains = useCallback((extraId: string) => {
    setActiveCalculatorState(prev => {
      const currentExtras = prev.selectedExtras || [];
      const exists = currentExtras.includes(extraId);
      const nextExtras = exists 
        ? currentExtras.filter(id => id !== extraId)
        : [...currentExtras, extraId];

      const nextQuantities = { ...(prev.extraQuantities || {}) };
      if (!exists) {
        if (!nextQuantities[extraId]) {
          nextQuantities[extraId] = 1;
        }
      } else {
        delete nextQuantities[extraId];
        if (extraId === 'difficult_stains') {
          setSelectedStainTypes([]);
        }
      }

      return {
        ...prev,
        selectedExtras: Array.from(new Set(nextExtras)),
        extraQuantities: nextQuantities
      };
    });
  }, []);

  const handleUpdateExtraQuantityFromStains = useCallback((extraId: string, qty: number) => {
    setActiveCalculatorState(prev => ({
      ...prev,
      extraQuantities: {
        ...(prev.extraQuantities || {}),
        [extraId]: Math.max(1, qty)
      }
    }));
  }, []);

  const scrollToCalculator = (tab?: 'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck') => {
    if (tab) {
      setActiveCategoryTab(tab);
    }
    const el = document.getElementById('tarifs') || document.getElementById('calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4FAF6] text-[#122B1E] flex flex-col selection:bg-[#16A34A] selection:text-white">
      
      {/* 1. Header with Max Expert 360 Branding & Large Green Phone */}
      <Header 
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenBooking={handleOpenBooking}
        onOpenCallback={handleOpenCallback}
        onOpenWriteReview={handleOpenWriteReview}
        onOpenChat={handleOpenChat}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        
        {/* Facebook Banner */}
        <FacebookBanner />

        {/* 2. Hero Section: NETTOYAGE MOBILE PROFESSIONNEL & GMC Savana */}
        <Hero 
          currentLang={currentLang}
          onOpenBooking={handleOpenBooking}
          onOpenCalculator={scrollToCalculator}
          onOpenWriteReview={handleOpenWriteReview}
        />

        {/* 3. NOS SERVICES: 4 Equal Cards with Direct Category Linking */}
        <ServicesSection 
          currentLang={currentLang}
          onSelectCategory={(category) => scrollToCalculator(category)}
        />

        {/* 4. Difficult Stains: DES TACHES DIFFICILES ? ON S'EN OCCUPE ! */}
        <DifficultStainsSection 
          currentLang={currentLang}
          onOpenBooking={handleOpenBooking}
          selectedExtras={activeCalculatorState.selectedExtras}
          extraQuantities={activeCalculatorState.extraQuantities}
          onToggleExtra={handleToggleExtraFromStains}
          onUpdateExtraQuantity={handleUpdateExtraQuantityFromStains}
          selectedStainTypes={selectedStainTypes}
          onToggleStainType={handleToggleStainType}
          onScrollToCalculator={() => scrollToCalculator('auto')}
        />

        {/* 5. Nos Réalisations Authentiques : Vidéo + Photo Avant / Après */}
        <AvantApresVideos 
          currentLang={currentLang}
          onOpenBooking={handleOpenBooking}
        />

        {/* 6. Avis Clients / Відгуки Клієнтів */}
        <ReviewsSection 
          currentLang={currentLang}
          onOpenWriteReview={handleOpenWriteReview}
        />

        {/* 7. Pricing & Configurator: Synchronized CostCalculator */}
        <CostCalculator 
          currentLang={currentLang}
          activeCategoryTab={activeCategoryTab}
          onCategoryTabChange={setActiveCategoryTab}
          calcState={activeCalculatorState}
          onCalcStateChange={setActiveCalculatorState}
          onOpenBookingWithCart={handleOpenBookingWithCart}
          onOpenBookingWithDetails={handleOpenBookingWithDetails}
          onCartChange={handleCartChange}
        />
        {/* 8. Contact final */}
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
        onOpenChat={handleOpenChat}
      />

      {/* Floating AI Bot Launcher */}
      <FloatingAiBotLauncher 
        currentLang={currentLang}
        onOpenChat={handleOpenChat}
      />

      {/* Gemini AI Multi-turn Chatbot Modal */}
      <GeminiChatModal 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentLang={currentLang}
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
      />

    </div>
  );
}

export default App;
