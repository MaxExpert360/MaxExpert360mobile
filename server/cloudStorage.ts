import { Storage, Bucket } from '@google-cloud/storage';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import type { Response } from 'express';

export interface StoredPhotoInfo {
  photoKey: string;
  originalName?: string;
  contentType: string;
  sizeBytes?: number;
  uploadedAt: string;
  storageType: 'gcs' | 'local';
}

class CloudStorageService {
  private storage: Storage | null = null;
  private bucket: Bucket | null = null;
  private bucketName: string;
  private isInitialized = false;
  private gcsAvailable = false;
  private localUploadsDir: string;
  private localDataDir: string;

  constructor() {
    this.bucketName = (
      process.env.GCS_BUCKET_NAME ||
      process.env.GOOGLE_CLOUD_STORAGE_BUCKET ||
      'maxexpert360-booking-photos'
    ).trim();

    this.localUploadsDir = path.join(process.cwd(), 'uploads');
    this.localDataDir = path.join(process.cwd(), 'data');

    // Ensure fallback local folders exist
    try {
      if (!fs.existsSync(this.localUploadsDir)) {
        fs.mkdirSync(this.localUploadsDir, { recursive: true });
      }
      if (!fs.existsSync(this.localDataDir)) {
        fs.mkdirSync(this.localDataDir, { recursive: true });
      }
    } catch (e) {
      console.warn('[CloudStorage] Error initializing local fallback dirs:', e);
    }
  }

  /**
   * Initializes Google Cloud Storage client with Application Default Credentials (ADC).
   * In Google Cloud Run, ADC is automatically provided by the container service account.
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const options: any = {};
      if (process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT) {
        options.projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
      }

      this.storage = new Storage(options);
      this.bucket = this.storage.bucket(this.bucketName);

      // Verify bucket exists and is accessible
      const [exists] = await this.bucket.exists();
      if (exists) {
        this.gcsAvailable = true;
        console.log(`[CloudStorage] Connected to persistent private GCS bucket: "${this.bucketName}"`);
      } else {
        console.warn(
          `[CloudStorage] Bucket "${this.bucketName}" does not exist yet. Attempting auto-creation...`
        );
        try {
          await this.bucket.create({
            location: process.env.GCS_REGION || 'northamerica-northeast1', // Montreal / Quebec region
            standard: true
          });
          this.gcsAvailable = true;
          console.log(`[CloudStorage] Successfully created private GCS bucket: "${this.bucketName}"`);
        } catch (createErr: any) {
          console.warn(
            `[CloudStorage] Auto-create bucket failed (${createErr.message}). Operating with local fallback while bucket is provisioned.`
          );
          this.gcsAvailable = false;
        }
      }
    } catch (err: any) {
      console.warn(
        `[CloudStorage] GCS initialization note: ADC not active in current environment (${err.message}). Using local persistent disk fallback.`
      );
      this.gcsAvailable = false;
    } finally {
      this.isInitialized = true;
    }
  }

  public isAvailable(): boolean {
    return this.gcsAvailable && this.bucket !== null;
  }

  public getBucketName(): string {
    return this.bucketName;
  }

  /**
   * Generates a tamper-proof HMAC-SHA256 gallery access token tied to the Square booking ID.
   */
  public generateAccessToken(bookingId: string): string {
    const secret =
      process.env.GALLERY_SECRET_KEY ||
      process.env.TWILIO_AUTH_TOKEN ||
      process.env.ADMIN_SECRET_KEY ||
      'maxexpert360-secure-gcs-gallery-token-2025';
    return crypto.createHmac('sha256', secret).update(bookingId.trim()).digest('hex');
  }

  /**
   * Validates that the provided token matches the required HMAC signature for the booking ID.
   */
  public verifyAccessToken(bookingId: string, token: string | undefined | null): boolean {
    if (!token || typeof token !== 'string') return false;

    // Allow owner admin key bypass
    const adminKey = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_KEY;
    if (adminKey && token.trim() === adminKey.trim()) return true;

    const expected = this.generateAccessToken(bookingId);
    if (token.length !== expected.length) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  /**
   * Uploads a client booking photo to persistent private GCS (or local fallback).
   * Object path format: bookings/${bookingId}/${photoFileName}
   */
  public async uploadPhoto(
    bookingId: string,
    bufferOrBase64: Buffer | string,
    mimeType = 'image/jpeg',
    customFileName?: string
  ): Promise<{ photoKey: string; storageType: 'gcs' | 'local' }> {
    await this.init();

    let buffer: Buffer;
    let actualMime = mimeType;

    if (typeof bufferOrBase64 === 'string') {
      const match = bufferOrBase64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        const rawExt = match[1].toLowerCase();
        actualMime = `image/${rawExt === 'jpg' ? 'jpeg' : rawExt}`;
        buffer = Buffer.from(match[2], 'base64');
      } else {
        buffer = Buffer.from(bufferOrBase64, 'base64');
      }
    } else {
      buffer = bufferOrBase64;
    }

    const ext = actualMime.includes('png')
      ? 'png'
      : actualMime.includes('webp')
      ? 'webp'
      : 'jpg';

    const safeBookingId = (bookingId || 'unassigned').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName =
      customFileName ||
      `photo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const gcsObjectPath = `bookings/${safeBookingId}/${fileName}`;

    if (this.isAvailable() && this.bucket) {
      try {
        const file = this.bucket.file(gcsObjectPath);
        await file.save(buffer, {
          metadata: {
            contentType: actualMime,
            metadata: {
              bookingId: safeBookingId,
              uploadedAt: new Date().toISOString(),
              access: 'private'
            }
          },
          resumable: false
        });

        console.log(
          `[CloudStorage] Saved photo to private GCS: gs://${this.bucketName}/${gcsObjectPath}`
        );
        return { photoKey: fileName, storageType: 'gcs' };
      } catch (err: any) {
        console.error(
          `[CloudStorage] GCS write error (${err.message}). Falling back to local disk storage.`
        );
      }
    }

    // Local disk fallback
    const bookingDir = path.join(this.localUploadsDir, safeBookingId);
    if (!fs.existsSync(bookingDir)) {
      try {
        fs.mkdirSync(bookingDir, { recursive: true });
      } catch {}
    }
    const localFilePath = path.join(bookingDir, fileName);
    fs.writeFileSync(localFilePath, buffer);

    // Also mirror flat in uploads/ for legacy compatibility
    const flatPath = path.join(this.localUploadsDir, `${safeBookingId}_${fileName}`);
    try {
      fs.writeFileSync(flatPath, buffer);
    } catch {}

    return { photoKey: fileName, storageType: 'local' };
  }

  /**
   * Lists all photo keys stored for a given booking ID.
   */
  public async listBookingPhotos(bookingId: string): Promise<StoredPhotoInfo[]> {
    await this.init();
    const safeBookingId = (bookingId || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const photos: StoredPhotoInfo[] = [];

    // 1. Check GCS bucket
    if (this.isAvailable() && this.bucket) {
      try {
        const prefix = `bookings/${safeBookingId}/`;
        const [files] = await this.bucket.getFiles({ prefix });

        for (const file of files) {
          // Avoid metadata JSON or non-image files in listing
          if (file.name.endsWith('.json') || file.name.endsWith('/')) continue;
          const photoKey = path.basename(file.name);
          const ext = path.extname(photoKey).toLowerCase();
          const contentType =
            ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

          photos.push({
            photoKey,
            contentType,
            sizeBytes: Number(file.metadata.size) || undefined,
            uploadedAt: file.metadata.timeCreated || new Date().toISOString(),
            storageType: 'gcs'
          });
        }

        if (photos.length > 0) {
          return photos;
        }
      } catch (err: any) {
        console.warn(`[CloudStorage] Error listing GCS photos for ${bookingId}:`, err.message);
      }
    }

    // 2. Check local booking subfolder
    const bookingDir = path.join(this.localUploadsDir, safeBookingId);
    if (fs.existsSync(bookingDir)) {
      try {
        const files = fs.readdirSync(bookingDir);
        for (const file of files) {
          if (file.endsWith('.json') || file.startsWith('.')) continue;
          const stat = fs.statSync(path.join(bookingDir, file));
          const ext = path.extname(file).toLowerCase();
          const contentType =
            ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
          photos.push({
            photoKey: file,
            contentType,
            sizeBytes: stat.size,
            uploadedAt: stat.mtime.toISOString(),
            storageType: 'local'
          });
        }
      } catch {}
    }

    // 3. Check legacy flat booking_photos.json index
    const photoMapFile = path.join(this.localDataDir, 'booking_photos.json');
    if (fs.existsSync(photoMapFile)) {
      try {
        const raw = fs.readFileSync(photoMapFile, 'utf-8');
        const map = JSON.parse(raw);
        const legacyUrls = map[bookingId] || [];
        for (const url of legacyUrls) {
          const key = path.basename(url);
          if (!photos.some(p => p.photoKey === key)) {
            photos.push({
              photoKey: key,
              contentType: 'image/jpeg',
              uploadedAt: new Date().toISOString(),
              storageType: 'local'
            });
          }
        }
      } catch {}
    }

    return photos;
  }

  /**
   * Securely streams a private photo to the HTTP response.
   * No public URL is exposed; access is mediated through our backend.
   */
  public async streamPhoto(
    bookingId: string,
    photoKey: string,
    res: Response,
    asDownload = false
  ): Promise<boolean> {
    await this.init();
    const safeBookingId = (bookingId || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeKey = path.basename(photoKey);
    const ext = path.extname(safeKey).toLowerCase();
    const mimeType =
      ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'private, max-age=86400, no-transform');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (asDownload) {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="maxexpert360_${safeBookingId}_${safeKey}"`
      );
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${safeKey}"`);
    }

    // 1. Try streaming from GCS
    if (this.isAvailable() && this.bucket) {
      try {
        const gcsPath = `bookings/${safeBookingId}/${safeKey}`;
        const file = this.bucket.file(gcsPath);
        const [exists] = await file.exists();

        if (exists) {
          const readStream = file.createReadStream();
          readStream.on('error', (streamErr) => {
            console.error('[CloudStorage] Read stream error:', streamErr);
            if (!res.headersSent) res.status(500).end();
          });
          readStream.pipe(res);
          return true;
        }
      } catch (err: any) {
        console.warn(`[CloudStorage] GCS stream error for ${safeKey}:`, err.message);
      }
    }

    // 2. Try streaming from local subfolder
    const localBookingPath = path.join(this.localUploadsDir, safeBookingId, safeKey);
    if (fs.existsSync(localBookingPath)) {
      fs.createReadStream(localBookingPath).pipe(res);
      return true;
    }

    // 3. Try streaming from flat uploads/
    const localFlatPath = path.join(this.localUploadsDir, safeKey);
    if (fs.existsSync(localFlatPath)) {
      fs.createReadStream(localFlatPath).pipe(res);
      return true;
    }

    // 4. Try legacy prefixed file
    const localPrefixedPath = path.join(this.localUploadsDir, `${safeBookingId}_${safeKey}`);
    if (fs.existsSync(localPrefixedPath)) {
      fs.createReadStream(localPrefixedPath).pipe(res);
      return true;
    }

    return false;
  }

  /**
   * Persists booking metadata to private GCS to survive Cloud Run container restarts.
   */
  public async saveBookingMetadata(bookingId: string, metadata: any): Promise<void> {
    await this.init();
    const safeBookingId = (bookingId || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const data = JSON.stringify(metadata, null, 2);

    // Save to GCS if available
    if (this.isAvailable() && this.bucket) {
      try {
        const file = this.bucket.file(`bookings/${safeBookingId}/metadata.json`);
        await file.save(data, {
          metadata: {
            contentType: 'application/json',
            metadata: { bookingId: safeBookingId, savedAt: new Date().toISOString() }
          },
          resumable: false
        });
        console.log(`[CloudStorage] Saved booking metadata to GCS for #${safeBookingId}`);
      } catch (err: any) {
        console.warn(`[CloudStorage] Error saving metadata to GCS:`, err.message);
      }
    }

    // Also persist locally in data/
    try {
      const localMetaDir = path.join(this.localDataDir, 'bookings');
      if (!fs.existsSync(localMetaDir)) {
        fs.mkdirSync(localMetaDir, { recursive: true });
      }
      fs.writeFileSync(path.join(localMetaDir, `${safeBookingId}.json`), data, 'utf-8');
    } catch {}
  }

  /**
   * Retrieves booking metadata from GCS or local backup.
   */
  public async getBookingMetadata(bookingId: string): Promise<any | null> {
    await this.init();
    const safeBookingId = (bookingId || '').replace(/[^a-zA-Z0-9_-]/g, '_');

    // 1. Try GCS
    if (this.isAvailable() && this.bucket) {
      try {
        const file = this.bucket.file(`bookings/${safeBookingId}/metadata.json`);
        const [exists] = await file.exists();
        if (exists) {
          const [content] = await file.download();
          return JSON.parse(content.toString('utf-8'));
        }
      } catch (err: any) {
        console.warn(`[CloudStorage] Error reading metadata from GCS:`, err.message);
      }
    }

    // 2. Try local file
    const localMetaFile = path.join(this.localDataDir, 'bookings', `${safeBookingId}.json`);
    if (fs.existsSync(localMetaFile)) {
      try {
        return JSON.parse(fs.readFileSync(localMetaFile, 'utf-8'));
      } catch {}
    }

    return null;
  }

  /**
   * Synchronizes entire customer database to persistent GCS object.
   */
  public async backupCustomersToStorage(customers: any[]): Promise<void> {
    await this.init();
    if (!this.isAvailable() || !this.bucket) return;

    try {
      const file = this.bucket.file('database/customers.json');
      await file.save(JSON.stringify(customers, null, 2), {
        metadata: {
          contentType: 'application/json',
          metadata: { updatedAt: new Date().toISOString() }
        },
        resumable: false
      });
      console.log(`[CloudStorage] Backed up ${customers.length} customers to persistent GCS.`);
    } catch (err: any) {
      console.warn(`[CloudStorage] Error backing up customers to GCS:`, err.message);
    }
  }

  /**
   * Restores customer database from persistent GCS if local disk is empty (e.g. after fresh deploy).
   */
  public async restoreCustomersFromStorage(): Promise<any[] | null> {
    await this.init();
    if (!this.isAvailable() || !this.bucket) return null;

    try {
      const file = this.bucket.file('database/customers.json');
      const [exists] = await file.exists();
      if (exists) {
        const [content] = await file.download();
        const list = JSON.parse(content.toString('utf-8'));
        if (Array.isArray(list)) {
          console.log(`[CloudStorage] Restored ${list.length} customers from persistent GCS.`);
          return list;
        }
      }
    } catch (err: any) {
      console.warn(`[CloudStorage] Error restoring customers from GCS:`, err.message);
    }
    return null;
  }
}

export const cloudStorageService = new CloudStorageService();
