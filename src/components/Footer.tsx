import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Sparkles, 
  Truck, 
  Facebook,
  Leaf,
  ArrowUp
} from 'lucide-react';
import { DYNASTIE_INFO } from '../data/dynastieData';
import { Language } from '../types';
import { MaxLogo } from './MaxLogo';

interface FooterProps {
  currentLang: Language;
}

export const Footer: React.FC<FooterProps> = ({ currentLang }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = {
    fr: {
      about: 'MaxExpert360mobile est votre spécialiste en nettoyage mobile professionnel à domicile à Drummondville et dans tout le Centre-du-Québec. Autos, camions lourds, sofas, tapis et matelas avec produits 100% écologiques.',
      punchline: '« Vous vous détendez, on s\'occupe du reste ! »',
      quickLinks: 'Navigation Rapide',
      services: 'Nos Spécialités',
      contactInfo: 'Coordonnées Directes',
      rights: 'Tous droits réservés.',
      legalNote: 'MaxExpert360mobile • Service mobile d\'esthétique automobile et de nettoyage résidentiel & commercial à domicile. Drummondville, QC.',
      srv1: 'Nettoyage Auto Intérieur & Extérieur',
      srv2: 'Sofas, Fauteuils & Sectionnels',
      srv3: 'Tapis, Moquettes & Escaliers',
      srv4: 'Matelas & Traitement Anti-Acariens',
      srv5: 'Cabines Camions Lourds & VR'
    },
    ua: {
      about: 'MaxExpert360mobile — ваш надійний експерт з мобільного клінінгу та детейлінгу з виїздом додому в Drummondville та регіоні. Авто, дивани, килими, матраци та тягачі з екологічними засобами.',
      punchline: '«Ви відпочиваєте — ми дбаємо про ідеальну чистоту!»',
      quickLinks: 'Швидка Навігація',
      services: 'Послуги',
      contactInfo: 'Контакти',
      rights: 'Всі права захищено.',
      legalNote: 'MaxExpert360mobile • Професійний мобільний сервіс у Drummondville, QC.',
      srv1: 'Комплексний детейлінг авто',
      srv2: 'Хімчистка диванів та меблів',
      srv3: 'Чистка килимів та сходів',
      srv4: 'Дезінфекція матраців',
      srv5: 'Хімчистка тягачів та кемперів'
    },
    en: {
      about: 'MaxExpert360mobile is your trusted mobile at-home detailing & deep cleaning specialist in Drummondville and Centre-du-Québec. Autos, heavy trucks, sofas, rugs and mattresses with 100% eco-friendly products.',
      punchline: '“You relax, we take care of the rest!”',
      quickLinks: 'Quick Links',
      services: 'Services',
      contactInfo: 'Direct Contacts',
      rights: 'All rights reserved.',
      legalNote: 'MaxExpert360mobile • Mobile at-home cleaning & detailing services. Drummondville, QC.',
      srv1: 'Auto Interior & Exterior Packages',
      srv2: 'Sofas, Couches & Sectionals',
      srv3: 'Area Rugs & Carpeted Stairs',
      srv4: 'Mattress Sanitization',
      srv5: 'Heavy Truck Cabs & RVs'
    }
  }[currentLang];

  return (
    <footer className="bg-[#0B2016] text-[#EAF6EE] pt-10 pb-24 border-t border-[#173D29]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-[#173D29]">
          
          {/* Brand Presentation (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            <MaxLogo size="sm" />

            <p className="text-xs text-[#A3C7B2] font-normal leading-relaxed max-w-sm">
              {t.about}
            </p>

            <div className="inline-block bg-[#122D20] border-l-2 border-[#16A34A] px-3 py-1.5 rounded-r">
              <span className="text-xs font-bold text-[#86EFAC] italic">
                {t.punchline}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-0.5 text-xs text-[#4ADE80]">
              <Leaf className="w-4 h-4 shrink-0" />
              <span className="text-[#C6ECCF] font-mono text-[10px]">Produits 100% écologiques • Sans danger pour enfants & animaux</span>
            </div>
          </div>

          {/* Quick links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading text-xs font-black text-white uppercase tracking-wider">
              {t.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs text-[#A3C7B2]">
              <li>
                <a href="#accueil" className="hover:text-[#4ADE80] transition-colors">Accueil</a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#4ADE80] transition-colors">Services</a>
              </li>
              <li>
                <a href="#taches-difficiles" className="hover:text-[#4ADE80] transition-colors">Taches difficiles</a>
              </li>
              <li>
                <a href="#avant-apres" className="hover:text-[#4ADE80] transition-colors">Avant / Après</a>
              </li>
              <li>
                <a href="#tarifs" className="hover:text-[#4ADE80] transition-colors">Tarifs & Calculateur</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#4ADE80] transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          {/* Core Services (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading text-xs font-black text-white uppercase tracking-wider">
              {t.services}
            </h4>
            <ul className="space-y-2 text-xs text-[#A3C7B2]">
              <li><a href="#services" className="hover:text-white transition-colors">{t.srv1}</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">{t.srv2}</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">{t.srv3}</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">{t.srv4}</a></li>
              <li><a href="#tarifs" className="hover:text-white transition-colors">{t.srv5}</a></li>
            </ul>
          </div>

          {/* Coordinates (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading text-xs font-black text-white uppercase tracking-wider">
              {t.contactInfo}
            </h4>
            <div className="space-y-2.5 text-xs text-[#A3C7B2]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#4ADE80] shrink-0 mt-0.5" />
                <span>{DYNASTIE_INFO.region} (Service Mobile)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                <span>{DYNASTIE_INFO.workingHours[currentLang]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                <a href={`tel:${DYNASTIE_INFO.phones[0].raw}`} className="font-mono text-white font-bold hover:text-[#4ADE80] transition-colors">
                  {DYNASTIE_INFO.phones[0].number}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Facebook className="w-3.5 h-3.5 text-[#60A5FA] shrink-0" />
                <a href={DYNASTIE_INFO.facebookUrl} target="_blank" rel="noreferrer" className="text-[#60A5FA] hover:text-[#93C5FD] transition-colors font-medium">
                  {DYNASTIE_INFO.facebook}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                <a href={`mailto:${DYNASTIE_INFO.email}`} className="text-white hover:text-[#4ADE80] transition-colors">
                  {DYNASTIE_INFO.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#4ADE80] font-bold text-xs">🌐</span>
                <a href={DYNASTIE_INFO.websiteUrl} className="text-[#86EFAC] hover:underline font-mono font-bold">
                  {DYNASTIE_INFO.website}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom micro copyright line */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#78A18B]">
          <p>
            © {new Date().getFullYear()} MaxExpert360mobile. {t.rights}
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-[#A3C7B2] hover:text-white transition-colors cursor-pointer"
          >
            <span>Haut de page</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#4ADE80]" />
          </button>
        </div>

      </div>
    </footer>
  );
};
