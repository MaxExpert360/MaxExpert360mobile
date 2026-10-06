import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { DifficultStainsSection } from './components/DifficultStainsSection';
import { BeforeAfterSection } from './components/BeforeAfterSection';
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

  const handleOpenChat = () => {
    setIsChatOpen(true);
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
        />

        {/* 5. Avant / Après Section: Sièges, Meubles, Matelas, Tapis */}
        <BeforeAfterSection 
          currentLang={currentLang}
          onOpenBooking={handleOpenBooking}
        />

        {/* 6. Avis Clients / Відгуки Клієнтів */}
        <ReviewsSection 
          currentLang={currentLang}
          onOpenWriteReview={handleOpenWriteReview}
        />

        {/* 7. Pricing & Configurator: Existing CostCalculator preserved */}
        <CostCalculator 
          currentLang={currentLang}
          activeCategoryTab={activeCategoryTab}
          onCategoryTabChange={setActiveCategoryTab}
          onOpenBookingWithCart={handleOpenBookingWithCart}
          onOpenBookingWithDetails={handleOpenBookingWithDetails}
          onCartChange={setCart}
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
