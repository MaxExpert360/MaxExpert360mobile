import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { squareBookingsService } from './server/squareService';
import { customerDb } from './server/customerDb';
import { googleMapsService } from './server/mapsService';
import { smsService } from './server/smsService';
import { reviewsDb } from './server/reviewsDb';
import { validateBookingSchedule } from './server/bookingSchedule';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8080;

  // Strict CORS configuration
  const ALLOWED_ORIGINS = new Set([
    'https://maxexpert360.ca',
    'https://www.maxexpert360.ca',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean) : [])
  ]);

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    const isAllowed = origin && (
      ALLOWED_ORIGINS.has(origin) ||
      (process.env.NODE_ENV !== 'production' && (
        origin.startsWith('http://localhost:') || 
        origin.startsWith('http://127.0.0.1:') ||
        origin.endsWith('.run.app')
      ))
    );

    if (isAllowed && origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400');
    }

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    next();
  });

  // JSON request body parser
  app.use(express.json({ limit: '60mb' }));

  // ================= API ROUTES =================

  // Simple Cloud Run health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // 1. API Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'MaxExpert360 Mobile API',
      timestamp: new Date().toISOString()
    });
  });

  // Reviews API
  app.get('/api/reviews', (req, res) => {
    try {
      const reviews = reviewsDb.getAllReviews();
      res.json({
        success: true,
        reviews
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  app.post('/api/reviews', (req, res) => {
    try {
      const { name, location, vehicle, rating, text, photos } = req.body;
      if (!name || !text) {
        return res.status(400).json({
          success: false,
          error: 'Le nom et le texte de l\'avis sont obligatoires.'
        });
      }

      const newReview = reviewsDb.addReview({
        name,
        location: location || 'Drummondville, QC',
        vehicle: vehicle || 'Nettoyage professionnel',
        rating: Number(rating) || 5,
        text,
        photos: Array.isArray(photos) ? photos : []
      });

      res.json({
        success: true,
        review: newReview
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  });

  // 2. Square Authentication Diagnostic & Test Endpoint
  app.get('/api/square/auth-diagnostic', async (req, res) => {
    try {
      const diagnostic = await squareBookingsService.testAuthentication();
      res.status(diagnostic.success ? 200 : 401).json(diagnostic);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        status: 'Square authentication diagnostic error',
        errors: [{
          category: 'INTERNAL_SERVER_ERROR',
          code: 'DIAGNOSTIC_EXCEPTION',
          detail: err.message
        }]
      });
    }
  });

  // 3. Square connection & configuration status
  app.get('/api/square/status', async (req, res) => {
    try {
      const status = await squareBookingsService.getStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({
        configured: false,
        error: err.message,
        message: 'Failed to retrieve Square connection status'
      });
    }
  });

  // 3. Square catalog services inspection
  app.get('/api/square/catalog', async (req, res) => {
    try {
      const variations = await squareBookingsService.getLiveCatalogVariations();
      res.json({
        success: true,
        count: variations.length,
        variations
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // 4. Square availability search (checks open slots to prevent double booking)
  app.post('/api/square/availability', async (req, res) => {
    try {
      const { date, serviceVariationIds } = req.body;
      if (!date) {
        return res.status(400).json({
          success: false,
          error: 'Date is required (YYYY-MM-DD)'
        });
      }

      const locationId = await squareBookingsService.getEffectiveLocationId();
      const availability = await squareBookingsService.checkAvailability({
        date,
        locationId,
        serviceVariationIds: Array.isArray(serviceVariationIds) ? serviceVariationIds : []
      });

      res.json({
        success: true,
        ...availability
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  });

  // ================= SMS OTP AUTHENTICATION & CUSTOMER LOOKUP =================

  // Request SMS verification code
  app.post('/api/auth/send-code', async (req, res) => {
    try {
      const { phone, isResend } = req.body;
      if (!phone || typeof phone !== 'string' || !phone.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Veuillez entrer un numéro de téléphone canadien valide.'
        });
      }

      const result = await smsService.sendVerificationCode(phone, Boolean(isResend));
      res.json(result);
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Impossible d’envoyer le code pour le moment. Veuillez réessayer.'
      });
    }
  });

  // Verify SMS OTP code and unlock customer profile if existing
  app.post('/api/auth/verify-code', async (req, res) => {
    try {
      const { phone, code } = req.body;
      if (!phone || !code) {
        return res.status(400).json({
          success: false,
          error: 'Numéro de téléphone et code de vérification requis.'
        });
      }

      const verifyResult = await smsService.verifyCode(phone, code);
      if (!verifyResult.success) {
        return res.status(400).json({
          success: false,
          error: verifyResult.error || 'Code de vérification invalide.'
        });
      }

      // Successful verification: safely load existing customer profile
      const customer = customerDb.findByPhone(phone);
      const loyalty = customerDb.getLoyaltySummary(phone);

      if (customer) {
        return res.json({
          success: true,
          verified: true,
          isReturning: true,
          customer: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            normalizedPhone: customer.normalizedPhone,
            email: customer.email || '',
            primaryAddress: customer.primaryAddress || '',
            addressDetails: customer.addressDetails || null,
            postalCode: customer.postalCode || '',
            completedBookingsCount: customer.completedBookingsCount,
            lastBookingDate: customer.lastBookingDate || '',
            bookingHistory: customer.bookingHistory || []
          },
          loyalty,
          welcomeMessage: `Bon retour, ${customer.name} !`
        });
      }

      return res.json({
        success: true,
        verified: true,
        isReturning: false,
        customer: null,
        loyalty
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // ================= CUSTOMER IDENTIFICATION & LOYALTY API =================

  // Phone-first customer recognition & lookup (Secure: Never reveal private data without SMS verification)
  app.get('/api/customers/lookup', (req, res) => {
    try {
      const phone = (req.query.phone as string) || '';
      if (!phone.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre phone est obligatoire.'
        });
      }

      const isVerified = smsService.isPhoneVerified(phone);
      const customer = customerDb.findByPhone(phone);

      if (!customer) {
        return res.json({
          success: true,
          exists: false,
          isReturning: false,
          welcomeMessage: null,
          customer: null
        });
      }

      // Security Constraint: If the phone number exists but SMS OTP is not verified,
      // only display "Bon retour !" and NEVER reveal name, email, address, postal code,
      // loyalty balance, booking count, or history.
      if (!isVerified) {
        return res.json({
          success: true,
          exists: true,
          isReturning: true,
          verified: false,
          welcomeMessage: 'Bon retour !',
          customer: null
        });
      }

      // If phone is verified via SMS OTP session (future OTP flow):
      const loyalty = customerDb.getLoyaltySummary(phone);
      return res.json({
        success: true,
        exists: true,
        isReturning: true,
        verified: true,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          normalizedPhone: customer.normalizedPhone,
          email: customer.email || '',
          primaryAddress: customer.primaryAddress || '',
          addressDetails: customer.addressDetails || null,
          postalCode: customer.postalCode || '',
          completedBookingsCount: customer.completedBookingsCount,
          lastBookingDate: customer.lastBookingDate || '',
          bookingHistory: customer.bookingHistory || []
        },
        loyalty,
        welcomeMessage: `Bon retour, ${customer.name} !`
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // Upsert customer profile
  app.post('/api/customers', (req, res) => {
    try {
      const { phone, name, email, primaryAddress, addressDetails, postalCode, notes } = req.body;
      if (!phone || !name) {
        return res.status(400).json({
          success: false,
          error: 'Le numéro de téléphone et le nom sont requis.'
        });
      }

      const customer = customerDb.upsertCustomer({
        phone,
        name,
        email,
        primaryAddress,
        addressDetails,
        postalCode,
        notes
      });

      const loyalty = customerDb.getLoyaltySummary(phone);

      res.json({
        success: true,
        customer,
        loyalty
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  });

  // Loyalty rewards status (masked for unverified requests)
  app.get('/api/loyalty/status', (req, res) => {
    try {
      const phone = (req.query.phone as string) || '';
      const isVerified = smsService.isPhoneVerified(phone);

      if (!isVerified) {
        // Return tier info without exposing personal booking counts
        const allSummary = customerDb.getLoyaltySummary(phone);
        return res.json({
          success: true,
          found: false,
          completedBookingsCount: 0,
          nextRewardAt: 3,
          visitsUntilNextReward: 3,
          unlockedRewards: [],
          allTiers: allSummary.allTiers
        });
      }

      const summary = customerDb.getLoyaltySummary(phone);
      res.json({
        success: true,
        ...summary
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // Mark booking completed (awards 1 stamp/point to customer without double counting)
  app.post('/api/customers/complete-booking', (req, res) => {
    try {
      const { phone, bookingId } = req.body;
      if (!phone || !bookingId) {
        return res.status(400).json({
          success: false,
          error: 'Phone and bookingId are required.'
        });
      }

      const result = customerDb.completeBooking(phone, bookingId);
      res.json({
        success: true,
        ...result
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  });

  // ================= GOOGLE MAPS & ADDRESS AUTOCOMPLETE API =================

  // Google Maps address autocomplete suggestions
  app.get('/api/maps/autocomplete', async (req, res) => {
    try {
      const input = (req.query.input as string) || '';
      if (!input || input.trim().length < 2) {
        return res.json({
          success: true,
          suggestions: []
        });
      }

      const suggestions = await googleMapsService.getAutocompleteSuggestions(input);
      res.json({
        success: true,
        query: input,
        suggestions
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
        suggestions: []
      });
    }
  });

  // Google Maps place details & address breakdown (street, city, province, postal code, lat, lng)
  app.get('/api/maps/place-details', async (req, res) => {
    try {
      const placeId = (req.query.placeId as string) || '';
      const addressFallback = (req.query.address as string) || '';

      if (!placeId && !addressFallback) {
        return res.status(400).json({
          success: false,
          error: 'placeId ou address est requis.'
        });
      }

      const details = await googleMapsService.getPlaceDetails(placeId, addressFallback);
      res.json({
        success: true,
        details
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // ================= SQUARE BOOKING ENDPOINTS =================
  app.post('/api/square/create-booking', async (req, res) => {
    try {
      const { 
        clientName, 
        clientPhone, 
        clientEmail, 
        serviceAddress, 
        postalCode,
        confirmedPostalCode,
        googlePostalCode,
        postalCodeSource,
        preferredDate, 
        preferredTimeSlot,
        vehicleMakeModel,
        notes,
        bookingPhotos,
        cart,
        language
      } = req.body;

      // Validation
      if (!clientName || !clientPhone) {
        return res.status(400).json({
          success: false,
          error: 'Le nom et le numéro de téléphone du client sont obligatoires.'
        });
      }

      if (!serviceAddress) {
        return res.status(400).json({
          success: false,
          error: 'L\'adresse d\'intervention est obligatoire pour le service mobile.'
        });
      }

      if (!preferredDate) {
        return res.status(400).json({
          success: false,
          error: 'Veuillez sélectionner une date de rendez-vous.'
        });
      }

      const rawTimeSlot = String(preferredTimeSlot || (req.body as any).timeSlot || (req.body as any).startTime || (req.body as any).time || '').trim();
      if (!rawTimeSlot) {
        const lang = language === 'ua' ? 'ua' : language === 'en' ? 'en' : 'fr';
        const msg = lang === 'ua'
          ? 'Будь ласка, оберіть точний час початку бронювання.'
          : lang === 'en'
          ? 'Please select an exact booking start time.'
          : 'Veuillez sélectionner une heure de début de rendez-vous exacte.';
        return res.status(400).json({
          success: false,
          error: msg,
          squareErrors: [{
            category: 'SCHEDULE_AVAILABILITY_ERROR',
            code: 'TIME_SLOT_REQUIRED',
            detail: msg,
            field: 'preferredTimeSlot'
          }]
        });
      }

      const scheduleValidation = validateBookingSchedule(preferredDate, rawTimeSlot);
      if (!scheduleValidation.isValid) {
        const lang = language === 'ua' ? 'ua' : language === 'en' ? 'en' : 'fr';
        const msg = scheduleValidation.error?.[lang] || scheduleValidation.error?.fr || 'Ce créneau horaire n\'est pas disponible pour cette date.';
        return res.status(400).json({
          success: false,
          error: msg,
          squareErrors: [{
            category: 'SCHEDULE_AVAILABILITY_ERROR',
            code: 'TIME_SLOT_UNAVAILABLE',
            detail: msg,
            field: 'preferredTimeSlot'
          }]
        });
      }

      if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Le panier ne contient aucune prestation sélectionnée.'
        });
      }

      // Execute real creation in Square
      const bookingResult = await squareBookingsService.createSquareBooking({
        clientName,
        clientPhone,
        clientEmail,
        serviceAddress,
        postalCode,
        confirmedPostalCode,
        googlePostalCode,
        postalCodeSource,
        preferredDate,
        preferredTimeSlot: rawTimeSlot,
        vehicleMakeModel,
        notes,
        bookingPhotos: Array.isArray(bookingPhotos) ? bookingPhotos.slice(0, 5) : [],
        cart,
        language: language || 'fr'
      });

      res.json(bookingResult);
    } catch (err: any) {
      const safeErrors = err.squareErrors || [
        {
          category: err.isValidationError ? 'VALIDATION_ERROR' : 'API_ERROR',
          code: err.code || 'BOOKING_CREATION_FAILED',
          detail: err.message,
          field: err.diagnostic?.failedField || undefined
        }
      ];

      console.error('[Square Booking Controller Error]:', {
        message: err.message,
        errors: safeErrors,
        diagnostic: err.diagnostic
      });

      res.status(400).json({
        success: false,
        error: err.message,
        squareErrors: safeErrors,
        diagnostic: err.diagnostic || null,
        details: 'Square API rejected or failed to process the booking request.'
      });
    }
  });

  // ================= VITE / STATIC SERVING =================
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.json({
          status: 'ok',
          service: 'MaxExpert360 Mobile API',
          message: 'Cloud Run Backend is running successfully. Frontend is served at https://maxexpert360.ca.'
        });
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MaxExpert360 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
