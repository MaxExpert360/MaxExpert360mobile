import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { Language } from '../types';
import { getApiUrl } from '../config/api';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onReviewSubmitted?: (newReview: any) => void;
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

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = name.trim();
    const trimmedComment = comment.trim();

    // Required Validations in French
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
          service: service.trim() || undefined
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setIsSubmitted(true);
      } else {
        setFormError(data.error || 'Une erreur est survenue lors de l\'enregistrement de votre avis.');
      }
    } catch {
      setFormError('Impossible de joindre le serveur. Veuillez vérifier votre connexion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setName('');
    setService('');
    setComment('');
    setRating(5);
    setFormError('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleResetAndClose();
      }}
    >
      <div className="bg-white border-2 border-[#D5EAD9] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-[#122B1E] relative my-8">
        
        {/* Header decoration */}
        <div className="bg-[#EAF6EE] p-5 sm:p-6 border-b border-[#D5EAD9] flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-heading font-black text-[#0D2818] uppercase tracking-tight">
                Donnez votre avis
              </h3>
              <p className="text-xs text-[#3E6552]">
                Partagez votre expérience avec Max Expert 360
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#F4FAF6] border border-[#D5EAD9] text-[#4F7A64] hover:text-[#0D2818] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-5 sm:p-6">
          {isSubmitted ? (
            /* Success confirmation screen */
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-[#EAF6EE] border-2 border-[#16A34A] text-[#16A34A] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-base sm:text-lg font-heading font-bold text-[#0D2818]">
                  Merci! Votre avis a bien été reçu et sera publié après vérification.
                </h4>
                <p className="text-xs text-[#3E6552] leading-relaxed max-w-sm mx-auto">
                  Nous vous remercions pour votre confiance et pour le temps accordé à nous faire part de vos impressions.
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            /* Review submission form */
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    value={service}
                    onChange={(e) => setService(e.target.value)}
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

              {/* Submit button */}
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
      </div>
    </div>
  );
};
