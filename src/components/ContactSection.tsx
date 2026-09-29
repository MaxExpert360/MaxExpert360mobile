import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Truck,
  Facebook,
  Car,
  ExternalLink
} from 'lucide-react';
import { DYNASTIE_INFO } from '../data/dynastieData';
import { Language } from '../types';

interface ContactSectionProps {
  currentLang: Language;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ currentLang }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceType: 'auto',
    address: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const t = {
    fr: {
      eyebrow: 'Contact & Prise de Rendez-vous',
      title: 'Nous Venons Chez Vous !',
      subtitle: 'Pour une soumission personnalisée, réserver une date de nettoyage à domicile ou poser vos questions.',
      coverageTitle: 'Secteur d\'Intervention Mobile',
      directLines: 'Ligne Directe & SMS',
      facebookTitle: 'Page Facebook Officielle',
      formName: 'Votre nom complet',
      formPhone: 'Téléphone (Appel / SMS)',
      formEmail: 'Courriel (optionnel)',
      formService: 'Type de service souhaité',
      formAddress: 'Votre ville ou adresse à Drummondville',
      formMsg: 'Précisez votre demande (modèle d\'auto, type de sofa, tapis...)',
      sendBtn: 'Envoyer ma demande de soumission',
      successTitle: 'Demande transmise avec succès !',
      successMsg: 'Max vous contactera d\'ici 30 minutes avec votre confirmation.',
      sendAnotherBtn: 'Envoyer une autre demande',
      minNotice: 'Minimum de service à domicile : 100 $ (Déplacement inclus)'
    },
    ua: {
      eyebrow: 'Контакти та Замовлення',
      title: 'Ми Приїжджаємо До Вас !',
      subtitle: 'Для індивідуального розрахунку, бронювання мобільного виїзду додому чи консультації.',
      coverageTitle: 'Зона Мобільного Обслуговування',
      directLines: 'Прямий Звʼязок & SMS',
      facebookTitle: 'Офіційна сторінка Facebook',
      formName: 'Ваше імʼя',
      formPhone: 'Номер телефону',
      formEmail: 'Email (за бажанням)',
      formService: 'Послуга, яка вас цікавить',
      formAddress: 'Ваше місто чи адреса в регіоні',
      formMsg: 'Деталі замовлення (модель авто, розмір дивану, площа килима...)',
      sendBtn: 'Надіслати заявку',
      successTitle: 'Запит успішно надіслано!',
      successMsg: 'Макс звʼяжеться з вами протягом 30 хвилин.',
      sendAnotherBtn: 'Надіслати ще одну заявку',
      minNotice: 'Мінімальне замовлення з виїздом : 100 $ (Виїзд включено)'
    },
    en: {
      eyebrow: 'Contact & Booking',
      title: 'We Come To Your Door !',
      subtitle: 'Get a custom quote, schedule a mobile at-home appointment or ask any question.',
      coverageTitle: 'Mobile Service Area',
      directLines: 'Direct Phone & SMS',
      facebookTitle: 'Official Facebook Page',
      formName: 'Full name',
      formPhone: 'Phone number',
      formEmail: 'Email (optional)',
      formService: 'Service of interest',
      formAddress: 'City or address in Drummondville area',
      formMsg: 'Describe what you need cleaned...',
      sendBtn: 'Submit Quote Request',
      successTitle: 'Request Sent Successfully!',
      successMsg: 'Max will follow up with you within 30 minutes.',
      sendAnotherBtn: 'Submit another request',
      minNotice: 'Mobile service minimum: $100 (Travel included)'
    }
  }[currentLang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-12 sm:py-16 bg-[#F4FAF6] text-[#122B1E] relative border-b border-[#D5EAD9] scroll-mt-16">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-[#15803D] font-mono font-bold bg-[#EAF6EE] px-3.5 py-1 rounded-full border border-[#BEE7CB] shadow-xs">
            {t.eyebrow}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-[#0D2818] tracking-tight uppercase">
            {t.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#3E6552] font-normal leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Coordinates (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Direct Phone Lines Card */}
            <div className="bg-white border border-[#D5EAD9] rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-xs">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#15803D] font-bold block">
                {t.directLines}
              </span>
              
              <div>
                <a
                  href={`tel:${DYNASTIE_INFO.phones[0].raw}`}
                  className="p-3.5 rounded-xl bg-[#F8FCF9] border border-[#D5EAD9] hover:border-[#16A34A] transition-all flex items-center gap-3.5 group shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] flex items-center justify-center text-[#15803D] group-hover:bg-[#16A34A] group-hover:text-white transition-colors shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#4F7A64] uppercase font-mono block font-bold">Max • Appel direct & SMS</span>
                    <span className="font-mono text-base sm:text-lg font-black text-[#0D2818] group-hover:text-[#16A34A] transition-colors">
                      {DYNASTIE_INFO.phones[0].number}
                    </span>
                  </div>
                </a>
              </div>

              {/* Facebook & Email Links */}
              <div className="pt-3 border-t border-[#EAF5ED] space-y-2 text-xs text-[#3E6552]">
                <a 
                  href={DYNASTIE_INFO.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-2 text-[#1877F2] hover:text-[#0b51ad] transition-all p-2.5 rounded-xl bg-[#F0F6FF] hover:bg-[#E2EDFF] border border-[#CFE2FE] group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Facebook className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div>
                      <span className="text-[9px] text-[#2563EB] uppercase font-mono block leading-tight font-bold">Page Facebook Officielle</span>
                      <span className="font-bold text-xs text-[#0D2818] group-hover:text-[#1877F2] transition-colors">{DYNASTIE_INFO.facebook}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#2563EB] group-hover:translate-x-0.5 transition-transform" />
                </a>

                <div className="flex items-center gap-2.5 text-[#3E6552] p-2.5 rounded-xl bg-[#F8FCF9] border border-[#D5EAD9]">
                  <Mail className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <a href={`mailto:${DYNASTIE_INFO.email}`} className="hover:text-[#0D2818] transition-colors font-medium">
                    {DYNASTIE_INFO.email}
                  </a>
                </div>

                <div className="flex items-center gap-2.5 text-[#15803D] p-2.5 rounded-xl bg-[#EAF6EE] border border-[#BEE7CB] font-mono font-bold text-xs">
                  <span className="text-sm">🌐</span>
                  <a href={DYNASTIE_INFO.websiteUrl} className="hover:underline">
                    {DYNASTIE_INFO.website}
                  </a>
                </div>

                <div className="flex items-center gap-2.5 text-[#3E6552] p-2.5 rounded-xl bg-[#F8FCF9] border border-[#D5EAD9]">
                  <Clock className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span className="font-medium">{DYNASTIE_INFO.workingHours[currentLang]}</span>
                </div>
              </div>
            </div>

            {/* Service Areas Pill list */}
            <div className="bg-white border border-[#D5EAD9] rounded-2xl p-5 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-black text-[#0D2818] uppercase">
                <Truck className="w-4 h-4 text-[#16A34A]" />
                <span>{t.coverageTitle}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {DYNASTIE_INFO.serviceAreas.map((city, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#EAF6EE] border border-[#BEE7CB] text-[#15803D] font-bold"
                  >
                    {city}
                  </span>
                ))}
              </div>
              <div className="pt-1.5 text-[10px] text-[#4F7A64] italic">
                {t.minNotice}
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Quick Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#D5EAD9] rounded-2xl p-5 sm:p-7 shadow-xs">
              {submitted ? (
                <div className="text-center py-10 space-y-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-[#EAF6EE] border-2 border-[#16A34A] flex items-center justify-center text-[#16A34A] mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-xl font-black text-[#0D2818] uppercase">
                    {t.successTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3E6552] max-w-md mx-auto">
                    {t.successMsg}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#EAF6EE] border border-[#BEE7CB] text-[#15803D] text-xs font-black uppercase tracking-wider hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
                  >
                    {t.sendAnotherBtn}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#4F7A64] mb-1 font-mono">
                        {t.formName} *
                      </label>
                      <input 
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Jean Dupont"
                        className="w-full bg-[#F8FCF9] border border-[#D5EAD9] rounded-xl px-3.5 py-2.5 text-xs text-[#0D2818] placeholder-[#8BAAA0] focus:outline-none focus:border-[#16A34A] focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#4F7A64] mb-1 font-mono">
                        {t.formPhone} *
                      </label>
                      <input 
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="873-657-5102"
                        className="w-full bg-[#F8FCF9] border border-[#D5EAD9] rounded-xl px-3.5 py-2.5 text-xs text-[#0D2818] placeholder-[#8BAAA0] focus:outline-none focus:border-[#16A34A] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#4F7A64] mb-1 font-mono">
                        {t.formService}
                      </label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                        className="w-full bg-[#F8FCF9] border border-[#D5EAD9] rounded-xl px-3.5 py-2.5 text-xs text-[#0D2818] focus:outline-none focus:border-[#16A34A] focus:bg-white transition-colors cursor-pointer"
                      >
                        <option value="auto">🚗 Esthétique Automobile</option>
                        <option value="sofa">🛋️ Sofas & Divans</option>
                        <option value="carpet">🟫 Tapis & Escaliers</option>
                        <option value="mattress">🛏️ Matelas & Désinfection</option>
                        <option value="truck">🚛 Camions Poids Lourds</option>
                        <option value="commercial">🏢 Nettoyage Commercial</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#4F7A64] mb-1 font-mono">
                        {t.formAddress}
                      </label>
                      <input 
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Drummondville, St-Cyrille..."
                        className="w-full bg-[#F8FCF9] border border-[#D5EAD9] rounded-xl px-3.5 py-2.5 text-xs text-[#0D2818] placeholder-[#8BAAA0] focus:outline-none focus:border-[#16A34A] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#4F7A64] mb-1 font-mono">
                      {t.formMsg}
                    </label>
                    <textarea 
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Ex: Nettoyage complet pour VUS Mazda CX-5 et sofa sectionnel en tissu..."
                      className="w-full bg-[#F8FCF9] border border-[#D5EAD9] rounded-xl px-3.5 py-2.5 text-xs text-[#0D2818] placeholder-[#8BAAA0] focus:outline-none focus:border-[#16A34A] focus:bg-white transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#16A34A]/25 border border-[#16A34A]"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t.sendBtn}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
