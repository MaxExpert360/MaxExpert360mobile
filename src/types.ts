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

export interface AutoCalculatorState {
  vehicleCategory: VehicleCategory;
  packageId: string;
  carpetSqFt?: number;
  selectedExtras: string[];
  serviceLocation: 'mobile' | 'workshop';
}

export interface AutoBookingFormData {
  vehicleCategory: VehicleCategory;
  vehicleMakeModel: string;
  packageId: string;
  selectedExtras: string[];
  serviceLocation: 'mobile' | 'workshop';
  address: string;
  city: string;
  date: string;
  timeSlot: string;
  clientName: string;
  phone: string;
  email: string;
  contactMethod: 'phone' | 'sms' | 'facebook' | 'email';
  comments: string;
  totalPrice: number;
}

