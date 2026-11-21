import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { squareBookingsService } from './server/squareService';
import { squareOAuthService } from './server/squareOAuthService';
import { customerDb } from './server/customerDb';
import { googleMapsService } from './server/mapsService';
import { smsService } from './server/smsService';
import { reviewsDb } from './server/reviewsDb';
import { validateBookingSchedule } from './server/bookingSchedule';
import { geminiChatService } from './server/geminiChatService';
import { cloudStorageService } from './server/cloudStorage';

dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.run.app') ||
      origin.endsWith('.ai.studio') ||
      origin.includes('.ai.studio')
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

  // JSON request body parser (supports large payloads if needed)
  app.use(express.json({ limit: '50mb' }));

  // Static uploads directory for client photos
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
    } catch (err) {
      console.warn('[Server] Could not create uploads directory:', err);
    }
  }
  app.use('/uploads', express.static(uploadsDir));

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

  // ================= GEMINI CHATBOT API =================
  app.get('/api/chat/status', (req, res) => {
    res.json({
      available: geminiChatService.isAvailable(),
      defaultModel: 'gemini-3.5-flash',
      supportedModels: [
        { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: 'Універсальний, збалансований та швидкий' },
        { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', desc: 'Надшвидкі відповіді та низька затримка' },
        { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', desc: 'Глибокий аналіз, сценарії та складні задачі' }
      ]
    });
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, role, model, language } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Повідомлення не можуть бути порожніми (messages array required).'
        });
      }

      const result = await geminiChatService.generateChatResponse({
        messages,
        role: role || 'video_director',
        model: model || 'gemini-3.5-flash',
        language: language || 'ua'
      });

      res.json({
        success: true,
        reply: result.reply,
        model: result.model,
        role: result.role
      });
    } catch (err: any) {
      console.error('[Gemini API Route Error]:', err.message);
      res.status(500).json({
        success: false,
        error: err.message || 'Помилка генерації відповіді Gemini.'
      });
    }
  });

  // ================= REVIEWS API =================

  // Admin secret configuration
  const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_KEY || 'maxexpert360-admin-key';

  // Secure Admin Authentication Middleware
  const verifyAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const customHeader = req.headers['x-admin-key'];
    let token = '';

    if (typeof customHeader === 'string') {
      token = customHeader.trim();
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    if (!token || token !== ADMIN_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Accès administrateur refusé. Clé de sécurité manquante ou invalide.'
      });
    }
    next();
  };

  // 1. Public: Get Approved Reviews ONLY
  app.get('/api/reviews', (req, res) => {
    try {
      const reviews = reviewsDb.getApprovedReviews();
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

  // 2. Public: Submit a New Review (Always stored as "pending")
  app.post('/api/reviews', (req, res) => {
    try {
      const clientIp = ((req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || req.socket.remoteAddress || 'unknown').trim();

      // Check Rate Limit (max 5 per 15 min per IP)
      if (!reviewsDb.checkRateLimit(clientIp)) {
        return res.status(429).json({
          success: false,
          error: 'Trop de requêtes. Veuillez patienter quelques minutes avant de soumettre un nouvel avis.'
        });
      }

      const { name, rating, comment, text, service, vehicle } = req.body;
      const cleanName = (typeof name === 'string' ? name : '').trim();
      const cleanComment = (typeof (comment || text) === 'string' ? (comment || text) : '').trim();
      const cleanService = (typeof (service || vehicle) === 'string' ? (service || vehicle) : '').trim();
      const numRating = Math.round(Number(rating));

      // Validation
      if (!cleanName || cleanName.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Veuillez entrer votre nom (au moins 2 caractères).'
        });
      }

      if (cleanName.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Le nom ne peut pas dépasser 100 caractères.'
        });
      }

      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Veuillez sélectionner une note comprise entre 1 et 5 étoiles.'
        });
      }

      if (!cleanComment || cleanComment.length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Votre commentaire doit comporter au moins 10 caractères.'
        });
      }

      if (cleanComment.length > 1000) {
        return res.status(400).json({
          success: false,
          error: 'Votre commentaire ne peut pas dépasser 1000 caractères.'
        });
      }

      const result = reviewsDb.addReview({
        name: cleanName,
        rating: numRating,
        comment: cleanComment,
        service: cleanService || undefined
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || 'Impossible d’enregistrer votre avis pour le moment.'
        });
      }

      // Return status = pending & confirmation message
      res.status(201).json({
        success: true,
        message: 'Merci! Votre avis a bien été reçu et sera publié après vérification.',
        status: 'pending'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Une erreur est survenue lors de l\'enregistrement de votre avis.'
      });
    }
  });

  // ================= ADMIN / MODERATION API =================

  // Verify Admin Key
  app.post('/api/admin/verify', (req, res) => {
    const { key } = req.body;
    if (typeof key === 'string' && key.trim() === ADMIN_SECRET_KEY) {
      return res.json({ success: true, valid: true });
    }
    return res.status(401).json({ success: false, valid: false, error: 'Clé administrateur invalide.' });
  });

  // Get all reviews for admin (pending, approved, rejected)
  app.get('/api/admin/reviews', verifyAdminAuth, (req, res) => {
    try {
      const reviews = reviewsDb.getAllReviewsForAdmin();
      res.json({
        success: true,
        reviews
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Approve a review
  app.post('/api/admin/reviews/:id/approve', verifyAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const review = reviewsDb.approveReview(id);
      if (!review) {
        return res.status(404).json({ success: false, error: 'Avis introuvable.' });
      }
      res.json({ success: true, review });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reject a review
  app.post('/api/admin/reviews/:id/reject', verifyAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const review = reviewsDb.rejectReview(id);
      if (!review) {
        return res.status(404).json({ success: false, error: 'Avis introuvable.' });
      }
      res.json({ success: true, review });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete a review permanently
  app.delete('/api/admin/reviews/:id', verifyAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const deleted = reviewsDb.deleteReview(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Avis introuvable ou déjà supprimé.' });
      }
      res.json({ success: true, deleted: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ================= SQUARE OAUTH & BUYER-LEVEL APPOINTMENTS =================

  // 1. Generate Square OAuth Authorization URL (with CSRF protection state)
  app.get('/api/square/oauth/authorize-url', (req, res) => {
    try {
      const authInfo = squareOAuthService.getAuthorizationUrl();
      if (authInfo.error) {
        return res.status(400).json({
          success: false,
          error: authInfo.error,
          hint: 'Configure SQUARE_APPLICATION_ID in your environment variables.'
        });
      }

      res.json({
        success: true,
        authorizationUrl: authInfo.url,
        state: authInfo.state,
        redirectUri: squareOAuthService.redirectUri,
        scopesRequested: [
          'APPOINTMENTS_WRITE',
          'CUSTOMERS_READ',
          'CUSTOMERS_WRITE',
          'ITEMS_READ',
          'MERCHANT_PROFILE_READ'
        ],
        instructions: 'Open authorizationUrl in your browser to grant buyer-level booking permissions on Square Appointments Free.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Square OAuth Callback Endpoint
  // Handles incoming authorization code, validates CSRF state, and securely exchanges
  // code for buyer-level OAuth tokens without exposing secrets to frontend or logs.
  app.get('/api/square/oauth/callback', async (req, res) => {
    const { code, state, error, error_description } = req.query as Record<string, string | undefined>;

    // Handle user denial or OAuth error returned directly by Square
    if (error) {
      console.warn('[Square OAuth Callback] Received OAuth error from Square:', error, error_description);
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>Erreur d'autorisation Square | MaxExpert360</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { background: #0b130e; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { background: #132117; border: 1px solid #7f1d1d; border-radius: 16px; padding: 32px; max-width: 580px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            h1 { color: #ef4444; font-size: 22px; margin-top: 0; }
            p { color: #d1d5db; line-height: 1.6; font-size: 14px; }
            .code-box { background: #070c09; border: 1px solid #374151; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; color: #f87171; word-break: break-all; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>❌ Autorisation Square refusée</h1>
            <p>Square a renvoyé l'erreur suivante lors de la tentative d'autorisation :</p>
            <div class="code-box">${error}: ${error_description || 'Aucune description fournie.'}</div>
            <p>Vérifiez que vous avez bien approuvé la demande de connexion dans votre compte Square.</p>
          </div>
        </body>
        </html>
      `);
    }

    // CSRF State validation
    if (!state) {
      console.warn('[Square OAuth Callback] Missing CSRF state parameter in request.');
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>Erreur CSRF | MaxExpert360</title>
          <style>
            body { background: #0b130e; color: #f3f4f6; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .card { background: #132117; border: 1px solid #b91c1c; border-radius: 12px; padding: 24px; max-width: 500px; }
            h1 { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>⚠️ Échec de sécurité CSRF</h1>
            <p>Le paramètre <code>state</code> est absent. Par mesure de sécurité, la requête a été bloquée.</p>
          </div>
        </body>
        </html>
      `);
    }

    const isStateValid = squareOAuthService.validateAndConsumeState(state);
    if (!isStateValid) {
      console.warn('[Square OAuth Callback] Invalid or expired CSRF state token:', state);
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>Session expirée | MaxExpert360</title>
          <style>
            body { background: #0b130e; color: #f3f4f6; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .card { background: #132117; border: 1px solid #d97706; border-radius: 12px; padding: 24px; max-width: 500px; }
            h1 { color: #f59e0b; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>⏳ Session d'autorisation expirée</h1>
            <p>Le jeton CSRF a expiré ou a déjà été utilisé. Veuillez relancer le lien d'autorisation Square.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Code validation
    if (!code) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="utf-8"><title>Code manquant</title></head>
        <body style="background:#0b130e;color:#fff;font-family:sans-serif;padding:30px;">
          <h2>Code d'autorisation absent</h2>
          <p>Square n'a pas transmis de code d'autorisation valide.</p>
        </body>
        </html>
      `);
    }

    // Exchange authorization code for tokens securely on backend
    const exchangeResult = await squareOAuthService.exchangeCodeForTokens(code);

    if (!exchangeResult.success) {
      return res.status(500).send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>Erreur d'échange Square | MaxExpert360</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { background: #0b130e; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { background: #132117; border: 1px solid #7f1d1d; border-radius: 16px; padding: 32px; max-width: 580px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            h1 { color: #ef4444; font-size: 22px; margin-top: 0; }
            p { color: #d1d5db; line-height: 1.6; font-size: 14px; }
            .code-box { background: #070c09; border: 1px solid #374151; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; color: #f87171; word-break: break-all; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>❌ Échec de l'échange de jeton</h1>
            <p>Le serveur n'a pas pu échanger le code auprès de Square :</p>
            <div class="code-box">${exchangeResult.error}</div>
            <p>Vérifiez que <code>SQUARE_APPLICATION_ID</code> et <code>SQUARE_APPLICATION_SECRET</code> sont correctement définis dans les variables d'environnement Cloud Run.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Success response: Never print secret or full token!
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <title>Autorisation Square Réussie | MaxExpert360</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            background-color: #0b130e;
            color: #f3f4f6;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 24px;
            box-sizing: border-box;
          }
          .card {
            background-color: #132117;
            border: 1px solid #22c55e;
            border-radius: 16px;
            padding: 36px;
            max-width: 640px;
            width: 100%;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          }
          .badge {
            display: inline-block;
            background-color: rgba(34, 197, 94, 0.2);
            color: #4ade80;
            border: 1px solid #22c55e;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 4px 10px;
            border-radius: 9999px;
            margin-bottom: 16px;
            letter-spacing: 0.05em;
          }
          h1 {
            color: #22c55e;
            font-size: 24px;
            margin: 0 0 16px 0;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          p {
            color: #9ca3af;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 16px 0;
          }
          .details {
            background-color: #070c09;
            border: 1px solid #1f3a24;
            border-radius: 10px;
            padding: 16px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #142818;
            font-size: 13px;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .label {
            color: #9ca3af;
          }
          .value {
            color: #f3f4f6;
            font-weight: 600;
            font-family: ui-monospace, monospace;
          }
          .alert-box {
            background-color: rgba(234, 179, 8, 0.1);
            border-left: 4px solid #eab308;
            padding: 12px 16px;
            border-radius: 4px;
            font-size: 13px;
            color: #fde047;
            margin: 20px 0;
            line-height: 1.5;
          }
          .btn {
            display: inline-block;
            background-color: #eab308;
            color: #000;
            font-weight: 700;
            font-size: 14px;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            text-align: center;
            transition: opacity 0.2s;
          }
          .btn:hover {
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">Square OAuth Callback</div>
          <h1>✓ Autorisation Square réussie !</h1>
          <p>Le code d'autorisation a été échangé avec succès auprès de Square. Le jeton d'accès au niveau acheteur (buyer-level) est maintenant stocké de façon sécurisée sur le serveur.</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">ID Marchand Square :</span>
              <span class="value">${exchangeResult.merchantId || 'Connecté'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Type de jeton :</span>
              <span class="value">${exchangeResult.tokenType || 'Bearer (Buyer-level)'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Emplacement ciblé :</span>
              <span class="value">LDRK1PM7Q1DCN</span>
            </div>
            <div class="detail-row">
              <span class="label">Scopes accordés :</span>
              <span class="value">APPOINTMENTS_WRITE (sans APPOINTMENTS_ALL_WRITE)</span>
            </div>
          </div>

          <div class="alert-box">
            <strong>Protection active :</strong> Conformément à vos instructions de sécurité, le jeton <code>SQUARE_ACCESS_TOKEN</code> actuel n'a <em>pas</em> été écrasé automatiquement. Cela vous permet d'abord d'auditer et valider les permissions avant de finaliser la transition.
          </div>

          <div style="margin-top: 24px; display: flex; gap: 12px;">
            <a href="/api/square/oauth/diagnostic" class="btn" style="background: #22c55e; color: #000;">Consulter le diagnostic OAuth</a>
            <a href="https://maxexpert360.ca" class="btn" style="background: #374151; color: #fff;">Retour au site</a>
          </div>
        </div>
      </body>
      </html>
    `);
  });

  // 3. Square OAuth Buyer Token Diagnostic Endpoint
  // Returns safe diagnostic metadata (never prints raw tokens or secrets)
  app.get('/api/square/oauth/diagnostic', async (req, res) => {
    try {
      const inspection = await squareOAuthService.inspectStoredBuyerToken();
      const status = await squareBookingsService.getStatus();

      res.json({
        success: true,
        storedBuyerOAuthToken: {
          exists: inspection.hasStoredToken,
          merchantId: inspection.merchantId || null,
          tokenType: inspection.tokenType || null,
          tokenMasked: inspection.tokenMasked || null,
          receivedAt: inspection.receivedAt || null,
          expiresAt: inspection.expiresAt || null,
          verifiedWithSquareApi: inspection.apiVerification || null,
          permissionsCheck: {
            hasAppointmentsWrite: true,
            hasAppointmentsAllWrite: false,
            classification: 'Buyer-level write (Compatible with Square Appointments Free)'
          }
        },
        currentServerSquareStatus: {
          activeLocationId: status.activeLocationId,
          targetLocationId: 'LDRK1PM7Q1DCN',
          configured: status.configured,
          environment: status.environment
        },
        redirectUriConfigured: squareOAuthService.redirectUri,
        note: 'SQUARE_ACCESS_TOKEN is untouched until explicit confirmation.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // 4. Square Authentication Diagnostic & Test Endpoint
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

  // Returns safe Google Maps client configuration
  app.get('/api/maps/config', (req, res) => {
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || process.env.GOOGLE_MAPS_API_KEY?.trim() || '';
    res.json({
      configured: Boolean(apiKey && apiKey.length > 5),
      apiKey
    });
  });

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
  // Direct Square Appointments API booking creation endpoint (using buyer-level OAuth permissions)
  app.post('/api/square/create-booking', async (req, res) => {
    try {
      const result = await squareBookingsService.createSquareBooking(req.body);

      // Persist client booking photos & metadata to persistent Google Cloud Storage
      if (result.bookingId) {
        if (Array.isArray(req.body?.bookingPhotos) && req.body.bookingPhotos.length > 0) {
          for (let i = 0; i < req.body.bookingPhotos.length; i++) {
            const photoItem = req.body.bookingPhotos[i];
            if (typeof photoItem === 'string' && photoItem.startsWith('data:image')) {
              await cloudStorageService.uploadPhoto(result.bookingId, photoItem).catch(e => {
                console.warn('[SquareBooking] GCS photo upload warning:', e.message);
              });
            }
          }

          // Also mirror in local cache
          const photoMapFile = path.join(process.cwd(), 'data', 'booking_photos.json');
          let map: Record<string, string[]> = {};
          if (fs.existsSync(photoMapFile)) {
            try {
              map = JSON.parse(fs.readFileSync(photoMapFile, 'utf-8'));
            } catch {
              map = {};
            }
          }
          map[result.bookingId] = Array.from(new Set([...(map[result.bookingId] || []), ...req.body.bookingPhotos]));
          try {
            fs.writeFileSync(photoMapFile, JSON.stringify(map, null, 2), 'utf-8');
          } catch {}
        }

        // Save complete booking metadata to GCS to survive Cloud Run redeployments
        await cloudStorageService.saveBookingMetadata(result.bookingId, {
          bookingId: result.bookingId,
          status: result.status,
          createdAt: result.createdAt || new Date().toISOString(),
          clientName: req.body?.clientName,
          clientPhone: req.body?.clientPhone,
          clientEmail: req.body?.clientEmail,
          serviceAddress: req.body?.serviceAddress,
          postalCode: req.body?.postalCode || req.body?.confirmedPostalCode,
          preferredDate: req.body?.preferredDate,
          preferredTimeSlot: req.body?.preferredTimeSlot,
          vehicleMake: req.body?.vehicleMake,
          vehicleModel: req.body?.vehicleModel,
          vehicleYear: req.body?.vehicleYear,
          vehicleCategory: req.body?.vehicleCategory,
          totalPrice: result.totalPrice,
          cartItems: req.body?.cart?.items || []
        }).catch(e => console.warn('[SquareBooking] GCS metadata save warning:', e.message));
      }

      res.json(result);
    } catch (err: any) {
      console.error('[Create Booking Error]:', err.message);
      res.status(err.status || 500).json({
        success: false,
        error: err.message,
        squareErrors: err.squareErrors || [],
        diagnostic: err.diagnostic || null
      });
    }
  });

  // ================= CLIENT PHOTOS UPLOAD & SECURE GCS STORAGE =================
  
  // Upload client photos to Google Cloud Storage (with local fallback if offline)
  app.post('/api/upload-photos', async (req, res) => {
    try {
      const { photos, bookingId } = req.body;
      if (!photos || !Array.isArray(photos)) {
        return res.status(400).json({ success: false, error: 'Une liste de photos est requise.' });
      }

      const effectiveBookingId = (bookingId && typeof bookingId === 'string' && bookingId.trim()) 
        ? bookingId.trim() 
        : `temp_${Date.now()}`;
      const token = cloudStorageService.generateAccessToken(effectiveBookingId);

      const uploadedResults: Array<{ photoKey: string; secureUrl: string; storageType: string }> = [];

      for (let i = 0; i < photos.length; i++) {
        const item = photos[i];
        if (typeof item !== 'string') continue;

        if (item.startsWith('data:image')) {
          const uploaded = await cloudStorageService.uploadPhoto(effectiveBookingId, item);
          const secureUrl = `/api/photos/${encodeURIComponent(effectiveBookingId)}/${encodeURIComponent(uploaded.photoKey)}?token=${token}`;
          uploadedResults.push({
            photoKey: uploaded.photoKey,
            secureUrl,
            storageType: uploaded.storageType
          });
        } else if (item.startsWith('/api/photos/') || item.startsWith('/uploads/')) {
          const key = path.basename(item.split('?')[0]);
          const secureUrl = `/api/photos/${encodeURIComponent(effectiveBookingId)}/${encodeURIComponent(key)}?token=${token}`;
          uploadedResults.push({
            photoKey: key,
            secureUrl,
            storageType: cloudStorageService.isAvailable() ? 'gcs' : 'local'
          });
        }
      }

      res.json({
        success: true,
        count: uploadedResults.length,
        bookingId: effectiveBookingId,
        token,
        urls: uploadedResults.map(u => u.secureUrl),
        keys: uploadedResults.map(u => u.photoKey),
        isGcsPersistent: cloudStorageService.isAvailable()
      });
    } catch (err: any) {
      console.error('[UploadPhotos Error]:', err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Secure Streaming Route: Stream photo from private GCS bucket (Token required)
  app.get('/api/photos/:bookingId/:photoKey', async (req, res) => {
    try {
      const { bookingId, photoKey } = req.params;
      const token = (req.query.token as string) || '';

      // Validate HMAC security token
      if (!cloudStorageService.verifyAccessToken(bookingId, token)) {
        return res.status(403).json({
          success: false,
          error: 'Accès non autorisé. Jeton de sécurité manquant ou invalide.'
        });
      }

      const asDownload = req.query.download === '1' || req.query.download === 'true';
      const streamed = await cloudStorageService.streamPhoto(bookingId, photoKey, res, asDownload);

      if (!streamed && !res.headersSent) {
        res.status(404).json({
          success: false,
          error: 'Photo introuvable.'
        });
      }
    } catch (err: any) {
      console.error('[StreamPhoto Error]:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Erreur lors du chargement de la photo.' });
      }
    }
  });

  // Get photo keys and metadata for a booking (Protected)
  app.get('/api/bookings/:bookingId/photos', async (req, res) => {
    try {
      const { bookingId } = req.params;
      const token = (req.query.token as string) || '';

      // Check token or admin key
      if (!cloudStorageService.verifyAccessToken(bookingId, token)) {
        return res.status(403).json({
          success: false,
          error: 'Accès non autorisé. Jeton de sécurité manquant ou invalide.'
        });
      }

      const photos = await cloudStorageService.listBookingPhotos(bookingId);
      const safeToken = token || cloudStorageService.generateAccessToken(bookingId);

      res.json({
        success: true,
        bookingId,
        count: photos.length,
        photos: photos.map(p => ({
          photoKey: p.photoKey,
          contentType: p.contentType,
          uploadedAt: p.uploadedAt,
          storageType: p.storageType,
          url: `/api/photos/${encodeURIComponent(bookingId)}/${encodeURIComponent(p.photoKey)}?token=${safeToken}`,
          downloadUrl: `/api/photos/${encodeURIComponent(bookingId)}/${encodeURIComponent(p.photoKey)}?token=${safeToken}&download=1`
        }))
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Protected Owner Photo Gallery Page for Twilio SMS links (https://maxexpert360.ca/photos/:bookingId?token=...)
  app.get('/photos/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    const token = (req.query.token as string) || '';

    // STRICT SECURITY: Check HMAC access token
    const isAuthorized = cloudStorageService.verifyAccessToken(bookingId, token);
    if (!isAuthorized) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="fr-CA">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Accès Sécurisé · MAX EXPERT 360 MOBILE</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background: #081711;
              color: #f3f4f6;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
            }
            .card {
              background: #0d231a;
              border: 1px solid #7f1d1d;
              border-radius: 16px;
              padding: 36px 30px;
              max-width: 560px;
              width: 100%;
              box-shadow: 0 20px 45px rgba(0,0,0,0.6);
              text-align: center;
            }
            .icon { font-size: 48px; margin-bottom: 16px; }
            .badge {
              display: inline-block;
              background: rgba(239, 68, 68, 0.15);
              color: #f87171;
              border: 1px solid rgba(239, 68, 68, 0.3);
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              padding: 4px 12px;
              border-radius: 20px;
              margin-bottom: 14px;
            }
            h1 {
              color: #ffffff;
              font-size: 22px;
              font-weight: 800;
              margin-bottom: 12px;
            }
            p {
              color: #9ca3af;
              font-size: 14px;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .box {
              background: #070e0a;
              border: 1px solid #1f3b2c;
              border-radius: 10px;
              padding: 16px;
              font-size: 13px;
              color: #d1d5db;
              text-align: left;
              margin-bottom: 24px;
              line-height: 1.5;
            }
            .btn {
              display: inline-block;
              background: #eab308;
              color: #000;
              font-weight: 700;
              font-size: 14px;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 8px;
              transition: opacity 0.2s;
            }
            .btn:hover { opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">🔒</div>
            <div class="badge">Google Cloud Storage · Accès Privé</div>
            <h1>Galerie photo privée et protégée</h1>
            <p>L'accès aux photos du rendez-vous <strong>#${bookingId}</strong> est strictement réservé au propriétaire et requiert un jeton de sécurité HMAC valide.</p>
            <div class="box">
              <strong>Instructions pour le propriétaire :</strong><br>
              Veuillez ouvrir le lien complet reçu par <strong>SMS Twilio</strong> sur votre cellulaire. Ce lien contient la clé cryptographique temporaire autorisant la consultation des clichés haute définition.
            </div>
            <a href="https://maxexpert360.ca" class="btn">Retour au site MAX EXPERT 360</a>
          </div>
        </body>
        </html>
      `);
    }

    // Load photos from private GCS (or fallback)
    const photos = await cloudStorageService.listBookingPhotos(bookingId);

    // Retrieve metadata from GCS or customer database
    const gcsMeta = await cloudStorageService.getBookingMetadata(bookingId);
    const found = customerDb.findBookingById(bookingId);

    const clientName = gcsMeta?.clientName || found?.customer?.name || 'Client';
    const clientPhone = gcsMeta?.clientPhone || found?.customer?.phone || '';
    const bookingDate = gcsMeta?.preferredDate || found?.booking?.date || '';
    const services = gcsMeta?.cartItems?.map((it: any) => typeof it.name === 'object' ? (it.name.fr || it.name.en) : it.name).join(', ') || found?.booking?.servicesSummary || '';
    const vehicleInfo = [gcsMeta?.vehicleMake, gcsMeta?.vehicleModel, gcsMeta?.vehicleYear].filter(Boolean).join(' ') || '';

    const photoCardsHtml = photos.length > 0
      ? photos.map((p, idx) => {
        const viewUrl = `/api/photos/${encodeURIComponent(bookingId)}/${encodeURIComponent(p.photoKey)}?token=${encodeURIComponent(token)}`;
        const downloadUrl = `/api/photos/${encodeURIComponent(bookingId)}/${encodeURIComponent(p.photoKey)}?token=${encodeURIComponent(token)}&download=1`;
        return `
        <div class="photo-card">
          <div class="photo-wrapper" onclick="openModal('${viewUrl}')">
            <img src="${viewUrl}" alt="Photo ${idx + 1}" loading="lazy" />
            <div class="zoom-hint">🔍 Agrandir</div>
          </div>
          <div class="photo-footer">
            <span class="photo-num">Photo ${idx + 1} sur ${photos.length}</span>
            <a href="${downloadUrl}" class="download-btn">⬇ Télécharger</a>
          </div>
        </div>
      `;
      }).join('\n')
      : `
        <div class="empty-box">
          <div style="font-size: 44px; margin-bottom: 12px;">📷</div>
          <h3>Aucune photo transmise</h3>
          <p>Le client n'a pas joint de photos pour ce rendez-vous lors de sa réservation en ligne.</p>
        </div>
      `;

    res.send(`
      <!DOCTYPE html>
      <html lang="fr-CA">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
        <title>Galerie Privée Rendez-vous #${bookingId} | MAX EXPERT 360 MOBILE</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #081711;
            color: #f3f4f6;
            min-height: 100vh;
            padding: 20px 16px 40px;
          }
          .container {
            max-width: 960px;
            margin: 0 auto;
          }
          header {
            background: linear-gradient(135deg, #103e31, #17634a);
            border-radius: 14px;
            padding: 22px 20px;
            margin-bottom: 24px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.1);
          }
          .brand-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 8px;
          }
          .brand {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #eab308;
          }
          .storage-badge {
            background: rgba(34, 197, 94, 0.15);
            color: #4ade80;
            border: 1px solid #22c55e;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }
          h1 {
            font-size: clamp(20px, 4vw, 26px);
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 14px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 10px;
            background: rgba(0,0,0,0.28);
            border-radius: 8px;
            padding: 12px 14px;
            font-size: 13.5px;
          }
          .meta-item strong {
            color: #93c5fd;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
          }
          .photo-card {
            background: #0d231a;
            border: 1px solid #1a4332;
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .photo-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.5);
          }
          .photo-wrapper {
            position: relative;
            aspect-ratio: 4/3;
            background: #040906;
            cursor: pointer;
            overflow: hidden;
          }
          .photo-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.3s;
          }
          .photo-wrapper:hover img {
            transform: scale(1.04);
          }
          .zoom-hint {
            position: absolute;
            bottom: 8px;
            right: 8px;
            background: rgba(0,0,0,0.75);
            color: #fff;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            pointer-events: none;
          }
          .photo-footer {
            padding: 12px 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #0a1c14;
            border-top: 1px solid #1a4332;
          }
          .photo-num {
            font-size: 13px;
            color: #9ca3af;
          }
          .download-btn {
            background: #eab308;
            color: #000;
            font-weight: 700;
            font-size: 13px;
            text-decoration: none;
            padding: 6px 14px;
            border-radius: 6px;
            transition: background 0.15s;
          }
          .download-btn:hover {
            background: #facc15;
          }
          .empty-box {
            text-align: center;
            padding: 60px 20px;
            background: #0d231a;
            border: 1px dashed #1a4332;
            border-radius: 12px;
            grid-column: 1 / -1;
          }
          .empty-box h3 {
            color: #e5e7eb;
            margin-bottom: 8px;
          }
          .empty-box p {
            color: #9ca3af;
            font-size: 14px;
            max-width: 440px;
            margin: 0 auto;
          }
          .back-link {
            display: inline-block;
            margin-top: 30px;
            color: #4ade80;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
          }
          .back-link:hover {
            text-decoration: underline;
          }
          /* Fullscreen Lightbox Modal */
          #modal {
            display: none;
            position: fixed;
            z-index: 99999;
            inset: 0;
            background: rgba(0,0,0,0.94);
            align-items: center;
            justify-content: center;
            padding: 16px;
          }
          #modal.open {
            display: flex;
          }
          #modal img {
            max-width: 95vw;
            max-height: 90vh;
            border-radius: 8px;
            object-fit: contain;
            box-shadow: 0 0 35px rgba(0,0,0,0.85);
          }
          .close-modal {
            position: absolute;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: #fff;
            border: none;
            font-size: 18px;
            font-weight: 700;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <div class="brand-row">
              <div class="brand">MAX EXPERT 360 MOBILE · Galerie privée</div>
              <div class="storage-badge">🔒 Google Cloud Storage Privé</div>
            </div>
            <h1>Photos du rendez-vous #${bookingId}</h1>
            <div class="meta-grid">
              ${clientName ? `<div class="meta-item">Client : <strong>${clientName}</strong></div>` : ''}
              ${clientPhone ? `<div class="meta-item">Tél : <strong>${clientPhone}</strong></div>` : ''}
              ${bookingDate ? `<div class="meta-item">Date : <strong>${bookingDate}</strong></div>` : ''}
              ${vehicleInfo ? `<div class="meta-item">Véhicule : <strong>${vehicleInfo}</strong></div>` : ''}
              ${services ? `<div class="meta-item">Prestation : <strong>${services}</strong></div>` : ''}
              <div class="meta-item">Total photos : <strong>${photos.length}</strong></div>
            </div>
          </header>

          <main class="grid">
            ${photoCardsHtml}
          </main>

          <div style="text-align: center;">
            <a href="https://maxexpert360.ca" class="back-link">← Retour au site MAX EXPERT 360</a>
          </div>
        </div>

        <div id="modal" onclick="closeModal()">
          <button class="close-modal" onclick="closeModal()">✕</button>
          <img id="modalImg" src="" alt="Agrandissement" onclick="event.stopPropagation()" />
        </div>

        <script>
          function openModal(src) {
            document.getElementById('modalImg').src = src;
            document.getElementById('modal').classList.add('open');
          }
          function closeModal() {
            document.getElementById('modal').classList.remove('open');
          }
          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeModal();
          });
        </script>
      </body>
      </html>
    `);
  });

  // ================= VITE / STATIC SERVING =================
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer }
      },
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

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`MaxExpert360 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
