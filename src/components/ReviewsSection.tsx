import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle2, 
  MapPin, 
  Edit3,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { REVIEWS_AUTO } from '../data/dynastieData';
import { Language, AutoReviewItem } from '../types';
import { WriteReviewModal } from './WriteReviewModal';
import { getApiUrl } from '../config/api';

interface ReviewsSectionProps {
  currentLang: Language;
  onOpenWriteReview?: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ currentLang, onOpenWriteReview }) => {
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [reviewsList, setReviewsList] = useState<AutoReviewItem[]>(REVIEWS_AUTO);

  // Load reviews from API and local storage
  useEffect(() => {
    let isMounted = true;

    async function fetchReviews() {
      try {
        const res = await fetch(getApiUrl('/api/reviews'));
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
            if (isMounted) {
              setReviewsList([...data.reviews, ...REVIEWS_AUTO]);
              return;
            }
          }
        }
      } catch {
        // Fall back to localStorage
      }

      try {
        const saved = localStorage.getItem('maxexpert_user_reviews');
        if (saved) {
          const parsed: AutoReviewItem[] = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
            setReviewsList([...parsed, ...REVIEWS_AUTO]);
          }
        }
      } catch {
        // ignore JSON errors
      }
    }

    fetchReviews();

    const handleCustomSubmit = (e: any) => {
      if (e.detail && isMounted) {
        handleReviewSubmitted(e.detail);
      }
    };
    window.addEventListener('new_review_submitted', handleCustomSubmit);

    return () => {
      isMounted = false;
      window.removeEventListener('new_review_submitted', handleCustomSubmit);
    };
  }, []);

  const handleReviewSubmitted = (newReview: AutoReviewItem) => {
    setReviewsList((prev) => {
      // deduplicate if same id
      const filtered = prev.filter(r => r.id !== newReview.id);
      const updated = [newReview, ...filtered];
      try {
        const userOnly = updated.filter(r => r.id.startsWith('rev_user_'));
        localStorage.setItem('maxexpert_user_reviews', JSON.stringify(userOnly));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleTriggerWrite = () => {
    if (onOpenWriteReview) {
      onOpenWriteReview();
    } else {
      setIsWriteModalOpen(true);
    }
  };

  const t = {
    fr: {
      eyebrow: 'Témoignages & Confiance',
      title: 'Ce que disent nos clients satisfaits',
      subtitle: 'La propreté éclatante de vos véhicules, meubles et tapis à Drummondville et dans la région.',
      verifiedClient: 'Client vérifié',
      googleBadge: 'Note 5.0 / 5 sur les avis clients',
      writeReviewBtn: 'Écrire un avis client',
      googleReviewBtn: 'Avis Google 5★',
      newBadge: 'Nouveau'
    },
    ua: {
      eyebrow: 'Репутація та Довіра',
      title: 'Відгуки наших задоволених клієнтів',
      subtitle: 'Ідеальна чистота автомобілів, диванів та килимів у Drummondville та регіоні.',
      verifiedClient: 'Перевірений клієнт',
      googleBadge: 'Оцінка 5.0 / 5 від наших клієнтів',
      writeReviewBtn: 'Написати відгук',
      googleReviewBtn: 'Google Відгуки 5★',
      newBadge: 'Новий'
    },
    en: {
      eyebrow: 'Customer Reviews',
      title: 'What Our Satisfied Clients Say',
      subtitle: 'Sparkling cleanliness for your cars, sofas and rugs in Drummondville and surrounding areas.',
      verifiedClient: 'Verified client',
      googleBadge: '5.0 / 5 Rating on Client Reviews',
      writeReviewBtn: 'Write a Review',
      googleReviewBtn: 'Google Reviews 5★',
      newBadge: 'New'
    }
  }[currentLang];

  return (
    <section id="reviews" className="py-16 sm:py-20 bg-[#080D09] text-white relative border-b border-[#1A261D]">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Heading & Action Buttons */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-[#22C55E] font-mono font-bold bg-[#112417] px-3.5 py-1 rounded-full border border-[#22C55E]/40">
            {t.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-white tracking-tight uppercase">
            {t.title}
          </h2>
          <p className="text-sm text-[#9CA3AF] font-normal leading-relaxed">
            {t.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* Rating badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0C150F] border border-[#1E3623] text-xs text-[#DDD]">
              <div className="flex text-[#22C55E]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#22C55E]" />
                ))}
              </div>
              <span className="font-bold text-white font-mono">5.0 / 5</span>
              <span className="text-[#9CA3AF]">• {t.googleBadge}</span>
            </div>

            {/* Write Review Button */}
            <button
              type="button"
              onClick={handleTriggerWrite}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#1EA850] text-black font-heading font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#22C55E]/20 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>{t.writeReviewBtn}</span>
            </button>
          </div>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviewsList.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#0C150F] border border-[#1E3623] hover:border-[#22C55E]/60 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl relative group"
            >
              <div className="space-y-4">
                
                {/* Top row: stars + date + new badge */}
                <div className="flex items-center justify-between">
                  <div className="flex text-[#22C55E]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#22C55E]" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {rev.id.startsWith('rev_user_') && (
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#22C55E] text-black font-bold">
                        {t.newBadge}
                      </span>
                    )}
                    <span className="text-[10px] text-[#6B7280] font-mono">{rev.date}</span>
                  </div>
                </div>

                {/* Testimonial text */}
                <p className="text-xs sm:text-sm text-[#D1D5DB] font-normal italic leading-relaxed">
                  "{rev.text[currentLang] || rev.text.fr || rev.text.ua || rev.text.en}"
                </p>

              </div>

              {/* Bottom: Client Profile */}
              <div className="pt-4 mt-6 border-t border-[#172B1B] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-xs font-bold text-white block">
                      {rev.name}
                    </strong>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF] mt-0.5">
                    <MapPin className="w-3 h-3 text-[#22C55E]" />
                    <span>{rev.location}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#112417] text-[#86EFAC] border border-[#22C55E]/30 block font-bold">
                    {rev.vehicle}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom CTA for writing a review */}
        <div className="mt-10 p-5 rounded-2xl bg-[#0D1810] border border-[#1E3623] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-[#22C55E]" />
              <span>
                {currentLang === 'fr' 
                  ? 'Avez-vous déjà utilisé les services de MaxExpert360 ?' 
                  : currentLang === 'ua' 
                  ? 'Ви вже користувалися послугами MaxExpert360 ?' 
                  : 'Have you experienced MaxExpert360 services?'}
              </span>
            </h4>
            <p className="text-xs text-[#9CA3AF]">
              {currentLang === 'fr'
                ? 'Laissez votre avis pour aider la communauté de Drummondville !'
                : currentLang === 'ua'
                ? 'Залиште свій відгук та поділіться враженнями з іншими клієнтами!'
                : 'Share your feedback to help the local Drummondville community!'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleTriggerWrite}
            className="px-6 py-2.5 rounded-xl bg-[#18331E] hover:bg-[#22C55E] text-[#86EFAC] hover:text-black border border-[#22C55E]/50 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-md flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>{t.writeReviewBtn}</span>
          </button>
        </div>

      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        currentLang={currentLang}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </section>
  );
};
