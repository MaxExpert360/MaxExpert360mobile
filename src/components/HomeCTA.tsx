import React from 'react';
import { Phone, Mail, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { MaxLogo } from './MaxLogo';
import { Language } from '../types';
import { DYNASTIE_INFO } from '../data/dynastieData';

interface HomeCTAProps {
  currentLang: Language;
  onOpenBooking: () => void;
}

export const HomeCTA: React.FC<HomeCTAProps> = ({
  currentLang,
  onOpenBooking
}) => {
  const t = {
    fr: {
      titlePart1: 'Prêt pour un nettoyage',
      titlePart2: 'professionnel ?',
      subtitle: 'Contactez-nous dès aujourd’hui !',
      description: 'Nous nous déplaçons directement chez vous avec notre unité mobile tout équipée à Drummondville et dans les environs.',
      bookBtn: 'RÉSERVER MAINTENANT',
      callBtn: '873-657-5102'
    },
    ua: {
      titlePart1: 'Готові до професійної',
      titlePart2: 'чистоти?',
      subtitle: 'Зв’яжіться з нами вже сьогодні!',
      description: 'Ми приїдемо безпосередньо до вас з повністю обладнаним мобільним юнітом у Драммондвілі та регіоні.',
      bookBtn: 'ЗАМОВИТИ ЗАРАЗ',
      callBtn: '873-657-5102'
    },
    en: {
      titlePart1: 'Ready for a truly professional',
      titlePart2: 'clean?',
      subtitle: 'Contact us today!',
      description: 'We travel directly to your location with our fully equipped mobile detailing unit in Drummondville and surrounding areas.',
      bookBtn: 'BOOK NOW',
      callBtn: '873-657-5102'
    }
  }[currentLang];

  return (
    <section className="py-8 sm:py-12 bg-[#0B1511] text-white relative border-t border-[#14261A] overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-[#43D322]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-[#07100D] border-2 border-[#1C3624] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
            
            {/* LEFT: Max Expert 360 Logo */}
            <div className="lg:col-span-3 flex justify-center lg:justify-start">
              <div className="p-3 rounded-xl bg-[#0B1511] border border-[#1C3624] shadow-inner">
                <MaxLogo size="md" showSubtitle={true} />
              </div>
            </div>

            {/* CENTER: Title and text */}
            <div className="lg:col-span-5 text-center lg:text-left space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight uppercase leading-tight text-white">
                {t.titlePart1} <br />
                <span className="text-[#43D322] drop-shadow-[0_2px_15px_rgba(67,211,34,0.3)]">
                  {t.titlePart2}
                </span>
              </h2>

              <p className="text-sm sm:text-base font-bold text-[#86EFAC]">
                {t.subtitle}
              </p>

              <p className="text-xs text-[#9CA3AF] max-w-md mx-auto lg:mx-0 leading-relaxed">
                {t.description}
              </p>
            </div>

            {/* RIGHT: Green phone button + Info + Booking */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end space-y-2.5">
              
              {/* GREEN BUTTON: ☎ 873-657-5102 */}
              <a 
                href="tel:+18736575102"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#43D322] hover:bg-[#2DB815] text-[#07100D] font-black text-sm font-mono tracking-wide shadow-md shadow-[#43D322]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-[#43D322]"
                title="Appelez MaxExpert360"
              >
                <Phone className="w-4 h-4 fill-[#07100D]" />
                <span>☎ {t.callBtn}</span>
              </a>

              {/* Booking Button */}
              <button
                type="button"
                onClick={onOpenBooking}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#0B1511] hover:bg-[#14261A] text-white border border-[#43D322] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:text-[#43D322]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#43D322]" />
                <span>{t.bookBtn}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Below: email & location */}
              <div className="pt-1 flex flex-col items-center lg:items-end space-y-0.5 text-xs text-[#9CA3AF]">
                <a 
                  href="mailto:maxexpert360@gmail.com" 
                  className="flex items-center gap-1.5 hover:text-[#43D322] transition-colors"
                >
                  <Mail className="w-3 h-3 text-[#43D322]" />
                  <span>maxexpert360@gmail.com</span>
                </a>
                <div className="flex items-center gap-1.5 text-[#86EFAC] text-[11px]">
                  <MapPin className="w-3 h-3 text-[#43D322]" />
                  <span>Drummondville et environs</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
