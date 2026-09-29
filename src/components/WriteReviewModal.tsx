import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Send, 
  CheckCircle2, 
  Sparkles,
  MapPin,
  Car,
  MessageSquare,
  Facebook
} from 'lucide-react';
import { Language, AutoReviewItem } from '../types';
import { DYNASTIE_INFO } from '../data/dynastieData';
import { getApiUrl } from '../config/api';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onReviewSubmitted: (newReview: AutoReviewItem) => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Drummondville, QC');
  const [vehicle, setVehicle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const quickCategories = {
    fr: [
      '🚗 Auto / Berline',
      '🚙 VUS / SUV',
      '🛋️ Sofa & Divan',
      '🧼 Tapis salon',
      '🛏️ Matelas',
      '🚛 Camion lourd'
    ],
    ua: [
      '🚗 Легкове авто',
      '🚙 Кросовер / VUS',
      '🛋️ Диван та меблі',
      '🧼 Килим',
      '🛏️ Матрац',
      '🚛 Тягач / Camion'
    ],
    en: [
      '🚗 Sedan / Car',
      '🚙 SUV / Crossover',
      '🛋️ Couch & Sofa',
      '🧼 Area Rug',
      '🛏️ Mattress',
      '🚛 Semi-Truck'
    ]
  }[currentLang];

  const t = {
    fr: {
      modalTitle: 'Donnez votre avis sur notre service',
      modalSubtitle: 'Votre satisfaction est notre plus grande fierté. Partagez votre expérience avec MaxExpert360 !',
      ratingLabel: 'Votre note globale :',
      nameLabel: 'Votre nom complet :',
      namePlaceholder: 'ex. Votre nom',
      locationLabel: 'Ville / Région :',
      locationPlaceholder: 'ex. Drummondville, Saint-Cyrille...',
      vehicleLabel: 'Prestation réalisée :',
      vehiclePlaceholder: 'ex. Toyota RAV4, Divan 3 places, Tapis...',
      quickSelect: 'Sélection rapide :',
      textLabel: 'Votre commentaire d\'expérience :',
      textPlaceholder: 'Décrivez la qualité du nettoyage, la ponctualité, l\'état de votre véhicule ou mobilier après notre passage...',
      submitBtn: 'Publier mon avis',
      submittingBtn: 'Publication en cours...',
      successTitle: 'Merci pour votre précieux avis !',
      successMessage: 'Votre témoignage a été publié avec succès. Merci de faire confiance à MaxExpert360 pour vos nettoyages à domicile.',
      closeBtn: 'Fermer',
      googleReviewPrompt: 'Vous souhaitez aussi nous suivre ou laisser un avis sur Facebook ?',
      facebookReviewBtn: 'Voir notre page Facebook officielle',
      googleReviewBtn: 'Laisser un avis Google ⭐⭐⭐⭐⭐'
    },
    ua: {
      modalTitle: 'Написати відгук про сервіс',
      modalSubtitle: 'Ваше задоволення — наша головна мета. Поділіться своїми враженнями від хімчистки MaxExpert360!',
      ratingLabel: 'Ваша оцінка :',
      nameLabel: 'Ваше ім\'я та прізвище :',
      namePlaceholder: 'напр. Максим Петренко',
      locationLabel: 'Місто / Населений пункт :',
      locationPlaceholder: 'напр. Drummondville, Saint-Cyrille...',
      vehicleLabel: 'Послуга чи автомобіль :',
      vehiclePlaceholder: 'напр. Honda CR-V, Диван 3 місця, Килим...',
      quickSelect: 'Швидкий вибір :',
      textLabel: 'Ваш відгук та враження :',
      textPlaceholder: 'Напишіть про якість хімчистки, пунктуальність, стан салону або меблів після роботи...',
      submitBtn: 'Опублікувати відгук',
      submittingBtn: 'Публікуємо відгук...',
      successTitle: 'Щиро дякуємо за ваш відгук !',
      successMessage: 'Ваш відгук успішно опубліковано на сайті. Дякуємо за довіру до MaxExpert360!',
      closeBtn: 'Закрити',
      googleReviewPrompt: 'Бажаєте також підтримати нас або підписатися на Facebook ?',
      facebookReviewBtn: 'Офіційна сторінка Facebook',
      googleReviewBtn: 'Залишити відгук у Google ⭐⭐⭐⭐⭐'
    },
    en: {
      modalTitle: 'Leave a Review About Our Service',
      modalSubtitle: 'Your satisfaction is our pride. Share your experience with MaxExpert360!',
      ratingLabel: 'Your overall rating:',
      nameLabel: 'Your full name:',
      namePlaceholder: 'e.g. Your Name',
      locationLabel: 'City / Area:',
      locationPlaceholder: 'e.g. Drummondville, QC',
      vehicleLabel: 'Service or cleaned item:',
      vehiclePlaceholder: 'e.g. Toyota RAV4, 3-Seat Sofa, Carpet...',
      quickSelect: 'Quick select:',
      textLabel: 'Your feedback and comments:',
      textPlaceholder: 'Tell us about the cleaning quality, punctuality, and how your vehicle/furniture looks now...',
      submitBtn: 'Publish My Review',
      submittingBtn: 'Publishing...',
      successTitle: 'Thank you for your review!',
      successMessage: 'Your review has been published successfully. Thank you for choosing MaxExpert360!',
      closeBtn: 'Close',
      googleReviewPrompt: 'Want to also follow us or leave feedback on Facebook?',
      facebookReviewBtn: 'Visit Official Facebook Page',
      googleReviewBtn: 'Leave a Google Review ⭐⭐⭐⭐⭐'
    }
  }[currentLang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !reviewText.trim()) return;

    setIsSubmitting(true);

    const vehicleCleaned = vehicle.trim() || (currentLang === 'fr' ? 'Nettoyage professionnel' : currentLang === 'ua' ? 'Професійна хімчистка' : 'Professional detailing');
    const localLocation = location.trim() || 'Drummondville, QC';

    const localReviewItem: AutoReviewItem = {
      id: `rev_user_${Date.now()}`,
      name: name.trim(),
      location: localLocation,
      vehicle: vehicleCleaned,
      rating: rating,
      date: currentLang === 'fr' ? 'Aujourd\'hui' : currentLang === 'ua' ? 'Сьогодні' : 'Today',
      service: {
        fr: vehicleCleaned,
        ua: vehicleCleaned,
        en: vehicleCleaned
      },
      text: {
        fr: reviewText.trim(),
        ua: reviewText.trim(),
        en: reviewText.trim()
      },
      verified: true
    };

    try {
      const res = await fetch(getApiUrl('/api/reviews'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          location: localLocation,
          vehicle: vehicleCleaned,
          rating,
          text: reviewText.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.review) {
          try {
            const raw = localStorage.getItem('maxexpert_user_reviews');
            const list: AutoReviewItem[] = raw ? JSON.parse(raw) : [];
            const updated = [data.review, ...list.filter(r => r.id !== data.review.id)];
            localStorage.setItem('maxexpert_user_reviews', JSON.stringify(updated));
          } catch {
            // ignore
          }
          onReviewSubmitted(data.review);
          setIsSubmitting(false);
          setIsSubmitted(true);
          return;
        }
      }
    } catch {
      // fallback to local handling
    }

    try {
      const raw = localStorage.getItem('maxexpert_user_reviews');
      const list: AutoReviewItem[] = raw ? JSON.parse(raw) : [];
      const updated = [localReviewItem, ...list.filter(r => r.id !== localReviewItem.id)];
      localStorage.setItem('maxexpert_user_reviews', JSON.stringify(updated));
    } catch {
      // ignore
    }

    onReviewSubmitted(localReviewItem);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setName('');
    setVehicle('');
    setReviewText('');
    setRating(5);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in"
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
              <h3 className="text-lg sm:text-xl font-heading font-black text-[#0D2818] uppercase tracking-tight">
                {t.modalTitle}
              </h3>
              <p className="text-xs text-[#15803D] font-mono mt-0.5">
                MaxExpert360 • Service Client
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#F4FAF6] text-[#4F7A64] hover:text-[#0D2818] flex items-center justify-center transition-colors cursor-pointer border border-[#D5EAD9]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#EAF6EE] border-2 border-[#16A34A] text-[#16A34A] flex items-center justify-center mx-auto shadow-xl shadow-[#16A34A]/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl sm:text-2xl font-heading font-black text-[#0D2818] uppercase">
                  {t.successTitle}
                </h4>
                <p className="text-sm text-[#3E6552] leading-relaxed max-w-sm mx-auto">
                  {t.successMessage}
                </p>
              </div>

              {/* Stars recap */}
              <div className="flex justify-center gap-1.5 text-[#16A34A]">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-[#16A34A]" />
                ))}
              </div>

              <div className="pt-4 border-t border-[#D5EAD9] space-y-2.5">
                <p className="text-xs text-[#4F7A64]">
                  {t.googleReviewPrompt}
                </p>
                <a
                  href={DYNASTIE_INFO.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-xs font-bold text-[#1877F2] transition-all cursor-pointer shadow-xs"
                >
                  <Facebook className="w-4 h-4 text-[#1877F2]" />
                  <span>{t.facebookReviewBtn}</span>
                </a>

                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full py-3 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-black uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer mt-1"
                >
                  {t.closeBtn}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-[#3E6552] leading-relaxed">
                {t.modalSubtitle}
              </p>

              {/* Interactive Star Rating */}
              <div className="bg-[#F8FCF9] p-4 rounded-2xl border border-[#D5EAD9] space-y-2 text-center">
                <label className="text-xs font-bold uppercase tracking-wider text-[#15803D] block">
                  {t.ratingLabel}
                </label>
                <div className="flex justify-center items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      >
                        <Star 
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            isFilled 
                              ? 'text-[#16A34A] fill-[#16A34A] drop-shadow-sm' 
                              : 'text-[#D1D5DB]'
                          }`} 
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] font-mono text-[#15803D] font-bold block">
                  {rating === 5 ? '⭐⭐⭐⭐⭐ 5.0 / 5 (Excellent)' : `${rating} / 5 étoiles`}
                </span>
              </div>

              {/* Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0D2818] flex items-center gap-1.5">
                    <span>{t.nameLabel}</span>
                    <span className="text-[#16A34A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full bg-[#F8FCF9] border border-[#D5EAD9] focus:border-[#16A34A] focus:bg-white focus:ring-1 focus:ring-[#16A34A] rounded-xl px-3.5 py-2.5 text-xs text-[#0D2818] placeholder-[#8BAAA0] outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0D2818] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>{t.locationLabel}</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t.locationPlaceholder}
                    className="w-full bg-[#F8FCF9] border border-[#D5EAD9] focus:border-[#16A34A] focus:bg-white focus:ring-1 focus:ring-[#16A34A] rounded-xl px-3.5 py-2.5 text-xs text-[#0D2818] placeholder-[#8BAAA0] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Vehicle or Service */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0D2818] flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>{t.vehicleLabel}</span>
                  </label>
                  <span className="text-[10px] text-[#4F7A64] font-mono">{t.quickSelect}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pb-1">
                  {quickCategories.map((catName) => (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => setVehicle(catName)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        vehicle === catName 
                          ? 'bg-[#16A34A] text-white font-bold border-[#16A34A]' 
                          : 'bg-[#F4FAF6] text-[#0D2818] border-[#D5EAD9] hover:border-[#16A34A]'
                      }`}
                    >
                      {catName}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  placeholder={t.vehiclePlaceholder}
                  className="w-full bg-[#F8FCF9] border border-[#D5EAD9] focus:border-[#16A34A] focus:bg-white focus:ring-1 focus:ring-[#16A34A] rounded-xl px-3.5 py-2.5 text-xs text-[#0D2818] placeholder-[#8BAAA0] outline-none transition-all"
                />
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0D2818] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>{t.textLabel}</span>
                  <span className="text-[#16A34A]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={t.textPlaceholder}
                  className="w-full bg-[#F8FCF9] border border-[#D5EAD9] focus:border-[#16A34A] focus:bg-white focus:ring-1 focus:ring-[#16A34A] rounded-xl p-3 text-xs text-[#0D2818] placeholder-[#8BAAA0] outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim() || !reviewText.trim()}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#16A34A] hover:bg-[#15803D] disabled:bg-[#D5EAD9] disabled:text-[#8BAAA0] disabled:cursor-not-allowed text-white font-heading font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-[#16A34A]/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <span>{t.submittingBtn}</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t.submitBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
