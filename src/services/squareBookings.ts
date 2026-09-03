import { BookingCart, AutoBookingFormData, Language, CartItem } from '../types';
import { DYNASTIE_INFO } from '../data/dynastieData';
import { getApiUrl } from '../config/api';
import { getLocalizedSlotLabel, validateBookingSchedule } from '../config/bookingSchedule';

export interface SquareApiErrorDetail {
  category: string;
  code: string;
  detail: string;
  field?: string;
}

export interface SquareApiBookingResult {
  success: boolean;
  bookingId?: string;
  status?: string;
  version?: number;
  startAt?: string;
  locationId?: string;
  customerId?: string;
  createdAt?: string;
  totalPrice?: number;
  error?: string;
  details?: string;
  squareErrors?: SquareApiErrorDetail[];
  diagnostic?: any;
}

export interface SquareServerStatus {
  configured: boolean;
  environment: string;
  activeLocationId?: string | null;
  locations?: Array<{ id: string; name: string; address?: string }>;
  message?: string;
  error?: string;
}

/**
 * Checks Square integration status from the backend API
 */
export async function checkSquareServerStatus(): Promise<SquareServerStatus> {
  try {
    const res = await fetch(getApiUrl('/api/square/status'));
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        configured: false,
        environment: 'unknown',
        error: err.error || 'Erreur de connexion au serveur'
      };
    }
    return await res.json();
  } catch (err: any) {
    return {
      configured: false,
      environment: 'unknown',
      error: err.message || 'Impossible de joindre le serveur API'
    };
  }
}

/**
 * Searches real-time availability on Square to prevent double bookings
 */
export async function checkSquareAvailability(date: string, serviceVariationIds?: string[]) {
  try {
    const res = await fetch(getApiUrl('/api/square/availability'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, serviceVariationIds })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Executes a REAL booking request to Square Bookings API via backend route /api/square/create-booking
 */
export async function submitRealSquareBooking(
  cart: BookingCart,
  formData: AutoBookingFormData,
  lang: Language = 'fr'
): Promise<SquareApiBookingResult> {
  const payload = {
    clientName: formData.clientName,
    clientPhone: formData.clientPhone,
    clientEmail: formData.clientEmail,
    serviceAddress: formData.serviceAddress,
    postalCode: formData.confirmedPostalCode || formData.postalCode,
    confirmedPostalCode: formData.confirmedPostalCode || formData.postalCode,
    googlePostalCode: formData.googlePostalCode,
    postalCodeSource: formData.postalCodeSource,
    preferredDate: formData.preferredDate,
    preferredTimeSlot: formData.preferredTimeSlot,
    vehicleMakeModel: formData.vehicleMakeModel,
    notes: formData.notes,
    cart,
    language: lang
  };

  const response = await fetch(getApiUrl('/api/square/create-booking'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({
    success: false,
    error: 'Réponse serveur invalide'
  }));

  if (!response.ok || !data.success) {
    const errorMessage = data.error || data.message || `Erreur Square (${response.status})`;
    const err: any = new Error(errorMessage);
    err.squareErrors = data.squareErrors;
    err.diagnostic = data.diagnostic;
    throw err;
  }

  return data;
}

/**
 * Generates a clean human-readable and system-parseable Order Summary receipt
 */
export function generateOrderSummaryText(
  cart: BookingCart,
  lang: Language,
  customerData?: Partial<AutoBookingFormData>,
  bookingRef?: string
): string {
  const isFr = lang === 'fr';
  const isUa = lang === 'ua';

  const title = isFr
    ? 'RÉCAPITULATIF DE COMMANDE - MAXEXPERT360'
    : isUa
    ? 'ДЕТАЛІ ЗАМОВЛЕННЯ - MAXEXPERT360'
    : 'ORDER SUMMARY - MAXEXPERT360';

  const lines: string[] = [];
  lines.push(`==============================`);
  lines.push(title);
  if (bookingRef) {
    lines.push(`Square Booking ID: ${bookingRef}`);
  }
  lines.push(`==============================`);
  lines.push(isFr ? 'PRESTATIONS CHOISIES :' : isUa ? 'ОБРАНІ ПОСЛУГИ :' : 'SELECTED SERVICES :');

  if (cart.items.length === 0) {
    lines.push(`- ${isFr ? 'Aucun service sélectionné' : 'No service selected'}`);
  } else {
    cart.items.forEach((item, idx) => {
      const itemName = item.name[lang] || item.name.fr;
      const detailStr = item.details?.[lang] ? ` (${item.details[lang]})` : '';
      lines.push(`${idx + 1}. ${itemName}${detailStr}`);
      lines.push(`   Quantité: ${item.quantity} × ${item.unitPrice} $ = ${item.totalPrice} $ CAD`);
    });
  }

  lines.push(`------------------------------`);
  lines.push(`${isFr ? 'Sous-total' : isUa ? 'Підсумок' : 'Subtotal'}: ${cart.subtotal} $ CAD`);
  
  if (cart.minimumAdjustment > 0) {
    lines.push(`${isFr ? 'Ajustement minimum de déplacement' : 'Minimum service adjustment'}: +${cart.minimumAdjustment} $ CAD`);
  }
  
  lines.push(`${isFr ? 'TOTAL ESTIMÉ' : isUa ? 'РАЗОМ' : 'TOTAL ESTIMATE'}: ${cart.totalPrice} $ CAD`);
  lines.push(`${isFr ? 'Durée indicative' : isUa ? 'Орієнтовний час' : 'Est. Duration'}: ${cart.estimatedDuration[lang] || cart.estimatedDuration.fr}`);
  lines.push(`${isFr ? 'Service' : 'Format'}: Mobile à domicile (Drummondville)`);

  if (customerData) {
    lines.push(`------------------------------`);
    lines.push(isFr ? 'COORDONNÉES CLIENT :' : isUa ? 'КОНТАКТИ КЛІЄНТА :' : 'CUSTOMER DETAILS :');
    if (customerData.clientName) lines.push(`Nom: ${customerData.clientName}`);
    if (customerData.clientPhone) lines.push(`Tél: ${customerData.clientPhone}`);
    if (customerData.clientEmail) lines.push(`Courriel: ${customerData.clientEmail}`);
    if (customerData.serviceAddress) lines.push(`Adresse: ${customerData.serviceAddress}`);
    if (customerData.preferredDate) {
      const slotStr = getLocalizedSlotLabel(customerData.preferredDate, customerData.preferredTimeSlot, lang);
      lines.push(`Date: ${customerData.preferredDate} (${slotStr})`);
    }
    if (customerData.vehicleMakeModel) {
      lines.push(`Objet: ${customerData.vehicleMakeModel}`);
    }
    if (customerData.notes) {
      lines.push(`Notes: ${customerData.notes}`);
    }
  }

  lines.push(`==============================`);
  lines.push(`Contact: ${DYNASTIE_INFO.phones[0].number} | ${DYNASTIE_INFO.website}`);
  return lines.join('\n');
}

/**
 * Builds the direct Square Appointments booking URL with prefilled parameters
 */
export function buildSquareBookingUrl(
  cart: BookingCart,
  customerData?: Partial<AutoBookingFormData>,
  lang: Language = 'fr'
): string {
  const baseUrl = DYNASTIE_INFO.squareBooking?.bookingUrl || 'https://squareup.com/appointments/book/maxexpert360';
  
  const summary = generateOrderSummaryText(cart, lang, customerData);
  
  const params = new URLSearchParams();
  
  if (customerData?.clientName) {
    params.set('name', customerData.clientName);
  }
  if (customerData?.clientPhone) {
    params.set('phone', customerData.clientPhone);
  }
  if (customerData?.clientEmail) {
    params.set('email', customerData.clientEmail);
  }
  if (customerData?.preferredDate) {
    params.set('date', customerData.preferredDate);
  }
  
  params.set('total', `${cart.totalPrice}`);
  params.set('note', summary);
  params.set('source', 'maxexpert360_web_cart');
  
  const primaryItem = cart.items[0];
  if (primaryItem) {
    params.set('service_id', primaryItem.id);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Prepares the payload for direct Square Bookings API integration
 */
export function createSquareBookingApiPayload(
  cart: BookingCart,
  customerData: AutoBookingFormData
) {
  const idempotencyKey = `MAX-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const summary = generateOrderSummaryText(cart, 'fr', customerData);

  let durationMinutes = 120;
  if (cart.totalPrice >= 200) {
    durationMinutes = 240;
  } else if (cart.totalPrice < 100) {
    durationMinutes = 90;
  }

  let startAt: string | undefined = undefined;
  if (customerData.preferredDate) {
    const validated = validateBookingSchedule(customerData.preferredDate, customerData.preferredTimeSlot);
    if (!validated.isValid) {
      throw new Error(validated.error?.fr || 'Créneau horaire non disponible pour cette date.');
    }
    startAt = validated.startAtIso;
  }

  return {
    idempotency_key: idempotencyKey,
    booking: {
      start_at: startAt,
      location_id: DYNASTIE_INFO.squareBooking?.locationId || 'LOC_MAXEXPERT360_DRUMMONDVILLE',
      customer_note: summary,
      seller_note: `Client: ${customerData.clientName} (${customerData.clientPhone}) | Adresse: ${customerData.serviceAddress}`,
      appointment_segments: [
        {
          duration_minutes: durationMinutes
        }
      ]
    }
  };
}

/**
 * Helper to copy summary to clipboard
 */
export async function copySummaryToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

/**
 * Creates default initial cart (SUV Interieur + Exterieur Complet + Poils d'animaux)
 */
export function createDefaultCart(): BookingCart {
  return {
    items: [
      {
        id: 'interieur_exterieur_complet_suv',
        category: 'auto',
        name: {
          fr: 'Intérieur + Extérieur Complet',
          ua: 'Комплекс: Салон + Кузов',
          en: 'Complete Interior + Exterior'
        },
        details: {
          fr: 'VUS / SUV',
          ua: 'Кросовер / VUS',
          en: 'SUV / Crossover'
        },
        quantity: 1,
        unitPrice: 179,
        totalPrice: 179
      },
      {
        id: 'poils_animaux',
        category: 'extra',
        name: {
          fr: 'Élimination poils d\'animaux & brossage',
          ua: 'Видалення шерсті тварин',
          en: 'Pet hair removal & brushing'
        },
        quantity: 1,
        unitPrice: 20,
        totalPrice: 20
      }
    ],
    subtotal: 199,
    travelFee: 0,
    minimumAdjustment: 0,
    totalPrice: 199,
    estimatedDuration: {
      fr: '3 - 4 heures',
      ua: '3 - 4 години',
      en: '3 - 4 hours'
    },
    activeCategory: 'auto'
  };
}

/**
 * Recalculates cart totals, subtotal, and duration
 */
export function calculateCartSummary(items: CartItem[], activeCategory?: 'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck' | 'extra' | 'multi'): BookingCart {
  const activeItems = items.filter(it => it.quantity > 0);
  const subtotal = activeItems.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0);
  
  // No minimum service fee
  const minimumAdjustment = 0;
  const totalPrice = subtotal;

  let durFr = '2 - 3 heures';
  let durUa = '2 - 3 години';
  let durEn = '2 - 3 hours';

  if (totalPrice >= 250) {
    durFr = '4 - 6 heures';
    durUa = '4 - 6 годин';
    durEn = '4 - 6 hours';
  } else if (totalPrice >= 170) {
    durFr = '3 - 4 heures';
    durUa = '3 - 4 години';
    durEn = '3 - 4 hours';
  } else if (totalPrice < 120 && totalPrice > 0) {
    durFr = '1 - 2 heures';
    durUa = '1 - 2 години';
    durEn = '1 - 2 hours';
  }

  return {
    items: activeItems,
    subtotal,
    travelFee: 0,
    minimumAdjustment,
    totalPrice,
    estimatedDuration: {
      fr: durFr,
      ua: durUa,
      en: durEn
    },
    activeCategory: activeCategory || (activeItems.length > 1 ? 'multi' : activeItems[0]?.category || 'auto')
  };
}

// ================= CUSTOMER AUTH & SMS VERIFICATION =================

export interface SmsVerificationResponse {
  success: boolean;
  message?: string;
  maskedPhone?: string;
  normalizedPhone?: string;
  cooldownSeconds?: number;
  isResend?: boolean;
  error?: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  verified: boolean;
  isReturning: boolean;
  error?: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    primaryAddress?: string;
    addressDetails?: any;
    postalCode?: string;
    completedBookingsCount: number;
    lastBookingDate?: string;
    bookingHistory?: any[];
  } | null;
  loyalty?: {
    completedBookingsCount: number;
    nextRewardAt: number | null;
    visitsUntilNextReward: number;
    unlockedRewards: Array<{
      id: string;
      title: { fr: string; ua: string; en: string };
      description: { fr: string; ua: string; en: string };
      requiredVisits: number;
      rewardValue: number;
      rewardType: 'service' | 'credit';
      claimed: boolean;
    }>;
    allTiers: any[];
  };
  welcomeMessage?: string;
}

export async function requestSmsVerification(phone: string, isResend = false): Promise<SmsVerificationResponse> {
  const response = await fetch(getApiUrl('/api/auth/send-code'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, isResend })
  });

  const data = await response.json().catch(() => ({
    success: false,
    error: 'Impossible d’envoyer le code pour le moment. Veuillez réessayer.'
  }));

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Impossible d’envoyer le code pour le moment. Veuillez réessayer.');
  }

  return data;
}

export async function verifySmsCode(phone: string, code: string): Promise<VerifyCodeResponse> {
  const response = await fetch(getApiUrl('/api/auth/verify-code'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code })
  });

  const data = await response.json().catch(() => ({
    success: false,
    error: 'Impossible d’envoyer le code pour le moment. Veuillez réessayer.'
  }));

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Le code de vérification est incorrect.');
  }

  return data;
}

export interface CustomerLookupResult {
  success: boolean;
  exists: boolean;
  isReturning: boolean;
  verified?: boolean;
  welcomeMessage?: string | null;
  customer?: any;
  loyalty?: any;
}

export async function lookupCustomerPhone(phone: string): Promise<CustomerLookupResult> {
  if (!phone || !phone.trim()) {
    return { success: false, exists: false, isReturning: false, welcomeMessage: null };
  }

  try {
    const response = await fetch(getApiUrl(`/api/customers/lookup?phone=${encodeURIComponent(phone.trim())}`));
    if (!response.ok) {
      return { success: false, exists: false, isReturning: false, welcomeMessage: null };
    }
    const data = await response.json();
    return data;
  } catch {
    return { success: false, exists: false, isReturning: false, welcomeMessage: null };
  }
}

/**
 * Validates and normalizes Canadian mobile phone numbers to E.164 (+1XXXXXXXXXX)
 */
export function normalizeCanadianPhoneClient(rawPhone: string): {
  isValid: boolean;
  e164: string;
  formatted: string;
} {
  if (!rawPhone) return { isValid: false, e164: '', formatted: '' };

  const digits = rawPhone.replace(/\D/g, '');
  let tenDigit = '';

  if (digits.length === 10) {
    tenDigit = digits;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    tenDigit = digits.substring(1);
  } else {
    return { isValid: false, e164: '', formatted: rawPhone };
  }

  // Validate North American Numbering Plan area code and exchange code (first digit between 2-9)
  const areaCodeFirst = parseInt(tenDigit.charAt(0), 10);
  const exchangeFirst = parseInt(tenDigit.charAt(3), 10);
  if (areaCodeFirst < 2 || exchangeFirst < 2) {
    return { isValid: false, e164: '', formatted: rawPhone };
  }

  const e164 = `+1${tenDigit}`;
  const formatted = `(${tenDigit.substring(0, 3)}) ${tenDigit.substring(3, 6)}-${tenDigit.substring(6)}`;

  return { isValid: true, e164, formatted };
}

// ================= GOOGLE MAPS ADDRESS AUTOCOMPLETE =================

export interface AddressSuggestionItem {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface ParsedAddressResult {
  placeId: string;
  place_id?: string;
  formattedAddress: string;
  formatted_address?: string;
  streetNumber: string;
  street_number?: string;
  streetName: string;
  route?: string;
  city: string;
  province: string;
  postalCode: string;
  postal_code?: string;
  googlePostalCode?: string;
  confirmedPostalCode?: string;
  postalCodeSource?: 'manual' | 'google';
  postalCodeStatus?: 'suggested' | 'manually_confirmed' | 'externally_verified';
  country: string;
  latitude: number;
  longitude: number;
  hasValidPostalCode: boolean;
  isVerified?: boolean;
  placeDetailsPostalCode?: string;
  geocodingPostalCode?: string;
  postalCodeMismatch?: boolean;
  postalCodeErrorMessage?: string;
}

export async function fetchAddressSuggestions(input: string): Promise<AddressSuggestionItem[]> {
  if (!input || input.trim().length < 2) return [];

  const response = await fetch(getApiUrl(`/api/maps/autocomplete?input=${encodeURIComponent(input.trim())}`));
  if (!response.ok) return [];

  const data = await response.json().catch(() => ({ suggestions: [] }));
  return Array.isArray(data.suggestions) ? data.suggestions : [];
}

export async function fetchPlaceDetails(placeId: string, addressFallback?: string): Promise<ParsedAddressResult | null> {
  const params = new URLSearchParams();
  if (placeId) params.set('placeId', placeId);
  if (addressFallback) params.set('address', addressFallback);

  const response = await fetch(getApiUrl(`/api/maps/place-details?${params.toString()}`));
  if (!response.ok) return null;

  const data = await response.json().catch(() => ({ success: false }));
  return data.success && data.details ? data.details : null;
}

/**
 * Helper to safely extract address component by type from Google Places addressComponents
 */
export function getAddressComponent(
  components: Array<{ long_name?: string; short_name?: string; longText?: string; shortText?: string; types?: string[] }> | null | undefined,
  type: string
): string {
  if (!components) return '';
  const component = components.find((c) => c.types?.includes(type));
  return component?.longText || component?.long_name || component?.shortText || component?.short_name || '';
}

/**
 * Standard Canadian Postal Code Regular Expression after normalization (^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] \d[ABCEGHJ-NPRSTV-Z]\d$)
 */
export const CANADIAN_POSTAL_CODE_REGEX = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] \d[ABCEGHJ-NPRSTV-Z]\d$/;

/**
 * Normalizes a Canadian postal code cleanly to standard "A1A 1A1"
 * Accepts: A1A1A1, a1a1a1, A1A 1A1, j2c 1n8, etc. -> A1A 1A1
 */
export function normalizeCanadianPostalCode(value?: string): string {
  if (!value) return '';
  const cleaned = value
    .replace(/\s+/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);
  if (cleaned.length <= 3) return cleaned;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
}

/**
 * Validates Canadian Postal Code format after normalization
 */
export function isValidCanadianPostalCode(value?: string): boolean {
  if (!value) return false;
  const normalized = normalizeCanadianPostalCode(value);
  return CANADIAN_POSTAL_CODE_REGEX.test(normalized);
}

export const validateCanadianPostalCode = isValidCanadianPostalCode;

/**
 * Formats and normalizes a Canadian postal code cleanly with a space (e.g. "a1a1a1" -> "A1A 1A1")
 */
export function formatCanadianPostalCode(postalCode?: string): string {
  return normalizeCanadianPostalCode(postalCode);
}
