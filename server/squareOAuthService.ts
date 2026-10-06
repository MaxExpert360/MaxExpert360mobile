import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface SquareOAuthTokenRecord {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresAt?: string;
  merchantId?: string;
  receivedAt: string;
  scopes?: string[];
}

export interface OAuthStateEntry {
  state: string;
  createdAt: number;
  expiresAt: number;
}

const REDIRECT_URI = 'https://maxexpert360mobile-backend-928037073642.northamerica-northeast1.run.app/api/square/oauth/callback';
const SQUARE_OAUTH_TOKEN_URL = 'https://connect.squareup.com/oauth2/token';
const SQUARE_OAUTH_AUTHORIZE_URL = 'https://connect.squareup.com/oauth2/authorize';

// Scopes required for buyer-level Square Bookings on Free tier:
// Specifically includes APPOINTMENTS_WRITE (buyer level), NOT APPOINTMENTS_ALL_WRITE (seller-level)
const DEFAULT_BUYER_SCOPES = [
  'APPOINTMENTS_WRITE',
  'CUSTOMERS_READ',
  'CUSTOMERS_WRITE',
  'ITEMS_READ',
  'MERCHANT_PROFILE_READ'
];

export class SquareOAuthService {
  private tokenFilePath: string;
  private stateFilePath: string;
  private activeStates: Map<string, OAuthStateEntry> = new Map();
  private cachedToken: SquareOAuthTokenRecord | null = null;

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.warn('[Square OAuth] Could not create data directory:', err);
      }
    }
    this.tokenFilePath = path.join(dataDir, 'square_oauth_buyer_token.json');
    this.stateFilePath = path.join(dataDir, 'square_oauth_states.json');
    this.loadTokenFromDisk();
    this.loadStatesFromDisk();
  }

  public get redirectUri(): string {
    return REDIRECT_URI;
  }

  public get applicationId(): string | undefined {
    return process.env.SQUARE_APPLICATION_ID?.trim();
  }

  public get hasApplicationSecret(): boolean {
    const secret = process.env.SQUARE_APPLICATION_SECRET?.trim();
    return Boolean(secret && secret.length > 5);
  }

  /**
   * Generates a cryptographically secure CSRF state token valid for 30 minutes
   */
  public generateState(): string {
    this.cleanupExpiredStates();
    const state = crypto.randomBytes(24).toString('hex');
    const now = Date.now();
    const entry: OAuthStateEntry = {
      state,
      createdAt: now,
      expiresAt: now + 30 * 60 * 1000 // 30 minutes
    };
    this.activeStates.set(state, entry);
    this.saveStatesToDisk();
    return state;
  }

  /**
   * Validates and consumes the CSRF state token (one-time use)
   */
  public validateAndConsumeState(state: string): boolean {
    if (!state || typeof state !== 'string') return false;
    this.cleanupExpiredStates();
    const entry = this.activeStates.get(state);
    if (!entry) {
      return false;
    }
    if (Date.now() > entry.expiresAt) {
      this.activeStates.delete(state);
      this.saveStatesToDisk();
      return false;
    }
    // One-time use: consume the state
    this.activeStates.delete(state);
    this.saveStatesToDisk();
    return true;
  }

  /**
   * Builds the official Square OAuth authorization URL
   */
  public getAuthorizationUrl(state?: string): { url: string; state: string; error?: string } {
    const appId = this.applicationId;
    if (!appId) {
      return {
        url: '',
        state: '',
        error: 'SQUARE_APPLICATION_ID is not configured in environment variables.'
      };
    }

    const stateToken = state || this.generateState();
    const scopesParam = DEFAULT_BUYER_SCOPES.join('+');

    const params = new URLSearchParams({
      client_id: appId,
      response_type: 'code',
      scope: DEFAULT_BUYER_SCOPES.join(' '),
      state: stateToken,
      session: 'false'
    });

    // Square requires space-separated or plus-separated scopes
    const url = `${SQUARE_OAUTH_AUTHORIZE_URL}?${params.toString()}`;

    return {
      url,
      state: stateToken
    };
  }

  /**
   * Exchanges an authorization code for buyer-level OAuth tokens
   * Note: NEVER prints tokens or secrets in logs.
   */
  public async exchangeCodeForTokens(code: string): Promise<{
    success: boolean;
    merchantId?: string;
    tokenType?: string;
    expiresAt?: string;
    error?: string;
  }> {
    const appId = this.applicationId;
    const appSecret = process.env.SQUARE_APPLICATION_SECRET?.trim();

    if (!appId) {
      return {
        success: false,
        error: 'Missing SQUARE_APPLICATION_ID environment variable on server.'
      };
    }

    if (!appSecret) {
      return {
        success: false,
        error: 'Missing SQUARE_APPLICATION_SECRET environment variable on server.'
      };
    }

    if (!code || typeof code !== 'string') {
      return {
        success: false,
        error: 'Missing or invalid authorization code from Square.'
      };
    }

    try {
      console.log('[Square OAuth] Exchanging authorization code with Square token endpoint...');

      const response = await fetch(SQUARE_OAUTH_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Square-Version': '2024-12-18'
        },
        body: JSON.stringify({
          client_id: appId,
          client_secret: appSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[Square OAuth] Token exchange error:', data.error || response.statusText);
        return {
          success: false,
          error: data.error_description || data.error || `Square OAuth error (HTTP ${response.status})`
        };
      }

      const {
        access_token,
        refresh_token,
        token_type,
        expires_at,
        merchant_id
      } = data;

      if (!access_token) {
        return {
          success: false,
          error: 'Square did not return an access_token in response.'
        };
      }

      // Store securely in dedicated server storage without overwriting process.env.SQUARE_ACCESS_TOKEN
      const tokenRecord: SquareOAuthTokenRecord = {
        accessToken: access_token,
        refreshToken: refresh_token || undefined,
        tokenType: token_type || 'bearer',
        expiresAt: expires_at || undefined,
        merchantId: merchant_id || undefined,
        receivedAt: new Date().toISOString(),
        scopes: DEFAULT_BUYER_SCOPES
      };

      this.cachedToken = tokenRecord;
      this.saveTokenToDisk(tokenRecord);

      // Safe logging without exposing secret or token
      const maskedToken = `${access_token.substring(0, 6)}...${access_token.substring(access_token.length - 4)}`;
      console.log(`[Square OAuth] Token exchange successful! Merchant ID: ${merchant_id || 'unknown'}, token received: ${maskedToken}. Stored securely on server.`);

      return {
        success: true,
        merchantId: merchant_id,
        tokenType: token_type,
        expiresAt: expires_at
      };
    } catch (err: any) {
      console.error('[Square OAuth] Network exception during token exchange:', err.message);
      return {
        success: false,
        error: `Network error exchanging code with Square: ${err.message}`
      };
    }
  }

  /**
   * Diagnostic inspection of the stored buyer OAuth token
   * Returns metadata only (no secrets/tokens revealed)
   */
  public async inspectStoredBuyerToken(): Promise<{
    hasStoredToken: boolean;
    merchantId?: string;
    tokenType?: string;
    receivedAt?: string;
    expiresAt?: string;
    tokenMasked?: string;
    apiVerification?: {
      connected: boolean;
      merchantBusinessName?: string;
      merchantCountry?: string;
      error?: string;
    };
  }> {
    if (!this.cachedToken || !this.cachedToken.accessToken) {
      return {
        hasStoredToken: false
      };
    }

    const token = this.cachedToken.accessToken;
    const tokenMasked = `${token.substring(0, 6)}...${token.substring(token.length - 4)}`;

    let apiVerification: {
      connected: boolean;
      merchantBusinessName?: string;
      merchantCountry?: string;
      error?: string;
    } = { connected: false };

    try {
      const res = await fetch('https://connect.squareup.com/v2/merchants/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Square-Version': '2024-12-18'
        }
      });
      const data = await res.json();
      if (res.ok && data.merchant) {
        apiVerification = {
          connected: true,
          merchantBusinessName: data.merchant.business_name || data.merchant.main_location_id,
          merchantCountry: data.merchant.country
        };
      } else {
        apiVerification = {
          connected: false,
          error: data.errors?.[0]?.detail || `HTTP ${res.status}`
        };
      }
    } catch (err: any) {
      apiVerification = {
        connected: false,
        error: err.message
      };
    }

    return {
      hasStoredToken: true,
      merchantId: this.cachedToken.merchantId,
      tokenType: this.cachedToken.tokenType,
      receivedAt: this.cachedToken.receivedAt,
      expiresAt: this.cachedToken.expiresAt,
      tokenMasked,
      apiVerification
    };
  }

  public getBuyerOAuthToken(): SquareOAuthTokenRecord | null {
    return this.cachedToken;
  }

  private saveTokenToDisk(token: SquareOAuthTokenRecord): void {
    try {
      fs.writeFileSync(this.tokenFilePath, JSON.stringify(token, null, 2), {
        encoding: 'utf-8',
        mode: 0o600 // Read/write only by file owner
      });
    } catch (err) {
      console.warn('[Square OAuth] Could not write token to disk:', err);
    }
  }

  private loadTokenFromDisk(): void {
    try {
      if (fs.existsSync(this.tokenFilePath)) {
        const raw = fs.readFileSync(this.tokenFilePath, 'utf-8');
        this.cachedToken = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[Square OAuth] Could not read token from disk:', err);
    }
  }

  private saveStatesToDisk(): void {
    try {
      const array = Array.from(this.activeStates.values());
      fs.writeFileSync(this.stateFilePath, JSON.stringify(array, null, 2), {
        encoding: 'utf-8',
        mode: 0o600
      });
    } catch (err) {
      console.warn('[Square OAuth] Could not save states to disk:', err);
    }
  }

  private loadStatesFromDisk(): void {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const raw = fs.readFileSync(this.stateFilePath, 'utf-8');
        const array: OAuthStateEntry[] = JSON.parse(raw);
        const now = Date.now();
        for (const entry of array) {
          if (entry.expiresAt > now) {
            this.activeStates.set(entry.state, entry);
          }
        }
      }
    } catch (err) {
      // Ignore
    }
  }

  private cleanupExpiredStates(): void {
    const now = Date.now();
    for (const [key, entry] of this.activeStates.entries()) {
      if (entry.expiresAt <= now) {
        this.activeStates.delete(key);
      }
    }
  }
}

export const squareOAuthService = new SquareOAuthService();
