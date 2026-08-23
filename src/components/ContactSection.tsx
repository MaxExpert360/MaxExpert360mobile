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
      minNotice: 'Mobile service minimum: $100 (Travel included)'
    }
  }[currentLang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-16 sm:py-20 bg-[#080D09] text-white relative border-b border-[#1A261D]">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-[#22C55E] font-mono font-bold bg-[#112417] px-3.5 py-1 rounded-full border border-[#22C55E]/40">
            {t.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-white tracking-tight uppercase">
            {t.title}
          </h2>
          <p className="text-sm text-[#9CA3AF] font-normal leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Coordinates (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Direct Phone Lines Card */}
            <div className="bg-[#0C150F] border border-[#1E3623] rounded-2xl p-6 space-y-4 shadow-xl">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#22C55E] font-bold block">
                {t.directLines}
              </span>
              
              <div>
                <a
                  href={`tel:${DYNASTIE_INFO.phones[0].raw}`}
                  className="p-4 rounded-xl bg-[#112115] border border-[#1C3622] hover:border-[#22C55E] transition-colors flex items-center gap-3.5 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#18301E] flex items-center justify-center text-[#22C55E] group-hover:bg-[#22C55E] group-hover:text-black transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9CA3AF] uppercase font-mono block font-bold">Max • Appel direct & SMS</span>
                    <span className="font-mono text-base sm:text-lg font-black text-white group-hover:text-[#22C55E] transition-colors">
                      {DYNASTIE_INFO.phones[0].number}
                    </span>
                  </div>
                </a>
              </div>

              {/* Facebook & Email Links */}
              <div className="pt-3 border-t border-[#172B1B] space-y-2.5 text-xs text-[#D1D5DB]">
                <a 
                  href={DYNASTIE_INFO.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-2.5 text-[#60A5FA] hover:text-white transition-all p-2.5 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/40 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Facebook className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#93C5FD] uppercase font-mono block leading-tight">Page Facebook Officielle</span>
                      <span className="font-bold text-xs text-white group-hover:text-[#93C5FD] transition-colors">{DYNASTIE_INFO.facebook}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#60A5FA] group-hover:translate-x-0.5 transition-transform" />
                </a>

                <div className="flex items-center gap-2.5 text-[#9CA3AF] p-2 rounded-lg bg-[#101E14] border border-[#1B3320]">
                  <Mail className="w-4 h-4 text-[#22C55E]" />
                  <a href={`mailto:${DYNASTIE_INFO.email}`} className="hover:text-white transition-colors">
                    {DYNASTIE_INFO.email}
                  </a>
                </div>

                <div className="flex items-center gap-2.5 text-[#86EFAC] p-2 rounded-lg bg-[#101E14] border border-[#1B3320] font-mono font-bold">
                  <span className="text-sm">🌐</span>
                  <a href={DYNASTIE_INFO.websiteUrl} className="hover:underline">
                    {DYNASTIE_INFO.website}
                  </a>
                </div>

                <div className="flex items-center gap-2.5 text-[#9CA3AF] p-2 rounded-lg bg-[#101E14] border border-[#1B3320]">
                  <Clock className="w-4 h-4 text-[#22C55E]" />
                  <span>{DYNASTIE_INFO.workingHours[currentLang]}</span>
                </div>
              </div>
            </div>

            {/* Service Areas Pill list */}
            <div className="bg-[#0C150F] border border-[#1E3623] rounded-2xl p-6 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
                <Truck className="w-4 h-4 text-[#22C55E]" />
                <span>{t.coverageTitle}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {DYNASTIE_INFO.serviceAreas.map((city, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#112115] border border-[#1C3622] text-[#86EFAC]"
                  >
                    {city}
                  </span>
                ))}
              </div>
              <div className="pt-2 text-[11px] text-[#9CA3AF] italic">
                {t.minNotice}
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Quick Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-[#0C150F] border border-[#1E3623] rounded-2xl p-6 sm:p-8 shadow-xl">
              {submitted ? (
                <div className="text-center py-10 space-y-4 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-[#132A1B] border-2 border-[#22C55E] flex items-center justify-center text-[#22C55E] mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading text-2xl font-black text-white uppercase">
                    {t.successTitle}
                  </h3>
                  <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
                    {t.successMsg}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-lg bg-[#142618] border border-[#22C55E]/40 text-[#86EFAC] text-xs font-bold uppercase tracking-wider hover:bg-[#1B3622] transition-colors"
                  >
                    Envoyer une autre demande
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase font-bold text-[#9CA3AF] mb-1.5 font-mono">
                        {t.formName} *
                      </label>
                      <input 
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Jean Dupont"
                        className="w-full bg-[#101E14] border border-[#1C3622] rounded-xl px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#22C55E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase font-bold text-[#9CA3AF] mb-1.5 font-mono">
                        {t.formPhone} *
                      </label>
                      <input 
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="873-657-5102"
                        className="w-full bg-[#101E14] border border-[#1C3622] rounded-xl px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#22C55E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase font-bold text-[#9CA3AF] mb-1.5 font-mono">
                        {t.formService}
                      </label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                        className="w-full bg-[#101E14] border border-[#1C3622] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#22C55E]"
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
                      <label className="block text-[11px] uppercase font-bold text-[#9CA3AF] mb-1.5 font-mono">
                        {t.formAddress}
                      </label>
                      <input 
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Drummondville, St-Cyrille..."
                        className="w-full bg-[#101E14] border border-[#1C3622] rounded-xl px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#22C55E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-[#9CA3AF] mb-1.5 font-mono">
                      {t.formMsg}
                    </label>
                    <textarea 
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Ex: Nettoyage complet pour VUS Mazda CX-5 et sofa sectionnel en tissu..."
                      className="w-full bg-[#101E14] border border-[#1C3622] rounded-xl px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#22C55E] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#15803D] hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#16A34A]/25 border border-[#86EFAC]/40"
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
