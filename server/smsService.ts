export interface SmsSendResult {
  success: boolean;
  message: string;
  maskedPhone: string;
  normalizedPhone: string;
  cooldownSeconds: number;
  isResend?: boolean;
}

export interface SmsVerifyResult {
  success: boolean;
  error?: string;
  normalizedPhone: string;
}

export class SmsVerificationService {
  private verifiedSessions: Map<string, { verifiedAt: number; expiresAt: number }> = new Map();
  private lastSentAtPerPhone: Map<string, number> = new Map(); // e164 -> timestamp
  private rateLimitWindows: Map<string, number[]> = new Map(); // e164 -> timestamps

  /**
   * Reads and inspects Twilio environment variables for Twilio Verify:
   * - TWILIO_ACCOUNT_SID
   * - TWILIO_AUTH_TOKEN
   * - TWILIO_VERIFY_SERVICE_SID
   */
  public getTwilioConfig(): {
    configured: boolean;
    accountSid: string;
    authToken: string;
    verifyServiceSid: string;
    missingVars: string[];
  } {
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim() || '';
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim() || '';
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim() || '';

    const missingVars: string[] = [];
    if (!accountSid) missingVars.push('TWILIO_ACCOUNT_SID');
    if (!authToken) missingVars.push('TWILIO_AUTH_TOKEN');
    if (!verifyServiceSid) missingVars.push('TWILIO_VERIFY_SERVICE_SID');

    if (!accountSid || !authToken || !verifyServiceSid) {
      return {
        configured: false,
        accountSid: '',
        authToken: '',
        verifyServiceSid: '',
        missingVars
      };
    }

    return {
      configured: true,
      accountSid,
      authToken,
      verifyServiceSid,
      missingVars: []
    };
  }

  /**
   * Normalizes and validates Canadian phone numbers to standard E.164 format (+18195551234)
   */
  public normalizeCanadianPhone(rawPhone: string): {
    valid: boolean;
    e164: string;
    masked: string;
    error?: string;
  } {
    if (!rawPhone || typeof rawPhone !== 'string') {
      return { valid: false, e164: '', masked: '', error: 'Veuillez entrer un numéro de téléphone canadien valide.' };
    }

    // Strip everything except digits
    const digits = rawPhone.replace(/\D/g, '');

    let tenDigits = '';
    if (digits.length === 10) {
      tenDigits = digits;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      tenDigits = digits.substring(1);
    } else {
      console.warn(`[Phone Normalization Error] Invalid length (${digits.length} digits) from input: "${rawPhone}"`);
      return { valid: false, e164: '', masked: '', error: 'Veuillez entrer un numéro de téléphone canadien valide à 10 chiffres (ex: 819 555-1234).' };
    }

    // Validate standard North American Numbering Plan (NANP) rules:
    // Area code (NXX): N = 2-9, X = 0-9
    // Exchange code (NXX): N = 2-9, X = 0-9
    const areaFirstDigit = parseInt(tenDigits.charAt(0), 10);
    const exchangeFirstDigit = parseInt(tenDigits.charAt(3), 10);

    if (areaFirstDigit < 2 || exchangeFirstDigit < 2) {
      console.warn(`[Phone Normalization Error] Invalid NANP area/exchange code in: "${tenDigits}"`);
      return { valid: false, e164: '', masked: '', error: 'Veuillez entrer un numéro de téléphone canadien valide.' };
    }

    const e164 = `+1${tenDigits}`;
    const last4 = tenDigits.substring(6);
    // Masked format for secure UI display: +1 (***) ***-1234
    const masked = `+1 (***) ***-${last4}`;

    console.log(`[Phone Normalization] Input: "${rawPhone}" -> E.164: "${e164}", Masked: "${masked}"`);

    return {
      valid: true,
      e164,
      masked
    };
  }

  /**
   * Starts an SMS verification via Twilio Verify API (v2) with channel="sms"
   */
  public async sendVerificationCode(rawPhone: string, isResend = false): Promise<SmsSendResult> {
    const { valid, e164, masked, error } = this.normalizeCanadianPhone(rawPhone);
    if (!valid || !e164) {
      throw new Error(error || 'Veuillez entrer un numéro de téléphone canadien valide.');
    }

    const now = Date.now();

    // Check 60-second cooldown per phone
    const lastSent = this.lastSentAtPerPhone.get(e164) || 0;
    const elapsed = Math.floor((now - lastSent) / 1000);
    const remainingCooldown = 60 - elapsed;
    if (lastSent > 0 && remainingCooldown > 0) {
      console.warn(`[SMS Cooldown] Blocked repeated request for ${e164}. ${remainingCooldown}s remaining.`);
      throw new Error(`Trop de tentatives. Veuillez attendre ${remainingCooldown} secondes avant de renvoyer un code.`);
    }

    // Check sliding window rate limit: max 5 requests per 15 minutes
    const timestamps = this.rateLimitWindows.get(e164) || [];
    const recentTimestamps = timestamps.filter(t => now - t < 15 * 60 * 1000);
    if (recentTimestamps.length >= 5) {
      console.warn(`[SMS Rate Limit] Max 5 requests/15min exceeded for ${e164}`);
      throw new Error('Trop de tentatives d’envoi de SMS. Veuillez attendre quelques minutes avant de réessayer.');
    }

    const twilio = this.getTwilioConfig();
    if (!twilio.configured) {
      console.error(`[Twilio Verify] Unconfigured service. Missing environment variables: ${twilio.missingVars.join(', ')}`);
      throw new Error(`Le service de vérification SMS n'est pas encore configuré sur le serveur (Variables manquantes : ${twilio.missingVars.join(', ')}).`);
    }

    try {
      console.log(`[Twilio Verify] Initiating SMS verification for ${masked} via Service ${twilio.verifyServiceSid} (channel=sms)...`);
      const endpoint = `https://verify.twilio.com/v2/Services/${encodeURIComponent(twilio.verifyServiceSid)}/Verifications`;
      const basicAuth = Buffer.from(`${twilio.accountSid}:${twilio.authToken}`).toString('base64');

      const bodyParams = new URLSearchParams();
      bodyParams.append('To', e164);
      bodyParams.append('Channel', 'sms');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams.toString()
      });

      const responseData: any = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(`[Twilio Verify] Verification dispatch failed (HTTP ${response.status}): Code=${responseData.code || 'N/A'}, Message=${responseData.message || 'N/A'}`);

        if (response.status === 429 || responseData.code === 20429 || responseData.code === 60200 || responseData.code === 60203) {
          throw new Error('Trop de tentatives. Veuillez attendre quelques minutes avant de réessayer.');
        } else if (responseData.code === 21211 || responseData.code === 21614 || responseData.code === 60202) {
          throw new Error('Veuillez entrer un numéro de téléphone canadien valide.');
        } else {
          throw new Error(responseData.message || 'Impossible d’envoyer le code pour le moment. Veuillez réessayer.');
        }
      }

      console.log(`[Twilio Verify] Verification code dispatched to ${masked} (Status: ${responseData.status}, SID: ${responseData.sid})`);
    } catch (err: any) {
      if (
        err.message.includes('Trop de tentatives') ||
        err.message.includes('numéro de téléphone canadien valide')
      ) {
        throw err;
      }
      console.error('[Twilio Verify] Error dispatching SMS:', err.message);
      throw new Error(err.message || 'Impossible d’envoyer le code pour le moment. Veuillez réessayer.');
    }

    // Update timestamps on success
    this.lastSentAtPerPhone.set(e164, now);
    recentTimestamps.push(now);
    this.rateLimitWindows.set(e164, recentTimestamps);

    return {
      success: true,
      message: isResend ? 'Un nouveau code a été envoyé.' : `Code envoyé au ${masked}`,
      maskedPhone: masked,
      normalizedPhone: e164,
      cooldownSeconds: 60,
      isResend
    };
  }

  /**
   * Verifies the OTP code submitted by customer using Twilio Verify API (status === "approved")
   */
  public async verifyCode(rawPhone: string, inputCode: string): Promise<SmsVerifyResult> {
    const { valid, e164, error } = this.normalizeCanadianPhone(rawPhone);
    if (!valid || !e164) {
      return {
        success: false,
        error: error || 'Veuillez entrer un numéro de téléphone canadien valide.',
        normalizedPhone: ''
      };
    }

    const cleanCode = (inputCode || '').trim();
    if (!cleanCode || cleanCode.length < 4) {
      return {
        success: false,
        error: 'Le code de vérification doit comporter 6 chiffres.',
        normalizedPhone: e164
      };
    }

    const twilio = this.getTwilioConfig();
    if (!twilio.configured) {
      return {
        success: false,
        error: `Le service de vérification SMS n'est pas encore configuré sur le serveur (Variables manquantes : ${twilio.missingVars.join(', ')}).`,
        normalizedPhone: e164
      };
    }

    try {
      console.log(`[Twilio Verify] Checking code for ${e164} via Service ${twilio.verifyServiceSid}...`);
      const endpoint = `https://verify.twilio.com/v2/Services/${encodeURIComponent(twilio.verifyServiceSid)}/VerificationCheck`;
      const basicAuth = Buffer.from(`${twilio.accountSid}:${twilio.authToken}`).toString('base64');

      const bodyParams = new URLSearchParams();
      bodyParams.append('To', e164);
      bodyParams.append('Code', cleanCode);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams.toString()
      });

      const responseData: any = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(`[Twilio Verify] VerificationCheck failed (HTTP ${response.status}): Code=${responseData.code || 'N/A'}, Message=${responseData.message || 'N/A'}`);

        if (response.status === 404 || responseData.code === 20404 || responseData.code === 60200) {
          return {
            success: false,
            error: 'Ce code a expiré. Veuillez demander un nouveau code.',
            normalizedPhone: e164
          };
        } else if (response.status === 429 || responseData.code === 60203 || responseData.code === 20429) {
          return {
            success: false,
            error: 'Trop de tentatives. Veuillez attendre quelques minutes avant de réessayer.',
            normalizedPhone: e164
          };
        } else {
          return {
            success: false,
            error: 'Le code de vérification est incorrect.',
            normalizedPhone: e164
          };
        }
      }

      // Strict approval check: status must be "approved"
      if (responseData.status === 'approved') {
        this.verifiedSessions.set(e164, {
          verifiedAt: Date.now(),
          expiresAt: Date.now() + 60 * 60 * 1000 // 1-hour verified session
        });

        console.log(`[Twilio Verify] Phone successfully verified with status 'approved': ${e164} (SID: ${responseData.sid})`);
        return {
          success: true,
          normalizedPhone: e164
        };
      } else {
        console.warn(`[Twilio Verify] Code not approved for ${e164} (Status: ${responseData.status})`);
        return {
          success: false,
          error: 'Le code de vérification est incorrect.',
          normalizedPhone: e164
        };
      }
    } catch (err: any) {
      console.error('[Twilio Verify] VerificationCheck error:', err.message);
      return {
        success: false,
        error: 'Impossible de vérifier le code pour le moment. Veuillez réessayer.',
        normalizedPhone: e164
      };
    }
  }

  /**
   * Checks if phone has an active verified session
   */
  public isPhoneVerified(rawPhone: string): boolean {
    const { valid, e164 } = this.normalizeCanadianPhone(rawPhone);
    if (!valid || !e164) return false;
    const session = this.verifiedSessions.get(e164);
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
      this.verifiedSessions.delete(e164);
      return false;
    }
    return true;
  }
}

export const smsService = new SmsVerificationService();
