import React, { useState, useEffect } from 'react';
import { 
  X, 
  Car, 
  Truck, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Armchair,
  Bed,
  PlusCircle
} from 'lucide-react';
import { 
  AutoBookingFormData, 
  AutoCalculatorState, 
  Language, 
  VehicleCategory 
} from '../types';
import { 
  DETAILING_PACKAGES, 
  EXTRA_SERVICES, 
  DYNASTIE_INFO 
} from '../data/dynastieData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  initialState?: AutoCalculatorState;
  initialEstimatedPrice?: number;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  initialState,
  initialEstimatedPrice
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [bookingRef, setBookingRef] = useState('');

  const [formData, setFormData] = useState<AutoBookingFormData>({
    vehicleCategory: initialState?.vehicleCategory || 'suv',
    vehicleMakeModel: '',
    vehicleYear: new Date().getFullYear().toString(),
    packageId: initialState?.packageId || 'interieur_exterieur_complet',
    feetLength: initialState?.feetLength || 22,
    selectedExtras: initialState?.selectedExtras || [],
    serviceLocation: 'mobile',
    serviceAddress: '',
    preferredDate: '',
    preferredTimeSlot: 'morning',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    notes: ''
  });

  // Sync state when initial props change
  useEffect(() => {
    if (initialState) {
      setFormData(prev => ({
        ...prev,
        vehicleCategory: initialState.vehicleCategory,
        packageId: initialState.packageId,
        feetLength: initialState.feetLength,
        selectedExtras: initialState.selectedExtras,
        serviceLocation: 'mobile'
      }));
    }
  }, [initialState]);

  if (!isOpen) return null;

  const t = {
    fr: {
      modalTitle: 'Réservation Service Mobile à Domicile',
      step1: '1. Service & Objet',
      step2: '2. Adresse & Date',
      step3: '3. Vos Coordonnées',
      step4: '4. Confirmation',
      catAuto: 'Auto / Berline',
      catSuv: 'VUS / SUV',
      catTruckVan: 'Camionnette / Van',
      catSofa: 'Sofa / Meubles',
      catCarpet: 'Tapis & Escaliers',
      catMattress: 'Matelas',
      catHeavyTruck: 'Camion Poids Lourd',
      makeModelLabel: 'Description du véhicule ou des meubles *',
      makeModelPlaceholder: 'ex: Mazda CX-5 (2022) / Sofa sectionnel 4 places en tissu',
      packageLabel: 'Forfait ou prestation souhaitée',
      locationLabel: 'Lieu de service',
      mobileChoice: 'Service Mobile à Domicile (Drummondville & environs)',
      addressLabel: 'Votre adresse complète (rue, ville, code postal) *',
      addressPlaceholder: 'ex: 450 Rue Lindsay, Drummondville, QC',
      dateLabel: 'Date souhaitée *',
      timeSlotLabel: 'Créneau horaire souhaité',
      slotMorning: 'Matin (8h00 - 12h00)',
      slotAfternoon: 'Après-midi (13h00 - 17h00)',
      slotFlexible: 'Flexible / À convenir',
      nameLabel: 'Votre nom complet *',
      phoneLabel: 'Numéro de téléphone (SMS / Appel) *',
      emailLabel: 'Courriel',
      notesLabel: 'Détails particuliers (taches, poils d\'animaux, accès eau/courant...)',
      btnNext: 'Continuer',
      btnBack: 'Précédent',
      btnConfirm: 'Confirmer la réservation',
      successHeader: 'Demande de Rendez-vous Enregistrée !',
      successRef: 'Numéro de dossier :',
      successMsg: 'Max vous contactera dans les 30 minutes pour confirmer l\'horaire exact.',
      btnClose: 'Fermer',
      minNotice: 'Minimum de service à domicile : 100 $ (Déplacement inclus)'
    },
    ua: {
      modalTitle: 'Онлайн Бронювання з Виїздом Додому',
      step1: '1. Послуга та Обʼєкт',
      step2: '2. Адреса та Дата',
      step3: '3. Контакти',
      step4: '4. Підтвердження',
      catAuto: 'Легкове авто / Седан',
      catSuv: 'Кросовер / VUS',
      catTruckVan: 'Пікап / Вен',
      catSofa: 'Дивани та Меблі',
      catCarpet: 'Килими та Сходи',
      catMattress: 'Матраци',
      catHeavyTruck: 'Тягач / Вантажівка',
      makeModelLabel: 'Опис авто або меблів *',
      makeModelPlaceholder: 'напр: Mazda CX-5 / Кутовий диван із тканини',
      packageLabel: 'Бажаний пакет',
      locationLabel: 'Формат послуги',
      mobileChoice: 'Мобільний виїзд додому (Drummondville)',
      addressLabel: 'Ваша адреса (вулиця, місто) *',
      addressPlaceholder: 'напр: 450 Rue Lindsay, Drummondville, QC',
      dateLabel: 'Бажана дата *',
      timeSlotLabel: 'Бажаний час',
      slotMorning: 'Ранок (8:00 - 12:00)',
      slotAfternoon: 'День (13:00 - 17:00)',
      slotFlexible: 'Гнучкий графік',
      nameLabel: 'Ваше імʼя та прізвище *',
      phoneLabel: 'Номер телефону (SMS / Дзвінок) *',
      emailLabel: 'Email',
      notesLabel: 'Особливі побажання чи коментарі',
      btnNext: 'Далі',
      btnBack: 'Назад',
      btnConfirm: 'Підтвердити бронювання',
      successHeader: 'Заявку Успішно Створено !',
      successRef: 'Номер запису :',
      successMsg: 'Макс зателефонує вам протягом 30 хвилин для узгодження часу.',
      btnClose: 'Закрити',
      minNotice: 'Мінімальне замовлення з виїздом : 100 $ (Виїзд включено)'
    },
    en: {
      modalTitle: 'Mobile At-Home Service Booking',
      step1: '1. Service & Details',
      step2: '2. Address & Date',
      step3: '3. Contact Info',
      step4: '4. Confirmation',
      catAuto: 'Car / Sedan',
      catSuv: 'SUV / Crossover',
      catTruckVan: 'Truck / Van',
      catSofa: 'Sofa & Couches',
      catCarpet: 'Carpets & Stairs',
      catMattress: 'Mattress',
      catHeavyTruck: 'Semi-Truck / Heavy',
      makeModelLabel: 'Vehicle or Furniture description *',
      makeModelPlaceholder: 'e.g., Mazda CX-5 (2022) / 4-seater fabric sectional',
      packageLabel: 'Selected package',
      locationLabel: 'Service format',
      mobileChoice: 'Mobile At-Home Unit (Drummondville & area)',
      addressLabel: 'Your full address *',
      addressPlaceholder: 'e.g., 450 Rue Lindsay, Drummondville, QC',
      dateLabel: 'Preferred Date *',
      timeSlotLabel: 'Preferred Time Slot',
      slotMorning: 'Morning (8:00 AM - 12:00 PM)',
      slotAfternoon: 'Afternoon (1:00 PM - 5:00 PM)',
      slotFlexible: 'Flexible / To be confirmed',
      nameLabel: 'Full Name *',
      phoneLabel: 'Phone Number (SMS / Call) *',
      emailLabel: 'Email',
      notesLabel: 'Special notes (stains, pets, parking access...)',
      btnNext: 'Next',
      btnBack: 'Back',
      btnConfirm: 'Confirm Booking',
      successHeader: 'Booking Request Received !',
      successRef: 'Reference Number :',
      successMsg: 'Max will contact you within 30 minutes to confirm your appointment.',
      btnClose: 'Close',
      minNotice: 'Mobile service minimum: $100 (Travel included)'
    }
  }[currentLang];

  const handleNext = () => {
    if (step === 1) {
      if (!formData.vehicleMakeModel) {
        alert(currentLang === 'fr' ? 'Veuillez préciser le modèle ou les meubles à nettoyer.' : 'Please describe the items to clean.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.serviceAddress || !formData.preferredDate) {
        alert(currentLang === 'fr' ? 'Veuillez renseigner votre adresse et la date souhaitée.' : 'Please provide your address and date.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!formData.clientName || !formData.clientPhone) {
        alert(currentLang === 'fr' ? 'Veuillez renseigner votre nom et votre numéro de téléphone.' : 'Please provide your name and phone.');
        return;
      }
      const ref = 'MAX-' + Math.floor(100000 + Math.random() * 900000);
      setBookingRef(ref);
      setStep(4);
    }
  };

  const handleToggleExtra = (extraId: string) => {
    setFormData(prev => {
      const exists = prev.selectedExtras.includes(extraId);
      return {
        ...prev,
        selectedExtras: exists 
          ? prev.selectedExtras.filter(id => id !== extraId)
          : [...prev.selectedExtras, extraId]
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0C150F] border border-[#1E3623] rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-[#1A301E] flex items-center justify-between bg-[#101D13]">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#22C55E] font-bold block">
              MAXEXPERT360MOBILE
            </span>
            <h3 className="font-heading text-lg sm:text-xl font-black text-white uppercase">
              {t.modalTitle}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-[#142618] border border-[#223B27] text-[#9CA3AF] hover:text-white hover:border-[#22C55E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Header */}
        {step < 4 && (
          <div className="grid grid-cols-3 border-b border-[#1A301E] bg-[#0E1A11] text-[11px] font-mono font-bold text-center">
            <div className={`py-2.5 ${step === 1 ? 'text-[#22C55E] border-b-2 border-[#22C55E] bg-[#14291A]' : 'text-[#6B7280]'}`}>
              {t.step1}
            </div>
            <div className={`py-2.5 ${step === 2 ? 'text-[#22C55E] border-b-2 border-[#22C55E] bg-[#14291A]' : 'text-[#6B7280]'}`}>
              {t.step2}
            </div>
            <div className={`py-2.5 ${step === 3 ? 'text-[#22C55E] border-b-2 border-[#22C55E] bg-[#14291A]' : 'text-[#6B7280]'}`}>
              {t.step3}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* STEP 1: SERVICE & OBJECT */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase font-mono text-[#9CA3AF] mb-2">
                  Catégorie de service :
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'auto', label: t.catAuto, icon: '🚗' },
                    { id: 'suv', label: t.catSuv, icon: '🚙' },
                    { id: 'truck_van', label: t.catTruckVan, icon: '🛻' },
                    { id: 'sofa', label: t.catSofa, icon: '🛋️' },
                    { id: 'carpet', label: t.catCarpet, icon: '🟫' },
                    { id: 'mattress', label: t.catMattress, icon: '🛏️' },
                    { id: 'heavy_truck', label: t.catHeavyTruck, icon: '🚛' },
                    { id: 'commercial', label: 'Commercial', icon: '🏢' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, vehicleCategory: cat.id as VehicleCategory }))}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        formData.vehicleCategory === cat.id
                          ? 'bg-[#18301E] border-[#22C55E] text-white font-bold'
                          : 'bg-[#112115] border-[#1C3622] text-[#9CA3AF] hover:text-white'
                      }`}
                    >
                      <span className="text-base block">{cat.icon}</span>
                      <span className="text-[11px] block leading-tight mt-0.5">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase font-mono text-[#9CA3AF] mb-1.5">
                  {t.makeModelLabel}
                </label>
                <input 
                  type="text"
                  required
                  value={formData.vehicleMakeModel}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicleMakeModel: e.target.value }))}
                  placeholder={t.makeModelPlaceholder}
                  className="w-full bg-[#112115] border border-[#1C3622] rounded-xl px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase font-mono text-[#9CA3AF] mb-1.5">
                  {t.packageLabel}
                </label>
                <select
                  value={formData.packageId}
                  onChange={(e) => setFormData(prev => ({ ...prev, packageId: e.target.value }))}
                  className="w-full bg-[#112115] border border-[#1C3622] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#22C55E]"
                >
                  <option value="interieur_exterieur_express">Intérieur + Extérieur Express (dès 119 $)</option>
                  <option value="interieur_exterieur_complet">⭐ Intérieur + Extérieur Complet (Recommandé - dès 169 $)</option>
                  <option value="remise_a_neuf">🔥 Remise à Neuf Complète (dès 209 $)</option>
                  <option value="sofa_cleaning">Nettoyage Sofas & Meubles (dès 70 $)</option>
                  <option value="carpet_cleaning">Nettoyage Tapis & Escaliers (0,30 $/pi²)</option>
                  <option value="mattress_cleaning">Désinfection Matelas (dès 80 $)</option>
                  <option value="heavy_truck_cleaning">Cabine Poids Lourd / Semi-Truck (dès 220 $)</option>
                </select>
              </div>

              {/* Extra add-ons */}
              <div>
                <label className="block text-xs font-bold uppercase font-mono text-[#9CA3AF] mb-2">
                  Options & Suppléments éventuels :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EXTRA_SERVICES.map(extra => {
                    const isChecked = formData.selectedExtras.includes(extra.id);
                    return (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() => handleToggleExtra(extra.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isChecked ? 'bg-[#18301E] border-[#22C55E] text-white' : 'bg-[#112115] border-[#1C3622] text-[#9CA3AF]'
                        }`}
                      >
                        <span>{extra.name[currentLang]}</span>
                        <span className="font-mono text-[#22C55E] font-bold">+{extra.price} $</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ADDRESS & DATE */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-3 rounded-xl bg-[#112417] border border-[#22C55E]/40 text-xs text-[#86EFAC] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>{t.mobileChoice}</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase font-mono text-[#9CA3AF] mb-1.5">
                  {t.addressLabel}
                </label>
                <input 
                  type="text"
                  required
                  value={formData.serviceAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceAddress: e.target.value }))}
                  placeholder={t.addressPlaceholder}
                  className="w-full bg-[#112115] border border-[#1C3622] rounded-xl px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase font-mono text-[#9CA3AF] mb-1.5">
                    {t.dateLabel}
                  </label>
                  <input 
                    type="date"
                    required
                    value={formData.preferredDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                    className="w-full bg-[#112115] border border-[#1C3622] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#22C55E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase font-mono text-[#9CA3AF] mb-1.5">
                    {t.timeSlotLabel}
                  </label>
                  <select
                    value={formData.preferredTimeSlot}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredTimeSlot: e.target.value as any }))}
                    className="w-full bg-[#112115] border border-[#1C3622] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#22C55E]"
                  >
                    <option value="morning">{t.slotMorning}</option>
                    <option value="afternoon">{t.slotAfternoon}</option>
                    <option value="flexible">{t.slotFlexible}</option>
                  </select>
                </div>
              </div>

              <div className="text-[11px] text-[#9CA3AF] italic">
                {t.minNotice}
              </div>
            </div>
          )}

          {/* STEP 3: CONTACT COORDINATES */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase font-mono text-[#9CA3AF] mb-1.5">
                    {t.nameLabel}
                  </label>
                  <input 
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Jean Tremblay"
                    className="w-full bg-[#112115] border border-[#1C3622] rounded-xl px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#22C55E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase font-mono text-[#9CA3AF] mb-1.5">
                    {t.phoneLabel}
                  </label>
                  <input 
                    type="tel"
                    required
                    value={formData.clientPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                    placeholder="873-657-5102"
                    className="w-full bg-[#112115] border border-[#1C3622] rounded-xl px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#22C55E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase font-mono text-[#9CA3AF] mb-1.5">
                  {t.emailLabel}
                </label>
                <input 
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="jean@exemple.com"
                  className="w-full bg-[#112115] border border-[#1C3622] rounded-xl px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase font-mono text-[#9CA3AF] mb-1.5">
                  {t.notesLabel}
                </label>
                <textarea 
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ex: Taches de café sur les sièges avant, prise électrique disponible dans l'entrée de cour..."
                  className="w-full bg-[#112115] border border-[#1C3622] rounded-xl px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#22C55E] resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#142B1A] border-2 border-[#22C55E] flex items-center justify-center text-[#22C55E] mx-auto shadow-lg shadow-[#22C55E]/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="font-heading text-2xl font-black text-white uppercase">
                {t.successHeader}
              </h3>
              <div className="inline-block bg-[#112115] border border-[#22C55E]/40 px-4 py-2 rounded-xl text-xs font-mono text-[#86EFAC]">
                {t.successRef} <strong className="text-white font-bold">{bookingRef}</strong>
              </div>
              <p className="text-xs text-[#9CA3AF] max-w-md mx-auto leading-relaxed">
                {t.successMsg}
              </p>
              <div className="p-3.5 bg-[#0F1B12] border border-[#1A301E] rounded-xl text-left text-xs space-y-1.5 max-w-md mx-auto text-[#D1D5DB]">
                <div><strong>Client :</strong> {formData.clientName} ({formData.clientPhone})</div>
                <div><strong>Adresse :</strong> {formData.serviceAddress}</div>
                <div><strong>Date :</strong> {formData.preferredDate} ({formData.preferredTimeSlot})</div>
                <div><strong>Objet :</strong> {formData.vehicleMakeModel}</div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Controls */}
        <div className="p-5 sm:p-6 border-t border-[#1A301E] bg-[#101D13] flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2.5 rounded-xl bg-[#142618] hover:bg-[#1B3622] text-[#86EFAC] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-[#22C55E]/30"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.btnBack}</span>
            </button>
          ) : <div></div>}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-[#16A34A]/30"
            >
              <span>{t.btnNext}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : step === 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#15803D] hover:brightness-110 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-xl shadow-[#16A34A]/30 border border-[#86EFAC]/40"
            >
              <Check className="w-4 h-4" />
              <span>{t.btnConfirm}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-[#22C55E] text-black text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-[#16A34A] transition-colors"
            >
              {t.btnClose}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
