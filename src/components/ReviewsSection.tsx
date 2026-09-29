import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle2, 
  MapPin, 
  Edit3,
  MessageSquare,
  Sparkles,
  Trash2,
  Send,
  X,
  AlertCircle
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
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [reviewsList, setReviewsList] = useState<AutoReviewItem[]>(() => {
    // Immediate safe load from localStorage
    try {
      const saved = localStorage.getItem('maxexpert_user_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(r => r && r.id && !r.id.startsWith('mock_') && !r.id.startsWith('rev_mock'));
        }
      }
    } catch {
      // ignore
    }
    return REVIEWS_AUTO;
  });

  // Inline Form States
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Drummondville, QC');
  const [selectedService, setSelectedService] = useState('🚗 Auto / VUS');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const t = {
    fr: {
      eyebrow: 'AVIS & RETOURS D\'EXPÉRIENCE',
      titlePart1: 'AVIS',
      titlePart2: 'CLIENTS',
      subtitle: 'Les vrais commentaires de nos clients à Drummondville et dans la région.',
      verifiedClient: 'Client vérifié',
      writeReviewBtn: 'Écrire un avis',
      closeFormBtn: 'Fermer le formulaire',
      emptyTitle: 'Aucun faux avis sur MaxExpert360 !',
      emptySub: 'Soyez le tout premier à laisser un commentaire après votre nettoyage professionnel.',
      writeFirstReviewBtn: 'Écrire le premier avis',
      newBadge: 'Nouveau',
      deleteConfirmTitle: 'Supprimer cet avis ?',
      deleteConfirmYes: 'Oui, supprimer',
      deleteConfirmNo: 'Annuler',
      deleteBtnTooltip: 'Supprimer cet avis',
      formTitle: 'Laisser un commentaire ou un avis client',
      formNameLabel: 'Votre nom :',
      formNamePlaceholder: 'ex. Maxime P.',
      formCityLabel: 'Ville / Région :',
      formCityPlaceholder: 'Drummondville, QC',
      formServiceLabel: 'Prestation réalisée :',
      formRatingLabel: 'Votre note :',
      formTextLabel: 'Votre commentaire :',
      formTextPlaceholder: 'Partagez votre avis sur la qualité du nettoyage, la ponctualité, le résultat...',
      publishBtn: 'Publier mon commentaire',
      publishing: 'Publication...',
      successMsg: 'Votre avis a été publié et enregistré avec succès !',
      clearTestReviewsBtn: 'Purger les anciens faux avis',
      servicesOptions: [
        '🚗 Auto / Berline / VUS',
        '🛋️ Canapé / Sofa / Divan',
        '🧼 Nettoyage Tapis',
        '🛏️ Matelas & Désinfection',
        '🚛 Camion Lourd / VR'
      ]
    },
    ua: {
      eyebrow: 'ВІДГУКИ ТА КОМЕНТАРІ',
      titlePart1: 'ВІДГУКИ',
      titlePart2: 'КЛІЄНТІВ',
      subtitle: 'Чесні коментарі клієнтів після хімчистки у Драммондвілі та регіоні.',
      verifiedClient: 'Перевірений клієнт',
      writeReviewBtn: 'Написати коментар',
      closeFormBtn: 'Закрити форму',
      emptyTitle: 'Жодних фальшивих відгуків на MaxExpert360!',
      emptySub: 'Ми показуємо виключно реальні відгуки. Будьте першим, хто поділиться своїм враженням!',
      writeFirstReviewBtn: 'Залишити перший відгук',
      newBadge: 'Новий',
      deleteConfirmTitle: 'Видалити цей коментар?',
      deleteConfirmYes: 'Так, видалити',
      deleteConfirmNo: 'Скасувати',
      deleteBtnTooltip: 'Видалити коментар',
      formTitle: 'Написати новий коментар або відгук',
      formNameLabel: 'Ваше ім\'я :',
      formNamePlaceholder: 'напр. Олександр М.',
      formCityLabel: 'Місто / Район :',
      formCityPlaceholder: 'Drummondville, QC',
      formServiceLabel: 'Очищений об\'єкт :',
      formRatingLabel: 'Ваша оцінка :',
      formTextLabel: 'Текст коментаря :',
      formTextPlaceholder: 'Опишіть якість хімчистки, пунктуальність, стан салону чи меблів після роботи...',
      publishBtn: 'Опублікувати коментар',
      publishing: 'Публікація...',
      successMsg: 'Ваш коментар збережено та успішно опубліковано на сайті!',
      clearTestReviewsBtn: 'Видалити всі фальшиві / тестові відгуки',
      servicesOptions: [
        '🚗 Авто / Кросовер / VUS',
        '🛋️ Диван / Меблі',
        '🧼 Хімчистка килима',
        '🛏️ Матрац та дезінфекція',
        '🚛 Вантажівка / VR'
      ]
    },
    en: {
      eyebrow: 'CLIENT REVIEWS & FEEDBACK',
      titlePart1: 'CLIENT',
      titlePart2: 'REVIEWS',
      subtitle: 'Real honest feedback from clients in Drummondville and surrounding areas.',
      verifiedClient: 'Verified client',
      writeReviewBtn: 'Write a Review',
      closeFormBtn: 'Close form',
      emptyTitle: 'No fake reviews on MaxExpert360!',
      emptySub: 'We only publish authentic feedback. Be the first to share your experience!',
      writeFirstReviewBtn: 'Write the first review',
      newBadge: 'New',
      deleteConfirmTitle: 'Delete this review?',
      deleteConfirmYes: 'Yes, delete',
      deleteConfirmNo: 'Cancel',
      deleteBtnTooltip: 'Delete review',
      formTitle: 'Leave a client review or comment',
      formNameLabel: 'Your name:',
      formNamePlaceholder: 'e.g. Alex M.',
      formCityLabel: 'City / Area:',
      formCityPlaceholder: 'Drummondville, QC',
      formServiceLabel: 'Cleaned service:',
      formRatingLabel: 'Your rating:',
      formTextLabel: 'Your comment:',
      formTextPlaceholder: 'Describe the cleaning quality, punctuality, and overall satisfaction...',
      publishBtn: 'Publish Review',
      publishing: 'Publishing...',
      successMsg: 'Your review has been successfully published and saved!',
      clearTestReviewsBtn: 'Clear old test/fake reviews',
      servicesOptions: [
        '🚗 Car / SUV / Van',
        '🛋️ Sofa & Couch',
        '🧼 Carpet Cleaning',
        '🛏️ Mattress Sanitization',
        '🚛 Heavy Truck / RV'
      ]
    }
  }[currentLang];

  // Helper to persist list to localStorage
  const saveToStorage = (list: AutoReviewItem[]) => {
    try {
      localStorage.setItem('maxexpert_user_reviews', JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // Reconcile and load reviews from API and local storage
  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      let localList: AutoReviewItem[] = [];
      try {
        const saved = localStorage.getItem('maxexpert_user_reviews');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            localList = parsed.filter(r => r && r.id && !r.id.startsWith('mock_'));
          }
        }
      } catch {
        // ignore
      }

      try {
        const res = await fetch(getApiUrl('/api/reviews'));
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.reviews)) {
            const serverList: AutoReviewItem[] = data.reviews.filter((r: any) => r && r.id && !r.id.startsWith('mock_'));
            
            const combinedMap = new Map<string, AutoReviewItem>();
            serverList.forEach(r => combinedMap.set(r.id, r));
            localList.forEach(r => combinedMap.set(r.id, r));
            const merged = Array.from(combinedMap.values());

            if (isMounted) {
              setReviewsList(merged);
              saveToStorage(merged);
              return;
            }
          }
        }
      } catch {
        // Server unreachable; keep local list
      }

      if (isMounted && localList.length > 0) {
        setReviewsList(localList);
      }
    }

    loadReviews();

    const handleCustomSubmit = (e: any) => {
      if (e.detail && isMounted) {
        const newRev = e.detail;
        setReviewsList(prev => {
          const filtered = prev.filter(r => r.id !== newRev.id);
          const updated = [newRev, ...filtered];
          saveToStorage(updated);
          return updated;
        });
      }
    };
    window.addEventListener('new_review_submitted', handleCustomSubmit);

    return () => {
      isMounted = false;
      window.removeEventListener('new_review_submitted', handleCustomSubmit);
    };
  }, []);

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError(currentLang === 'ua' ? 'Будь ласка, введіть ваше ім\'я' : 'Veuillez entrer votre nom');
      return;
    }
    if (!reviewText.trim()) {
      setFormError(currentLang === 'ua' ? 'Будь ласка, напишіть текст відгуку' : 'Veuillez rédiger votre commentaire');
      return;
    }

    setIsSubmitting(true);

    const dateStr = new Intl.DateTimeFormat('fr-CA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(new Date());

    const newRevId = `rev_user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newReview: AutoReviewItem = {
      id: newRevId,
      name: name.trim(),
      location: location.trim() || 'Drummondville, QC',
      vehicle: selectedService,
      rating: rating,
      date: dateStr,
      service: {
        fr: selectedService,
        ua: selectedService,
        en: selectedService
      },
      text: {
        fr: reviewText.trim(),
        ua: reviewText.trim(),
        en: reviewText.trim()
      },
      verified: true
    };

    // 1. Immediately update UI state and LocalStorage so it NEVER disappears!
    setReviewsList(prev => {
      const updated = [newReview, ...prev.filter(r => r.id !== newRevId)];
      saveToStorage(updated);
      return updated;
    });

    // 2. Send to backend database for permanent server storage
    try {
      await fetch(getApiUrl('/api/reviews'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          location: location.trim() || 'Drummondville, QC',
          vehicle: selectedService,
          rating,
          text: reviewText.trim()
        })
      });
    } catch (err) {
      console.warn('Backend save notice (cached locally):', err);
    }

    setIsSubmitting(false);
    setSubmitSuccess(true);
    setReviewText('');

    setTimeout(() => {
      setSubmitSuccess(false);
      setShowInlineForm(false);
    }, 3500);
  };

  const handleDeleteReview = async (id: string) => {
    setReviewsList(prev => {
      const updated = prev.filter(r => r.id !== id);
      saveToStorage(updated);
      return updated;
    });
    setReviewToDelete(null);

    try {
      await fetch(getApiUrl('/api/reviews/delete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch {
      // ignore
    }
  };

  const handlePurgeFakeReviews = async () => {
    try {
      localStorage.removeItem('maxexpert_user_reviews');
      await fetch(getApiUrl('/api/reviews/clear-all'), { method: 'POST' });
    } catch {
      // ignore
    }
    setReviewsList([]);
  };

  const avgRating = reviewsList.length > 0 
    ? (reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewsList.length).toFixed(1)
    : null;

  return (
    <section id="avis" className="py-10 sm:py-14 bg-[#F4FAF6] text-[#122B1E] relative border-b border-[#D5EAD9] scroll-mt-16">
      
      <span id="reviews" className="absolute -top-16 opacity-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Heading & Action Buttons */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-[#15803D] font-mono font-bold bg-white px-3.5 py-1 rounded-full border border-[#BEE7CB] shadow-xs">
            {t.eyebrow}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-[#0D2818] tracking-tight uppercase">
            <span>{t.titlePart1}</span>{' '}
            <span className="text-[#16A34A]">{t.titlePart2}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#3E6552] font-normal leading-relaxed">
            {t.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {avgRating && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#D5EAD9] text-xs text-[#0D2818] shadow-xs">
                <div className="flex text-[#16A34A]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#16A34A]" />
                  ))}
                </div>
                <span className="font-bold font-mono text-xs text-[#0D2818]">{avgRating} / 5</span>
                <span className="text-[11px] text-[#4F7A64]">({reviewsList.length})</span>
              </div>
            )}

            {/* Write Review Button */}
            <button
              type="button"
              onClick={() => setShowInlineForm(!showInlineForm)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-heading font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#16A34A]/25 hover:scale-105 active:scale-95 cursor-pointer border border-[#16A34A]"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{showInlineForm ? t.closeFormBtn : t.writeReviewBtn}</span>
            </button>
          </div>
        </div>

        {/* INLINE WRITE REVIEW FORM */}
        {showInlineForm && (
          <div className="max-w-2xl mx-auto mb-8 p-5 sm:p-6 rounded-2xl bg-white border-2 border-[#16A34A] shadow-xl animate-fade-in relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAF5ED] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EAF6EE] border border-[#BEE7CB] flex items-center justify-center text-[#16A34A]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-heading font-bold text-[#0D2818] uppercase">
                  {t.formTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInlineForm(false)}
                className="w-7 h-7 rounded-full bg-[#F4FAF6] hover:bg-[#EAF6EE] text-[#4F7A64] hover:text-[#0D2818] flex items-center justify-center transition-colors border border-[#D5EAD9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="text-center py-6 space-y-3 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-[#EAF6EE] border-2 border-[#16A34A] text-[#16A34A] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-[#0D2818]">
                  {t.successMsg}
                </p>
              </div>
            ) : (
              <form onSubmit={handleInlineSubmit} className="space-y-4">
                {formError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Rating stars */}
                <div>
                  <label className="block text-xs font-bold text-[#15803D] uppercase tracking-wider mb-1.5">
                    {t.formRatingLabel}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star 
                          className={`w-6 h-6 ${
                            (hoverRating || rating) >= star 
                              ? 'text-[#16A34A] fill-[#16A34A]' 
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-mono text-xs text-[#15803D] font-bold">
                      {rating} / 5
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#15803D] uppercase tracking-wider mb-1">
                      {t.formNameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.formNamePlaceholder}
                      className="w-full px-3 py-2 rounded-xl bg-[#F8FCF9] border border-[#D5EAD9] text-[#0D2818] text-xs focus:border-[#16A34A] focus:outline-none"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-[#15803D] uppercase tracking-wider mb-1">
                      {t.formCityLabel}
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={t.formCityPlaceholder}
                      className="w-full px-3 py-2 rounded-xl bg-[#F8FCF9] border border-[#D5EAD9] text-[#0D2818] text-xs focus:border-[#16A34A] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Service chips */}
                <div>
                  <label className="block text-xs font-bold text-[#15803D] uppercase tracking-wider mb-1.5">
                    {t.formServiceLabel}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {t.servicesOptions.map((srv) => (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => setSelectedService(srv)}
                        className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                          selectedService === srv
                            ? 'bg-[#EAF6EE] text-[#15803D] border-[#16A34A] font-bold'
                            : 'bg-[#F8FCF9] text-[#4F7A64] border-[#D5EAD9] hover:border-[#16A34A]'
                        }`}
                      >
                        {srv}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-bold text-[#15803D] uppercase tracking-wider mb-1">
                    {t.formTextLabel}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={t.formTextPlaceholder}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FCF9] border border-[#D5EAD9] text-[#0D2818] text-xs focus:border-[#16A34A] focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#4F7A64] font-mono">
                    ✓ Sauvegarde instantanée
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim() || !reviewText.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-heading font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-[#16A34A]/25"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? t.publishing : t.publishBtn}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* REVIEWS GRID OR EMPTY STATE */}
        {reviewsList.length === 0 ? (
          <div className="max-w-xl mx-auto text-center p-6 sm:p-8 rounded-2xl bg-white border border-[#D5EAD9] space-y-3.5 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#EAF6EE] border border-[#BEE7CB] text-[#16A34A] mx-auto flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#16A34A]" />
            </div>
            <h3 className="text-base font-bold font-heading text-[#0D2818]">
              {t.emptyTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#3E6552] leading-relaxed max-w-md mx-auto">
              {t.emptySub}
            </p>
            <button
              type="button"
              onClick={() => setShowInlineForm(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#16A34A]/25"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t.writeFirstReviewBtn}</span>
            </button>
          </div>
        ) : (
          /* Review Cards Grid */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-[#D5EAD9] hover:border-[#16A34A] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-md relative group"
                >
                  <div className="space-y-3">
                    {/* Top row: stars + date + new badge + delete option */}
                    <div className="flex items-center justify-between">
                      <div className="flex text-[#16A34A]">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#16A34A]" />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {rev.id.startsWith('rev_user_') && (
                          <span className="text-[9px] uppercase font-bold font-mono px-2 py-0.5 rounded-full bg-[#EAF6EE] text-[#15803D] border border-[#BEE7CB]">
                            {t.newBadge}
                          </span>
                        )}
                        <span className="text-[11px] text-[#7A9C87] font-mono">{rev.date}</span>

                        {/* Delete button to remove fake / unwanted reviews */}
                        <button
                          type="button"
                          onClick={() => setReviewToDelete(rev.id)}
                          title={t.deleteBtnTooltip}
                          className="opacity-40 group-hover:opacity-100 hover:opacity-100 p-1 text-[#9CA3AF] hover:text-red-500 transition-opacity ml-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Delete Confirmation Overlay for this card */}
                    {reviewToDelete === rev.id && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-2 animate-fade-in">
                        <p className="text-xs text-red-800 font-bold text-center">
                          {t.deleteConfirmTitle}
                        </p>
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold uppercase transition-colors cursor-pointer"
                          >
                            {t.deleteConfirmYes}
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewToDelete(null)}
                            className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 text-[11px] uppercase hover:bg-gray-300 transition-colors cursor-pointer"
                          >
                            {t.deleteConfirmNo}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Comment text */}
                    <p className="text-xs sm:text-[13px] text-[#244634] leading-relaxed italic">
                      "{rev.text ? (rev.text[currentLang] || rev.text.fr || rev.text.ua || rev.text.en) : ''}"
                    </p>

                    {/* Service tag */}
                    {rev.service && (
                      <div className="inline-block bg-[#EAF6EE] text-[#15803D] text-[11px] px-2.5 py-1 rounded-md border border-[#BEE7CB] font-medium">
                        {rev.service[currentLang] || rev.service.fr || rev.service.ua || rev.service.en}
                      </div>
                    )}
                  </div>

                  {/* Bottom author and location */}
                  <div className="pt-3 mt-3 border-t border-[#EAF5ED] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#0D2818]">{rev.name}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-[#527964]">
                        <MapPin className="w-3 h-3 text-[#16A34A]" />
                        <span>{rev.location}</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#16A34A] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.verifiedClient}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Optional purge button if user wants to reset all mock/test reviews */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handlePurgeFakeReviews}
                className="text-[11px] font-mono text-[#7A9C87] hover:text-red-500 underline transition-colors cursor-pointer"
              >
                {t.clearTestReviewsBtn}
              </button>
            </div>
          </div>
        )}

      </div>

      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        currentLang={currentLang}
        onReviewSubmitted={(newRev) => {
          setReviewsList(prev => {
            const updated = [newRev, ...prev.filter(r => r.id !== newRev.id)];
            saveToStorage(updated);
            return updated;
          });
        }}
      />
    </section>
  );
};
