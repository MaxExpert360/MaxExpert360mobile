import fs from 'fs';
import path from 'path';
import type { CustomerReview, ReviewStatus } from '../src/types';

const REVIEWS_FILE_PATH = path.join(process.cwd(), 'data', 'user_reviews.json');

// Simple in-memory rate limiting tracker (IP -> timestamps array)
interface RateLimitTracker {
  [ip: string]: number[];
}

export class ReviewsDatabase {
  private reviews: CustomerReview[] = [];
  private ipSubmissions: RateLimitTracker = {};

  constructor() {
    this.ensureDirectory();
    this.loadReviews();
  }

  private ensureDirectory() {
    const dir = path.dirname(REVIEWS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadReviews() {
    try {
      if (fs.existsSync(REVIEWS_FILE_PATH)) {
        const raw = fs.readFileSync(REVIEWS_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Normalize older or legacy structures if any exist
          this.reviews = parsed.map((item: any) => ({
            id: String(item.id || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
            name: String(item.name || '').trim(),
            rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
            comment: String(item.comment || (typeof item.text === 'object' ? item.text.fr || item.text.ua || item.text.en : item.text) || '').trim(),
            service: item.service ? (typeof item.service === 'object' ? item.service.fr || item.service.ua || item.service.en : String(item.service)) : (item.vehicle || ''),
            createdAt: item.createdAt || (item.date ? new Date().toISOString() : new Date().toISOString()),
            status: (['pending', 'approved', 'rejected'].includes(item.status) ? item.status : 'approved') as ReviewStatus
          })).filter(r => r.name && r.comment);
        }
      }
    } catch (err) {
      console.warn('[ReviewsDatabase] Error loading reviews from disk:', err);
      this.reviews = [];
    }
  }

  private saveReviews() {
    try {
      this.ensureDirectory();
      fs.writeFileSync(REVIEWS_FILE_PATH, JSON.stringify(this.reviews, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ReviewsDatabase] Error saving reviews to disk:', err);
    }
  }

  /**
   * Basic string sanitization to prevent XSS / raw HTML injection
   */
  private sanitize(str: string): string {
    return str
      .replace(/<[^>]*>/g, '') // Strip HTML tags
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // Strip control chars
      .trim();
  }

  /**
   * Check rate limit for an IP address (Max 5 submissions per 15 minutes)
   */
  public checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxSubmissions = 5;

    if (!this.ipSubmissions[ip]) {
      this.ipSubmissions[ip] = [];
    }

    // Clean old entries
    this.ipSubmissions[ip] = this.ipSubmissions[ip].filter(ts => now - ts < windowMs);

    if (this.ipSubmissions[ip].length >= maxSubmissions) {
      return false; // Rate limit exceeded
    }

    this.ipSubmissions[ip].push(now);
    return true;
  }

  /**
   * Public approved reviews only.
   * Never exposes pending or rejected reviews.
   * Sorted newest first (createdAt descending).
   */
  public getApprovedReviews(): CustomerReview[] {
    return this.reviews
      .filter(r => r.status === 'approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Admin-only: retrieve all reviews regardless of status.
   * Sorted newest first.
   */
  public getAllReviewsForAdmin(): CustomerReview[] {
    return [...this.reviews].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Admin-only: retrieve pending reviews only.
   */
  public getPendingReviews(): CustomerReview[] {
    return this.reviews
      .filter(r => r.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Add a new customer review.
   * Enforces server-side validation:
   * - Name: min 2, max 100
   * - Comment: min 10, max 1000
   * - Rating: 1 to 5
   * - Duplicate check (last 10 minutes)
   * - Initial status is ALWAYS 'pending'
   */
  public addReview(input: {
    name: string;
    rating: number;
    comment: string;
    service?: string;
  }): { success: boolean; error?: string; review?: CustomerReview } {
    const rawName = String(input.name || '');
    const cleanName = this.sanitize(rawName);
    if (cleanName.length < 2) {
      return { success: false, error: 'Le nom doit comporter au moins 2 caractères.' };
    }
    if (cleanName.length > 100) {
      return { success: false, error: 'Le nom ne peut pas dépasser 100 caractères.' };
    }

    const rawComment = String(input.comment || '');
    const cleanComment = this.sanitize(rawComment);
    if (cleanComment.length < 10) {
      return { success: false, error: 'Le commentaire doit comporter au moins 10 caractères.' };
    }
    if (cleanComment.length > 1000) {
      return { success: false, error: 'Le commentaire ne peut pas dépasser 1000 caractères.' };
    }

    const numRating = Math.round(Number(input.rating));
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return { success: false, error: 'La note doit être un chiffre compris entre 1 et 5.' };
    }

    const cleanService = input.service ? this.sanitize(String(input.service)).substring(0, 100) : undefined;

    // Check for duplicate submission in the last 10 minutes
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const isDuplicate = this.reviews.some(r => {
      const reviewTime = new Date(r.createdAt).getTime();
      return (
        reviewTime > tenMinutesAgo &&
        r.name.toLowerCase() === cleanName.toLowerCase() &&
        r.comment.toLowerCase() === cleanComment.toLowerCase()
      );
    });

    if (isDuplicate) {
      return {
        success: false,
        error: 'Un avis identique a déjà été soumis récemment. Merci de patienter avant de soumettre un nouveau commentaire.'
      };
    }

    const newReview: CustomerReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name: cleanName,
      rating: numRating,
      comment: cleanComment,
      service: cleanService || undefined,
      createdAt: new Date().toISOString(),
      status: 'pending' // ALWAYS pending for moderation!
    };

    this.reviews.unshift(newReview);
    this.saveReviews();

    return {
      success: true,
      review: newReview
    };
  }

  /**
   * Approve a review (Moderation)
   */
  public approveReview(id: string): CustomerReview | null {
    const review = this.reviews.find(r => r.id === id);
    if (!review) return null;

    review.status = 'approved';
    this.saveReviews();
    return review;
  }

  /**
   * Reject a review (Moderation)
   */
  public rejectReview(id: string): CustomerReview | null {
    const review = this.reviews.find(r => r.id === id);
    if (!review) return null;

    review.status = 'rejected';
    this.saveReviews();
    return review;
  }

  /**
   * Delete a review permanently
   */
  public deleteReview(id: string): boolean {
    const initialLen = this.reviews.length;
    this.reviews = this.reviews.filter(r => r.id !== id);
    if (this.reviews.length !== initialLen) {
      this.saveReviews();
      return true;
    }
    return false;
  }

  /**
   * Clear all reviews (useful for cleanup or testing)
   */
  public clearAllReviews(): void {
    this.reviews = [];
    this.saveReviews();
  }
}

export const reviewsDb = new ReviewsDatabase();
