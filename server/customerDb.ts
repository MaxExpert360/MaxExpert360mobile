import fs from 'fs';
import path from 'path';

export interface CustomerAddressBreakdown {
  formattedAddress: string;
  streetNumber?: string;
  streetName?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface CustomerBookingRecord {
  bookingId: string;
  date: string;
  servicesSummary: string;
  totalPrice: number;
  status: 'booked' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  squareCustomerId?: string;
  photos?: string[];
}

export interface LoyaltyReward {
  id: string;
  title: {
    fr: string;
    ua: string;
    en: string;
  };
  description: {
    fr: string;
    ua: string;
    en: string;
  };
  requiredVisits: number;
  rewardValue: number; // in CAD or equivalent
  rewardType: 'service' | 'credit';
  claimed: boolean;
}

export interface CustomerProfile {
  id: string;
  phone: string; // original input
  normalizedPhone: string; // E.164 without non-digits e.g. 18195551234
  name: string;
  email?: string;
  primaryAddress?: string;
  addressDetails?: CustomerAddressBreakdown;
  postalCode?: string;
  squareCustomerId?: string;
  bookingHistory: CustomerBookingRecord[];
  completedBookingsCount: number;
  completedBookingIds: string[]; // prevents double-awarding
  loyaltyRewardBalance: number;
  unlockedRewards: LoyaltyReward[];
  lastBookingDate?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

const LOYALTY_TIERS: Omit<LoyaltyReward, 'claimed'>[] = [
  {
    id: 'tier_3',
    requiredVisits: 3,
    title: {
      fr: 'Traitement anti-odeur offert',
      ua: 'Безкоштовна антибактеріальна дезодорація',
      en: 'Free odor neutralization treatment'
    },
    description: {
      fr: 'Désodorisation et assainissement professionnel de l\'habitacle ou des tissus lors de votre 3e visite complétée.',
      ua: 'Професійна дезодорація салону або меблів на вашому 3-му візиті.',
      en: 'Professional interior odor neutralization upon completing your 3rd visit.'
    },
    rewardValue: 30,
    rewardType: 'service'
  },
  {
    id: 'tier_5',
    requiredVisits: 5,
    title: {
      fr: 'Nettoyage siège auto enfant offert ou 20 $ de crédit',
      ua: 'Безкоштовна чистка дитячого автокрісла або 20 $ кредиту',
      en: 'Free child car seat cleaning or $20 credit'
    },
    description: {
      fr: 'Nettoyage en profondeur de siège auto enfant ou crédit de 20 $ sur votre facture.',
      ua: 'Глибока чистка дитячого автокрісла або 20 $ знижки.',
      en: 'Deep cleaning of child car seat or $20 billing credit.'
    },
    rewardValue: 40,
    rewardType: 'service'
  },
  {
    id: 'tier_8',
    requiredVisits: 8,
    title: {
      fr: '30 $ de crédit fidélité',
      ua: '30 $ бонусного кредиту лояльності',
      en: '$30 loyalty reward credit'
    },
    description: {
      fr: 'Rabais direct de 30 $ applicable sur le service de votre choix.',
      ua: 'Пряма знижка 30 $ на будь-яку обрану послугу.',
      en: 'Direct $30 discount applied to any service of your choice.'
    },
    rewardValue: 30,
    rewardType: 'credit'
  },
  {
    id: 'tier_10',
    requiredVisits: 10,
    title: {
      fr: '50 $ de crédit fidélité VIP',
      ua: '50 $ VIP бонусного кредиту лояльності',
      en: '$50 VIP loyalty reward credit'
    },
    description: {
      fr: 'Statut VIP MaxExpert360 : 50 $ de crédit applicable sur tous nos forfaits.',
      ua: 'Статус VIP MaxExpert360: 50 $ кредиту на всі наші пакети.',
      en: 'MaxExpert360 VIP Status: $50 loyalty credit on all packages.'
    },
    rewardValue: 50,
    rewardType: 'credit'
  }
];

export class CustomerDatabase {
  private dataFilePath: string;
  private customers: Map<string, CustomerProfile> = new Map(); // key is normalizedPhone
  private isLoaded = false;

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.warn('Could not create data directory:', err);
      }
    }
    this.dataFilePath = path.join(dataDir, 'customers.json');
    this.loadFromDisk();
  }

  /**
   * Normalizes Canadian/US phone numbers to a consistent E.164 string format: +1XXXXXXXXXX
   * e.g., (819) 555-1234 -> +18195551234
   *       8195551234 -> +18195551234
   *       819-555-1234 -> +18195551234
   *       +1 819 555 1234 -> +18195551234
   */
  public normalizePhone(rawPhone: string): string {
    if (!rawPhone) return '';
    const digits = rawPhone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    if (rawPhone.trim().startsWith('+')) {
      return `+${digits}`;
    }
    return digits ? `+${digits}` : '';
  }

  /**
   * Formats a phone number for user-friendly display
   * e.g., +18195551234 -> (819) 555-1234
   */
  public formatPhoneDisplay(normalized: string): string {
    const digits = normalized.replace(/\D/g, '');
    const localDigits = digits.length === 11 && digits.startsWith('1') ? digits.substring(1) : digits;
    if (localDigits.length === 10) {
      return `(${localDigits.substring(0, 3)}) ${localDigits.substring(3, 6)}-${localDigits.substring(6)}`;
    }
    return normalized;
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const fileContent = fs.readFileSync(this.dataFilePath, 'utf-8');
        const list: CustomerProfile[] = JSON.parse(fileContent);
        this.customers.clear();
        for (const cust of list) {
          const norm = this.normalizePhone(cust.normalizedPhone || cust.phone);
          if (norm) {
            cust.normalizedPhone = norm;
            this.customers.set(norm, cust);
          }
        }
      }
      this.isLoaded = true;
    } catch (err) {
      console.error('Error loading customer database from disk:', err);
      this.customers = new Map();
      this.isLoaded = true;
    }
  }

  private saveToDisk() {
    try {
      const list = Array.from(this.customers.values());
      fs.writeFileSync(this.dataFilePath, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving customer database to disk:', err);
    }
  }

  /**
   * Evaluates loyalty rewards based on completed visits count
   */
  private calculateUnlockedRewards(completedCount: number): LoyaltyReward[] {
    return LOYALTY_TIERS.filter(tier => completedCount >= tier.requiredVisits).map(tier => ({
      ...tier,
      claimed: false
    }));
  }

  /**
   * Searches for a customer by phone number
   */
  public findByPhone(phone: string): CustomerProfile | null {
    const normalized = this.normalizePhone(phone);
    if (!normalized) return null;
    return this.customers.get(normalized) || null;
  }

  /**
   * Upserts or creates a customer profile
   */
  public upsertCustomer(data: {
    phone: string;
    name: string;
    email?: string;
    primaryAddress?: string;
    addressDetails?: CustomerAddressBreakdown;
    postalCode?: string;
    squareCustomerId?: string;
    notes?: string;
  }): CustomerProfile {
    const normalized = this.normalizePhone(data.phone);
    if (!normalized) {
      throw new Error('Numéro de téléphone invalide.');
    }

    const now = new Date().toISOString();
    let existing = this.customers.get(normalized);

    if (existing) {
      existing.name = data.name.trim() || existing.name;
      if (data.email && data.email.trim()) existing.email = data.email.trim();
      if (data.primaryAddress && data.primaryAddress.trim()) existing.primaryAddress = data.primaryAddress.trim();
      if (data.addressDetails) existing.addressDetails = data.addressDetails;
      if (data.postalCode && data.postalCode.trim()) existing.postalCode = data.postalCode.trim().toUpperCase();
      if (data.squareCustomerId) existing.squareCustomerId = data.squareCustomerId;
      if (data.notes) existing.notes = data.notes;
      existing.updatedAt = now;
      this.saveToDisk();
      return existing;
    }

    const newProfile: CustomerProfile = {
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      phone: data.phone.trim(),
      normalizedPhone: normalized,
      name: data.name.trim(),
      email: data.email?.trim(),
      primaryAddress: data.primaryAddress?.trim(),
      addressDetails: data.addressDetails,
      postalCode: data.postalCode?.trim().toUpperCase(),
      squareCustomerId: data.squareCustomerId,
      bookingHistory: [],
      completedBookingsCount: 0,
      completedBookingIds: [],
      loyaltyRewardBalance: 0,
      unlockedRewards: [],
      createdAt: now,
      updatedAt: now,
      notes: data.notes
    };

    this.customers.set(normalized, newProfile);
    this.saveToDisk();
    return newProfile;
  }

  /**
   * Records a new booking in customer history
   */
  public recordBooking(
    phone: string,
    booking: {
      bookingId: string;
      date: string;
      servicesSummary: string;
      totalPrice: number;
      squareCustomerId?: string;
      photos?: string[];
    }
  ): CustomerProfile {
    const normalized = this.normalizePhone(phone);
    let customer = this.customers.get(normalized);

    if (!customer) {
      customer = this.upsertCustomer({
        phone,
        name: 'Client',
        squareCustomerId: booking.squareCustomerId
      });
    }

    const newRecord: CustomerBookingRecord = {
      bookingId: booking.bookingId,
      date: booking.date,
      servicesSummary: booking.servicesSummary,
      totalPrice: booking.totalPrice,
      status: 'booked',
      createdAt: new Date().toISOString(),
      squareCustomerId: booking.squareCustomerId,
      photos: booking.photos || []
    };

    // Avoid duplicate booking ids in history
    const existingIndex = customer.bookingHistory.findIndex(b => b.bookingId === booking.bookingId);
    if (existingIndex >= 0) {
      customer.bookingHistory[existingIndex] = newRecord;
    } else {
      customer.bookingHistory.unshift(newRecord);
    }

    customer.lastBookingDate = booking.date;
    customer.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return customer;
  }

  /**
   * Marks a booking as completed and credits loyalty points/rewards
   * Enforces that a single booking ID is ONLY awarded once!
   */
  public completeBooking(phone: string, bookingId: string): {
    customer: CustomerProfile;
    awardedStamp: boolean;
    newCompletedCount: number;
    newRewards: LoyaltyReward[];
  } {
    const normalized = this.normalizePhone(phone);
    const customer = this.customers.get(normalized);
    if (!customer) {
      throw new Error(`Customer with phone ${phone} not found`);
    }

    // Check if this booking ID was already counted
    const alreadyCounted = customer.completedBookingIds.includes(bookingId);
    let awardedStamp = false;

    if (!alreadyCounted) {
      customer.completedBookingIds.push(bookingId);
      customer.completedBookingsCount += 1;
      awardedStamp = true;

      // Update reward unlocks
      customer.unlockedRewards = this.calculateUnlockedRewards(customer.completedBookingsCount);
    }

    // Update the booking status in history
    const bookingRecord = customer.bookingHistory.find(b => b.bookingId === bookingId);
    if (bookingRecord) {
      bookingRecord.status = 'completed';
      bookingRecord.completedAt = new Date().toISOString();
    }

    customer.updatedAt = new Date().toISOString();
    this.saveToDisk();

    return {
      customer,
      awardedStamp,
      newCompletedCount: customer.completedBookingsCount,
      newRewards: customer.unlockedRewards
    };
  }

  /**
   * Retrieves full loyalty summary for a customer
   */
  public getLoyaltySummary(phone: string): {
    found: boolean;
    customerName?: string;
    completedBookingsCount: number;
    nextRewardAt: number | null;
    visitsUntilNextReward: number;
    unlockedRewards: LoyaltyReward[];
    allTiers: typeof LOYALTY_TIERS;
  } {
    const normalized = this.normalizePhone(phone);
    const customer = this.customers.get(normalized);

    const completedCount = customer ? customer.completedBookingsCount : 0;
    const unlocked = this.calculateUnlockedRewards(completedCount);

    // Find next upcoming tier
    const nextTier = LOYALTY_TIERS.find(tier => tier.requiredVisits > completedCount);
    const visitsUntilNext = nextTier ? nextTier.requiredVisits - completedCount : 0;

    return {
      found: Boolean(customer),
      customerName: customer?.name,
      completedBookingsCount: completedCount,
      nextRewardAt: nextTier ? nextTier.requiredVisits : null,
      visitsUntilNextReward: visitsUntilNext,
      unlockedRewards: unlocked,
      allTiers: LOYALTY_TIERS
    };
  }

  public getAllCustomers(): CustomerProfile[] {
    return Array.from(this.customers.values());
  }
}

export const customerDb = new CustomerDatabase();
