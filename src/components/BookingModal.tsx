import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Car,
  ShoppingBag,
  Sparkles,
  MapPin,
  Trash2,
  Phone,
  AlertCircle,
  ExternalLink,
  Flame,
  Copy,
  MessageSquare,
  Gift,
  ShieldCheck,
  Loader2,
  Mail,
  User,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import {
  BookingCart,
  AutoBookingFormData,
  Language,
  CartItem,
  AutoCalculatorState,
  ParsedAddressDetails
} from '../types';
import {
  EXTRA_SERVICES,
  FURNITURE_SERVICES,
  AUTO_LAUNCH_PROMO,
  isAutoPromoActive,
  calculateServicePrice,
  DYNASTIE_INFO
} from '../data/dynastieData';
import {
  getScheduleRuleForDate,
  getTimeSlotOptionsForDate,
  validateBookingSchedule,
  getLocalizedSlotLabel
} from '../config/bookingSchedule';
import {
  submitRealSquareBooking,
  checkSquareServerStatus,
  generateOrderSummaryText,
  copySummaryToClipboard,
  buildSquareBookingUrl,
  createDefaultCart,
  calculateCartSummary,
  SquareServerStatus,
  SquareApiBookingResult,
  requestSmsVerification,
  verifySmsCode,
  normalizeCanadianPhoneClient,
  fetchAddressSuggestions,
  fetchPlaceDetails,
  validateCanadianPostalCode,
  normalizeCanadianPostalCode,
  AddressSuggestionItem
} from '../services/squareBookings';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCart?: BookingCart;
  initialState?: Partial<AutoCalculatorState>;
  initialEstimatedPrice?: number;
  currentLang?: Language;
  onCartUpdate?: (updatedCart: BookingCart) => void;
}

// In-memory persistent map of phone -> cooldown expiration timestamp (in ms)
const smsSessionCooldowns: Record<string, number> = {};

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialCart,
  initialState,
  currentLang = 'fr',
  onCartUpdate
}) => {
  // Step state: 1: Phone & SMS, 2: Name/Email & Address, 3: Services & Date/Time, 4: Summary & Confirm, 5: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Loading & Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<SquareApiBookingResult | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [squareStatus, setSquareStatus] = useState<SquareServerStatus | null>(null);

  // Centralized Validation Error
  const [validationError, setValidationError] = useState<{ field: string; message: string } | null>(null);

  // Phone & SMS OTP authentication state
  const [phoneInput, setPhoneInput] = useState('');
  const [smsCodeInput, setSmsCodeInput] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [smsSentNotice, setSmsSentNotice] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedCustomer, setVerifiedCustomer] = useState<any | null>(null);
  const [loyaltySummary, setLoyaltySummary] = useState<any | null>(null);
  const [welcomeBanner, setWelcomeBanner] = useState<string | null>(null);

  // Customer Contact Fields
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  // Google Maps Autocomplete & Postal Code State
  const [addressInput, setAddressInput] = useState('');
  const [postalCodeInput, setPostalCodeInput] = useState('');
  const [selectedAddressDetails, setSelectedAddressDetails] = useState<ParsedAddressDetails | null>(null);
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
  const [postalCodeErrorNotice, setPostalCodeErrorNotice] = useState<string | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestionItem[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic category custom fields
  const [vehicleMakeModelInput, setVehicleMakeModelInput] = useState('');
  const [furnitureDescInput, setFurnitureDescInput] = useState('');
  const [carpetDescInput, setCarpetDescInput] = useState('');
  const [mattressDescInput, setMattressDescInput] = useState('');
  const [truckDescInput, setTruckDescInput] = useState('');

  // Selected loyalty reward
  const [selectedLoyaltyReward, setSelectedLoyaltyReward] = useState<any | null>(null);

  // Local cart state
  const [cart, setCart] = useState<BookingCart>(() => {
    if (initialCart && initialCart.items.length > 0) {
      return initialCart;
    }
    return createDefaultCart();
  });

  const [formData, setFormData] = useState<AutoBookingFormData>({
    vehicleCategory: initialState?.vehicleCategory || 'suv',
    vehicleMakeModel: '',
    vehicleYear: new Date().getFullYear().toString(),
    packageId: initialState?.packageId || 'interieur_exterieur_complet',
    feetLength: initialState?.feetLength || 22,
    selectedExtras: initialState?.selectedExtras || [],
    serviceLocation: 'mobile',
    serviceAddress: '',
    postalCode: '',
    preferredDate: '',
    preferredTimeSlot: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    notes: ''
  });

  // Maintain countdown timer linked to persistent session cooldown timestamp
  useEffect(() => {
    const cleanDigits = phoneInput.replace(/\D/g, '');
    const updateCountdown = () => {
      const until = smsSessionCooldowns[cleanDigits] || 0;
      const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setCooldownSeconds(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 500);
    return () => clearInterval(interval);
  }, [phoneInput, smsSentNotice]);

  // Check Square backend status on mount
  useEffect(() => {
    if (isOpen) {
      checkSquareServerStatus()
        .then(status => setSquareStatus(status))
        .catch(() => setSquareStatus({ configured: false, environment: 'unknown' }));
    }
  }, [isOpen]);

  // Sync cart and formData when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialCart && initialCart.items.length > 0) {
        setCart(initialCart);
      }
      if (initialState) {
        setFormData(prev => ({
          ...prev,
          vehicleCategory: initialState.vehicleCategory || prev.vehicleCategory,
          packageId: initialState.packageId || prev.packageId,
          feetLength: initialState.feetLength || prev.feetLength,
          selectedExtras: initialState.selectedExtras || prev.selectedExtras
        }));
      }
      setStep(1);
      setIsSubmitting(false);
      setSubmissionError(null);
      setValidationError(null);
      setBookingResult(null);
      setCopiedToast(false);
    }
  }, [isOpen, initialCart, initialState]);

  const triggerValidation = (fieldKey: string, elementId: string, message: string) => {
    setValidationError({ field: fieldKey, message });
    setTimeout(() => {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if ('focus' in el && typeof (el as any).focus === 'function') {
          (el as HTMLElement).focus();
        }
      }
    }, 60);
  };

  // Propagate cart changes back to parent
  const updateCartItems = (newItems: CartItem[]) => {
    const updated = calculateCartSummary(newItems, cart.activeCategory);
    setCart(updated);
    if (validationError?.field === 'cart' && newItems.length > 0) {
      setValidationError(null);
    }
    if (onCartUpdate) {
      onCartUpdate(updated);
    }
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    const newItems = cart.items.map(item => {
      if (item.id === itemId) {
        const nextQty = Math.max(0, item.quantity + delta);
        return {
          ...item,
          quantity: nextQty,
          totalPrice: nextQty * item.unitPrice
        };
      }
      return item;
    }).filter(item => item.quantity > 0);

    updateCartItems(newItems);
  };

  const handleRemoveItem = (itemId: string) => {
    const newItems = cart.items.filter(item => item.id !== itemId);
    updateCartItems(newItems);
  };

  const handleToggleServiceItem = (
    item: { id: string; name: { fr: string; ua: string; en: string }; price: number },
    category: 'furniture' | 'carpet' | 'mattress' | 'truck' | 'auto'
  ) => {
    const existingIndex = cart.items.findIndex(it => it.id === item.id);
    if (existingIndex >= 0) {
      handleRemoveItem(item.id);
    } else {
      const priceInfo = calculateServicePrice(item.price, category);
      const unitPrice = priceInfo.finalPrice;

      const newItem: CartItem = {
        id: item.id,
        category,
        name: item.name,
        details: {
          fr: category === 'furniture' ? 'Meuble / Divan' : category === 'carpet' ? 'Tapis / Moquette' : category === 'mattress' ? 'Matelas' : 'Véhicule',
          ua: category === 'furniture' ? 'Меблі / Диван' : category === 'carpet' ? 'Килим' : category === 'mattress' ? 'Матрац' : 'Транспорт',
          en: category === 'furniture' ? 'Furniture / Sofa' : category === 'carpet' ? 'Carpet' : category === 'mattress' ? 'Mattress' : 'Vehicle'
        },
        quantity: 1,
        unitPrice,
        totalPrice: unitPrice
      };
      updateCartItems([...cart.items, newItem]);
    }
  };

  const handleToggleExtraOption = (extraId: string) => {
    const extra = EXTRA_SERVICES.find(e => e.id === extraId);
    if (!extra) return;

    const existingIndex = cart.items.findIndex(it => it.id === extraId);
    if (existingIndex >= 0) {
      handleRemoveItem(extraId);
    } else {
      const newItem: CartItem = {
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
      };
      updateCartItems([...cart.items, newItem]);
    }
  };

  // Phone input handler
  const handlePhoneInputChange = (rawVal: string) => {
    setPhoneInput(rawVal);
    if (validationError?.field === 'phone') setValidationError(null);
    setIsPhoneVerified(false);
    setSmsSentNotice(null);
    setWelcomeBanner(null);

    const norm = normalizeCanadianPhoneClient(rawVal);
    if (norm.isValid) {
      setFormData(prev => ({
        ...prev,
        clientPhone: norm.e164
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        clientPhone: rawVal
      }));
    }
  };

  // SMS Verification Handlers
  const handleSendSmsCode = async (isResend = false) => {
    if (isSendingCode) return;

    const raw = phoneInput.trim();
    const phoneCheck = normalizeCanadianPhoneClient(raw);

    if (!phoneCheck.isValid) {
      triggerValidation('phone', 'booking-field-phone', 'Veuillez entrer un numéro de téléphone canadien valide (ex: 819 555-1234).');
      return;
    }

    const clean = raw.replace(/\D/g, '');
    const cleanTen = clean.length === 11 ? clean.substring(1) : clean;

    const until = smsSessionCooldowns[cleanTen] || 0;
    const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
    if (isResend && remaining > 0) {
      return;
    }

    setIsSendingCode(true);
    setValidationError(null);
    setResendNotice(null);

    try {
      const res = await requestSmsVerification(phoneCheck.e164, isResend);

      const cooldownSec = res.cooldownSeconds || 60;
      const targetTime = Date.now() + cooldownSec * 1000;
      smsSessionCooldowns[cleanTen] = targetTime;
      setCooldownSeconds(cooldownSec);

      if (isResend) {
        setResendNotice('Un nouveau code a été envoyé.');
        setSmsSentNotice(res.message || 'Un nouveau code a été envoyé.');
      } else {
        const masked = res.maskedPhone || `+1 (***) ***-${cleanTen.substring(6)}`;
        setSmsSentNotice(res.message || `Code envoyé au ${masked}`);
      }
    } catch (err: any) {
      triggerValidation('phone', 'booking-field-phone', err.message || 'Impossible d’envoyer le code pour le moment. Veuillez réessayer.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifySmsCode = async () => {
    if (isVerifyingCode) return;

    const phoneCheck = normalizeCanadianPhoneClient(phoneInput.trim());
    if (!phoneCheck.isValid) {
      triggerValidation('phone', 'booking-field-phone', 'Veuillez entrer un numéro de téléphone canadien valide.');
      return;
    }
    if (!smsCodeInput.trim() || smsCodeInput.trim().length < 4) {
      triggerValidation('smsCode', 'booking-field-code', 'Veuillez entrer le code de vérification reçu par SMS.');
      return;
    }

    setIsVerifyingCode(true);
    setValidationError(null);

    try {
      const res = await verifySmsCode(phoneCheck.e164, smsCodeInput.trim());
      setIsPhoneVerified(true);
      setFormData(prev => ({
        ...prev,
        clientPhone: res.customer?.phone || phoneCheck.e164
      }));

      // If returning customer: prefill contact & address information
      if (res.isReturning && res.customer) {
        setVerifiedCustomer(res.customer);
        setWelcomeBanner(res.welcomeMessage || `Bon retour, ${res.customer.name} !`);

        if (res.customer.name) setClientName(res.customer.name);
        if (res.customer.email) setClientEmail(res.customer.email);
        if (res.customer.primaryAddress) {
          setAddressInput(res.customer.primaryAddress);
          setIsAddressConfirmed(false);
          // Pre-fetch suggestions for user convenience
          fetchAddressSuggestions(res.customer.primaryAddress).then(sugs => {
            if (sugs.length > 0) setAddressSuggestions(sugs);
          }).catch(() => {});
        }
        if (res.customer.postalCode) {
          const normPostal = normalizeCanadianPostalCode(res.customer.postalCode);
          if (validateCanadianPostalCode(normPostal)) {
            setPostalCodeInput(normPostal);
          }
        }

        setFormData(prev => ({
          ...prev,
          clientName: res.customer?.name || prev.clientName,
          clientEmail: res.customer?.email || prev.clientEmail,
          clientPhone: res.customer?.phone || prev.clientPhone,
          serviceAddress: res.customer?.primaryAddress || prev.serviceAddress,
          addressValidated: false,
          placeId: '',
          postalCode: res.customer?.postalCode || prev.postalCode,
          confirmedPostalCode: res.customer?.postalCode || prev.confirmedPostalCode
        }));
      }

      if (res.loyalty) {
        setLoyaltySummary(res.loyalty);
      }
    } catch (err: any) {
      triggerValidation('smsCode', 'booking-field-code', err.message || 'Le code de vérification est incorrect.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Google Maps Autocomplete & Address selection
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddressInput(val);
    
    // Invalidate previous Google selection & components
    setIsAddressConfirmed(false);
    setSelectedAddressDetails(null);
    setPostalCodeInput('');
    setPostalCodeErrorNotice(null);

    setFormData(prev => ({
      ...prev,
      address: val,
      serviceAddress: val,
      formattedAddress: '',
      placeId: '',
      googlePlaceId: '',
      streetNumber: '',
      street: '',
      city: '',
      province: '',
      country: '',
      postalCode: '',
      googlePostalCode: '',
      confirmedPostalCode: '',
      postalCodeSource: null,
      postalCodeStatus: undefined,
      latitude: null,
      longitude: null,
      addressVerified: false,
      addressValidated: false,
      addressDetails: undefined
    }));

    if (validationError?.field === 'serviceAddress' || validationError?.field === 'postalCode') {
      setValidationError(null);
    }

    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }

    if (val.trim().length >= 2) {
      setIsSearchingAddress(true);
      autocompleteTimeoutRef.current = setTimeout(async () => {
        const suggestions = await fetchAddressSuggestions(val);
        setAddressSuggestions(suggestions);
        setShowSuggestionsDropdown(suggestions.length > 0);
        setIsSearchingAddress(false);
      }, 200);
    } else {
      setAddressSuggestions([]);
      setShowSuggestionsDropdown(false);
      setIsSearchingAddress(false);
    }
  };

  const handleSelectAddressSuggestion = async (sug: AddressSuggestionItem) => {
    setShowSuggestionsDropdown(false);
    setIsSearchingAddress(true);
    setPostalCodeErrorNotice(null);

    // Fetch place details from backend API (which extracts Google address components)
    const details = await fetchPlaceDetails(sug.placeId, sug.description);
    setIsSearchingAddress(false);

    if (!details || !details.formattedAddress) {
      triggerValidation('serviceAddress', 'booking-field-address', 'Impossible de vérifier cette adresse. Veuillez sélectionner une autre suggestion Google.');
      setIsAddressConfirmed(false);
      setFormData(prev => ({
        ...prev,
        addressValidated: false,
        placeId: '',
        googlePlaceId: '',
        formattedAddress: ''
      }));
      return;
    }

    const officialAddress = details.formattedAddress || sug.description;
    setAddressInput(officialAddress);

    const streetNumber = details.streetNumber || details.street_number || '';
    const route = details.streetName || details.route || '';
    const city = details.city || 'Drummondville';
    const province = details.province || 'QC';
    const country = details.country || 'Canada';
    const placeId = details.placeId || sug.placeId;

    // Read postal code ONLY from Google address_components (where type = "postal_code")
    const rawPostal = details.postalCode || details.postal_code || details.googlePostalCode || '';
    const normalizedPostal = rawPostal ? normalizeCanadianPostalCode(rawPostal) : '';
    const hasValidPostal = Boolean(normalizedPostal && validateCanadianPostalCode(normalizedPostal));

    // If Google returned a valid postal code, automatically populate & format it.
    // If not, clear postal code input to allow manual entry.
    if (hasValidPostal) {
      setPostalCodeInput(normalizedPostal);
      setPostalCodeErrorNotice(null);
    } else {
      setPostalCodeInput('');
      setPostalCodeErrorNotice(null);
    }

    setSelectedAddressDetails({
      ...details,
      placeId,
      postalCode: hasValidPostal ? normalizedPostal : '',
      googlePostalCode: hasValidPostal ? normalizedPostal : undefined,
      confirmedPostalCode: hasValidPostal ? normalizedPostal : undefined
    });
    
    setIsAddressConfirmed(true);

    // Atomically update formData with all separated address fields
    setFormData(prev => ({
      ...prev,
      address: officialAddress,
      serviceAddress: officialAddress,
      formattedAddress: officialAddress,
      streetNumber,
      street: route,
      city,
      province,
      country,
      placeId,
      googlePlaceId: placeId,
      postalCode: hasValidPostal ? normalizedPostal : '',
      googlePostalCode: hasValidPostal ? normalizedPostal : undefined,
      confirmedPostalCode: hasValidPostal ? normalizedPostal : undefined,
      postalCodeSource: hasValidPostal ? 'google' : 'manual',
      postalCodeStatus: hasValidPostal ? 'suggested' : undefined,
      latitude: details.latitude ?? null,
      longitude: details.longitude ?? null,
      addressVerified: true,
      addressValidated: true,
      addressDetails: details
    }));

    // Immediately clear validation errors for address & postalCode if valid
    if (validationError?.field === 'serviceAddress') {
      setValidationError(null);
    }
    if (hasValidPostal && validationError?.field === 'postalCode') {
      setValidationError(null);
    }
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const clean = rawVal.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let formattedVal = clean;
    if (clean.length > 3) {
      formattedVal = `${clean.slice(0, 3)} ${clean.slice(3, 6)}`;
    }

    setPostalCodeInput(formattedVal);

    const normalized = normalizeCanadianPostalCode(formattedVal);
    const isValid = validateCanadianPostalCode(normalized);

    setFormData(prev => ({
      ...prev,
      postalCode: isValid ? normalized : formattedVal,
      confirmedPostalCode: isValid ? normalized : '',
      postalCodeSource: 'manual',
      postalCodeStatus: isValid ? 'manually_confirmed' : undefined
    }));

    if (isValid) {
      setPostalCodeErrorNotice(null);
      if (validationError?.field === 'postalCode') {
        setValidationError(null);
      }
    }
  };

  const handlePostalCodeBlur = () => {
    const raw = postalCodeInput.trim();
    if (raw) {
      const normalized = normalizeCanadianPostalCode(raw);
      setPostalCodeInput(normalized);
      if (validateCanadianPostalCode(normalized)) {
        setFormData(prev => ({
          ...prev,
          postalCode: normalized,
          confirmedPostalCode: normalized,
          postalCodeSource: 'manual',
          postalCodeStatus: 'manually_confirmed'
        }));
        setPostalCodeErrorNotice(null);
        if (validationError?.field === 'postalCode') {
          setValidationError(null);
        }
      } else {
        setPostalCodeErrorNotice('Veuillez entrer un code postal canadien valide (ex. J2C 1A1).');
      }
    }
  };

  // Dynamic Cart Category detection
  const hasAutoInCart = useMemo(() => cart.items.some(it => it.category === 'auto'), [cart.items]);
  const hasFurnitureInCart = useMemo(() => cart.items.some(it => it.category === 'furniture'), [cart.items]);
  const hasCarpetInCart = useMemo(() => cart.items.some(it => it.category === 'carpet'), [cart.items]);
  const hasMattressInCart = useMemo(() => cart.items.some(it => it.category === 'mattress'), [cart.items]);
  const hasTruckInCart = useMemo(() => cart.items.some(it => it.category === 'truck'), [cart.items]);

  // Compute total loyalty discount
  const loyaltyCreditDiscount = useMemo(() => {
    if (selectedLoyaltyReward && selectedLoyaltyReward.rewardType === 'credit') {
      return selectedLoyaltyReward.rewardValue || 0;
    }
    return 0;
  }, [selectedLoyaltyReward]);

  const finalAdjustedTotal = useMemo(() => {
    return Math.max(0, cart.totalPrice - loyaltyCreditDiscount);
  }, [cart.totalPrice, loyaltyCreditDiscount]);

  // ================= STEP VALIDATION RULES =================
  const validateStep = (currentStepNumber: 1 | 2 | 3 | 4): boolean => {
    // Step 1: Phone & SMS verification
    if (currentStepNumber === 1) {
      if (!phoneInput.trim()) {
        triggerValidation('phone', 'booking-field-phone', 'Veuillez entrer votre numéro de téléphone.');
        return false;
      }

      const phoneCheck = normalizeCanadianPhoneClient(phoneInput.trim());
      if (!phoneCheck.isValid) {
        triggerValidation('phone', 'booking-field-phone', 'Veuillez entrer un numéro de téléphone canadien valide (ex: 819 555-1234).');
        return false;
      }

      if (!isPhoneVerified) {
        triggerValidation('smsCode', 'booking-field-code', 'Veuillez vérifier votre numéro de téléphone avec le code SMS avant de continuer.');
        return false;
      }
    }

    // Step 2: Name / Email & Address / Postal Code
    if (currentStepNumber === 2) {
      if (!clientName.trim()) {
        triggerValidation('clientName', 'booking-field-name', 'Veuillez entrer votre nom et prénom.');
        return false;
      }

      if (!addressInput.trim()) {
        triggerValidation('serviceAddress', 'booking-field-address', 'Veuillez entrer votre adresse de service à domicile.');
        return false;
      }

      // Check if address was confirmed via Google Place selection
      const hasPlaceId = Boolean(formData.placeId?.trim() || selectedAddressDetails?.placeId?.trim());
      const hasFormattedAddress = Boolean(formData.formattedAddress?.trim() || selectedAddressDetails?.formattedAddress?.trim() || formData.address?.trim());
      const isValidated = Boolean(formData.addressValidated && isAddressConfirmed && hasPlaceId && hasFormattedAddress);

      if (!isValidated) {
        triggerValidation('serviceAddress', 'booking-field-address', 'Veuillez sélectionner votre adresse dans les suggestions Google.');
        return false;
      }

      // Postal code validation: MUST accept valid Canadian postal code (A1A 1A1)
      const rawPostal = postalCodeInput.trim() || formData.postalCode?.trim() || '';
      if (!rawPostal) {
        const errorMsg = 'Le code postal est requis.';
        setPostalCodeErrorNotice(errorMsg);
        triggerValidation('postalCode', 'booking-field-postal', errorMsg);
        return false;
      }

      const normalizedPostal = normalizeCanadianPostalCode(rawPostal);
      if (!validateCanadianPostalCode(normalizedPostal)) {
        const errorMsg = 'Veuillez entrer un code postal canadien valide (ex. J2C 1A1).';
        setPostalCodeErrorNotice(errorMsg);
        triggerValidation('postalCode', 'booking-field-postal', errorMsg);
        return false;
      }
    }

    // Step 3: Cart Services, Date & Time Slot
    if (currentStepNumber === 3) {
      if (cart.items.length === 0) {
        triggerValidation('cart', 'booking-field-cart', 'Veuillez sélectionner au moins une prestation.');
        return false;
      }

      if (!formData.preferredDate) {
        triggerValidation('preferredDate', 'booking-field-date', 'Veuillez sélectionner une date de rendez-vous.');
        return false;
      }

      if (!formData.preferredTimeSlot) {
        triggerValidation('preferredTimeSlot', 'booking-field-timeslot', 'Veuillez sélectionner un créneau horaire.');
        return false;
      }

      // Schedule availability validation (America/Toronto)
      const scheduleValidation = validateBookingSchedule(formData.preferredDate, formData.preferredTimeSlot);
      if (!scheduleValidation.isValid) {
        const errorMsg = scheduleValidation.error?.[currentLang] || scheduleValidation.error?.fr || 'Ce créneau horaire n\'est pas disponible pour cette date.';
        triggerValidation('preferredTimeSlot', 'booking-field-timeslot', errorMsg);
        return false;
      }

      // Dynamic Category-Specific Fields Validation
      if (hasAutoInCart && !vehicleMakeModelInput.trim()) {
        triggerValidation('vehicleMakeModel', 'booking-field-vehicle-desc', 'Veuillez préciser la marque, le modèle et l\'année du véhicule.');
        return false;
      }

      if (hasFurnitureInCart && !furnitureDescInput.trim()) {
        triggerValidation('furnitureDesc', 'booking-field-furniture-desc', 'Veuillez décrire le meuble à nettoyer.');
        return false;
      }

      if (hasCarpetInCart && !carpetDescInput.trim()) {
        triggerValidation('carpetDesc', 'booking-field-carpet-desc', 'Veuillez préciser les dimensions et le type de tapis.');
        return false;
      }

      if (hasMattressInCart && !mattressDescInput.trim()) {
        triggerValidation('mattressDesc', 'booking-field-mattress-desc', 'Veuillez préciser le type et la taille du matelas.');
        return false;
      }

      if (hasTruckInCart && !truckDescInput.trim()) {
        triggerValidation('truckDesc', 'booking-field-truck-desc', 'Veuillez décrire le camion ou les surfaces à nettoyer.');
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  // Next Step Action
  const handleNext = async () => {
    if (step === 1) {
      if (!validateStep(1)) return;
      setStep(2);
    } else if (step === 2) {
      if (!validateStep(2)) return;

      const rawPostal = postalCodeInput.trim() || formData.confirmedPostalCode || formData.postalCode || '';
      const normalizedPostal = normalizeCanadianPostalCode(rawPostal);

      setFormData(prev => ({
        ...prev,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        serviceAddress: addressInput.trim(),
        address: addressInput.trim(),
        postalCode: normalizedPostal,
        confirmedPostalCode: normalizedPostal,
        addressValidated: true,
        addressVerified: true
      }));

      setStep(3);
    } else if (step === 3) {
      if (!validateStep(3)) return;

      // Compile dynamic notes
      const notesParts = [];
      if (hasAutoInCart && vehicleMakeModelInput.trim()) {
        notesParts.push(`Véhicule: ${vehicleMakeModelInput.trim()}`);
      }
      if (hasFurnitureInCart && furnitureDescInput.trim()) {
        notesParts.push(`Meuble: ${furnitureDescInput.trim()}`);
      }
      if (hasCarpetInCart && carpetDescInput.trim()) {
        notesParts.push(`Tapis: ${carpetDescInput.trim()}`);
      }
      if (hasMattressInCart && mattressDescInput.trim()) {
        notesParts.push(`Matelas: ${mattressDescInput.trim()}`);
      }
      if (hasTruckInCart && truckDescInput.trim()) {
        notesParts.push(`Camion: ${truckDescInput.trim()}`);
      }
      if (formData.notes) {
        notesParts.push(`Notes: ${formData.notes}`);
      }

      setFormData(prev => ({
        ...prev,
        vehicleMakeModel: vehicleMakeModelInput.trim() || furnitureDescInput.trim() || carpetDescInput.trim() || mattressDescInput.trim() || truckDescInput.trim(),
        notes: notesParts.join(' | ')
      }));

      setStep(4);
    } else if (step === 4) {
      // Final confirmation & submission
      setIsSubmitting(true);
      setSubmissionError(null);

      try {
        const rawPostal = postalCodeInput.trim() || formData.confirmedPostalCode || formData.postalCode || '';
        const normalizedPostal = normalizeCanadianPostalCode(rawPostal);

        const finalSubmissionData: AutoBookingFormData = {
          ...formData,
          clientName: clientName.trim() || formData.clientName,
          clientEmail: clientEmail.trim() || formData.clientEmail,
          clientPhone: phoneInput.trim() || formData.clientPhone,
          serviceAddress: addressInput.trim() || formData.serviceAddress,
          postalCode: normalizedPostal,
          confirmedPostalCode: normalizedPostal,
          totalPrice: finalAdjustedTotal,
          selectedRewardId: selectedLoyaltyReward?.id,
          rewardDiscount: loyaltyCreditDiscount
        };

        const result = await submitRealSquareBooking(cart, finalSubmissionData, currentLang);

        if (result.success && result.bookingId) {
          setBookingResult(result);
          setStep(5);
        } else {
          setSubmissionError(result.error || 'Erreur inattendue de Square API.');
        }
      } catch (err: any) {
        console.error('Square Booking creation error:', err);
        setSubmissionError(err.message || 'Impossible de créer le rendez-vous dans Square.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCopySummary = async () => {
    const ref = bookingResult?.bookingId || undefined;
    const text = generateOrderSummaryText(cart, currentLang, formData, ref);
    const success = await copySummaryToClipboard(text);
    if (success) {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3500);
    }
  };

  const handleOpenSquareFallback = () => {
    const squareUrl = buildSquareBookingUrl(cart, formData, currentLang);
    window.open(squareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSendSms = () => {
    const ref = bookingResult?.bookingId || undefined;
    const text = generateOrderSummaryText(cart, currentLang, formData, ref);
    const phoneRaw = DYNASTIE_INFO.phones[0].raw;
    const smsUrl = `sms:${phoneRaw}?body=${encodeURIComponent(text)}`;
    window.location.href = smsUrl;
  };

  const t = {
    fr: {
      modalTitle: 'Réservation & Rendez-vous Square',
      step1: '1. Téléphone & SMS',
      step2: '2. Coordonnées & Adresse',
      step3: '3. Prestations & Date',
      step4: '4. Récapitulatif & Validation',
      phoneFirstTitle: 'Identification par SMS',
      phoneFirstSubtitle: 'Entrez votre numéro de cellulaire canadien pour recevoir un code de sécurité instantané.',
      phoneLabel: 'Votre numéro de téléphone cellulaire *',
      phonePlaceholder: 'ex: 819 555-1234',
      btnSendCode: 'Envoyer le code par SMS',
      btnSending: 'Envoi en cours…',
      btnResendCode: 'Renvoyer le code',
      codeLabel: 'Code de sécurité reçu par SMS *',
      codePlaceholder: 'Entrez le code à 6 chiffres',
      btnVerifyCode: 'Vérifier le code',
      btnVerifying: 'Vérification en cours…',
      countdownNotice: (s: number) => `Vous pourrez demander un nouveau code dans ${s} s`,
      resendPrompt: 'Vous n’avez pas reçu le code ?',
      verifiedBadge: '✓ Numéro vérifié avec succès',
      nameLabel: 'Votre nom et prénom *',
      namePlaceholder: 'ex: Jean Tremblay',
      emailLabel: 'Courriel (pour confirmation Square)',
      emailPlaceholder: 'ex: jean.tremblay@email.com',
      addressLabel: 'Votre adresse de service à domicile *',
      addressPlaceholder: 'Tapez votre adresse (ex: 450 Rue Lindsay, Drummondville)...',
      postalCodeLabel: 'CODE POSTAL *',
      postalCodePlaceholder: 'ex: J2C 1A1',
      dateLabel: 'Date souhaitée *',
      timeSlotLabel: 'Créneau horaire souhaité *',
      notesLabel: 'Notes particulières (taches tenaces, stationnement, etc.)',
      subtotalLabel: 'Sous-total des prestations :',
      totalEstimated: 'Total estimé :',
      localTravelNote: 'Déplacement inclus à Drummondville • Sans acompte',
      btnNext: 'Continuer',
      btnBack: 'Précédent',
      btnConfirmSquare: 'Créer le Rendez-vous sur Square',
      btnProcessing: 'Création en cours sur Square...',
      btnCopySummary: 'Copier le récapitulatif',
      btnSmsMax: 'Envoyer par SMS à Max',
      copiedSuccess: '✓ Récapitulatif copié dans le presse-papier !',
      successHeader: 'Rendez-vous Confirmé sur Square !',
      successSub: 'Votre rendez-vous a été enregistré avec succès dans notre système Square Appointments.',
      refNumber: 'Square Booking ID :',
      statusLabel: 'Statut du rendez-vous :',
      btnClose: 'Fermer',
      errorHeader: 'Impossible de finaliser sur Square',
      btnRetry: 'Réessayer la réservation',
      btnFallbackSquare: 'Ouvrir sur le portail Square Appointments',
      loyaltyTitle: 'Programme de Fidélité MaxExpert360',
      loyaltyProgress: (count: number, next: number) => `Fidélité : ${count} / ${next} visites`,
      loyaltyRemaining: (rem: number) => `Encore ${rem} visite${rem > 1 ? 's' : ''} pour votre prochaine récompense.`,
      availableRewardsHeading: 'Vos Récompenses Disponibles :',
      applyRewardBtn: 'Appliquer ce privilège',
      rewardAppliedBadge: '✓ Récompense appliquée',
      loyaltyCreditLabel: 'Crédit Privilège Fidélité :'
    },
    ua: {
      modalTitle: 'Бронювання через Square Appointments',
      step1: '1. Телефон та SMS',
      step2: '2. Контакти та Адреса',
      step3: '3. Послуги та Дата',
      step4: '4. Підсумок та Запис',
      phoneFirstTitle: 'Вхід за Номером Телефону',
      phoneFirstSubtitle: 'Введіть номер мобільного для отримання захисного SMS коду.',
      phoneLabel: 'Номер мобільного телефону *',
      phonePlaceholder: 'напр: 819 555-1234',
      btnSendCode: 'Надіслати SMS код',
      btnSending: 'Відправка коду…',
      btnResendCode: 'Надіслати код повторно',
      codeLabel: 'Код перевірки з SMS *',
      codePlaceholder: 'Введіть 6-значний код',
      btnVerifyCode: 'Підтвердити код',
      btnVerifying: 'Перевірка…',
      countdownNotice: (s: number) => `Повторний запит доступний через ${s} с`,
      resendPrompt: 'Не отримали код?',
      verifiedBadge: '✓ Телефон успішно підтверджено',
      nameLabel: 'Ваше імʼя та прізвище *',
      namePlaceholder: 'напр: Іван Петренко',
      emailLabel: 'Email (для підтвердження)',
      emailPlaceholder: 'напр: ivan@email.com',
      addressLabel: 'Адреса виїзду *',
      addressPlaceholder: 'Почніть вводити адресу (напр: 450 Rue Lindsay, Drummondville)...',
      postalCodeLabel: 'ПОШТОВИЙ ІНДЕКС *',
      postalCodePlaceholder: 'напр: J2C 1A1',
      dateLabel: 'Бажана дата *',
      timeSlotLabel: 'Бажаний час *',
      notesLabel: 'Особливі побажання',
      subtotalLabel: 'Підсумок послуг :',
      totalEstimated: 'Загальна вартість :',
      localTravelNote: 'Виїзд по Драммондвілю включено • Без передплати',
      btnNext: 'Далі',
      btnBack: 'Назад',
      btnConfirmSquare: 'Створити Запис у Square',
      btnProcessing: 'Створення запису у Square...',
      btnCopySummary: 'Скопіювати опис',
      btnSmsMax: 'Відправити SMS Максу',
      copiedSuccess: '✓ Деталі скопійовано !',
      successHeader: 'Запис Успішно Створено у Square !',
      successSub: 'Ваш запис зареєстровано в системі Square Appointments.',
      refNumber: 'Square Booking ID :',
      statusLabel: 'Статус запису :',
      btnClose: 'Закрити',
      errorHeader: 'Помилка створення запису в Square',
      btnRetry: 'Спробувати знову',
      btnFallbackSquare: 'Відкрити онлайн-портал Square',
      loyaltyTitle: 'Програма Лояльності MaxExpert360',
      loyaltyProgress: (count: number, next: number) => `Лояльність : ${count} / ${next} візитів`,
      loyaltyRemaining: (rem: number) => `Ще ${rem} візит${rem > 1 ? 'и' : ''} до винагороди.`,
      availableRewardsHeading: 'Доступні Бонуси :',
      applyRewardBtn: 'Застосувати бонус',
      rewardAppliedBadge: '✓ Бонус застосовано',
      loyaltyCreditLabel: 'Знижка за лояльність :'
    },
    en: {
      modalTitle: 'Square Appointments Booking',
      step1: '1. Phone & SMS',
      step2: '2. Contact & Address',
      step3: '3. Services & Date',
      step4: '4. Summary & Confirm',
      phoneFirstTitle: 'SMS Phone Verification',
      phoneFirstSubtitle: 'Enter your mobile phone number to receive an instant verification code.',
      phoneLabel: 'Mobile Phone Number *',
      phonePlaceholder: 'e.g., 819 555-1234',
      btnSendCode: 'Send SMS Code',
      btnSending: 'Sending code…',
      btnResendCode: 'Resend code',
      codeLabel: 'SMS Verification Code *',
      codePlaceholder: 'Enter 6-digit code',
      btnVerifyCode: 'Verify code',
      btnVerifying: 'Verifying…',
      countdownNotice: (s: number) => `You can request a new code in ${s} s`,
      resendPrompt: 'Didn’t receive the code?',
      verifiedBadge: '✓ Phone number verified',
      nameLabel: 'Full Name *',
      namePlaceholder: 'e.g., John Smith',
      emailLabel: 'Email (for Square confirmation)',
      emailPlaceholder: 'e.g., john@email.com',
      addressLabel: 'Service Address *',
      addressPlaceholder: 'Start typing your address (e.g., 450 Rue Lindsay, Drummondville)...',
      postalCodeLabel: 'CODE POSTAL *',
      postalCodePlaceholder: 'e.g., J2C 1A1',
      dateLabel: 'Preferred Date *',
      timeSlotLabel: 'Preferred Time Slot *',
      notesLabel: 'Special instructions (parking, stains, etc.)',
      subtotalLabel: 'Services Subtotal :',
      totalEstimated: 'Total Estimate :',
      localTravelNote: 'Travel included in Drummondville • No deposit required',
      btnNext: 'Next',
      btnBack: 'Back',
      btnConfirmSquare: 'Create Booking in Square',
      btnProcessing: 'Creating Square Appointment...',
      btnCopySummary: 'Copy Order Summary',
      btnSmsMax: 'Send via SMS to Max',
      copiedSuccess: '✓ Summary copied to clipboard !',
      successHeader: 'Booking Confirmed in Square !',
      successSub: 'Your appointment has been successfully created in Square Appointments.',
      refNumber: 'Square Booking ID :',
      statusLabel: 'Booking status :',
      btnClose: 'Close',
      errorHeader: 'Unable to finalize on Square',
      btnRetry: 'Retry Booking',
      btnFallbackSquare: 'Open Square Appointments Portal',
      loyaltyTitle: 'MaxExpert360 Loyalty Program',
      loyaltyProgress: (count: number, next: number) => `Loyalty: ${count} / ${next} visits`,
      loyaltyRemaining: (rem: number) => `${rem} more visit${rem > 1 ? 's' : ''} until next reward.`,
      availableRewardsHeading: 'Your Available Rewards:',
      applyRewardBtn: 'Apply Reward',
      rewardAppliedBadge: '✓ Reward applied',
      loyaltyCreditLabel: 'Loyalty Reward Discount :'
    }
  }[currentLang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0B130E] border-2 border-[#1E3A24] rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8">

        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#1A301E] flex items-center justify-between bg-[#0F1D13]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#142B1A] border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#22C55E] font-bold block">
                  MAXEXPERT360 • SQUARE BOOKINGS API
                </span>
                {squareStatus && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    squareStatus.configured
                      ? 'bg-[#15341E] text-[#86EFAC] border border-[#22C55E]/40'
                      : 'bg-[#2A1616] text-[#FCA5A5] border border-[#EF4444]/40'
                  }`}>
                    {squareStatus.configured ? '● Square Connecté' : '○ Configuration Token'}
                  </span>
                )}
              </div>
              <h3 className="font-heading text-base sm:text-lg font-black text-white uppercase tracking-tight">
                {t.modalTitle}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-[#142618] border border-[#223B27] text-[#9CA3AF] hover:text-white hover:border-[#22C55E] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        {step < 5 && (
          <div className="grid grid-cols-4 border-b border-[#1A301E] bg-[#0A120C] text-[10px] sm:text-[11px] font-mono font-bold text-center">
            <button
              type="button"
              onClick={() => {
                setValidationError(null);
                setStep(1);
              }}
              className={`py-2.5 px-1 cursor-pointer transition-colors ${step === 1 ? 'text-[#22C55E] border-b-2 border-[#22C55E] bg-[#122416]' : 'text-[#6B7280] hover:text-white'}`}
            >
              {t.step1}
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateStep(1)) {
                  setStep(2);
                }
              }}
              className={`py-2.5 px-1 cursor-pointer transition-colors ${step === 2 ? 'text-[#22C55E] border-b-2 border-[#22C55E] bg-[#122416]' : 'text-[#6B7280] hover:text-white'}`}
            >
              {t.step2}
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateStep(1) && validateStep(2)) {
                  setStep(3);
                }
              }}
              className={`py-2.5 px-1 cursor-pointer transition-colors ${step === 3 ? 'text-[#22C55E] border-b-2 border-[#22C55E] bg-[#122416]' : 'text-[#6B7280] hover:text-white'}`}
            >
              {t.step3}
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateStep(1) && validateStep(2) && validateStep(3)) {
                  setStep(4);
                }
              }}
              className={`py-2.5 px-1 cursor-pointer transition-colors ${step === 4 ? 'text-[#22C55E] border-b-2 border-[#22C55E] bg-[#122416]' : 'text-[#6B7280] hover:text-white'}`}
            >
              {t.step4}
            </button>
          </div>
        )}

        {/* Centralized Alert Banner */}
        {validationError && (
          <div
            id="booking-modal-validation-alert"
            className="m-4 p-4 rounded-xl bg-[#2A0E0E] border-2 border-[#EF4444] shadow-2xl flex items-center justify-center gap-3 text-center animate-bounce-subtle"
          >
            <AlertCircle className="w-6 h-6 text-[#EF4444] shrink-0" />
            <div className="text-sm font-bold text-white tracking-wide">
              {validationError.message}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">

          {/* ================= STEP 1: PHONE & SMS VERIFICATION ================= */}
          {step === 1 && (
            <div className="space-y-6">
              <div
                id="booking-field-phone-block"
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isPhoneVerified
                    ? 'bg-[#0E2013] border-[#22C55E]/60'
                    : validationError?.field === 'phone' || validationError?.field === 'smsCode'
                    ? 'bg-[#261010] border-2 border-red-500'
                    : 'bg-[#0D1810] border-[#1C3221]'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isPhoneVerified ? 'bg-[#22C55E] text-black' : 'bg-[#152B1B] text-[#22C55E]'}`}>
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                      {t.phoneFirstTitle}
                    </h4>
                    <p className="text-[11px] text-[#9CA3AF]">
                      {t.phoneFirstSubtitle}
                    </p>
                  </div>
                </div>

                {/* Returning customer welcome notice */}
                {welcomeBanner && (
                  <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-[#14381E] to-[#0E2614] border border-[#22C55E] flex items-center gap-2.5 text-[#86EFAC] text-xs font-bold shadow-md animate-fade-in">
                    <Sparkles className="w-4 h-4 text-[#FACC15] shrink-0" />
                    <span>{welcomeBanner}</span>
                  </div>
                )}

                {/* Phone Input and Send Button */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#D1D5DB] mb-1.5 uppercase">
                      {t.phoneLabel}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <input
                          id="booking-field-phone"
                          type="tel"
                          value={phoneInput}
                          onChange={(e) => handlePhoneInputChange(e.target.value)}
                          placeholder={t.phonePlaceholder}
                          disabled={isPhoneVerified}
                          className={`w-full bg-[#080E0A] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all ${
                            isPhoneVerified
                              ? 'border border-[#22C55E] bg-[#09150C] text-[#86EFAC]'
                              : validationError?.field === 'phone'
                              ? 'border-2 border-red-500 bg-red-950/20'
                              : 'border border-[#203926] focus:border-[#22C55E]'
                          }`}
                        />
                      </div>

                      {!isPhoneVerified && (
                        <button
                          type="button"
                          onClick={() => handleSendSmsCode(Boolean(smsSentNotice))}
                          disabled={isSendingCode || cooldownSeconds > 0}
                          className="px-4 py-3 rounded-xl bg-[#22C55E] hover:bg-[#1EA750] disabled:bg-[#183620] disabled:text-[#6B7280] text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
                        >
                          {isSendingCode ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{t.btnSending}</span>
                            </>
                          ) : cooldownSeconds > 0 ? (
                            <span>{cooldownSeconds}s</span>
                          ) : smsSentNotice ? (
                            <span>{t.btnResendCode}</span>
                          ) : (
                            <span>{t.btnSendCode}</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SMS Sent Notice */}
                  {smsSentNotice && !isPhoneVerified && (
                    <div className="p-3 rounded-lg bg-[#122616] border border-[#22C55E]/40 text-xs text-[#86EFAC] flex items-center justify-between gap-2">
                      <span>{smsSentNotice}</span>
                      {cooldownSeconds > 0 && (
                        <span className="text-[10px] font-mono text-[#9CA3AF]">
                          {cooldownSeconds}s
                        </span>
                      )}
                    </div>
                  )}

                  {/* OTP Code Entry Block */}
                  {smsSentNotice && !isPhoneVerified && (
                    <div className="pt-3 border-t border-[#1A2E1E] space-y-3">
                      <div>
                        <label className="block text-xs font-mono font-bold text-[#D1D5DB] mb-1.5 uppercase">
                          {t.codeLabel}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            id="booking-field-code"
                            type="text"
                            maxLength={6}
                            value={smsCodeInput}
                            onChange={(e) => {
                              setSmsCodeInput(e.target.value);
                              if (validationError?.field === 'smsCode') setValidationError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleVerifySmsCode();
                              }
                            }}
                            placeholder={t.codePlaceholder}
                            className={`w-full bg-[#080E0A] rounded-xl px-4 py-3 text-sm text-white font-mono tracking-widest focus:outline-none transition-all ${
                              validationError?.field === 'smsCode'
                                ? 'border-2 border-red-500 bg-red-950/20'
                                : 'border border-[#203926] focus:border-[#22C55E]'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={handleVerifySmsCode}
                            disabled={isVerifyingCode || !smsCodeInput.trim()}
                            className="px-5 py-3 rounded-xl bg-[#22C55E] hover:bg-[#1EA750] disabled:bg-[#183620] disabled:text-[#6B7280] text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
                          >
                            {isVerifyingCode ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>{t.btnVerifying}</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{t.btnVerifyCode}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verified Badge */}
                  {isPhoneVerified && (
                    <div className="p-3 rounded-lg bg-[#14331C] border border-[#22C55E] flex items-center justify-between text-xs text-[#86EFAC] font-bold">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                        <span>{t.verifiedBadge}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPhoneVerified(false);
                          setSmsSentNotice(null);
                          setSmsCodeInput('');
                        }}
                        className="text-[10px] text-[#9CA3AF] hover:text-white underline cursor-pointer"
                      >
                        Modifier le numéro
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Loyalty summary display if customer exists */}
              {loyaltySummary && isPhoneVerified && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#0F2615] to-[#0A160D] border border-[#22C55E]/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-[#FACC15]" />
                      <span className="text-xs font-bold text-white uppercase">{t.loyaltyTitle}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#86EFAC]">
                      {t.loyaltyProgress(loyaltySummary.completedBookingsCount, loyaltySummary.nextRewardAt || 3)}
                    </span>
                  </div>

                  {loyaltySummary.unlockedRewards && loyaltySummary.unlockedRewards.length > 0 && (
                    <div className="pt-2 border-t border-[#1C3A22] space-y-1.5">
                      <div className="text-[11px] font-bold text-[#FACC15]">{t.availableRewardsHeading}</div>
                      {loyaltySummary.unlockedRewards.map((reward: any) => {
                        const isApplied = selectedLoyaltyReward?.id === reward.id;
                        return (
                          <div key={reward.id} className="p-2.5 rounded-lg bg-[#071209] border border-[#1E3E25] flex items-center justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-white">{reward.title[currentLang] || reward.title.fr}</div>
                              <div className="text-[10px] text-[#9CA3AF]">{reward.description[currentLang] || reward.description.fr}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedLoyaltyReward(isApplied ? null : reward)}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                isApplied
                                  ? 'bg-[#22C55E] text-black'
                                  : 'bg-[#152B1B] text-[#86EFAC] hover:bg-[#1E3E25]'
                              }`}
                            >
                              {isApplied ? t.rewardAppliedBadge : t.applyRewardBtn}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 2: NAME/EMAIL & ADDRESS / POSTAL CODE ================= */}
          {step === 2 && (
            <div className="space-y-5">
              
              {/* Name & Email Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#D1D5DB] mb-1.5 uppercase">
                    {t.nameLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="booking-field-name"
                      type="text"
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        if (validationError?.field === 'clientName') setValidationError(null);
                      }}
                      placeholder={t.namePlaceholder}
                      className={`w-full bg-[#080E0A] rounded-xl pl-9 pr-3 py-3 text-sm text-white focus:outline-none transition-all ${
                        validationError?.field === 'clientName'
                          ? 'border-2 border-red-500 bg-red-950/20'
                          : 'border border-[#203926] focus:border-[#22C55E]'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#D1D5DB] mb-1.5 uppercase">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="booking-field-email"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full bg-[#080E0A] rounded-xl pl-9 pr-3 py-3 text-sm text-white border border-[#203926] focus:border-[#22C55E] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Google Maps Address Autocomplete Field */}
              <div className="relative" id="booking-field-address-container">
                <label className="block text-xs font-mono font-bold text-[#D1D5DB] mb-1.5 uppercase">
                  {t.addressLabel}
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#22C55E]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    id="booking-field-address"
                    type="text"
                    value={addressInput}
                    onChange={handleAddressInputChange}
                    onFocus={() => {
                      if (addressSuggestions.length > 0) setShowSuggestionsDropdown(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestionsDropdown(false), 250);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (addressSuggestions.length > 0) {
                          handleSelectAddressSuggestion(addressSuggestions[0]);
                        }
                      }
                    }}
                    placeholder={t.addressPlaceholder}
                    className={`w-full bg-[#080E0A] rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none transition-all ${
                      validationError?.field === 'serviceAddress'
                        ? 'border-2 border-red-500 bg-red-950/20'
                        : isAddressConfirmed
                        ? 'border border-[#22C55E] bg-[#09150C]'
                        : 'border border-[#203926] focus:border-[#22C55E]'
                    }`}
                  />
                  {isSearchingAddress && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <Loader2 className="w-4 h-4 text-[#22C55E] animate-spin" />
                    </div>
                  )}
                </div>

                {/* Google Places Dropdown */}
                {showSuggestionsDropdown && addressSuggestions.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#0D1810] border border-[#22C55E]/60 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                    {addressSuggestions.map((sug) => (
                      <button
                        key={sug.placeId}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectAddressSuggestion(sug);
                        }}
                        onClick={() => handleSelectAddressSuggestion(sug)}
                        className="w-full px-4 py-3 text-left text-xs text-[#D1D5DB] hover:bg-[#152D1B] hover:text-white transition-colors flex items-start gap-2 border-b border-[#1A2E1E] last:border-0 cursor-pointer min-h-[44px]"
                      >
                        <MapPin className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white truncate">{sug.mainText}</div>
                          <div className="text-[10px] text-[#9CA3AF] truncate">{sug.secondaryText}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Postal Code Field (Populated from Google or entered manually) */}
              <div className="p-4 rounded-xl bg-[#09140C] border border-[#1B3220] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-bold text-[#D1D5DB] uppercase">
                    {t.postalCodeLabel}
                  </label>
                  {postalCodeInput && validateCanadianPostalCode(postalCodeInput) && (
                    <span className="text-[10px] font-mono text-[#86EFAC] bg-[#14301B] px-2 py-0.5 rounded border border-[#22C55E]/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                      <span>Code postal validé</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="booking-field-postal"
                    type="text"
                    maxLength={7}
                    value={postalCodeInput}
                    onChange={handlePostalCodeChange}
                    onBlur={handlePostalCodeBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePostalCodeBlur();
                        if (validateStep(2)) {
                          handleNext();
                        }
                      }
                    }}
                    placeholder={t.postalCodePlaceholder}
                    className={`w-40 bg-[#080E0A] rounded-xl px-4 py-2.5 text-sm text-white font-mono uppercase focus:outline-none transition-all ${
                      validationError?.field === 'postalCode' || postalCodeErrorNotice
                        ? 'border-2 border-red-500 bg-red-950/20'
                        : postalCodeInput && validateCanadianPostalCode(postalCodeInput)
                        ? 'border border-[#22C55E] bg-[#0A1A0E] text-[#86EFAC]'
                        : 'border border-[#203926] focus:border-[#22C55E]'
                    }`}
                  />
                  <span className="text-[11px] text-[#9CA3AF]">
                    Format canadien normalisé : <span className="font-mono text-white">A1A 1A1</span>
                  </span>
                </div>

                {postalCodeErrorNotice && (
                  <p className="text-[11px] text-[#EF4444] font-medium">
                    {postalCodeErrorNotice}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 3: PRESTATIONS & DATE / TIME ================= */}
          {step === 3 && (
            <div className="space-y-6">

              {/* Selected Services / Cart List */}
              <div
                id="booking-field-cart"
                className={`space-y-3 p-4 rounded-xl border transition-all ${
                  validationError?.field === 'cart'
                    ? 'border-2 border-red-500 bg-red-950/20'
                    : 'bg-[#0D1810] border-[#1C3221]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-[#D1D5DB] uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#22C55E]" />
                    <span>Prestations dans votre panier ({cart.items.length})</span>
                  </h4>

                  {isAutoPromoActive() && hasAutoInCart && (
                    <span className="text-[10px] font-mono font-bold bg-[#DC2626]/20 text-[#FCA5A5] border border-[#DC2626]/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Flame className="w-3 h-3 text-[#F97316]" />
                      <span>{AUTO_LAUNCH_PROMO.badgeText[currentLang] || AUTO_LAUNCH_PROMO.badgeText.fr}</span>
                    </span>
                  )}
                </div>

                {cart.items.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#9CA3AF]">
                    Aucune prestation dans le panier. Ajoutez un service ci-dessous.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.items.map((item) => {
                      const isAuto = item.category === 'auto';
                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg bg-[#09110B] border border-[#1A2E1E] flex items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">
                                {item.name[currentLang] || item.name.fr}
                              </span>
                              {isAuto && isAutoPromoActive() && (
                                <span className="text-[9px] font-mono font-bold bg-[#22C55E]/20 text-[#86EFAC] px-1.5 py-0.2 rounded">
                                  -20 $ PROMO
                                </span>
                              )}
                            </div>
                            {item.details && (
                              <div className="text-[10px] text-[#9CA3AF]">
                                {item.details[currentLang] || item.details.fr}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-[#050A06] border border-[#1A2E1E] rounded-lg">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, -1)}
                                className="px-2 py-1 text-xs text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-mono font-bold text-white">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, 1)}
                                className="px-2 py-1 text-xs text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right min-w-[60px]">
                              <span className="text-xs font-mono font-black text-[#22C55E]">
                                {item.totalPrice} $
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 text-[#6B7280] hover:text-[#EF4444] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Add services picker */}
                <div className="pt-3 border-t border-[#1A2E1E] space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#9CA3AF] block">
                    Ajouter d'autres prestations en 1 clic :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {FURNITURE_SERVICES.slice(0, 3).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleToggleServiceItem(f, 'furniture')}
                        className="px-2.5 py-1 rounded-lg bg-[#08120A] border border-[#1E3623] hover:border-[#22C55E] text-[11px] text-[#D1D5DB] hover:text-white transition-colors cursor-pointer"
                      >
                        + {f.name[currentLang] || f.name.fr} ({f.price} $)
                      </button>
                    ))}
                    {EXTRA_SERVICES.slice(0, 3).map((extra) => (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() => handleToggleExtraOption(extra.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#08120A] border border-[#1E3623] hover:border-[#22C55E] text-[11px] text-[#D1D5DB] hover:text-white transition-colors cursor-pointer"
                      >
                        + {extra.name[currentLang] || extra.name.fr} ({extra.price} $)
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cart Pricing Breakdown */}
                <div className="pt-3 border-t border-[#1A2E1E] space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-[#9CA3AF]">
                    <span>{t.subtotalLabel}</span>
                    <span>{cart.subtotal} $ CAD</span>
                  </div>

                  {selectedLoyaltyReward && loyaltyCreditDiscount > 0 && (
                    <div className="flex justify-between text-[#22C55E] font-bold">
                      <span>{t.loyaltyCreditLabel}</span>
                      <span>-{loyaltyCreditDiscount} $ CAD</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-[#1A2E1E]">
                    <span>{t.totalEstimated}</span>
                    <span className="text-[#22C55E]">{finalAdjustedTotal} $ CAD</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Category Specific Inputs */}
              {hasAutoInCart && (
                <div>
                  <label className="block text-xs font-mono font-bold text-[#D1D5DB] mb-1.5 uppercase">
                    Modèle du véhicule (Marque, modèle, année) *
                  </label>
                  <input
                    id="booking-field-vehicle-desc"
                    type="text"
                    value={vehicleMakeModelInput}
                    onChange={(e) => {
                      setVehicleMakeModelInput(e.target.value);
                      if (validationError?.field === 'vehicleMakeModel') setValidationError(null);
                    }}
                    placeholder="ex: Toyota RAV4 2022"
                    className="w-full bg-[#080E0A] rounded-xl px-4 py-2.5 text-sm text-white border border-[#203926] focus:border-[#22C55E] focus:outline-none"
                  />
                </div>
              )}

              {hasFurnitureInCart && (
                <div>
                  <label className="block text-xs font-mono font-bold text-[#D1D5DB] mb-1.5 uppercase">
                    Description du meuble (Type, tissu, nombre de places) *
                  </label>
                  <input
                    id="booking-field-furniture-desc"
                    type="text"
                    value={furnitureDescInput}
                    onChange={(e) => {
                      setFurnitureDescInput(e.target.value);
                      if (validationError?.field === 'furnitureDesc') setValidationError(null);
                    }}
                    placeholder="ex: Divan sectionnel en L, tissu microfibre gris"
                    className="w-full bg-[#080E0A] rounded-xl px-4 py-2.5 text-sm text-white border border-[#203926] focus:border-[#22C55E] focus:outline-none"
                  />
                </div>
              )}

              {hasCarpetInCart && (
                <div>
                  <label className="block text-xs font-mono font-bold text-[#D1D5DB] mb-1.5 uppercase">
                    Description du tapis (Dimensions approx, laine/synthétique) *
                  </label>
                  <input
                    id="booking-field-carpet-desc"
                    type="text"
                    value={carpetDescInput}
                    onChange={(e) => {
                      setCarpetDescInput(e.target.value);
                      if (validationError?.field === 'carpetDesc') setValidationError(null);
                    }}
                    placeholder="ex: Tapis de salon 8x10 pieds, poils courts"
                    className="w-full bg-[#080E0A] rounded-xl px-4 py-2.5 text-sm text-white border border-[#203926] focus:border-[#22C55E] focus:outline-none"
                  />
                </div>
              )}

              {hasMattressInCart && (
                <div>
                  <label className="block text-xs font-mono font-bold text-[#D1D5DB] mb-1.5 uppercase">
                    Taille et faces du matelas *
                  </label>
                  <input
                    id="booking-field-mattress-desc"
                    type="text"
                    value={mattressDescInput}
                    onChange={(e) => {
                      setMattressDescInput(e.target.value);
                      if (validationError?.field === 'mattressDesc') setValidationError(null);
                    }}
                    placeholder="ex: Matelas Queen, nettoyage 2 côtés"
                    className="w-full bg-[#080E0A] rounded-xl px-4 py-2.5 text-sm text-white border border-[#203926] focus:border-[#22C55E] focus:outline-none"
                  />
                </div>
              )}

              {hasTruckInCart && (
                <div>
                  <label className="block text-xs font-mono font-bold text-[#D1D5DB] mb-1.5 uppercase">
                    Description du camion lourd ou VR *
                  </label>
                  <input
                    id="booking-field-truck-desc"
                    type="text"
                    value={truckDescInput}
                    onChange={(e) => {
                      setTruckDescInput(e.target.value);
                      if (validationError?.field === 'truckDesc') setValidationError(null);
                    }}
                    placeholder="ex: Tracteur routier Kenworth T680, cabine couchette"
                    className="w-full bg-[#080E0A] rounded-xl px-4 py-2.5 text-sm text-white border border-[#203926] focus:border-[#22C55E] focus:outline-none"
                  />
                </div>
              )}

              {/* Date & Time Slot Selection */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#D1D5DB] mb-1.5 uppercase">
                      {t.dateLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#22C55E]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input
                        id="booking-field-date"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.preferredDate}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          const newSlotOptions = getTimeSlotOptionsForDate(newDate);

                          setFormData(prev => ({
                            ...prev,
                            preferredDate: newDate,
                            preferredTimeSlot: newSlotOptions[0]?.value || ''
                          }));

                          if (
                            validationError?.field === 'preferredDate' ||
                            validationError?.field === 'preferredTimeSlot'
                          ) {
                            setValidationError(null);
                          }
                        }}
                        className={`w-full bg-[#080E0A] rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none transition-all ${
                          validationError?.field === 'preferredDate'
                            ? 'border-2 border-red-500 bg-red-950/20'
                            : 'border border-[#203926] focus:border-[#22C55E]'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-[#D1D5DB] mb-1.5 uppercase">
                      {t.timeSlotLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#22C55E]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <select
                        id="booking-field-timeslot"
                        value={formData.preferredTimeSlot}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, preferredTimeSlot: e.target.value }));
                          if (validationError?.field === 'preferredTimeSlot') setValidationError(null);
                        }}
                        className={`w-full bg-[#080E0A] rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:border-[#22C55E] focus:outline-none transition-all ${
                          validationError?.field === 'preferredTimeSlot'
                            ? 'border-2 border-red-500 bg-red-950/20'
                            : 'border border-[#203926]'
                        }`}
                      >
                        {getTimeSlotOptionsForDate(formData.preferredDate).map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label[currentLang] || opt.label.fr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Availability Notice Banner */}
                {formData.preferredDate && (() => {
                  const scheduleRule = getScheduleRuleForDate(formData.preferredDate);
                  if (!scheduleRule) return null;
                  return (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0F2013] border border-[#22C55E]/40 text-xs text-[#86EFAC]">
                      <Clock className="w-4 h-4 text-[#22C55E] shrink-0" />
                      <span>{scheduleRule.availableNotice[currentLang] || scheduleRule.availableNotice.fr}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#D1D5DB] mb-1.5 uppercase">
                  {t.notesLabel}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  placeholder="ex: Prise électrique disponible, tache de café sur siège passager..."
                  className="w-full bg-[#080E0A] rounded-xl p-3 text-xs text-white border border-[#203926] focus:border-[#22C55E] focus:outline-none"
                />
              </div>

            </div>
          )}

          {/* ================= STEP 4: SUMMARY & CONFIRM ================= */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="p-4 sm:p-5 rounded-xl bg-[#0D1910] border border-[#1E3E25] space-y-4">
                <h4 className="text-xs font-mono font-bold text-[#86EFAC] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  <span>Récapitulatif de votre rendez-vous</span>
                </h4>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#071109] border border-[#162C1B]">
                    <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">Client</div>
                    <div className="font-bold text-white mt-0.5">{clientName || formData.clientName}</div>
                    <div className="text-[#86EFAC] font-mono mt-0.5">{phoneInput || formData.clientPhone}</div>
                    {clientEmail && <div className="text-[#9CA3AF] mt-0.5">{clientEmail}</div>}
                  </div>

                  <div className="p-3 rounded-lg bg-[#071109] border border-[#162C1B]">
                    <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">Lieu & Date</div>
                    <div className="font-bold text-white mt-0.5">{addressInput || formData.serviceAddress}</div>
                    <div className="text-[#86EFAC] font-mono mt-0.5">
                      Code postal : {postalCodeInput || formData.confirmedPostalCode || formData.postalCode}
                    </div>
                    <div className="text-[#D1D5DB] mt-0.5">
                      {formData.preferredDate} ({getLocalizedSlotLabel(formData.preferredDate, formData.preferredTimeSlot, currentLang)})
                    </div>
                  </div>
                </div>

                {/* Services List */}
                <div className="space-y-2 pt-2 border-t border-[#18341E]">
                  <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">Prestations sélectionnées ({cart.items.length})</div>
                  {cart.items.map((it) => (
                    <div key={it.id} className="flex justify-between items-center text-xs">
                      <span className="text-white">{it.quantity} × {it.name[currentLang] || it.name.fr}</span>
                      <span className="font-mono text-[#86EFAC] font-bold">{it.totalPrice} $ CAD</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-[#18341E] flex justify-between items-center text-base font-bold">
                  <span className="text-white">Total estimé :</span>
                  <span className="text-xl font-mono font-black text-[#22C55E]">{finalAdjustedTotal} $ CAD</span>
                </div>
              </div>

              {submissionError && (
                <div className="p-4 rounded-xl bg-[#2A0E0E] border-2 border-red-500 text-xs text-white space-y-2">
                  <div className="font-bold flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{t.errorHeader}</span>
                  </div>
                  <p>{submissionError}</p>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 5: SUCCESS CONFIRMATION ================= */}
          {step === 5 && bookingResult && (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#173D22] border-2 border-[#22C55E] text-[#22C55E] flex items-center justify-center mx-auto animate-bounce-subtle">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-heading text-lg sm:text-xl font-black text-white uppercase">
                  {t.successHeader}
                </h4>
                <p className="text-xs text-[#9CA3AF] mt-1 max-w-md mx-auto">
                  {t.successSub}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0C1A10] border border-[#1F4228] text-xs font-mono max-w-md mx-auto space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">{t.refNumber}</span>
                  <span className="text-[#22C55E] font-bold">{bookingResult.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">{t.statusLabel}</span>
                  <span className="text-white uppercase">{bookingResult.status || 'CONFIRMED'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-4 py-2.5 rounded-xl bg-[#142A1A] border border-[#22C55E]/40 hover:border-[#22C55E] text-xs text-[#86EFAC] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedToast ? t.copiedSuccess : t.btnCopySummary}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendSms}
                  className="px-4 py-2.5 rounded-xl bg-[#142A1A] border border-[#22C55E]/40 hover:border-[#22C55E] text-xs text-[#86EFAC] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t.btnSmsMax}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer Navigation */}
        <div className="p-4 sm:p-5 border-t border-[#1A301E] bg-[#0A140D] flex items-center justify-between gap-3">
          {step > 1 && step < 5 ? (
            <button
              type="button"
              onClick={() => {
                setValidationError(null);
                setStep((prev) => (prev - 1) as any);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#122416] border border-[#1E3823] hover:border-[#22C55E] text-xs font-bold text-[#D1D5DB] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.btnBack}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-xl bg-[#22C55E] hover:bg-[#1EA750] text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg ml-auto"
            >
              <span>{t.btnNext}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : step === 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-[#22C55E] hover:bg-[#1EA750] disabled:bg-[#183620] disabled:text-[#6B7280] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg ml-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.btnProcessing}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.btnConfirmSquare}</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#1EA750] text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ml-auto"
            >
              {t.btnClose}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
