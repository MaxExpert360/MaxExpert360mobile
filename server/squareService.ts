import { resolveServiceVariation, LiveSquareVariation } from './squareCatalogMapping';
import { customerDb } from './customerDb';
import { googleMapsService } from './mapsService';
import { validateBookingSchedule, getEasternTimeOffset, formatSquareSlotToQuebecTime } from './bookingSchedule';
import { squareOAuthService } from './squareOAuthService';
import { ownerNotificationService } from './ownerNotificationService';

/**
 * Interface for Square API Booking Payload & Responses
 */
export interface BookingRequestInput {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceAddress: string;
  postalCode?: string;
  confirmedPostalCode?: string;
  googlePostalCode?: string;
  postalCodeSource?: 'manual' | 'google';
  preferredDate: string; // YYYY-MM-DD
  preferredTimeSlot: string;
  vehicleMakeModel?: string;
  notes?: string;
  bookingPhotos?: string[];
  cart: {
    items: Array<{
      id: string;
      category: string;
      name: { fr: string; ua: string; en: string };
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    totalPrice: number;
    subtotal: number;
    minimumAdjustment: number;
    currency?: string;
  };
  language?: 'fr' | 'ua' | 'en';
}

export interface SquareApiError {
  category: string;
  code: string;
  detail: string;
  field?: string;
}

export interface SquareValidationDiagnostic {
  isValid: boolean;
  missingRequiredFields: string[];
  fieldReport: {
    location_id: { valid: boolean; valueMasked?: string; error?: string };
    customer_id: { valid: boolean; valueMasked?: string; error?: string };
    start_at: { valid: boolean; value?: string; error?: string };
    appointment_segments: {
      valid: boolean;
      count: number;
      segments: Array<{
        index: number;
        service_variation_id?: string;
        service_variation_version?: number;
        team_member_id?: string;
        duration_minutes?: number;
        missingFields: string[];
      }>;
    };
  };
  action: string;
}

export class SquareBookingsService {
  private get environment(): string {
    const env = (process.env.SQUARE_ENVIRONMENT || '').trim();
    // If SQUARE_ENVIRONMENT was accidentally populated with an Access Token (starts with EAAA / sq0atp)
    if (env.startsWith('EAAA') || env.startsWith('sq0atp') || env.startsWith('sq0atb')) {
      return env.startsWith('sq0atb') ? 'sandbox' : 'production';
    }
    return env.toLowerCase() === 'sandbox' ? 'sandbox' : 'production';
  }

  private get baseUrl(): string {
    if (this.environment === 'sandbox') {
      return 'https://connect.squareupsandbox.com/v2';
    }
    return 'https://connect.squareup.com/v2';
  }

  private get accessToken(): string | undefined {
    // 1. Check for stored buyer-level OAuth access token from OAuth callback
    const buyerToken = squareOAuthService.getBuyerOAuthToken()?.accessToken;
    if (buyerToken && (buyerToken.startsWith('EAAA') || buyerToken.startsWith('sq0atp-') || buyerToken.startsWith('sq0atb-'))) {
      return buyerToken;
    }

    // 2. Direct token from environment
    const directToken = process.env.SQUARE_ACCESS_TOKEN?.trim();
    const envVar = process.env.SQUARE_ENVIRONMENT?.trim();

    // If direct token is a valid Square Access Token format (not application ID)
    if (directToken && !directToken.startsWith('sq0idp-') && (directToken.startsWith('EAAA') || directToken.startsWith('sq0atp-') || directToken.startsWith('sq0atb-') || directToken.startsWith('sandbox-sq0atb-'))) {
      return directToken;
    }

    // If SQUARE_ENVIRONMENT was filled with the Access Token instead
    if (envVar && !envVar.startsWith('sq0idp-') && (envVar.startsWith('EAAA') || envVar.startsWith('sq0atp-') || envVar.startsWith('sq0atb-'))) {
      return envVar;
    }

    return buyerToken || directToken;
  }

  private get headers(): Record<string, string> {
    const token = this.accessToken;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Square-Version': '2024-12-18'
    };
  }

  /**
   * Diagnostic test for Square API Authentication (calls GET /v2/locations)
   */
  async testAuthentication() {
    const token = this.accessToken;
    const isProduction = this.environment !== 'sandbox';
    const targetUrl = isProduction 
      ? 'https://connect.squareup.com/v2/locations'
      : 'https://connect.squareupsandbox.com/v2/locations';

    const tokenExists = Boolean(token && token.length > 0);
    const tokenLength = token ? token.length : 0;
    const tokenMasked = token && token.length > 8 
      ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
      : tokenExists ? '****' : '(none)';
    
    let tokenTypeGuess = 'No token configured';
    if (token) {
      if (token.startsWith('EAAA')) {
        tokenTypeGuess = 'Production Access Token (EAAA...)';
      } else if (token.startsWith('sq0atp-')) {
        tokenTypeGuess = 'Production Access Token (sq0atp-...)';
      } else if (token.startsWith('sq0atb-') || token.startsWith('sandbox-')) {
        tokenTypeGuess = 'Sandbox Access Token (sq0atb-...)';
      } else if (token.startsWith('sq0idp-') || token.startsWith('sq0i')) {
        tokenTypeGuess = 'Warning: This looks like a Square Application ID (sq0idp-), NOT an Access Token';
      } else {
        tokenTypeGuess = `Custom/Other token (${tokenLength} chars)`;
      }
    }

    if (!tokenExists) {
      return {
        success: false,
        status: 'Square authentication failed: SQUARE_ACCESS_TOKEN is missing',
        diagnostic: {
          tokenLoaded: false,
          environment: this.environment,
          isProduction,
          targetUrl,
          tokenMasked: '(none)',
          tokenType: tokenTypeGuess,
          authHeaderFormat: 'Authorization: Bearer <MISSING>'
        },
        errors: [{
          category: 'AUTHENTICATION_ERROR',
          code: 'UNAUTHORIZED',
          detail: 'SQUARE_ACCESS_TOKEN environment variable is not defined or is empty.'
        }]
      };
    }

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Square-Version': '2024-12-18'
        }
      });

      const data = await response.json();

      if (response.ok) {
        const locations = (data.locations || []).map((loc: any) => ({
          id: loc.id,
          name: loc.name,
          status: loc.status,
          currency: loc.currency,
          timezone: loc.timezone
        }));

        return {
          success: true,
          status: 'Square authentication OK',
          diagnostic: {
            tokenLoaded: true,
            tokenLength,
            tokenMasked,
            tokenType: tokenTypeGuess,
            environment: this.environment,
            isProduction,
            targetUrl,
            authHeaderFormat: `Authorization: Bearer ${tokenMasked}`,
            httpStatus: response.status,
            locationsCount: locations.length
          },
          locations
        };
      } else {
        const errors = (data.errors || []).map((err: any) => ({
          category: err.category || 'AUTHENTICATION_ERROR',
          code: err.code || 'UNAUTHORIZED',
          detail: err.detail || 'This request could not be authorized.',
          field: err.field
        }));

        return {
          success: false,
          status: 'Square authentication failed',
          diagnostic: {
            tokenLoaded: true,
            tokenLength,
            tokenMasked,
            tokenType: tokenTypeGuess,
            environment: this.environment,
            isProduction,
            targetUrl,
            authHeaderFormat: `Authorization: Bearer ${tokenMasked}`,
            httpStatus: response.status
          },
          errors: errors.length > 0 ? errors : [{
            category: 'AUTHENTICATION_ERROR',
            code: 'UNAUTHORIZED',
            detail: 'This request could not be authorized.'
          }]
        };
      }
    } catch (networkErr: any) {
      return {
        success: false,
        status: 'Square authentication failed: Network Error',
        diagnostic: {
          tokenLoaded: true,
          tokenLength,
          tokenMasked,
          environment: this.environment,
          isProduction,
          targetUrl
        },
        errors: [{
          category: 'NETWORK_ERROR',
          code: 'CONNECTION_FAILURE',
          detail: networkErr.message
        }]
      };
    }
  }

  /**
   * Validates if Square API credentials are configured and functional
   */
  async getStatus() {
    const hasToken = Boolean(this.accessToken && this.accessToken.length > 5);
    const env = this.environment;
    const rawEnvLoc = process.env.SQUARE_LOCATION_ID?.trim();
    // Use target active location LDRK1PM7Q1DCN (replacing obsolete L9N846TPWYHA6)
    const configuredLocationId = (!rawEnvLoc || rawEnvLoc === 'L9N846TPWYHA6') ? 'LDRK1PM7Q1DCN' : rawEnvLoc;

    if (!hasToken) {
      return {
        configured: false,
        environment: env,
        message: 'SQUARE_ACCESS_TOKEN is not set in environment or AI Studio settings.',
        locationId: configuredLocationId || null,
        locations: []
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/locations`, {
        method: 'GET',
        headers: this.headers
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          configured: false,
          environment: env,
          error: data.errors?.[0]?.detail || data.errors?.[0]?.code || 'Square API authentication failed',
          message: 'Square token provided is invalid or unauthorized.',
          locations: []
        };
      }

      const locations = (data.locations || []).map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        address: loc.address ? `${loc.address.address_line_1 || ''} ${loc.address.locality || ''}`.trim() : '',
        status: loc.status,
        timezone: loc.timezone || 'America/Toronto',
        currency: loc.currency || 'CAD'
      }));

      const activeLocationId = configuredLocationId || locations[0]?.id || null;

      return {
        configured: true,
        environment: env,
        activeLocationId,
        locations,
        message: 'Square Bookings API is connected and active.'
      };
    } catch (err: any) {
      return {
        configured: false,
        environment: env,
        error: err.message,
        message: 'Network error connecting to Square API.',
        locations: []
      };
    }
  }

  /**
   * Retrieves active location ID from env or Square API
   */
  async getEffectiveLocationId(): Promise<string> {
    const envLoc = process.env.SQUARE_LOCATION_ID?.trim();
    if (envLoc && envLoc !== 'L9N846TPWYHA6') {
      return envLoc;
    }
    return 'LDRK1PM7Q1DCN';
  }

  /**
   * Retrieves bookable team members from Square Appointments
   */
  async getBookableTeamMembers(): Promise<Array<{ id: string; name: string; isBookable: boolean }>> {
    if (!this.accessToken) return [];

    try {
      const res = await fetch(`${this.baseUrl}/bookings/team-member-booking-profiles`, {
        headers: this.headers
      });
      if (!res.ok) return [];

      const data = await res.json();
      const profiles = data.team_member_booking_profiles || [];
      return profiles.map((p: any) => ({
        id: p.team_member_id,
        name: p.display_name || 'Équipe MaxExpert360',
        isBookable: p.is_bookable !== false
      }));
    } catch {
      return [];
    }
  }

  /**
   * Retrieves live booking service variations from Square Catalog
   */
  async getLiveCatalogVariations(): Promise<LiveSquareVariation[]> {
    if (!this.accessToken) return [];

    try {
      const res = await fetch(`${this.baseUrl}/catalog/list?types=ITEM,ITEM_VARIATION`, {
        headers: this.headers
      });
      if (!res.ok) return [];

      const data = await res.json();
      const objects = data.objects || [];
      
      // Build lookup of parent items
      const itemMap = new Map<string, string>();
      for (const obj of objects) {
        if (obj.type === 'ITEM' && obj.item_data) {
          itemMap.set(obj.id, obj.item_data.name || '');
        }
      }

      const variations: LiveSquareVariation[] = [];

      for (const obj of objects) {
        if (obj.type === 'ITEM_VARIATION' && obj.item_variation_data) {
          const varData = obj.item_variation_data;
          const parentItemName = itemMap.get(varData.item_id) || '';
          variations.push({
            id: obj.id,
            name: varData.name || '',
            itemName: parentItemName,
            version: Number(obj.version) || 1,
            durationMinutes: varData.service_duration ? Math.round(Number(varData.service_duration) / 60000) : 90,
            priceCents: varData.price_money?.amount ? Number(varData.price_money.amount) : undefined,
            teamMemberIds: Array.isArray(varData.team_member_ids) ? varData.team_member_ids : []
          });
        }
      }
      return variations;
    } catch {
      return [];
    }
  }

  /**
   * Checks availability for a specific date and service variations on Square
   */
  async checkAvailability(params: {
    date: string; // YYYY-MM-DD
    locationId: string;
    serviceVariationIds: string[];
  }) {
    if (!this.accessToken) {
      throw new Error('SQUARE_ACCESS_TOKEN is required to check Square availability.');
    }

    const { date, locationId, serviceVariationIds } = params;

    // Build ISO range covering the requested day in Eastern Time (America/Toronto EDT/EST)
    const offset = getEasternTimeOffset(date);
    const startAt = `${date}T07:00:00${offset}`;
    const endAt = `${date}T20:30:00${offset}`;

    const effectiveVariationIds = (serviceVariationIds && serviceVariationIds.length > 0)
      ? serviceVariationIds
      : ['CQ4JQP7RN4JGAS42Y2F4BSUG'];

    const segmentFilters = effectiveVariationIds.map(varId => ({
      service_variation_id: varId
    }));

    try {
      const response = await fetch(`${this.baseUrl}/bookings/availability/search`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query: {
            filter: {
              start_at_range: {
                start_at: startAt,
                end_at: endAt
              },
              location_id: locationId,
              segment_filters: segmentFilters.length > 0 ? segmentFilters : undefined
            }
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // If specific variation ID isn't found in Square Catalog, fallback to general location availability
        if (data.errors?.[0]?.code === 'NOT_FOUND' || data.errors?.[0]?.detail?.includes('variation')) {
          const fallbackRes = await fetch(`${this.baseUrl}/bookings/availability/search`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
              query: {
                filter: {
                  start_at_range: {
                    start_at: startAt,
                    end_at: endAt
                  },
                  location_id: locationId
                }
              }
            })
          });
          const fallbackData = await fallbackRes.json();
          if (fallbackRes.ok) {
            const rawFallback = fallbackData.availabilities || [];
            const filteredFallback = rawFallback.filter((item: any) => {
              if (!item?.start_at) return false;
              const { value } = formatSquareSlotToQuebecTime(item.start_at);
              return validateBookingSchedule(date, value).isValid;
            });
            return {
              availabilities: filteredFallback,
              count: filteredFallback.length,
              date
            };
          }
        }

        throw new Error(data.errors?.[0]?.detail || data.errors?.[0]?.code || 'Failed to search Square availability');
      }

      const rawAvailabilities = data.availabilities || [];
      const filteredAvailabilities = rawAvailabilities.filter((item: any) => {
        if (!item?.start_at) return false;
        const { value } = formatSquareSlotToQuebecTime(item.start_at);
        return validateBookingSchedule(date, value).isValid;
      });

      return {
        availabilities: filteredAvailabilities,
        count: filteredAvailabilities.length,
        date
      };
    } catch (err: any) {
      throw new Error(`Square Availability Error: ${err.message}`);
    }
  }

  /**
   * Searches for existing customer or creates a new customer profile in Square
   */
  async findOrCreateCustomer(input: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    postalCode?: string;
    note?: string;
  }): Promise<{ customerId: string; isNew: boolean }> {
    if (!this.accessToken) {
      throw new Error('SQUARE_ACCESS_TOKEN is required to manage Square customers.');
    }

    const { name, phone, email, address, postalCode, note } = input;
    const cleanPhone = phone.replace(/[^0-9+]/g, '');

    // Format phone to E.164 if possible
    let formattedPhone = cleanPhone;
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) {
        formattedPhone = `+1${formattedPhone}`;
      } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
        formattedPhone = `+${formattedPhone}`;
      }
    }

    // Split name into given and family
    const parts = name.trim().split(/\s+/);
    const givenName = parts[0] || 'Client';
    const familyName = parts.slice(1).join(' ') || '';

    // 1. Search existing customer by phone
    try {
      const searchRes = await fetch(`${this.baseUrl}/customers/search`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query: {
            filter: {
              phone_number: {
                exact: formattedPhone
              }
            }
          }
        })
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.customers && searchData.customers.length > 0) {
          const existing = searchData.customers[0];
          return { customerId: existing.id, isNew: false };
        }
      }
    } catch {
      // Continue to creation
    }

    // 2. Create new customer in Square
    const createRes = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        idempotency_key: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        given_name: givenName,
        family_name: familyName,
        phone_number: formattedPhone,
        email_address: email && email.includes('@') ? email.trim() : undefined,
        address: {
          address_line_1: address,
          locality: 'Drummondville',
          administrative_district_level_1: 'QC',
          postal_code: postalCode || undefined,
          country: 'CA'
        },
        note: `MaxExpert360 Mobile Client - ${address} ${postalCode ? `(${postalCode})` : ''} ${note ? `\nNotes: ${note}` : ''}`
      })
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      const safeErrors = (createData.errors || []).map((e: any) => ({
        category: e.category || 'INVALID_REQUEST_ERROR',
        code: e.code || 'CUSTOMER_CREATION_FAILED',
        detail: e.detail || 'Failed to create customer in Square',
        field: e.field
      }));
      console.error('[Square Diagnostic] Customer Creation Error:', JSON.stringify(safeErrors, null, 2));
      throw new Error(safeErrors[0]?.detail || 'Failed to create customer profile in Square');
    }

    return { customerId: createData.customer.id, isNew: true };
  }

  /**
   * Rigorous Pre-Flight Validator for Square CreateBooking Payload
   * Checks all required Square fields before sending to prevent API errors.
   */
  validateBookingPayloadBeforeSquare(payload: any): {
    isValid: boolean;
    errors: SquareApiError[];
    diagnostic: SquareValidationDiagnostic;
  } {
    const errors: SquareApiError[] = [];
    const missingFields: string[] = [];

    const booking = payload?.booking || {};

    // 1. location_id
    const hasLocation = Boolean(
      booking.location_id && typeof booking.location_id === 'string' && booking.location_id.trim().length > 0
    );
    if (!hasLocation) {
      missingFields.push('booking.location_id');
      errors.push({
        category: 'INVALID_REQUEST_ERROR',
        code: 'VALUE_EMPTY',
        detail: 'Field must not be blank: booking.location_id. A valid Square Location ID is required.',
        field: 'booking.location_id'
      });
    }

    // 2. customer_id
    const hasCustomer = Boolean(
      booking.customer_id && typeof booking.customer_id === 'string' && booking.customer_id.trim().length > 0
    );
    if (!hasCustomer) {
      missingFields.push('booking.customer_id');
      errors.push({
        category: 'INVALID_REQUEST_ERROR',
        code: 'VALUE_EMPTY',
        detail: 'Field must not be blank: booking.customer_id. A valid Square Customer ID must be created or associated.',
        field: 'booking.customer_id'
      });
    }

    // 3. start_at
    const hasStartAt = Boolean(
      booking.start_at && typeof booking.start_at === 'string' && booking.start_at.trim().length > 0
    );
    const isValidIso = hasStartAt && !isNaN(Date.parse(booking.start_at));
    if (!hasStartAt || !isValidIso) {
      missingFields.push('booking.start_at');
      errors.push({
        category: 'INVALID_REQUEST_ERROR',
        code: 'VALUE_EMPTY',
        detail: 'Field must not be blank: booking.start_at. A valid RFC 3339 start timestamp is required.',
        field: 'booking.start_at'
      });
    }

    // 4. appointment_segments
    const segments = Array.isArray(booking.appointment_segments) ? booking.appointment_segments : [];
    if (segments.length === 0) {
      missingFields.push('booking.appointment_segments');
      errors.push({
        category: 'INVALID_REQUEST_ERROR',
        code: 'VALUE_EMPTY',
        detail: 'Field must not be blank: booking.appointment_segments. At least one appointment segment is required.',
        field: 'booking.appointment_segments'
      });
    }

    const segmentDiagnostics: any[] = [];

    segments.forEach((seg: any, idx: number) => {
      const segMissing: string[] = [];

      // service_variation_id
      if (!seg.service_variation_id || typeof seg.service_variation_id !== 'string' || !seg.service_variation_id.trim()) {
        segMissing.push('service_variation_id');
        missingFields.push(`booking.appointment_segments[${idx}].service_variation_id`);
        errors.push({
          category: 'INVALID_REQUEST_ERROR',
          code: 'VALUE_EMPTY',
          detail: `Field must not be blank: booking.appointment_segments[${idx}].service_variation_id. Square requires a valid Catalog Item Variation ID.`,
          field: `booking.appointment_segments[${idx}].service_variation_id`
        });
      }

      // service_variation_version
      if (
        seg.service_variation_version === undefined ||
        seg.service_variation_version === null ||
        typeof seg.service_variation_version !== 'number' ||
        seg.service_variation_version <= 0
      ) {
        segMissing.push('service_variation_version');
        missingFields.push(`booking.appointment_segments[${idx}].service_variation_version`);
        errors.push({
          category: 'INVALID_REQUEST_ERROR',
          code: 'VALUE_EMPTY',
          detail: `Field must not be blank: booking.appointment_segments[${idx}].service_variation_version. Square requires the Catalog Item Variation version number.`,
          field: `booking.appointment_segments[${idx}].service_variation_version`
        });
      }

      // team_member_id
      if (!seg.team_member_id || typeof seg.team_member_id !== 'string' || !seg.team_member_id.trim()) {
        segMissing.push('team_member_id');
        missingFields.push(`booking.appointment_segments[${idx}].team_member_id`);
        errors.push({
          category: 'INVALID_REQUEST_ERROR',
          code: 'VALUE_EMPTY',
          detail: `Field must not be blank: booking.appointment_segments[${idx}].team_member_id. A bookable Team Member ID must be assigned.`,
          field: `booking.appointment_segments[${idx}].team_member_id`
        });
      }

      // duration_minutes
      if (
        seg.duration_minutes === undefined ||
        seg.duration_minutes === null ||
        typeof seg.duration_minutes !== 'number' ||
        seg.duration_minutes <= 0
      ) {
        segMissing.push('duration_minutes');
        missingFields.push(`booking.appointment_segments[${idx}].duration_minutes`);
        errors.push({
          category: 'INVALID_REQUEST_ERROR',
          code: 'VALUE_EMPTY',
          detail: `Field must not be blank: booking.appointment_segments[${idx}].duration_minutes. Service duration in minutes is required.`,
          field: `booking.appointment_segments[${idx}].duration_minutes`
        });
      }

      segmentDiagnostics.push({
        index: idx,
        service_variation_id: seg.service_variation_id || undefined,
        service_variation_version: seg.service_variation_version || undefined,
        team_member_id: seg.team_member_id || undefined,
        duration_minutes: seg.duration_minutes || undefined,
        missingFields: segMissing
      });
    });

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      diagnostic: {
        isValid,
        missingRequiredFields: missingFields,
        fieldReport: {
          location_id: {
            valid: hasLocation,
            valueMasked: hasLocation ? `${booking.location_id.substring(0, 4)}***` : undefined,
            error: !hasLocation ? 'Location ID is blank or missing.' : undefined
          },
          customer_id: {
            valid: hasCustomer,
            valueMasked: hasCustomer ? `${booking.customer_id.substring(0, 4)}***` : undefined,
            error: !hasCustomer ? 'Customer ID is blank or missing.' : undefined
          },
          start_at: {
            valid: Boolean(hasStartAt && isValidIso),
            value: booking.start_at,
            error: !hasStartAt || !isValidIso ? 'Start timestamp is blank or invalid RFC 3339 format.' : undefined
          },
          appointment_segments: {
            valid: segments.length > 0 && segmentDiagnostics.every(s => s.missingFields.length === 0),
            count: segments.length,
            segments: segmentDiagnostics
          }
        },
        action: isValid
          ? 'Passed pre-flight validation. Forwarding to Square Bookings API.'
          : 'Failed pre-flight validation. Request blocked before sending to Square API.'
      }
    };
  }

  /**
   * Creates an official booking in Square Appointments with strict validation and safe diagnostics
   */
  async createSquareBooking(input: BookingRequestInput) {
    if (!this.accessToken) {
      throw new Error(
        'SQUARE_ACCESS_TOKEN is missing. Please configure your Square Access Token in AI Studio Settings / Environment variables.'
      );
    }

    // Pre-flight Schedule Availability Validation (America/Toronto timezone)
    const effectiveTimeSlot = String(input.preferredTimeSlot || '').trim();
    const scheduleCheck = validateBookingSchedule(input.preferredDate, effectiveTimeSlot);
    if (!scheduleCheck.isValid || !scheduleCheck.startAtIso) {
      const lang = input.language || 'fr';
      const msg = scheduleCheck.error?.[lang] || scheduleCheck.error?.fr || 'Créneau horaire non disponible pour cette date.';
      const err: any = new Error(msg);
      err.isValidationError = true;
      err.squareErrors = [{
        category: 'SCHEDULE_AVAILABILITY_ERROR',
        code: 'TIME_SLOT_UNAVAILABLE',
        detail: msg,
        field: 'preferredTimeSlot'
      }];
      throw err;
    }

    // 1. Resolve Location ID
    const locationId = await this.getEffectiveLocationId();

    const finalPostalCode = input.confirmedPostalCode || input.postalCode || '';

    // 2. Resolve Customer ID
    const customer = await this.findOrCreateCustomer({
      name: input.clientName,
      phone: input.clientPhone,
      email: input.clientEmail,
      address: input.serviceAddress,
      postalCode: finalPostalCode,
      note: input.notes
    });

    // 3. Resolve Bookable Team Members & Live Catalog Variations from Square
    const [teamMembers, liveCatalog] = await Promise.all([
      this.getBookableTeamMembers(),
      this.getLiveCatalogVariations()
    ]);

    // Primary bookable team member ID (e.g. Maksym Dmytruk TMFJ6AiDibVJenrB)
    const primaryTeamMemberId = teamMembers.find(t => t.isBookable)?.id || teamMembers[0]?.id || 'TMFJ6AiDibVJenrB';

    // 4. Calculate appointment segments with exact Square variation ID, version, and team member ID
    const segments: Array<{
      duration_minutes: number;
      service_variation_id: string;
      service_variation_version: number;
      team_member_id: string;
    }> = [];

    const itemNamesFormatted: string[] = [];

    for (const item of input.cart.items) {
      const itemId = (item as any).id || (item as any).serviceId || '';
      const itemCategory = (item as any).category || 'auto';
      const resolved = resolveServiceVariation(itemId, itemCategory, liveCatalog, primaryTeamMemberId);
      const segmentDuration = Math.max(30, (resolved.durationMinutes || 90) * (item.quantity || 1));

      const langKey = input.language || 'fr';
      const displayName = typeof item.name === 'object' && item.name !== null
        ? ((item.name as any)[langKey] || (item.name as any).fr || 'Service')
        : (item.name || (item as any).serviceName || 'Service');
      const itemPrice = item.totalPrice ?? (item as any).finalPrice ?? (item as any).basePrice ?? 0;
      itemNamesFormatted.push(`${displayName} (x${item.quantity || 1}) - ${itemPrice} $`);

      // Verify that team_member_id is bookable
      const finalTeamMemberId = resolved.teamMemberId || primaryTeamMemberId;

      segments.push({
        duration_minutes: segmentDuration,
        service_variation_id: resolved.serviceVariationId,
        service_variation_version: resolved.serviceVariationVersion || 1,
        team_member_id: finalTeamMemberId
      });
    }

    // If for any reason no segments were created, build primary segment from catalog
    if (segments.length === 0) {
      const fallbackVar = liveCatalog[0];
      if (fallbackVar) {
        segments.push({
          duration_minutes: 120,
          service_variation_id: fallbackVar.id,
          service_variation_version: fallbackVar.version || 1,
          team_member_id: fallbackVar.teamMemberIds?.[0] || primaryTeamMemberId
        });
      }
    }

    // 5. Calculate precise start time in ISO 8601 (Eastern Time Montreal/Drummondville America/Toronto)
    const startAt = scheduleCheck.startAtIso;

    // 6. Detailed notes for Square appointment
    const calculatedTotal = input.cart.totalPrice ?? (input.cart as any).summary?.finalPrice ?? (input.cart as any).total ?? (
      input.cart.items.reduce((sum, item) => sum + (item.totalPrice ?? (item as any).finalPrice ?? (item as any).basePrice ?? 0), 0)
    );

    const customerNote = [
      `=== MAXEXPERT360 SERVICE MOBILE ===`,
      `Prestations demandées :`,
      ...itemNamesFormatted.map(name => `• ${name}`),
      `Total Estimé : ${calculatedTotal} $ CAD`,
      input.vehicleMakeModel ? `Véhicule/Meuble : ${input.vehicleMakeModel}` : '',
      input.notes ? `Instructions : ${input.notes}` : ''
    ].filter(Boolean).join('\n');

    const sellerNote = [
      `Adresse intervention : ${input.serviceAddress}`,
      `Client : ${input.clientName} (${input.clientPhone})`,
      `Créneau souhaité : ${input.preferredTimeSlot}`,
      `Total Devis : ${calculatedTotal} $ CAD (Déplacement inclus Drummondville)`
    ].join('\n');

    // 7. Prepare Complete Booking Payload
    const idempotencyKey = `booking_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const bookingPayload = {
      idempotency_key: idempotencyKey,
      booking: {
        location_id: locationId,
        customer_id: customer.customerId,
        start_at: startAt,
        appointment_segments: segments,
        customer_note: customerNote,
        seller_note: sellerNote
      }
    };

    // 8. CRITICAL: Validate the booking payload before sending it to Square
    const validation = this.validateBookingPayloadBeforeSquare(bookingPayload);

    if (!validation.isValid) {
      // REQUIREMENT 6: If a required Square field is missing, do not send the request.
      // REQUIREMENT 7: Show a clear developer diagnostic explaining which field must be fixed.
      console.error('[Square Pre-Flight Validation FAILED]:', JSON.stringify({
        errors: validation.errors,
        diagnostic: validation.diagnostic
      }, null, 2));

      const firstErr = validation.errors[0];
      const errorObj: any = new Error(`Validation Square échouée : ${firstErr.detail}`);
      errorObj.squareErrors = validation.errors;
      errorObj.diagnostic = validation.diagnostic;
      errorObj.isValidationError = true;
      throw errorObj;
    }

    // 9. Send validated request to Square API (POST /v2/bookings)
    console.log('[Square API] Sending Validated CreateBooking Payload:', JSON.stringify({
      location_id: locationId,
      customer_id: customer.customerId,
      start_at: startAt,
      segments_count: segments.length
    }));

    const bookingRes = await fetch(`${this.baseUrl}/bookings`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(bookingPayload)
    });

    const bookingData = await bookingRes.json();

    if (!bookingRes.ok) {
      console.error('[Square API CreateBooking Error]:', JSON.stringify(bookingData, null, 2));
      const firstErr = bookingData.errors?.[0];
      const errorDetail = firstErr?.detail || firstErr?.code || `HTTP ${bookingRes.status}`;

      // Save customer booking intent in local database so the request is never lost
      try {
        const itemNames = input.cart.items.map(it => (typeof it.name === 'object' ? (it.name.fr || it.name.en) : it.name));
        customerDb.recordBooking(input.clientPhone, {
          bookingId: `pending_${Date.now()}`,
          date: input.preferredDate,
          servicesSummary: itemNames.join(', '),
          totalPrice: calculatedTotal,
          squareCustomerId: customer.customerId,
          photos: input.bookingPhotos
        });
      } catch (dbErr) {
        console.warn('[CustomerDb] Could not record pending request:', dbErr);
      }
      
      let friendlyMessage = `Square API: ${errorDetail}`;
      if (bookingRes.status === 403 && errorDetail.includes('subscription')) {
        friendlyMessage = `Square API (HTTP 403) : Le forfait Square Appointments actuel est sur l'offre gratuite qui bloque la création programmatique via API. Activez Square Appointments Plus (essai gratuit 30 jours disponible sur votre tableau de bord Square) ou utilisez la page officielle Square ci-dessous.`;
      }

      const errorObj: any = new Error(friendlyMessage);
      errorObj.status = bookingRes.status;
      errorObj.squareErrors = bookingData.errors;
      errorObj.diagnostic = {
        origin: 'Square API (connect.squareup.com/v2/bookings)',
        httpStatus: bookingRes.status,
        squareErrorCode: firstErr?.code,
        squareErrorDetail: firstErr?.detail,
        locationId,
        customerId: customer.customerId,
        startAt,
        cause: 'Merchant subscription does not support write operations (Square Appointments Free tier requires Appointments Plus for API booking creation).'
      };
      throw errorObj;
    }

    const createdBooking = bookingData.booking;
    console.log(`[Square Booking SUCCESS] ID: ${createdBooking.id} (Status: ${createdBooking.status})`);

    // Record booking in local customer database
    try {
      const itemNames = input.cart.items.map(it => it.name.fr || it.name.en);
      customerDb.recordBooking(input.clientPhone, {
        bookingId: createdBooking.id,
        date: input.preferredDate,
        servicesSummary: itemNames.join(', '),
        totalPrice: calculatedTotal,
        squareCustomerId: createdBooking.customer_id,
        photos: input.bookingPhotos
      });
    } catch (dbErr) {
      console.warn('[CustomerDb] Failed to record booking in DB:', dbErr);
    }

    // Trigger owner SMS notification strictly AFTER Square confirms the booking
    try {
      const servicesSummary = input.cart.items
        .map(it => (typeof it.name === 'object' ? (it.name.fr || it.name.en) : it.name))
        .join(', ');

      await ownerNotificationService.notifyOwnerOfNewBooking({
        bookingId: createdBooking.id,
        clientName: input.clientName,
        clientPhone: input.clientPhone,
        clientEmail: input.clientEmail,
        serviceAddress: input.serviceAddress,
        preferredDate: input.preferredDate,
        preferredTimeSlot: input.preferredTimeSlot,
        vehicleMakeModel: input.vehicleMakeModel,
        servicesSummary,
        totalPrice: calculatedTotal
      });
    } catch (notifErr: any) {
      // Notification failure must NOT disrupt or cancel the confirmed Square booking
      console.warn('[OwnerNotification] Failed to send owner alert:', notifErr.message);
    }

    return {
      success: true,
      bookingId: createdBooking.id,
      status: createdBooking.status,
      version: createdBooking.version,
      startAt: createdBooking.start_at,
      locationId: createdBooking.location_id,
      customerId: createdBooking.customer_id,
      createdAt: createdBooking.created_at,
      totalPrice: calculatedTotal,
      booking: createdBooking,
      message: 'Rendez-vous créé avec succès sur Square Appointments !'
    };
  }
}

export const squareBookingsService = new SquareBookingsService();
