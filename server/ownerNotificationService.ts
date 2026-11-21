import fs from 'fs';
import path from 'path';
import { cloudStorageService } from './cloudStorage';

export interface OwnerBookingNotificationParams {
  bookingId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceAddress: string;
  preferredDate: string; // YYYY-MM-DD
  preferredTimeSlot: string; // e.g. "16:30"
  vehicleMakeModel?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleCategory?: string;
  packageName?: string;
  extraServicesDetails?: string[];
  servicesSummary: string;
  totalPrice?: number;
  durationLabel?: string;
  photoCount?: number;
}

export class OwnerNotificationService {
  private notifiedBookingIds: Set<string> = new Set();
  private storageFilePath: string;
  private twilioSenderNumber = '+18737001034';
  private defaultOwnerNumber = '+18736575102';

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.warn('[OwnerNotification] Could not create data dir:', err);
      }
    }
    this.storageFilePath = path.join(dataDir, 'owner_notifications.json');
    this.loadHistoryFromDisk();
  }

  private loadHistoryFromDisk(): void {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const raw = fs.readFileSync(this.storageFilePath, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (const item of list) {
            if (item && item.bookingId) {
              this.notifiedBookingIds.add(item.bookingId);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[OwnerNotification] Could not read notification history:', err);
    }
  }

  private recordSentNotification(bookingId: string, sid?: string): void {
    this.notifiedBookingIds.add(bookingId);
    try {
      let list: Array<{ bookingId: string; sentAt: string; sid?: string }> = [];
      if (fs.existsSync(this.storageFilePath)) {
        try {
          const raw = fs.readFileSync(this.storageFilePath, 'utf-8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) list = parsed;
        } catch {
          list = [];
        }
      }
      list.push({
        bookingId,
        sentAt: new Date().toISOString(),
        sid
      });
      fs.writeFileSync(this.storageFilePath, JSON.stringify(list, null, 2), {
        encoding: 'utf-8',
        mode: 0o600
      });
    } catch (err) {
      console.warn('[OwnerNotification] Could not persist notification history:', err);
    }
  }

  private formatFrenchDate(dateStr: string): string {
    try {
      const clean = (dateStr || '').trim().split('T')[0];
      const [year, month, day] = clean.split('-').map(Number);
      const months = [
        'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
      ];
      if (day && month && months[month - 1]) {
        return `${day} ${months[month - 1]}`;
      }
    } catch {
      // fallback
    }
    return dateStr;
  }

  private maskPhone(phone: string): string {
    if (!phone || phone.length < 7) return '***';
    return `${phone.substring(0, 4)}***${phone.substring(phone.length - 2)}`;
  }

  /**
   * Sends owner SMS notification via Twilio AFTER a Square booking is confirmed
   * Guaranteed duplicate prevention: one bookingId = one SMS
   * If notification fails, error is logged and suppressed so Square booking is never disrupted.
   */
  public async notifyOwnerOfNewBooking(params: OwnerBookingNotificationParams): Promise<{
    sent: boolean;
    reason?: string;
    sid?: string;
  }> {
    const {
      bookingId,
      clientName,
      clientPhone,
      serviceAddress,
      preferredDate,
      preferredTimeSlot,
      vehicleMakeModel,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleCategory,
      packageName,
      extraServicesDetails = [],
      servicesSummary,
      totalPrice,
      durationLabel,
      photoCount = 0
    } = params;

    // 1. Strict deduplication check
    if (this.notifiedBookingIds.has(bookingId)) {
      console.log(`[OwnerNotification] Duplicate suppressed for booking ID: ${bookingId}`);
      return { sent: false, reason: 'Already notified' };
    }

    // 2. Resolve Twilio configuration
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    if (!accountSid || !authToken) {
      console.warn('[OwnerNotification] Twilio credentials missing in environment.');
      return { sent: false, reason: 'Twilio not configured' };
    }

    const fromNumber = process.env.TWILIO_PHONE_NUMBER?.trim() || this.twilioSenderNumber;
    const toOwnerNumber = process.env.OWNER_PHONE_NUMBER?.trim() || process.env.OWNER_NOTIFICATION_PHONE?.trim() || this.defaultOwnerNumber;

    // 3. Compose message body adhering to strict Quebec French standards
    const formattedDate = this.formatFrenchDate(preferredDate);
    const timeDisplay = preferredTimeSlot.includes('h') ? preferredTimeSlot : preferredTimeSlot.replace(':', 'h');

    const lines: string[] = [
      'NOUVEAU RENDEZ-VOUS MAXEXPERT360',
      `Client : ${clientName || 'Client'}`,
      `Téléphone : ${clientPhone || 'Non spécifié'}`,
      `Adresse : ${serviceAddress || 'Drummondville'}`
    ];

    if (vehicleCategory || vehicleMake || vehicleModel || vehicleYear || vehicleMakeModel) {
      const catDisplay = vehicleCategory === 'suv' ? 'VUS / SUV' : vehicleCategory === 'truck_van' ? 'Camionnette / Van' : vehicleCategory === 'auto' ? 'Auto / Berline' : (vehicleCategory || '');
      if (catDisplay) lines.push(`Véhicule : ${catDisplay}`);
      if (vehicleMake) lines.push(`Marque : ${vehicleMake}`);
      if (vehicleModel) lines.push(`Modèle : ${vehicleModel}`);
      if (vehicleYear) lines.push(`Année : ${vehicleYear}`);
      if (!vehicleMake && !vehicleModel && vehicleMakeModel) {
        lines.push(`Détails véhicule : ${vehicleMakeModel}`);
      }
    }

    if (packageName) {
      lines.push(`Forfait : ${packageName}`);
    } else {
      lines.push(`Service : ${servicesSummary || 'Nettoyage professionnel'}`);
    }

    if (extraServicesDetails.length > 0) {
      lines.push(`Prestations supplémentaires :`);
      extraServicesDetails.forEach(detail => lines.push(`• ${detail}`));
    }

    if (typeof totalPrice === 'number' && !isNaN(totalPrice)) {
      lines.push(`Prix total CAD : ${totalPrice} $ CAD`);
    }

    if (durationLabel) {
      lines.push(`Durée : ${durationLabel}`);
    }

    lines.push(`Date : ${formattedDate}`);
    lines.push(`Heure : ${timeDisplay}`);
    lines.push(`Square Booking ID : ${bookingId}`);

    if (photoCount > 0) {
      const galleryToken = cloudStorageService.generateAccessToken(bookingId);
      lines.push(`Photos : ${photoCount}`);
      lines.push(`Galerie photos sécurisée :`);
      lines.push(`https://maxexpert360.ca/photos/${bookingId}?token=${galleryToken}`);
    } else {
      lines.push(`Photos : aucune`);
    }

    const messageBody = lines.join('\n');

    // 4. Dispatch SMS via Twilio Messages API
    try {
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const bodyParams = new URLSearchParams();
      bodyParams.append('From', fromNumber);
      bodyParams.append('To', toOwnerNumber);
      bodyParams.append('Body', messageBody);

      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams.toString()
      });

      const data: any = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(
          `[OwnerNotification] Failed to send SMS via Twilio (HTTP ${response.status}): Code=${data.code || 'N/A'}, Msg=${data.message || 'N/A'}`
        );
        return { sent: false, reason: data.message || `HTTP ${response.status}` };
      }

      console.log(
        `[OwnerNotification SUCCESS] Sent owner SMS alert to ${this.maskPhone(toOwnerNumber)} for booking ${bookingId} (Twilio SID: ${data.sid})`
      );

      this.recordSentNotification(bookingId, data.sid);
      return { sent: true, sid: data.sid };
    } catch (err: any) {
      console.error('[OwnerNotification] Unexpected error dispatching SMS:', err.message);
      return { sent: false, reason: err.message };
    }
  }
}

export const ownerNotificationService = new OwnerNotificationService();
