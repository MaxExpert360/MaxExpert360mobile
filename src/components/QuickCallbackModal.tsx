import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  Clock,
  Car
} from 'lucide-react';
import { DYNASTIE_INFO } from '../data/dynastieData';
import { Language } from '../types';

interface QuickCallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
}

export const QuickCallbackModal: React.FC<QuickCallbackModalProps> = ({
  isOpen,
  onClose,
  currentLang
}) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const t = {
    fr: {
      title: 'Rappel Rapide en 30 Minutes',
      subtitle: 'Laissez votre numéro pour que Max vous contacte directement pour échanger sur vos besoins.',
      nameLabel: 'Votre nom',
      phoneLabel: 'Votre numéro de téléphone (SMS ou Appel)',
      submitBtn: 'Demander mon rappel gratuit',
      successTitle: 'Demande Reçue !',
      successMsg: 'Max vous appellera sous peu pour échanger sur vos besoins.',
      directLinesTitle: 'Ou appelez directement :'
    },
    ua: {
      title: 'Швидкий Дзвінок за 30 Хвилин',
      subtitle: 'Залиште номер, і Макс зателефонує вам для консультації.',
      nameLabel: 'Ваше імʼя',
      phoneLabel: 'Номер телефону (SMS або дзвінок)',
      submitBtn: 'Замовити дзвінок майстра',
      successTitle: 'Запит Прийнято !',
      successMsg: 'Макс зателефонує вам найближчим часом для детальної консультації.',
      directLinesTitle: 'Або зателефонуйте прямо зараз :'
    },
    en: {
      title: 'Fast Callback within 30 Minutes',
      subtitle: 'Leave your phone number for Max to call you back directly.',
      nameLabel: 'Your name',
      phoneLabel: 'Phone number (Call or SMS)',
      submitBtn: 'Request Free Callback',
      successTitle: 'Request Received!',
      successMsg: 'Max will call you shortly to assist you.',
      directLinesTitle: 'Or call us right now :'
    }
  }[currentLang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0C150F] border border-[#1E3623] rounded-2xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative">
        
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#888] hover:text-white rounded-lg bg-[#142618] border border-[#223B27] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-[#142B1A] border-2 border-[#22C55E] text-[#22C55E] flex items-center justify-center mx-auto shadow-lg shadow-[#22C55E]/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-heading text-2xl font-black text-white uppercase">
              {t.successTitle}
            </h4>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              {t.successMsg}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-lg bg-[#22C55E] text-black font-bold text-xs uppercase tracking-wider"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#22C55E] font-bold block">
                MAXEXPERT360MOBILE
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-white uppercase">
                {t.title}
              </h3>
              <p className="text-xs text-[#9CA3AF]">
                {t.subtitle}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-[#9CA3AF] block font-bold">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Tremblay"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#112115] border border-[#1C3622] text-xs text-white placeholder-[#555] focus:border-[#22C55E] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-[#9CA3AF] block font-bold">
                  {t.phoneLabel} *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="873-657-5102"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#112115] border border-[#1C3622] text-xs text-white placeholder-[#555] focus:border-[#22C55E] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#15803D] hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#16A34A]/25 border border-[#86EFAC]/40"
            >
              <span>{t.submitBtn}</span>
            </button>

            <div className="pt-2 text-center">
              <span className="text-[10px] text-[#6B7280] block mb-1.5">{t.directLinesTitle}</span>
              <a
                href={`tel:${DYNASTIE_INFO.phones[0].raw}`}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#86EFAC] hover:text-white"
              >
                <Phone className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Max: {DYNASTIE_INFO.phones[0].number}</span>
              </a>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
