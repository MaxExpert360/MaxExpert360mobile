import { resolveServiceVariation, LiveSquareVariation } from './squareCatalogMapping';
import { customerDb } from './customerDb';
import { googleMapsService } from './mapsService';

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
  preferredTimeSlot: 'morning' | 'afternoon' | 'flexible';
  vehicleMakeModel?: string;
  notes?: string;
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
    const directToken = process.env.SQUARE_ACCESS_TOKEN?.trim();
    const envVar = process.env.SQUARE_ENVIRONMENT?.trim();

    // If direct token is a valid Square Access Token format
    if (directToken && (directToken.startsWith('EAAA') || directToken.startsWith('sq0atp-') || directToken.startsWith('sq0atb-') || directToken.startsWith('sandbox-sq0atb-'))) {
      return directToken;
    }

    // If SQUARE_ENVIRONMENT was filled with the Access Token instead
    if (envVar && (envVar.startsWith('EAAA') || envVar.startsWith('sq0atp-') || envVar.startsWith('sq0atb-'))) {
      return envVar;
    }

    return directToken;
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
    const configuredLocationId = process.env.SQUARE_LOCATION_ID?.trim();

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
    if (process.env.SQUARE_LOCATION_ID?.trim()) {
      return process.env.SQUARE_LOCATION_ID.trim();
    }

    const status = await this.getStatus();
    if (status.activeLocationId) {
      return status.activeLocationId;
    }

    throw new Error('No active Square Location found in your account.');
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

    // Build ISO range covering the requested day in Eastern Time (America/Toronto UTC-4 / UTC-5)
    const startAt = `${date}T07:00:00-04:00`;
    const endAt = `${date}T20:30:00-04:00`;

    const segmentFilters = serviceVariationIds.map(varId => ({
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
            return {
              availabilities: fallbackData.availabilities || [],
              count: fallbackData.availabilities?.length || 0,
              date
            };
          }
        }

        throw new Error(data.errors?.[0]?.detail || data.errors?.[0]?.code || 'Failed to search Square availability');
      }

      return {
        availabilities: data.availabilities || [],
        count: data.availabilities?.length || 0,
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
      const resolved = resolveServiceVariation(item.id, item.category, liveCatalog, primaryTeamMemberId);
      const segmentDuration = Math.max(30, (resolved.durationMinutes || 90) * (item.quantity || 1));

      const langKey = input.language || 'fr';
      const displayName = item.name[langKey] || item.name.fr;
      itemNamesFormatted.push(`${displayName} (x${item.quantity}) - ${item.totalPrice} $`);

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

    // 5. Calculate precise start time in ISO 8601 (Eastern Time Montreal/Drummondville UTC-4)
    let timeStr = '09:00:00';
    if (input.preferredTimeSlot === 'afternoon') {
      timeStr = '13:30:00';
    } else if (input.preferredTimeSlot === 'flexible') {
      timeStr = '10:30:00';
    }

    const startAt = `${input.preferredDate}T${timeStr}-04:00`;

    // 6. Detailed notes for Square appointment
    const customerNote = [
      `=== MAXEXPERT360 SERVICE MOBILE ===`,
      `Prestations demandées :`,
      ...itemNamesFormatted.map(name => `• ${name}`),
      `Total Estimé : ${input.cart.totalPrice} $ CAD`,
      input.vehicleMakeModel ? `Véhicule/Meuble : ${input.vehicleMakeModel}` : '',
      input.notes ? `Instructions : ${input.notes}` : ''
    ].filter(Boolean).join('\n');

    const sellerNote = [
      `Adresse intervention : ${input.serviceAddress}`,
      `Client : ${input.clientName} (${input.clientPhone})`,
      `Créneau souhaité : ${input.preferredTimeSlot}`,
      `Total Devis : ${input.cart.totalPrice} $ CAD (Déplacement inclus Drummondville)`
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
      segments_count: segments.length,
      segments_summary: segments.map(s => ({
        variation_id: s.service_variation_id,
        version: s.service_variation_version,
        team_member: s.team_member_id,
        duration: s.duration_minutes
      }))
    }, null, 2));

    const bookingRes = await fetch(`${this.baseUrl}/bookings`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(bookingPayload)
    });

    const bookingData = await bookingRes.json();

    if (!bookingRes.ok) {
      // REQUIREMENT 1: Log and display the full Square error object safely (category, code, detail, field)
      // REQUIREMENT 2: Do not expose the access token or secrets
      const safeErrors: SquareApiError[] = (bookingData.errors || []).map((err: any) => ({
        category: err.category || 'INVALID_REQUEST_ERROR',
        code: err.code || 'BAD_REQUEST',
        detail: err.detail || 'Square request rejected',
        field: err.field || undefined
      }));

      console.error('[Square CreateBooking API Error Object]:', JSON.stringify(safeErrors, null, 2));

      const primaryErr = safeErrors[0] || {
        category: 'INVALID_REQUEST_ERROR',
        code: 'UNKNOWN_ERROR',
        detail: 'Square appointment creation failed.'
      };

      const customErr: any = new Error(primaryErr.detail);
      customErr.squareErrors = safeErrors;
      customErr.diagnostic = {
        httpStatus: bookingRes.status,
        failedField: primaryErr.field,
        errorCode: primaryErr.code,
        errorCategory: primaryErr.category,
        errorDetail: primaryErr.detail,
        payloadSent: {
          location_id: locationId,
          start_at: startAt,
          customer_id: customer.customerId,
          segments_count: segments.length
        }
      };
      throw customErr;
    }

    const booking = bookingData.booking;

    // Record customer in Customer Database & loyalty engine
    try {
      const parsedAddress = googleMapsService.parseAddressString(input.serviceAddress);
      const effectivePostalCode = finalPostalCode || parsedAddress.postalCode;
      customerDb.upsertCustomer({
        phone: input.clientPhone,
        name: input.clientName,
        email: input.clientEmail,
        primaryAddress: input.serviceAddress,
        addressDetails: {
          formattedAddress: input.serviceAddress,
          streetNumber: parsedAddress.streetNumber,
          streetName: parsedAddress.streetName,
          city: parsedAddress.city,
          province: parsedAddress.province,
          postalCode: effectivePostalCode,
          country: parsedAddress.country,
          latitude: parsedAddress.latitude,
          longitude: parsedAddress.longitude
        },
        postalCode: effectivePostalCode,
        squareCustomerId: customer.customerId,
        notes: input.notes
      });

      customerDb.recordBooking(input.clientPhone, {
        bookingId: booking.id,
        date: input.preferredDate,
        servicesSummary: itemNamesFormatted.join(' • '),
        totalPrice: input.cart.totalPrice,
        squareCustomerId: customer.customerId
      });
    } catch (dbErr) {
      console.warn('[CustomerDb Warning] Could not record booking in local db:', dbErr);
    }

    const loyaltySummary = customerDb.getLoyaltySummary(input.clientPhone);

    return {
      success: true,
      bookingId: booking.id,
      status: booking.status || 'ACCEPTED',
      version: booking.version,
      startAt: booking.start_at,
      locationId: booking.location_id,
      customerId: customer.customerId,
      createdAt: booking.created_at,
      totalPrice: input.cart.totalPrice,
      loyalty: loyaltySummary,
      diagnostic: {
        validationPassed: true,
        segmentsAssigned: segments.length,
        teamMemberId: segments[0]?.team_member_id
      },
      squareRaw: booking
    };
  }
}

export const squareBookingsService = new SquareBookingsService();
