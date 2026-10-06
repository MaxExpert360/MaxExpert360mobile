import { AddressSuggestionItem, ParsedAddressResult, normalizeCanadianPostalCode, validateCanadianPostalCode } from './squareBookings';
import { getApiUrl } from '../config/api';

declare global {
  interface Window {
    google?: any;
    gm_authFailure?: () => void;
  }
}

let googleMapsScriptPromise: Promise<boolean> | null = null;
let cachedApiKey: string | null = null;
let isClientGoogleMapsBlocked = false;

/**
 * Retrieves the Google Maps API Key from environment or from the backend config endpoint
 */
export async function getGoogleMapsApiKey(): Promise<string> {
  if (cachedApiKey) return cachedApiKey;

  // 1. Check Vite bundled environment variable
  const envKey = ((import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || '').trim();
  if (envKey && envKey.length > 5) {
    cachedApiKey = envKey;
    return envKey;
  }

  // 2. Fetch from same-origin backend config endpoint
  try {
    const res = await fetch(getApiUrl('/api/maps/config'));
    if (res.ok) {
      const data = await res.json();
      if (data.apiKey && typeof data.apiKey === 'string') {
        cachedApiKey = data.apiKey.trim();
        return cachedApiKey;
      }
    }
  } catch (err) {
    console.warn('[Google Maps Loader] Could not fetch maps config from server:', err);
  }

  return '';
}

/**
 * Loads the Google Maps JavaScript API script with Places library in the browser
 */
export function ensureGoogleMapsLoaded(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  // Already fully loaded
  if (window.google?.maps?.places) {
    return Promise.resolve(true);
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise(async (resolve) => {
    try {
      const apiKey = await getGoogleMapsApiKey();
      if (!apiKey) {
        console.warn('[Google Maps Loader] No Google Maps API key available.');
        resolve(false);
        return;
      }

      // Check if script tag is already in DOM
      const existingScript = document.getElementById('google-maps-js-sdk') as HTMLScriptElement | null;
      if (existingScript) {
        if (window.google?.maps?.places) {
          resolve(true);
          return;
        }
        existingScript.addEventListener('load', () => resolve(true), { once: true });
        existingScript.addEventListener('error', () => resolve(false), { once: true });
        return;
      }

      // Attach global auth failure listener for clean developer diagnostics
      window.gm_authFailure = () => {
        isClientGoogleMapsBlocked = true;
        console.warn('[Google Maps Platform] Authentication failed for this domain (gm_authFailure). Using secure server-side Google Places API proxy.');
      };

      const script = document.createElement('script');
      script.id = 'google-maps-js-sdk';
      script.type = 'text/javascript';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&language=fr&region=CA&v=weekly`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.google?.maps?.places) {
          console.log('[Google Maps Loader] Google Maps JavaScript API with Places library loaded successfully.');
          resolve(true);
        } else {
          // Poll briefly for places namespace initialization
          let checks = 0;
          const interval = setInterval(() => {
            checks++;
            if (window.google?.maps?.places) {
              clearInterval(interval);
              resolve(true);
            } else if (checks > 20) {
              clearInterval(interval);
              resolve(false);
            }
          }, 50);
        }
      };

      script.onerror = (e) => {
        console.error('[Google Maps Loader] Failed to load Google Maps script:', e);
        resolve(false);
      };

      document.head.appendChild(script);
    } catch (err) {
      console.error('[Google Maps Loader] Exception while loading script:', err);
      resolve(false);
    }
  });

  return googleMapsScriptPromise;
}

let autocompleteServiceInstance: any = null;
let placesServiceInstance: any = null;

function getAutocompleteService(): any {
  if (!autocompleteServiceInstance && window.google?.maps?.places?.AutocompleteService) {
    autocompleteServiceInstance = new window.google.maps.places.AutocompleteService();
  }
  return autocompleteServiceInstance;
}

function getPlacesService(): any {
  if (!placesServiceInstance && window.google?.maps?.places?.PlacesService) {
    const dummy = document.createElement('div');
    placesServiceInstance = new window.google.maps.places.PlacesService(dummy);
  }
  return placesServiceInstance;
}

/**
 * Searches real-time Google Places address suggestions directly in the browser.
 * Uses client-side AutocompleteService which sends the browser's HTTP referer.
 */
export async function getClientGooglePlacesSuggestions(input: string): Promise<AddressSuggestionItem[]> {
  const query = (input || '').trim();
  if (query.length < 2 || isClientGoogleMapsBlocked) return [];

  const loaded = await ensureGoogleMapsLoaded();
  if (!loaded || isClientGoogleMapsBlocked || !window.google?.maps?.places) {
    return [];
  }

  const service = getAutocompleteService();
  if (!service) return [];

  return new Promise((resolve) => {
    try {
      service.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'ca' },
          locationBias: {
            center: { lat: 45.8827, lng: -72.4851 }, // Drummondville center
            radius: 50000 // 50 km bias
          },
          types: ['address']
        },
        (predictions: any[], status: string) => {
          if (status === 'REQUEST_DENIED') {
            isClientGoogleMapsBlocked = true;
            resolve([]);
            return;
          }

          if (status !== 'OK' || !Array.isArray(predictions)) {
            resolve([]);
            return;
          }

          const results: AddressSuggestionItem[] = predictions.map((p) => ({
            placeId: p.place_id,
            description: p.description,
            mainText: p.structured_formatting?.main_text || p.description,
            secondaryText: p.structured_formatting?.secondary_text || ''
          }));

          resolve(results);
        }
      );
    } catch (err) {
      console.warn('[Google Places Client] Autocomplete error:', err);
      resolve([]);
    }
  });
}

/**
 * Fetches place details using client-side PlacesService to extract address components
 */
export async function getClientGooglePlaceDetails(placeId: string, addressFallback?: string): Promise<ParsedAddressResult | null> {
  if (isClientGoogleMapsBlocked) return null;

  const loaded = await ensureGoogleMapsLoaded();
  if (!loaded || isClientGoogleMapsBlocked || !window.google?.maps?.places) {
    return null;
  }

  const service = getPlacesService();
  if (!service) return null;

  return new Promise((resolve) => {
    try {
      service.getDetails(
        {
          placeId,
          fields: ['formatted_address', 'address_components', 'geometry', 'name', 'place_id']
        },
        (place: any, status: string) => {
          if (status === 'REQUEST_DENIED') {
            isClientGoogleMapsBlocked = true;
            resolve(null);
            return;
          }

          if (status !== 'OK' || !place) {
            resolve(null);
            return;
          }

          const components: any[] = place.address_components || [];
          const getComp = (types: string[]): { longName: string; shortName: string } => {
            for (const t of types) {
              const match = components.find((c) => c.types?.includes(t));
              if (match) {
                return { longName: match.long_name || '', shortName: match.short_name || '' };
              }
            }
            return { longName: '', shortName: '' };
          };

          const streetNumber = getComp(['street_number']).longName;
          const route = getComp(['route']).longName;
          const city = getComp(['locality', 'sublocality_level_1', 'postal_town', 'administrative_area_level_2']).longName || 'Drummondville';
          const province = getComp(['administrative_area_level_1']).shortName || 'QC';
          const country = getComp(['country']).longName || 'Canada';
          const rawPostal = getComp(['postal_code']).longName;

          const normalizedPostal = rawPostal ? normalizeCanadianPostalCode(rawPostal) : '';
          const hasValidPostal = Boolean(normalizedPostal && validateCanadianPostalCode(normalizedPostal));

          const lat = typeof place.geometry?.location?.lat === 'function' ? place.geometry.location.lat() : 45.8827;
          const lng = typeof place.geometry?.location?.lng === 'function' ? place.geometry.location.lng() : -72.4851;

          const formattedAddress = place.formatted_address || addressFallback || '';

          const result: ParsedAddressResult = {
            placeId: place.place_id || placeId,
            place_id: place.place_id || placeId,
            formattedAddress,
            formatted_address: formattedAddress,
            streetNumber,
            street_number: streetNumber,
            streetName: route,
            route,
            city,
            province,
            postalCode: normalizedPostal,
            postal_code: normalizedPostal,
            googlePostalCode: hasValidPostal ? normalizedPostal : undefined,
            confirmedPostalCode: hasValidPostal ? normalizedPostal : undefined,
            postalCodeSource: hasValidPostal ? 'google' : undefined,
            country,
            latitude: lat,
            longitude: lng,
            hasValidPostalCode: hasValidPostal,
            isVerified: true
          };

          resolve(result);
        }
      );
    } catch (err) {
      console.warn('[Google Places Client] getDetails error:', err);
      resolve(null);
    }
  });
}
