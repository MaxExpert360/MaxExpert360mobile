import fs from 'fs';
import path from 'path';
import type { AutoReviewItem } from '../src/types';

const REVIEWS_FILE_PATH = path.join(process.cwd(), 'server', 'data', 'user_reviews.json');

export class ReviewsDatabase {
  private reviews: AutoReviewItem[] = [];

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
          this.reviews = parsed;
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

  public getAllReviews(): AutoReviewItem[] {
    return this.reviews;
  }

  public addReview(review: {
    name: string;
    location: string;
    vehicle: string;
    rating: number;
    text: string;
  }): AutoReviewItem {
    const dateStr = new Intl.DateTimeFormat('fr-CA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(new Date());

    const newReview: AutoReviewItem = {
      id: `rev_user_${Date.now()}`,
      name: review.name.trim(),
      location: review.location.trim() || 'Drummondville, QC',
      vehicle: review.vehicle.trim() || 'Nettoyage professionnel',
      rating: Math.min(5, Math.max(1, review.rating || 5)),
      date: dateStr,
      service: {
        fr: review.vehicle.trim() || 'Nettoyage professionnel',
        ua: review.vehicle.trim() || 'Професійна хімчистка',
        en: review.vehicle.trim() || 'Professional cleaning'
      },
      text: {
        fr: review.text.trim(),
        ua: review.text.trim(),
        en: review.text.trim()
      },
      verified: true
    };

    this.reviews.unshift(newReview);
    this.saveReviews();
    return newReview;
  }
}

export const reviewsDb = new ReviewsDatabase();
