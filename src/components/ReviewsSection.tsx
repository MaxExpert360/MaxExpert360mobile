import React, { useState, useEffect, useCallback } from 'react';
import { 
  Star, 
  CheckCircle2, 
  MessageSquare, 
  Sparkles, 
  Send, 
  AlertCircle,
  Shield,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { Language, CustomerReview } from '../types';
import { getApiUrl } from '../config/api';
import { ReviewModerationModal } from './ReviewModerationModal';

interface ReviewsSectionProps {
  currentLang: Language;
  onOpenWriteReview?: () => void;
}

const SERVICE_OPTIONS = [
  'Nettoyage intérieur automobile',
  'Nettoyage complet automobile',
  'Canapé',
  'Tapis',
  'Escaliers',
  'Matelas',
  'Autre'
];

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ currentLang }) => {
  const [reviewsList, setReviewsList] = useState<CustomerReview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showInlineForm, setShowInlineForm] = useState<boolean>(false);
  const [isModerationOpen, setIsModerationOpen] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Fetch approved reviews from server
  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/reviews'));
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews)) {
          // Sort newest first
          const sorted = [...data.reviews].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setReviewsList(sorted);
        }
      }
    } catch (err) {
      console.warn('[ReviewsSection] Erreur lors du chargement des avis serveur:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();

    // Clean up any old fake localStorage reviews left from previous versions
    try {
      localStorage.removeItem('maxexpert_user_reviews');
    } catch {
      // ignore
    }

    // Listen to custom event if review is approved or submitted elsewhere
    const handleRefresh = () => {
      fetchReviews();
    };
    window.addEventListener('approved_reviews_updated', handleRefresh);
    window.addEventListener('open_reviews_form', () => {
      setShowInlineForm(true);
      const el = document.getElementById('formulaire-avis');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });

    return () => {
      window.removeEventListener('approved_reviews_updated', handleRefresh);
    };
  }, [fetchReviews]);

  // Handle Form Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = name.trim();
    const trimmedComment = comment.trim();

    // Validations (French messages)
    if (!trimmedName || trimmedName.length < 2) {
      setFormError('Veuillez entrer votre nom (au moins 2 caractères).');
      return;
    }
    if (trimmedName.length > 100) {
      setFormError('Le nom ne peut pas dépasser 100 caractères.');
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      setFormError('Veuillez sélectionner une note de 1 à 5 étoiles.');
      return;
    }
    if (!trimmedComment || trimmedComment.length < 10) {
      setFormError('Votre commentaire doit comporter au moins 10 caractères.');
      return;
    }
    if (trimmedComment.length > 1000) {
      setFormError('Votre commentaire ne peut pas dépasser 1000 caractères.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(getApiUrl('/api/reviews'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          rating,
          comment: trimmedComment,
          service: selectedService.trim() || undefined
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setSubmitSuccess(true);
        // Reset form fields
        setName('');
        setRating(5);
        setComment('');
        setSelectedService('');

        // Close form after user reads confirmation
        setTimeout(() => {
          setSubmitSuccess(false);
          setShowInlineForm(false);
        }, 5000);
      } else {
        setFormError(data.error || 'Une erreur est survenue lors de l\'envoi de votre avis. Veuillez réessayer.');
      }
    } catch {
      setFormError('Impossible de joindre le serveur. Veuillez vérifier votre connexion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date in French
  const formatDateFrench = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat('fr-CA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(d);
    } catch {
      return dateString;
    }
  };

  // Dynamic Rating Calculations from APPROVED reviews only
  const approvedCount = reviewsList.length;
  const avgRating = approvedCount > 0
    ? (reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0) / approvedCount).toFixed(1)
    : null;

  return (
    <section id="avis" className="py-12 sm:py-16 bg-[#F4FAF6] text-[#122B1E] relative border-b border-[#D5EAD9] scroll-mt-16">
      <span id="reviews" className="absolute -top-16 opacity-0 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-[#15803D] font-mono font-bold bg-white px-3.5 py-1 rounded-full border border-[#BEE7CB] shadow-xs">
            AVIS CLIENTS VÉRIFIÉS
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-[#0D2818] tracking-tight uppercase">
            <span>AVIS</span>{' '}
            <span className="text-[#16A34A]">CLIENTS</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#3E6552] font-normal leading-relaxed">
            Les témoignages et retours d'expérience authentiques de nos clients à Drummondville et dans la région.
          </p>

          {/* Dynamic Average Rating Header - ONLY if genuine approved reviews exist */}
          {approvedCount > 0 && avgRating && (
            <div className="pt-2 flex flex-col items-center justify-center gap-1.5 animate-fade-in">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-[#D5EAD9] text-xs text-[#0D2818] shadow-xs">
                <span className="font-heading font-black text-sm text-[#0D2818]">
                  {avgRating} / 5
                </span>
                <div className="flex text-[#16A34A]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-sm">
                      {Number(avgRating) >= s ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-medium text-[#4F7A64]">
                  Basé sur {approvedCount} {approvedCount > 1 ? 'avis' : 'avis'}
                </span>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-3">
            <button
              type="button"
              onClick={() => {
                setShowInlineForm(!showInlineForm);
                if (!showInlineForm) {
                  setTimeout(() => {
                    const el = document.getElementById('formulaire-avis');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#16A34A]/25 hover:scale-105 active:scale-95 cursor-pointer border border-[#16A34A]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showInlineForm ? 'Fermer le formulaire' : 'Donner mon avis'}</span>
            </button>
          </div>
        </div>

        {/* CUSTOMER REVIEW FORM */}
        {showInlineForm && (
          <div id="formulaire-avis" className="max-w-xl mx-auto mb-10 p-5 sm:p-7 rounded-3xl bg-white border-2 border-[#16A34A] shadow-xl animate-fade-in scroll-mt-24">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAF5ED] mb-5">
              <div>
                <h3 className="text-base sm:text-lg font-heading font-bold text-[#0D2818] uppercase">
                  Partager votre expérience
                </h3>
                <p className="text-[11px] text-[#4F7A64] mt-0.5">
                  Votre avis sera vérifié par notre équipe avant publication.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInlineForm(false)}
                className="text-[#7A9C87] hover:text-[#0D2818] text-xs font-bold uppercase transition-colors px-2 py-1 rounded-lg hover:bg-[#F4FAF6] cursor-pointer"
              >
                Fermer
              </button>
            </div>

            {submitSuccess ? (
              <div className="text-center py-8 px-4 space-y-3 animate-fade-in bg-[#EAF6EE] rounded-2xl border border-[#BEE7CB]">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#16A34A] text-[#16A34A] flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-heading font-bold text-sm sm:text-base text-[#0D2818]">
                  Merci! Votre avis a bien été reçu et sera publié après vérification.
                </h4>
                <p className="text-xs text-[#3E6552]">
                  Nous vous remercions sincèrement pour votre confiance et pour votre retour d'expérience avec Max Expert 360.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Rating selection with Clickable Stars */}
                <div>
                  <label className="block text-xs font-bold text-[#15803D] uppercase tracking-wider mb-1.5">
                    Votre note *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-[#F8FCF9] border border-[#D5EAD9] px-3 py-1.5 rounded-xl">
                      {[1, 2, 3, 4, 5].map((starIndex) => {
                        const isFilled = (hoverRating || rating) >= starIndex;
                        return (
                          <button
                            key={starIndex}
                            type="button"
                            onClick={() => setRating(starIndex)}
                            onMouseEnter={() => setHoverRating(starIndex)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                            title={`${starIndex} étoile${starIndex > 1 ? 's' : ''}`}
                          >
                            <span className={`text-2xl transition-colors ${
                              isFilled ? 'text-[#16A34A]' : 'text-gray-300 hover:text-[#16A34A]/50'
                            }`}>
                              {isFilled ? '★' : '☆'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <span className="font-mono text-xs font-bold text-[#15803D]">
                      {rating} / 5 étoiles
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-[#15803D] uppercase tracking-wider mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex. Maxime P."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FCF9] border border-[#D5EAD9] text-xs text-[#0D2818] focus:border-[#16A34A] focus:bg-white focus:outline-none transition-colors"
                  />
                  <p className="text-[10px] text-[#7A9C87] mt-1">
                    Minimum 2 caractères
                  </p>
                </div>

                {/* Optional Service used */}
                <div>
                  <label className="block text-xs font-bold text-[#15803D] uppercase tracking-wider mb-1">
                    Service utilisé <span className="font-normal text-[#7A9C87] text-[11px]">(facultatif)</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-[#F8FCF9] border border-[#D5EAD9] text-xs text-[#0D2818] focus:border-[#16A34A] focus:bg-white focus:outline-none transition-colors pr-8 cursor-pointer"
                    >
                      <option value="">-- Sélectionnez un service si applicable --</option>
                      {SERVICE_OPTIONS.map((srv) => (
                        <option key={srv} value={srv}>
                          {srv}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#7A9C87] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Commentaire */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#15803D] uppercase tracking-wider">
                      Commentaire *
                    </label>
                    <span className={`text-[10px] font-mono ${
                      comment.length > 1000 ? 'text-red-500 font-bold' : 'text-[#7A9C87]'
                    }`}>
                      {comment.length} / 1000 caractères (min. 10)
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    maxLength={1000}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Partagez votre expérience avec Max Expert 360 (qualité du nettoyage, ponctualité, résultat)..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FCF9] border border-[#D5EAD9] text-xs text-[#0D2818] focus:border-[#16A34A] focus:bg-white focus:outline-none transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim() || comment.trim().length < 10}
                    className="w-full py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-heading font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-[#16A34A]/25 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Publication en cours...' : 'Publier mon avis'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* REVIEWS GRID OR EMPTY STATE */}
        {isLoading ? (
          <div className="text-center py-12 text-xs text-[#4F7A64]">
            Chargement des avis...
          </div>
        ) : reviewsList.length === 0 ? (
          /* Exact required empty state message */
          <div className="max-w-lg mx-auto text-center p-8 sm:p-10 rounded-3xl bg-white border border-[#D5EAD9] space-y-4 shadow-sm animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF6EE] border border-[#BEE7CB] text-[#16A34A] mx-auto flex items-center justify-center shadow-xs">
              <MessageSquare className="w-7 h-7 text-[#16A34A]" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-heading font-bold text-[#0D2818]">
                Aucun avis pour le moment.
              </h3>
              <p className="text-xs sm:text-sm text-[#3E6552] leading-relaxed">
                Soyez le premier à partager votre expérience avec Max Expert 360.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowInlineForm(true);
                  setTimeout(() => {
                    const el = document.getElementById('formulaire-avis');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#16A34A]/25"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Publier le premier avis</span>
              </button>
            </div>
          </div>
        ) : (
          /* Approved Review Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-[#D5EAD9] hover:border-[#16A34A] rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-md"
              >
                <div className="space-y-3">
                  {/* Top row: stars + date */}
                  <div className="flex items-center justify-between">
                    <div className="flex text-[#16A34A]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="text-sm">
                          {rev.rating >= s ? '★' : '☆'}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-[#7A9C87] font-mono">
                      <Calendar className="w-3 h-3 text-[#16A34A]/70" />
                      <span>{formatDateFrench(rev.createdAt)}</span>
                    </div>
                  </div>

                  {/* Customer name */}
                  <h4 className="text-sm font-bold text-[#0D2818]">
                    {rev.name}
                  </h4>

                  {/* Service tag (if provided) */}
                  {rev.service && (
                    <div className="inline-block bg-[#EAF6EE] text-[#15803D] text-[11px] font-medium px-2.5 py-1 rounded-md border border-[#BEE7CB]">
                      {rev.service}
                    </div>
                  )}

                  {/* Comment */}
                  <p className="text-xs sm:text-[13px] text-[#244634] leading-relaxed italic pt-1">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-[#EAF5ED] flex items-center justify-between text-[11px] text-[#4F7A64]">
                  <span className="inline-flex items-center gap-1 font-medium text-[#16A34A]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Avis client vérifié</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Discreet Owner Moderation Link */}
        <div className="text-center pt-10">
          <button
            type="button"
            onClick={() => setIsModerationOpen(true)}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#7A9C87] hover:text-[#16A34A] transition-colors cursor-pointer opacity-70 hover:opacity-100"
            title="Espace sécurisé pour approuver ou rejeter les avis en attente"
          >
            <Shield className="w-3 h-3" />
            <span>Espace modération propriétaire</span>
          </button>
        </div>

      </div>

      {/* Moderation Modal */}
      <ReviewModerationModal
        isOpen={isModerationOpen}
        onClose={() => setIsModerationOpen(false)}
        onReviewsUpdated={fetchReviews}
      />
    </section>
  );
};
