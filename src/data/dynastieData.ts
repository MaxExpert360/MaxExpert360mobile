import { 
  DetailingPackage, 
  DetailingServiceItem, 
  ExtraDetailingService, 
  BeforeAfterAutoItem, 
  AutoReviewItem, 
  DetailingFaqItem 
} from '../types';

import carInteriorDirty from '../assets/images/car_interior_dirty_1787363587019.jpg';
import carInteriorClean from '../assets/images/car_interior_clean_1787363600214.jpg';
import sofaDirty from '../assets/images/sofa_dirty_1787363609878.jpg';
import sofaClean from '../assets/images/sofa_clean_1787363621465.jpg';
import carFloorDirty from '../assets/images/car_floor_dirty_1787363633146.jpg';
import carFloorClean from '../assets/images/car_floor_clean_1787363645656.jpg';
import truckCabDirty from '../assets/images/truck_cab_dirty_1787363991231.jpg';
import truckCabClean from '../assets/images/truck_cab_clean_1787364002946.jpg';

export const DYNASTIE_INFO = {
  name: 'MaxExpert360mobile',
  displayName: 'MAX EXPERT 360 MOBILE',
  tagline: 'Nettoyage mobile professionnel • Nous venons chez vous !',
  secondaryTagline: 'Vous vous détendez, on s\'occupe du reste !',
  region: 'Drummondville & régions environnantes',
  address: 'Drummondville & Centre-du-Québec, QC',
  googleMapsUrl: 'https://maps.google.com/?q=Drummondville+QC',
  phones: [
    { name: 'Max', number: '873-657-5102', raw: '+18736575102' }
  ],
  email: 'maxexpert360@gmail.com',
  website: 'maxexpert360.ca',
  websiteUrl: 'https://maxexpert360.ca',
  facebook: 'MaxExpert360 Mobile',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61591249901797',
  squareBooking: {
    enabled: true,
    bookingUrl: 'https://squareup.com/appointments/book/maxexpert360',
    siteUrl: 'https://maxexpert360.square.site',
    locationId: 'LOC_MAXEXPERT360_DRUMMONDVILLE',
    merchantName: 'MaxExpert360 Mobile',
    currency: 'CAD'
  },
  minimumMobileService: 0,
  workingHours: {
    fr: '7j/7 : 07:30 - 20:00 • Service mobile à domicile et en entreprise',
    ua: '7 днів на тиждень : 07:30 - 20:00 • Виїзне мобільне обслуговування',
    en: '7 days a week : 07:30 - 20:00 • Mobile service at home & business'
  },
  serviceAreas: [
    'Drummondville', 'Saint-Cyrille-de-Wendover', 'Saint-Germain-de-Grantham',
    'Saint-Majorique', 'Saint-Lucien', 'Wickham', 'L\'Avenir', 
    'Notre-Dame-du-Bon-Conseil', 'Saint-Bonaventure', 'Sainte-Brigitte-des-Saults',
    'Centre-du-Québec & environs'
  ],
  guarantees: {
    fr: [
      'Résultats professionnels',
      'Produits 100% écologiques',
      'Sécuritaire pour enfants et animaux',
      'Extraction à l\'eau chaude',
      'Séchage ultra-rapide',
      'Satisfaction garantie'
    ],
    ua: [
      'Професійний результат',
      '100% екологічні засоби',
      'Безпечно для дітей та тварин',
      'Екстракція гарячою водою',
      'Швидке висихання',
      'Гарантія якості'
    ],
    en: [
      'Professional results',
      '100% eco-friendly products',
      'Safe for kids and pets',
      'Hot water extraction',
      'Fast drying time',
      'Satisfaction guaranteed'
    ]
  }
};

export const DETAILING_PACKAGES: DetailingPackage[] = [
  {
    id: 'express',
    title: {
      fr: 'Intérieur + Extérieur Express',
      ua: 'Експрес: Салон + Кузов',
      en: 'Express Interior + Exterior'
    },
    tagline: {
      fr: 'Nettoyage complet efficace pour un entretien régulier impeccable',
      ua: 'Швидка та якісна комплексна мийка для щоденного догляду',
      en: 'Fast, efficient complete wash for regular maintenance'
    },
    badge: {
      fr: 'Entretien Rapide',
      ua: 'Швидкий Догляд',
      en: 'Quick Wash'
    },
    popular: false,
    prices: {
      auto: 99,
      suv: 119,
      truck_van: 139
    },
    duration: {
      fr: '1.5 - 2 heures',
      ua: '1.5 - 2 години',
      en: '1.5 - 2 hours'
    },
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1000&q=80',
    features: {
      fr: [
        'Aspiration complète de l\'habitacle',
        'Nettoyage soigné des plastiques intérieurs',
        'Tableau de bord et console centrale',
        'Nettoyage des vitres intérieures et extérieures',
        'Nettoyage des tapis de sol',
        'Finition et désodorisation intérieure',
        'Lavage extérieur complet de la carrosserie',
        'Nettoyage des roues et des pneus',
        'Séchage méticuleux de la carrosserie'
      ],
      ua: [
        'Повне пилососіння салону',
        'Очищення пластикових поверхонь',
        'Торпедо та центральна консоль',
        'Миття внутрішніх та зовнішніх вікон',
        'Очищення килимків для підлоги',
        'Фінішна обробка та освіження салону',
        'Повна зовнішня мийка кузова',
        'Очищення колісних дисків та шин',
        'Акуратне сушіння кузова'
      ],
      en: [
        'Complete interior vacuuming',
        'Interior plastics wiping and care',
        'Dashboard and center console cleaning',
        'Interior and exterior streak-free windows',
        'Floor mats deep cleaning',
        'Interior finishing & fresh scent',
        'Full exterior body wash',
        'Wheels and tires cleaning',
        'Meticulous body drying'
      ]
    }
  },
  {
    id: 'complet',
    title: {
      fr: 'Intérieur + Extérieur Complet',
      ua: 'Повний Комплекс: Салон + Кузов',
      en: 'Complete Interior + Exterior'
    },
    tagline: {
      fr: 'Le choix recommandé pour un nettoyage complet avec extraction en profondeur',
      ua: 'Найкращий вибір: глибока хімчистка екстрактором сидінь та кузов',
      en: 'Recommended choice for complete detailing with deep hot water extraction'
    },
    badge: {
      fr: 'Le Choix Recommandé ★',
      ua: 'Хіт Замовлень ★',
      en: 'Recommended Choice ★'
    },
    popular: true,
    prices: {
      auto: 149,
      suv: 179,
      truck_van: 209
    },
    duration: {
      fr: '3 - 4 heures',
      ua: '3 - 4 години',
      en: '3 - 4 hours'
    },
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1000&q=80',
    features: {
      fr: [
        'Aspiration en profondeur de tout le véhicule',
        'Nettoyage et dégraissage des plastiques',
        'Tableau de bord, console et panneaux de portes',
        'Vitres intérieures & extérieures sans traces',
        'Nettoyage en profondeur des tapis',
        'Extraction des sièges en tissu à l\'eau chaude',
        'Extraction de la moquette et du plancher',
        'Traitement ciblé des taches tenaces',
        'Finition intérieure protectrice',
        'Lavage extérieur complet de la carrosserie',
        'Nettoyage en profondeur des roues et pneus',
        'Séchage minutieux de la carrosserie'
      ],
      ua: [
        'Глибоке пилососіння всього автомобіля',
        'Очищення та знежирення пластику',
        'Панель приладів, консоль та карти дверей',
        'Миття скла всередині та зовні без розводів',
        'Глибоке очищення килимів',
        'Екстракція тканинних сидінь гарячою водою',
        'Екстракція підлогового покриття та ковроліну',
        'Локальне видалення вʼїдених плям',
        'Захисна фінішна обробка пластику',
        'Повна зовнішня мийка кузова',
        'Глибоке очищення дисків та шин',
        'Ретельне сушіння кузова'
      ],
      en: [
        'Deep thorough vehicle vacuuming',
        'Plastics deep cleaning and degreasing',
        'Dashboard, console and door cards',
        'Crystal-clear interior & exterior windows',
        'Deep carpet cleaning',
        'Hot water extraction on fabric seats',
        'Deep floor carpet extraction',
        'Targeted stubborn stain removal',
        'Interior protective matte finish',
        'Full comprehensive exterior wash',
        'Deep wheels and tire cleaning',
        'Meticulous scratch-free drying'
      ]
    }
  },
  {
    id: 'remise_a_neuf',
    title: {
      fr: 'Remise à Neuf (Intérieur + Extérieur)',
      ua: 'Повна Реновація «Як Новий»',
      en: 'Deep Rejuvenation (In & Out)'
    },
    tagline: {
      fr: 'Restauration intensive pour véhicules très sales ou fortement contaminés',
      ua: 'Максимальне відновлення для сильно забруднених авто та після сезону',
      en: 'Intensive restoration for heavily soiled or contaminated vehicles'
    },
    badge: {
      fr: 'Transformation Totale 🔥',
      ua: 'Повне Відновлення 🔥',
      en: 'Total Transformation 🔥'
    },
    popular: false,
    prices: {
      auto: 199,
      suv: 239,
      truck_van: 269
    },
    duration: {
      fr: '4 - 6 heures',
      ua: '4 - 6 годин',
      en: '4 - 6 hours'
    },
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80',
    features: {
      fr: [
        'Nettoyage intérieur complet intensif',
        'Extraction intensive multi-passes à l\'eau chaude',
        'Traitement des taches tenaces et incrustées',
        'Lavage extérieur complet & décontamination de surface',
        'Nettoyage en profondeur des tapis et sièges',
        'Travail supplémentaire sur les zones fortement contaminées',
        'Nettoyage des roues, jantes et pneus avec brillant protecteur',
        'Séchage complet de la carrosserie',
        'Désinfection et assainissement complet de l\'habitacle'
      ],
      ua: [
        'Інтенсивне повне очищення інтерʼєру',
        'Багатопрохідна екстракція гарячою водою під тиском',
        'Спеціальна хімія проти складних плям',
        'Повна зовнішня мийка та деконтамінація',
        'Глибоке очищення сидінь та підлоги',
        'Додаткова увага до сильно забруднених зон',
        'Очищення дисків та консервація шин захисним блиском',
        'Повне сушіння кузова',
        'Антибактеріальна обробка та дезінфекція салону'
      ],
      en: [
        'Intensive complete interior restoration',
        'Multi-pass hot water extraction',
        'Heavy stubborn stain treatments',
        'Full exterior wash & surface decontamination',
        'Deep cleaning of all carpets, floor mats & seats',
        'Extra focused work on heavily contaminated areas',
        'Deep rim & tire cleaning with protective satin dressing',
        'Complete streak-free vehicle drying',
        'Cabin sanitization & bacterial treatment'
      ]
    }
  }
];

export const FURNITURE_SERVICES = [
  { id: 'fauteuil', name: { fr: 'Fauteuil 1 place', ua: 'Крісло 1-місне', en: 'Armchair (1 seat)' }, price: 70 },
  { id: 'causeuse', name: { fr: 'Causeuse 2 places', ua: 'Диван 2-місний', en: 'Loveseat (2 seats)' }, price: 100 },
  { id: 'sofa_3', name: { fr: 'Sofa standard 3 places', ua: 'Диван стандарт 3-місний', en: 'Standard 3-seat sofa' }, price: 130 },
  { id: 'sectionnel_l', name: { fr: 'Divan sectionnel en L', ua: 'Кутовий диван (L-форма)', en: 'L-Shape Sectional Sofa' }, price: 170 },
  { id: 'sectionnel_u', name: { fr: 'Divan sectionnel en U / XL', ua: 'Великий диван (U-форма / XL)', en: 'U-Shape / XL Sectional' }, price: 210 },
  { id: 'chaise_salle', name: { fr: 'Chaise de salle à manger', ua: 'Обідній стілець', en: 'Dining Chair' }, price: 20 }
];

export const CARPET_SERVICES = [
  { 
    id: 'tapis_pi2', 
    name: { fr: 'Tapis & Moquette au pi²', ua: 'Килими та ковролін за кв. фут', en: 'Carpet per sq.ft' }, 
    pricePerSqFt: 0.40,
    description: { 
      fr: '0,40 $ / pi² (minimum 40 $ pour une petite surface)', 
      ua: '0,40 $ / кв. фут (мінімум 40 $ для малої площі)', 
      en: '$0.40 / sq.ft ($40 minimum for a small area)' 
    } 
  },
  { 
    id: 'marche_tapissee', 
    name: { fr: 'Marche d’escalier moquettée', ua: 'Килимова сходинка', en: 'Carpeted stair step' }, 
    price: 4,
    description: { 
      fr: '4 $ / marche (palier en supplément)', 
      ua: '4 $ / сходинка (площадка окремо)', 
      en: '$4 / stair step (landing extra)' 
    } 
  }
];

export const MATTRESS_SERVICES = [
  { id: 'matelas_simple', name: { fr: 'Matelas Simple (Twin)', ua: 'Матрац Односпальний (Twin)', en: 'Twin Mattress' }, price: 80 },
  { id: 'matelas_double', name: { fr: 'Matelas Double / Full', ua: 'Матрац Полуторний (Double)', en: 'Full/Double Mattress' }, price: 100 },
  { id: 'matelas_queen', name: { fr: 'Matelas Queen', ua: 'Матрац Queen Size', en: 'Queen Mattress' }, price: 120 },
  { id: 'matelas_king', name: { fr: 'Matelas King', ua: 'Матрац King Size', en: 'King Mattress' }, price: 150 },
  { id: 'siege_auto_bebe', name: { fr: 'Siège d\'auto enfant / bébé', ua: 'Дитяче автокрісло', en: 'Baby / Child Car Seat' }, price: 25 }
];

export const TRUCK_RV_SERVICES = [
  { 
    id: 'camion_couchette', 
    name: { fr: 'Camion Lourd - Cabine de dormeur complète', ua: 'Тягач - Спальна кабіна повна', en: 'Semi-Truck - Full Sleeper Cab' }, 
    priceFrom: '220 $ - 280 $',
    description: { fr: 'Couchette, sièges, tapis, tableau de bord et désinfection thermique', ua: 'Спальне місце, сидіння, підлога, торпедо та дезінфекція', en: 'Sleeper berth, seats, floor mats, dash & full sanitization' } 
  },
  { 
    id: 'camion_jour', 
    name: { fr: 'Camion Lourd - Cabine de jour (Day Cab)', ua: 'Тягач - Денна кабіна (Day Cab)', en: 'Semi-Truck - Day Cab' }, 
    priceFrom: '140 $ - 180 $',
    description: { fr: 'Sièges chauffeur/passager, plancher, vitres et tableau de bord', ua: 'Сидіння водія/пасажира, підлога, скло та панель', en: 'Seats, floor, windows, dashboard & plastics' } 
  },
  { 
    id: 'vr_motorise', 
    name: { fr: 'VR & Motorisé (Véhicule Récréatif)', ua: 'VR та Кемпери (Будинки на колесах)', en: 'RVs & Motorhomes' }, 
    priceFrom: 'À partir de 180 $',
    description: { fr: 'Habitacle complet, banquettes, lits et moquettes sur devis', ua: 'Повна хімчистка салону, диванів та спальних зон за оцінкою', en: 'Complete interior, dinette booths, beds & flooring' } 
  }
];

export const COMMERCIAL_SERVICES = [
  { 
    id: 'bureaux_chaises', 
    name: { fr: 'Chaises de bureau & Fauteuils corporatifs', ua: 'Офісні крісла та стільці', en: 'Office & Task Chairs' }, 
    priceUnit: { fr: '15 $ - 25 $ / unité', ua: '15 $ - 25 $ / шт', en: '$15 - $25 / unit' },
    description: { fr: 'Tarif dégressif selon la quantité d\'unités en entreprise', ua: 'Знижка від кількості крісел у бізнес-центрі чи офісі', en: 'Volume discount for corporate batches' } 
  },
  { 
    id: 'banquettes_resto', 
    name: { fr: 'Banquettes de restaurant & Hôtellerie', ua: 'Ресторанні диванчики та готелі', en: 'Restaurant Booths & Hospitality' }, 
    priceUnit: { fr: 'Sur soumission', ua: 'За оцінкою', en: 'Custom Quote' },
    description: { fr: 'Dégraissage intensif et élimination des odeurs', ua: 'Інтенсивне знежирення та знищення плям і запахів', en: 'Heavy degreasing and stain extraction' } 
  },
  { 
    id: 'moquette_commerciale', 
    name: { fr: 'Tapis & Moquettes de bureaux / corridors', ua: 'Комерційний ковролін та коридори', en: 'Commercial Carpet & Corridors' }, 
    priceUnit: { fr: '0,25 $ - 0,35 $ / pi²', ua: '0,25 $ - 0,35 $ / кв. фут', en: '$0.25 - $0.35 / sq.ft' },
    description: { fr: 'Nettoyage en dehors des heures d\'ouverture pour zéro perturbation', ua: 'Виїзд у неробочі години для комфорту вашого бізнесу', en: 'After-hours service for zero business downtime' } 
  }
];

export const RESIDENTIAL_FURNITURE_SERVICES: DetailingServiceItem[] = [
  {
    id: 'sofas_meubles',
    title: {
      fr: 'Divans, Sofas & Meubles Rembourrés',
      ua: 'Дивани, Софи та Мʼякі Меблі',
      en: 'Sofas, Couches & Upholstered Furniture'
    },
    shortDesc: {
      fr: 'Nettoyage en profondeur par injection-extraction : divans, causeuses, fauteuils et chaises.',
      ua: 'Глибока хімчистка диванів, куточків, крісел та стільців екстрактором.',
      en: 'Deep hot water injection-extraction for couches, loveseats, armchairs and chairs.'
    },
    fullDesc: {
      fr: 'Élimination des taches de nourriture, boissons, sébum, poussières et odeurs incrustées. Nos produits écologiques sont 100% sécuritaires pour vos enfants et vos animaux de compagnie.',
      ua: 'Видалення плям від напоїв, їжі, засаленості та неприємних запахів. Безпечна екологічна хімія для вашої родини.',
      en: 'Eliminates food spills, drink stains, oils, embedded dust and pet odors with non-toxic eco solutions.'
    },
    priceStart: 70,
    priceUnit: 'par meuble',
    iconName: 'Armchair',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
    subcategories: {
      fr: ['Divans (2, 3, 4 places)', 'Divans sectionnels en L / U', 'Causeuses & Fauteuils', 'Chaises de salle à manger', 'Meubles rembourrés divers'],
      ua: ['Дивани (2, 3, 4 місні)', 'Кутові секційні дивани', 'Крісла та софи', 'Обідні стільці', 'Пуфи та узголівʼя ліжка'],
      en: ['Couches (2, 3, 4 seaters)', 'Sectional L/U Sofas', 'Loveseats & Armchairs', 'Dining room chairs', 'Ottomans & headboards']
    },
    highlights: {
      fr: [
        'Extraction à l\'eau chaude haute puissance',
        'Élimination des odeurs et bactéries',
        'Séchage rapide en quelques heures',
        'Produits écologiques inoffensifs'
      ],
      ua: [
        'Екстракція гарячою водою під високим тиском',
        'Знищення запахів та бактерій',
        'Швидке висихання за лічені години',
        'Екологічні гіпоалергенні засоби'
      ],
      en: [
        'High-powered hot water extraction',
        'Complete odor and bacteria elimination',
        'Fast drying within a few hours',
        'Child & pet safe eco detergents'
      ]
    }
  },
  {
    id: 'tapis_moquettes',
    title: {
      fr: 'Tapis & Moquettes (Résidentiel & Commercial)',
      ua: 'Килими та Ковролін (Дім і Офіс)',
      en: 'Carpets & Area Rugs (Home & Business)'
    },
    shortDesc: {
      fr: 'Nettoyage en profondeur au pied carré ou par escalier pour éliminer la saleté incrustée.',
      ua: 'Глибока хімчистка за квадратний фут або сходів від бруду та плям.',
      en: 'Deep pile cleansing per square foot or staircase to remove heavy grime.'
    },
    fullDesc: {
      fr: 'Nous redonnons éclat et douceur à vos tapis décoratifs, moquettes murales et marches d\'escaliers avec notre système d\'extraction à l\'eau chaude qui élimine les acariens et les allergènes.',
      ua: 'Повертаємо свіжість та яскравість килимам, ковроліну та сходовим маршам, нейтралізуючи кліщів та пил.',
      en: 'Restore colors and soft fibers on your area rugs, wall-to-wall carpeting and stairs.'
    },
    priceStart: 0.30,
    priceUnit: '0,30 $ / pi²',
    iconName: 'Layers',
    image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1000&q=80',
    subcategories: {
      fr: ['Tapis de salon & carpettes (à partir de 0,30 $/pi²)', 'Moquettes complètes de chambres/maison', 'Escaliers moquettés (à partir de 120 $)', 'Tapis d\'entrée & passages'],
      ua: ['Килими у вітальнях (від 0,30 $/кв. фут)', 'Ковролін у спальнях та коридорах', 'Килимові сходи (від 120 $)', 'Вхідні та приліжкові килимки'],
      en: ['Living room area rugs (from $0.30 / sq ft)', 'Wall-to-wall room carpets', 'Carpeted staircases (from $120)', 'Entry runners & hallway rugs']
    },
    highlights: {
      fr: [
        'Tarif avantageux à partir de 0,30 $ / pi²',
        'Escaliers à partir de 120 $',
        'Désinfection thermique en profondeur',
        'Ravive les fibres et couleurs d\'origine'
      ],
      ua: [
        'Вигідна ціна від 0,30 $ / кв. фут',
        'Сходи від 120 $ за комплекс',
        'Глибока термічна дезінфекція',
        'Оновлення структури ворсу'
      ],
      en: [
        'Affordable starting at $0.30 / sq ft',
        'Stairs starting from $120',
        'Deep thermal disinfection',
        'Revitalizes fiber spring & original colors'
      ]
    }
  },
  {
    id: 'matelas',
    title: {
      fr: 'Matelas & Désinfection Anti-Acariens',
      ua: 'Матраци та Антиалергенна Дезінфекція',
      en: 'Mattresses & Dust Mite Sanitization'
    },
    shortDesc: {
      fr: 'Désinfection thermique, élimination des acariens, allergènes, sueur et taches.',
      ua: 'Термодезінфекція, знищення кліщів, алергенів, слідів поту та плям.',
      en: 'Thermal sanitization, dust mite removal, allergen extraction and spot clearing.'
    },
    fullDesc: {
      fr: 'Un nettoyage essentiel pour votre santé respiratoire et un sommeil sain. Élimine les cellules mortes, acariens, bactéries et odeurs résiduelles.',
      ua: 'Необхідна гігієна для здорового сну та дихання. Повне знезараження від пилових кліщів та бактерій.',
      en: 'Essential hygiene for healthy sleep and respiratory comfort. Clears dead skin, allergens and moisture stains.'
    },
    priceStart: 80,
    priceUnit: 'par matelas',
    iconName: 'Bed',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
    subcategories: {
      fr: ['Matelas Simple / Double', 'Matelas Queen', 'Matelas King', 'Sièges d\'auto pour enfants / bébés'],
      ua: ['Односпальні та полуторні матраци', 'Матраци Queen Size', 'Матраци King Size', 'Дитячі автокрісла'],
      en: ['Twin / Double Mattresses', 'Queen Mattresses', 'King Mattresses', 'Child / Baby Car Seats']
    },
    highlights: {
      fr: [
        'Désinfection en profondeur',
        'Élimination des acariens et allergènes',
        'Extraction des taches et odeurs',
        'Séchage rapide et assainissement'
      ],
      ua: [
        'Глибока дезінфекція структури',
        'Знищення алергенів та пилових кліщів',
        'Виведення плям та запаху поту',
        'Безпечні для шкіри матеріали'
      ],
      en: [
        'Deep thermal disinfection',
        'Dust mites and allergens eradicated',
        'Odor and biological spot removal',
        'Rapid drying and air freshening'
      ]
    }
  },
  {
    id: 'camions_vr',
    title: {
      fr: 'Camions Poids Lourds, VR & Motorisés',
      ua: 'Вантажні Тягачі, Кемпери та VR',
      en: 'Heavy Trucks, RVs & Motorhomes'
    },
    shortDesc: {
      fr: 'Nettoyage intérieur et extérieur grand format pour cabines de camions, roulottes et VR.',
      ua: 'Комплексний детейлінг кабін вантажівок, житлових модулів та будинків на колесах.',
      en: 'Large format interior and exterior detailing for semi-truck cabs, campers and RVs.'
    },
    fullDesc: {
      fr: 'Service mobile direct chez les transporteurs, stationnements ou résidences. Nettoyage de la couchette, sièges, tableau de bord et lavage carrosserie grand gabarit.',
      ua: 'Мобільний виїзд до автопарків або додому. Хімчистка спальних місць, сидінь та мийка кабін.',
      en: 'On-site mobile service at transport yards, parking lots or residential driveways.'
    },
    priceStart: 180,
    priceUnit: 'sur estimation',
    iconName: 'Truck',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1000&q=80',
    highlights: {
      fr: [
        'Cabines de semi-remorques & camions',
        'VR, Roulottes & Motorisés toutes tailles',
        'Désinfection couchette et habitacle',
        'Lavage extérieur haute pression'
      ],
      ua: [
        'Кабіни сідельних тягачів та фур',
        'Кемпери та житлові трейлери',
        'Хімчистка спальника та сидінь',
        'Митка кузова високим тиском'
      ],
      en: [
        'Semi-truck cabs & fleet tractors',
        'All-size motorhomes & campers',
        'Sleeper berth disinfection',
        'High-pressure exterior wash'
      ]
    }
  }
];

export const DETAILING_SERVICES = RESIDENTIAL_FURNITURE_SERVICES;

export const EXTRA_SERVICES: ExtraDetailingService[] = [
  {
    id: 'pet_hair',
    name: {
      fr: 'Poils d\'animaux (Extraction minutieuse)',
      ua: 'Видалення шерсті тварин',
      en: 'Pet hair removal (Deep extraction)'
    },
    price: 20,
    priceMax: 40,
    unit: { fr: 'supplément (+20$ à 40$)', ua: 'доплата (+20$ до 40$)', en: 'add-on (+20$ to 40$)' },
    iconName: 'Dog',
    category: 'cleaning',
    description: {
      fr: 'Élimination complète des poils de chiens et chats incrustés dans les moquettes, tissus et recoins.',
      ua: 'Спеціальні щітки та екстракція шерсті з тканини, килимів та важкодоступних місць.',
      en: 'Complete removal of stubborn pet hair embedded in upholstery and floor fibers.'
    }
  },
  {
    id: 'heavy_dirt',
    name: {
      fr: 'Saleté excessive / Boue incrustée',
      ua: 'Надмірне забруднення / Болото',
      en: 'Excessive grime / heavy dirt'
    },
    price: 20,
    priceMax: 40,
    unit: { fr: 'supplément (+20$ à 40$)', ua: 'доплата (+20$ до 40$)', en: 'add-on (+20$ to 40$)' },
    iconName: 'AlertTriangle',
    category: 'cleaning',
    description: {
      fr: 'Travail approfondi pour véhicules de chantier, retour de chasse/camping ou sable abondant.',
      ua: 'Додатковий час та спеціальні розчини для авто після полювання, дачі або будівництва.',
      en: 'Extra deep treatment for construction vehicles, hunting/camping trips or deep mud.'
    }
  },
  {
    id: 'difficult_stains',
    name: {
      fr: 'Taches difficiles / Contamination organique',
      ua: 'Складні плями / Органіка',
      en: 'Tough stains / Organic spills'
    },
    price: 20,
    priceMax: 40,
    unit: { fr: 'supplément (+20$ à 40$)', ua: 'доплата (+20$ до 40$)', en: 'add-on (+20$ to 40$)' },
    iconName: 'Sparkles',
    category: 'stains',
    description: {
      fr: 'Café incrusté, soda, graisse, vomissures, lait caillé, moisissure de surface traitées avec détachants enzymatiques.',
      ua: 'Виведення плям від кави, молока, жиру, їжі та розливів ензимними розчинниками.',
      en: 'Enzymatic treatment for coffee, milk, grease, food spills and organic contamination.'
    }
  },
  {
    id: 'odor_treatment',
    name: {
      fr: 'Traitement neutralisant des odeurs',
      ua: 'Усунення запахів (Озонування / Антибактерія)',
      en: 'Odor elimination treatment'
    },
    price: 35,
    unit: { fr: 'à partir de 35 $', ua: 'від 35 $', en: 'from $35' },
    iconName: 'Wind',
    category: 'special',
    description: {
      fr: 'Neutralisation moléculaire des odeurs de cigarette, humidité, animaux et nourriture à la source.',
      ua: 'Повна нейтралізація неприємних запахів тютюну, сирості та тварин на молекулярному рівні.',
      en: 'Molecular level neutralization of tobacco, damp, pet and food odors.'
    }
  },
  {
    id: 'child_seat',
    name: {
      fr: 'Nettoyage & désinfection siège auto enfant',
      ua: 'Хімчистка дитячого автокрісла',
      en: 'Child safety seat deep wash & sanitize'
    },
    price: 25,
    unit: { fr: 'par siège (25 $)', ua: 'за крісло (25 $)', en: 'per seat ($25)' },
    iconName: 'Baby',
    category: 'furniture',
    description: {
      fr: 'Désinfection hypoallergénique complète des sangles, tissus et mousse sans résidu toxique.',
      ua: 'Гіпоалергенна дезінфекція ременів та тканини крісла без шкідливих залишків.',
      en: '100% hypoallergenic sanitization of straps, padding and covers safe for babies.'
    }
  }
];

export const COMMERCIAL_CLIENTS = {
  fr: {
    title: 'Tarifs & Services Commerciaux',
    subtitle: 'Solutions de nettoyage mobile sur mesure pour entreprises & gestionnaires',
    desc: 'Bénéficiez de tarifs préférentiels pour vos flottes de véhicules, parcs locatifs et établissements commerciaux. Facturation professionnelle et service récurrent.',
    types: [
      { name: 'Hôtels & Motels', desc: 'Nettoyage matelas, moquettes et mobilier de chambres' },
      { name: 'Airbnb & Chalets locatifs', desc: 'Remise à neuf rapide entre les réservations' },
      { name: 'Concessionnaires Automobiles', desc: 'Préparation esthétique inventaire et livraison' },
      { name: 'Bureaux & Espaces Corporatifs', desc: 'Chaises de bureau, canapés d\'accueil et tapis' },
      { name: 'Immeubles Locatifs & Syndics', desc: 'Nettoyage des tapis de corridors et espaces communs' },
      { name: 'Gestionnaires Immobiliers', desc: 'Intervention avant emménagement / après déménagement' }
    ],
    cta: 'Demandez une estimation commerciale'
  },
  ua: {
    title: 'Корпоративні та Комерційні Тарифи',
    subtitle: 'Виїзний клінінг та детейлінг для бізнесу, готелів та автопарків',
    desc: 'Спеціальні умови для комерційних клієнтів з регулярним графіком обслуговування, гнучкою системою знижок та офіційними рахунками-фактурами.',
    types: [
      { name: 'Готелі та Мотелі', desc: 'Хімчистка матраців, ковроліну та крісел у номерах' },
      { name: 'Airbnb та Оренда житла', desc: 'Швидка реновація меблів між заїздами гостей' },
      { name: 'Автосалони та Дилери', desc: 'Передпродажна підготовка автомобілів' },
      { name: 'Офіси та Бізнес-центри', desc: 'Офісні крісла, дивани в лаунж-зонах та килими' },
      { name: 'ОСББ та Багатоквартирні будинки', desc: 'Чистка килимових доріжок у холах та сходах' },
      { name: 'Управляючі компанії', desc: 'Клінінг після виїзду або перед здачею в оренду' }
    ],
    cta: 'Отримати комерційну пропозицію'
  },
  en: {
    title: 'Commercial & Corporate Services',
    subtitle: 'Mobile cleaning solutions tailored for businesses & property managers',
    desc: 'Volume discounts for fleet vehicles, rental portfolios and commercial properties. Professional invoicing and scheduled recurring visits.',
    types: [
      { name: 'Hotels & Motels', desc: 'Deep mattress, carpet and room furniture cleaning' },
      { name: 'Airbnb & Vacation Rentals', desc: 'Fast turnaround furniture cleaning between guest stays' },
      { name: 'Auto Dealerships', desc: 'Showroom delivery detailing and inventory prep' },
      { name: 'Offices & Corporate Hubs', desc: 'Desk chairs, lounge couches and reception rugs' },
      { name: 'Rental Buildings & HOAs', desc: 'Hallway runners, common area carpets and staircases' },
      { name: 'Property Management', desc: 'Move-in / Move-out deep refresh services' }
    ],
    cta: 'Request a commercial estimate'
  }
};

export const BEFORE_AFTER_ITEMS: BeforeAfterAutoItem[] = [
  {
    id: 'seats_stain_removal',
    title: {
      fr: 'Auto : Sièges en Tissu & Taches Tenaces',
      ua: 'Авто : Тканинні сидіння та видалення плям',
      en: 'Auto : Fabric Seats & Deep Stain Removal'
    },
    category: {
      fr: '🚗 Auto',
      ua: '🚗 Авто',
      en: '🚗 Auto'
    },
    description: {
      fr: 'Siège conducteur très taché avec auréoles de café et saleté incrustée, métamorphosé après extraction à l\'eau chaude et shampoing désinfectant.',
      ua: 'Сидіння водія зі слідами напоїв та глибокого бруду. Повністю очищене та продезінфіковане за допомогою екстрактора з гарячою водою.',
      en: 'Heavily stained driver seat with embedded coffee marks completely restored after deep hot-water extraction and steam.'
    },
    beforeImage: carInteriorDirty,
    afterImage: carInteriorClean,
    vehicleModel: 'Auto / VUS',
    timeSpent: '2 heures'
  },
  {
    id: 'sofa_deep_clean',
    title: {
      fr: 'Sofa : Canapé Sectionnel en Tissu',
      ua: 'Диван : Секційний тканинний диван',
      en: 'Sofa : Fabric Sectional Couch'
    },
    category: {
      fr: '🛋️ Sofa',
      ua: '🛋️ Диван',
      en: '🛋️ Sofa'
    },
    description: {
      fr: 'Divan en tissu avec taches de nourriture, liquides et ternissement. Retrouve sa couleur d\'origine éclatante, sans résidu collant et 100% désinfecté.',
      ua: 'Тканинний диван із плямами від напоїв, їжі та загальною тьмяністю. Відновлено первинний колір тканини, знищено запахи та бактерії.',
      en: 'Sectional fabric sofa with heavy drink spills and dull spots. Restored to fresh, vibrant texture and 100% sanitized.'
    },
    beforeImage: sofaDirty,
    afterImage: sofaClean,
    vehicleModel: 'Sofa / Divan',
    timeSpent: '1.5 heure'
  },
  {
    id: 'car_floor_salt',
    title: {
      fr: 'Tapis : Élimination du Sel d\'Hiver & Moquette',
      ua: 'Килим : Видалення зимової солі та бруду',
      en: 'Tapis : Winter Salt & Carpet Extraction'
    },
    category: {
      fr: '🟫 Tapis',
      ua: '🟫 Килим',
      en: '🟫 Carpet'
    },
    description: {
      fr: 'Élimination thermique complète du sel de voirie incrusté et de la boue séchée sur les moquettes et tapis sans abîmer les fibres.',
      ua: 'Повне термічне розчинення білої кірки зимової дорожньої солі та піску на килимках і підлозі.',
      en: 'Complete thermal extraction of stubborn winter road salt crust and ground-in sand without damaging carpet fibers.'
    },
    beforeImage: carFloorDirty,
    afterImage: carFloorClean,
    vehicleModel: 'Tapis & Moquettes',
    timeSpent: '1 heure'
  },
  {
    id: 'truck_sleeper_cab',
    title: {
      fr: 'Camion : Cabine de Dormeur & Sièges Poids Lourd',
      ua: 'Вантажівка : Спальна кабіна тягача та сидіння',
      en: 'Truck : Heavy Truck Sleeper Cab & Seats'
    },
    category: {
      fr: '🚛 Camion',
      ua: '🚛 Вантажівка',
      en: '🚛 Truck'
    },
    description: {
      fr: 'Nettoyage en profondeur de la cabine de dormeur de camion lourd : couchette, sièges, tableau de bord, plancher et désinfection intégrale.',
      ua: 'Глибока хімчистка спальної кабіни вантажівки / тягача: спальне місце, сидіння, торпедо, підлога та повна дезінфекція.',
      en: 'Deep extraction of heavy truck sleeper cab: sleeper berth, driver seats, dashboard, floor mats and full sanitization.'
    },
    beforeImage: truckCabDirty,
    afterImage: truckCabClean,
    vehicleModel: 'Camion Poids Lourd (Semi-Truck)',
    timeSpent: '2.5 heures'
  }
];

// Liste vide des avis - Aucun faux avis (affichage réservé aux vrais avis clients)
export const REVIEWS_AUTO: AutoReviewItem[] = [];

export const FAQ_DETAILING: DetailingFaqItem[] = [
  {
    id: 'faq_1',
    category: 'mobile',
    question: {
      fr: 'Comment fonctionne le service mobile à domicile de MaxExpert360 ?',
      ua: 'Як працює виїзне мобільне обслуговування MaxExpert360 ?',
      en: 'How does the MaxExpert360 mobile service at home work?'
    },
    answer: {
      fr: 'Nous venons directement chez vous ou à votre lieu de travail avec notre unité mobile équipée de matériel professionnel (extracteurs d\'eau chaude, shampouineuses, nettoyeurs vapeur et produits écologiques). Nous desservons Drummondville et toutes les municipalités environnantes. Le déplacement dans le secteur local est inclus.',
      ua: 'Ми приїжджаємо до вашого будинку чи офісу з повним комплектом професійного обладнання. Обслуговуємо місто Драммондвіль та навколишні населені пункти. Виїзд по місту включений у вартість.',
      en: 'We come directly to your home or office equipped with professional hot water extractors, steam machines and eco-friendly products. We serve Drummondville and surrounding areas with local travel included.'
    }
  },
  {
    id: 'faq_2',
    category: 'pricing',
    question: {
      fr: 'Quels sont vos forfaits et tarifs pour les véhicules ?',
      ua: 'Які ціни на комплексні пакети для автомобілів ?',
      en: 'What are the vehicle detailing package rates?'
    },
    answer: {
      fr: 'Nos 3 forfaits principaux sont : Express (Auto 99 $, VUS 119 $, Camionnette/Van 139 $), Complet avec extraction en profondeur (Auto 149 $, VUS 179 $, Camionnette/Van 209 $) et Remise à Neuf intensive (à partir de 199 $ Auto, 239 $ VUS, 269 $ Camionnette/Van). Des options ciblées sont disponibles (poils d\'animaux +20$ à 40$, traitement odeurs à partir de 35$).',
      ua: 'Наші основні пакети: Експрес (Авто 99 $, VUS 119 $, Пікап/Вен 139 $), Повний з екстракцією сидінь (Авто 149 $, VUS 179 $, Пікап/Вен 209 $) та Реновація «Як новий» (від 199 $ Авто, 239 $ VUS, 269 $ Пікап/Вен).',
      en: 'Our 3 main packages: Express (Car $99, SUV $119, Truck/Van $139), Complete with deep hot water extraction (Car $149, SUV $179, Truck/Van $209), and Deep Rejuvenation (from $199 Car, $239 SUV, $269 Truck/Van).'
    }
  },
  {
    id: 'faq_3',
    category: 'furniture',
    question: {
      fr: 'Nettoyez-vous également les meubles de maison, divans, tapis et matelas ?',
      ua: 'Чи чистите ви домашні меблі, дивани, килими та матраци ?',
      en: 'Do you also clean home furniture, couches, carpets and mattresses?'
    },
    answer: {
      fr: 'Oui, absolument ! Nous sommes spécialisés dans le nettoyage par injection-extraction à l\'eau chaude des canapés, causeuses, chaises rembourrées, tapis décoratifs (à partir de 0,30 $/pi²), escaliers moquettés (à partir de 120 $) et matelas avec désinfection thermique contre les acariens et allergènes.',
      ua: 'Так, звичайно! Ми спеціалізуємося на глибинній хімчистці диванів, крісел, стільців, килимів (від 0,30 $/кв. фут), килимових сходів (від 120 $) та матраців з термодезінфекцією від пилових кліщів.',
      en: 'Yes, absolutely! We specialize in hot water extraction for couches, armchairs, dining chairs, rugs (from $0.30/sq ft), stairs (from $120) and mattresses with allergen sanitization.'
    }
  },
  {
    id: 'faq_4',
    category: 'care',
    question: {
      fr: 'Combien de temps faut-il pour le séchage après une extraction ?',
      ua: 'Скільки часу потрібно для висихання після хімчистки ?',
      en: 'How long does drying take after hot water extraction?'
    },
    answer: {
      fr: 'Grâce à la forte puissance d\'aspiration de nos extracteurs professionnels, 90% de l\'humidité est extraite immédiatement. Les tissus et sièges sèchent généralement en 2 à 4 heures selon la ventilation et la température de la pièce ou du véhicule.',
      ua: 'Завдяки потужній силі всмоктування наших екстракторів вилучається 90% вологи. Поверхні повністю висихають за 2–4 години залежно від вентиляції.',
      en: 'Thanks to our high-power moisture suction, 90% of water is extracted on the spot. Upholstery typically dries within 2 to 4 hours.'
    }
  }
];

export const AUTO_LAUNCH_PROMO = {
  discountAmount: 20,
  badgeText: {
    fr: 'PROMO LANCEMENT -20 $',
    ua: 'ПРОМО -20 $',
    en: 'LAUNCH PROMO -$20'
  }
};

export function isAutoPromoActive(): boolean {
  return true;
}

export function calculateServicePrice(basePrice: number, _category?: string): { originalPrice: number; discount: number; finalPrice: number } {
  const discount = 0;
  return {
    originalPrice: basePrice,
    discount,
    finalPrice: basePrice
  };
}

