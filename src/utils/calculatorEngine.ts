/**
 * Unified Calculation Engine for MAX EXPERT 360 MOBILE
 * Single source of truth for prices, durations, extras, and discounts.
 * Used by CostCalculator, DifficultStainsSection, BookingCart, BookingModal, and Square API.
 */

import { Language, VehicleCategory, ExtraDetailingService } from '../types';
import { DETAILING_PACKAGES, EXTRA_SERVICES } from '../data/dynastieData';
import { formatDurationLocalized, formatSingleDuration } from './durationFormatter';

export interface UnifiedCalculationResult {
  basePrice: number;
  extrasSum: number;
  discountAmount: number;
  totalPrice: number;
  uniqueExtrasList: Array<ExtraDetailingService & { quantity: number; itemTotalPrice: number; itemTotalMinutes: number }>;
  durationMinutesRange: {
    min: number;
    max: number;
  };
  totalMinutesAverage: number;
  durationFormatted: {
    fr: string;
    ua: string;
    en: string;
  };
}

export function calculateUnifiedBookingTotal(params: {
  vehicleCategory?: VehicleCategory | string;
  packageId?: string;
  selectedExtras?: string[];
  extraQuantities?: Record<string, number>;
  discountAmount?: number;
  customBasePrice?: number;
  customDurationMinutes?: { min: number; max: number };
}): UnifiedCalculationResult {
  const {
    vehicleCategory = 'suv',
    packageId = 'complet',
    selectedExtras = [],
    extraQuantities = {},
    discountAmount = 0,
    customBasePrice,
    customDurationMinutes
  } = params;

  // 1. Determine base package price and duration
  let basePrice = 0;
  let baseMinMinutes = 180;
  let baseMaxMinutes = 240;

  if (typeof customBasePrice === 'number') {
    basePrice = customBasePrice;
    if (customDurationMinutes) {
      baseMinMinutes = customDurationMinutes.min;
      baseMaxMinutes = customDurationMinutes.max;
    }
  } else {
    const pkg = DETAILING_PACKAGES.find(p => p.id === packageId) || DETAILING_PACKAGES[1];
    const catKey: 'auto' | 'suv' | 'truck_van' = 
      (vehicleCategory === 'suv' || vehicleCategory === 'truck_van') ? vehicleCategory : 'auto';
    basePrice = pkg.prices[catKey] ?? pkg.prices.auto;

    if (pkg.id === 'express') {
      baseMinMinutes = 90;
      baseMaxMinutes = 120;
    } else if (pkg.id === 'remise_a_neuf') {
      baseMinMinutes = 240;
      baseMaxMinutes = 360;
    } else {
      // complet
      baseMinMinutes = 180;
      baseMaxMinutes = 240;
    }
  }

  // 2. Strict Deduplication of extra service IDs
  const uniqueIds = Array.from(new Set(selectedExtras.filter(Boolean)));
  let extrasSum = 0;
  let extraMinutes = 0;

  const uniqueExtrasList: Array<ExtraDetailingService & { quantity: number; itemTotalPrice: number; itemTotalMinutes: number }> = [];

  for (const extraId of uniqueIds) {
    const extra = EXTRA_SERVICES.find(e => e.id === extraId);
    if (!extra) continue;

    const qty = Math.max(1, Number(extraQuantities[extra.id]) || 1);
    const itemTotalPrice = extra.price * qty;
    const durHours = extra.durationHours ?? 1;
    const itemTotalMinutes = Math.round(durHours * 60 * qty);

    extrasSum += itemTotalPrice;
    extraMinutes += itemTotalMinutes;

    uniqueExtrasList.push({
      ...extra,
      quantity: qty,
      itemTotalPrice,
      itemTotalMinutes
    });
  }

  // 3. Final Total Calculation: totalPrice = basePackagePrice + sum(extras) - discounts
  const cleanDiscount = Math.max(0, Number(discountAmount) || 0);
  const rawTotal = basePrice + extrasSum - cleanDiscount;
  const totalPrice = Math.max(0, Math.round(rawTotal * 100) / 100);

  // 4. Duration Calculation in Minutes
  const totalMinMinutes = baseMinMinutes + extraMinutes;
  const totalMaxMinutes = baseMaxMinutes + extraMinutes;
  const totalMinutesAverage = Math.round((totalMinMinutes + totalMaxMinutes) / 2);

  return {
    basePrice,
    extrasSum,
    discountAmount: cleanDiscount,
    totalPrice,
    uniqueExtrasList,
    durationMinutesRange: {
      min: totalMinMinutes,
      max: totalMaxMinutes
    },
    totalMinutesAverage,
    durationFormatted: {
      fr: formatDurationLocalized(totalMinMinutes, totalMaxMinutes, 'fr'),
      ua: formatDurationLocalized(totalMinMinutes, totalMaxMinutes, 'ua'),
      en: formatDurationLocalized(totalMinMinutes, totalMaxMinutes, 'en')
    }
  };
}

/**
 * Quick helper to format currency compactly for mobile
 * e.g., 209 $, 394 $ CAD
 */
export function formatCompactCad(amount: number, withCadSuffix = true): string {
  const clean = amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2);
  return withCadSuffix ? `${clean} $ CAD` : `${clean} $`;
}
