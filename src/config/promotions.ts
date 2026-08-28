export interface AutoPromoConfig {
  enabled: boolean;
  discountAmount: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  title: {
    fr: string;
    ua: string;
    en: string;
  };
  badgeText: {
    fr: string;
    ua: string;
    en: string;
  };
  description: {
    fr: string;
    ua: string;
    en: string;
  };
}

export const AUTO_LAUNCH_PROMO: AutoPromoConfig = {
  enabled: false,
  discountAmount: 0,
  startDate: '2025-01-01',
  endDate: '2026-12-31',
  title: {
    fr: '',
    ua: '',
    en: ''
  },
  badgeText: {
    fr: '',
    ua: '',
    en: ''
  },
  description: {
    fr: '',
    ua: '',
    en: ''
  }
};

/**
 * Checks if the Auto launch promotion is currently active
 */
export function isAutoPromoActive(config: AutoPromoConfig = AUTO_LAUNCH_PROMO): boolean {
  if (!config.enabled) return false;
  
  const today = new Date().toISOString().split('T')[0];
  if (config.startDate && today < config.startDate) return false;
  if (config.endDate && today > config.endDate) return false;
  
  return true;
}

/**
 * Calculates promo discount for an eligible service category
 * Eligible: auto detailing packages (category === 'auto' or packageId is an auto package)
 * Ineligible: sofa, carpet, mattress, commercial truck
 */
export function calculateServicePrice(
  basePrice: number,
  category: string,
  config: AutoPromoConfig = AUTO_LAUNCH_PROMO
): { regularPrice: number; finalPrice: number; discount: number; isPromoApplied: boolean } {
  const isAutoCategory = category === 'auto' || category === 'suv' || category === 'truck_van';
  const active = isAutoPromoActive(config) && isAutoCategory;
  
  if (active && basePrice > config.discountAmount) {
    return {
      regularPrice: basePrice,
      finalPrice: basePrice - config.discountAmount,
      discount: config.discountAmount,
      isPromoApplied: true
    };
  }
  
  return {
    regularPrice: basePrice,
    finalPrice: basePrice,
    discount: 0,
    isPromoApplied: false
  };
}
