export type ServiceTypeCategory = 'auto' | 'suv' | 'truck_van' | 'heavy_truck' | 'rv' | 'sofa' | 'carpet' | 'mattress';

export type VehicleCategory = 'auto' | 'suv' | 'truck_van' | 'heavy_truck' | 'rv' | 'sofa' | 'carpet' | 'mattress';

export type Language = 'fr' | 'ua' | 'en';

export interface ExtraDetailingService {
  id: string;
  name: {
    fr: string;
    ua: string;
    en: string;
  };
  price: number;
  priceMax?: number;
  unit: {
    fr: string;
    ua: string;
    en: string;
  };
  iconName: string;
  category: 'cleaning' | 'stains' | 'furniture' | 'special';
  description: {
    fr: string;
    ua: string;
    en: string;
  };
}

export interface DetailingPackage {
  id: string;
  title: {
    fr: string;
    ua: string;
    en: string;
  };
  tagline: {
    fr: string;
    ua: string;
    en: string;
  };
  badge?: {
    fr: string;
    ua: string;
    en: string;
  };
  popular?: boolean;
  prices: {
    auto: number;
    suv: number;
    truck_van: number;
    heavy_truck?: number;
    rv?: number;
    sofa?: number;
    carpet?: number;
    mattress?: number;
  };
  duration: {
    fr: string;
    ua: string;
    en: string;
  };
  image: string;
  features: {
    fr: string[];
    ua: string[];
    en: string[];
  };
}

export interface DetailingServiceItem {
  id: string;
  title: {
    fr: string;
    ua: string;
    en: string;
  };
  shortDesc: {
    fr: string;
    ua: string;
    en: string;
  };
  fullDesc: {
    fr: string;
    ua: string;
    en: string;
  };
  priceStart: number;
  priceUnit?: string;
  iconName: string;
  image: string;
  subcategories?: {
    fr: string[];
    ua: string[];
    en: string[];
  };
  highlights: {
    fr: string[];
    ua: string[];
    en: string[];
  };
}

export interface BeforeAfterAutoItem {
  id: string;
  title: {
    fr: string;
    ua: string;
    en: string;
  };
  category: {
    fr: string;
    ua: string;
    en: string;
  };
  description: {
    fr: string;
    ua: string;
    en: string;
  };
  beforeImage: string;
  afterImage: string;
  vehicleModel: string;
  timeSpent: string;
}

export interface AutoReviewItem {
  id: string;
  name: string;
  location: string;
  vehicle: string;
  rating: number;
  date: string;
  service: {
    fr: string;
    ua: string;
    en: string;
  };
  text: {
    fr: string;
    ua: string;
    en: string;
  };
  verified: boolean;
}

export interface DetailingFaqItem {
  id: string;
  question: {
    fr: string;
    ua: string;
    en: string;
  };
  answer: {
    fr: string;
    ua: string;
    en: string;
  };
  category: 'mobile' | 'pricing' | 'furniture' | 'care';
}

export interface CartItem {
  id: string;
  category: 'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck' | 'extra';
  name: {
    fr: string;
    ua: string;
    en: string;
  };
  details?: {
    fr?: string;
    ua?: string;
    en?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BookingCart {
  items: CartItem[];
  subtotal: number;
  travelFee: number;
  minimumAdjustment: number;
  totalPrice: number;
  estimatedDuration: {
    fr: string;
    ua: string;
    en: string;
  };
  activeCategory?: 'auto' | 'furniture' | 'carpet' | 'mattress' | 'truck' | 'extra' | 'multi';
}

export interface AutoCalculatorState {
  vehicleCategory: VehicleCategory;
  packageId: string;
  feetLength?: number;
  carpetSqFt?: number;
  selectedExtras: string[];
  serviceLocation: 'mobile' | 'workshop';
  frequencyDiscount?: string;
}

export interface ParsedAddressDetails {
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

export interface AutoBookingFormData {
  vehicleCategory: VehicleCategory;
  vehicleMakeModel: string;
  vehicleYear?: string;
  packageId: string;
  feetLength?: number;
  selectedExtras: string[];
  serviceLocation: 'mobile' | 'workshop';
  serviceAddress: string;
  address?: string;
  formattedAddress?: string;
  streetNumber?: string;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  googlePostalCode?: string;
  confirmedPostalCode?: string;
  postalCodeSource?: 'manual' | 'google';
  postalCodeStatus?: 'suggested' | 'manually_confirmed' | 'externally_verified';
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  placeId?: string;
  googlePlaceId?: string;
  addressVerified?: boolean;
  addressValidated?: boolean;
  addressDetails?: ParsedAddressDetails;
  preferredDate: string;
  preferredTimeSlot: 'morning' | 'afternoon' | 'flexible';
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
  contactMethod?: 'phone' | 'sms' | 'facebook' | 'email';
  totalPrice?: number;
  selectedRewardId?: string;
  rewardDiscount?: number;
}

