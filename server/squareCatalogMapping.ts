/**
 * Mapping between MaxExpert360 service IDs and Square Service Variation IDs.
 * If exact Square variation IDs are configured in Square Catalog, they can be matched dynamically
 * or overridden via this mapping.
 */

export interface ServiceVariationMapping {
  serviceId: string;
  defaultVariationId: string;
  serviceName: string;
  durationMinutes: number;
  priceCents: number;
  category: string;
  squareVariationId?: string;
  squareVariationVersion?: number;
}

export interface LiveSquareVariation {
  id: string;
  name: string;
  itemName?: string;
  version: number;
  durationMinutes: number;
  priceCents?: number;
  teamMemberIds: string[];
}

export const SQUARE_SERVICE_MAPPINGS: Record<string, ServiceVariationMapping> = {
  // 1. Detailing Auto Packages (Mapped directly to Square Catalog)
  'express_auto': {
    serviceId: 'express_auto',
    defaultVariationId: 'CQ4JQP7RN4JGAS42Y2F4BSUG',
    squareVariationId: 'CQ4JQP7RN4JGAS42Y2F4BSUG',
    serviceName: 'Intérieur + Extérieur Express (Auto / Berline)',
    durationMinutes: 90,
    priceCents: 9900,
    category: 'auto'
  },
  'express_suv': {
    serviceId: 'express_suv',
    defaultVariationId: 'TWMM6URGJYEC7TLITDWXGXRU',
    squareVariationId: 'TWMM6URGJYEC7TLITDWXGXRU',
    serviceName: 'Intérieur + Extérieur Express (VUS / SUV)',
    durationMinutes: 105,
    priceCents: 11900,
    category: 'auto'
  },
  'express_truck_van': {
    serviceId: 'express_truck_van',
    defaultVariationId: 'B5CBFD6PC53ZAV47QDOJFD6N',
    squareVariationId: 'B5CBFD6PC53ZAV47QDOJFD6N',
    serviceName: 'Intérieur + Extérieur Express (Camionnette / Van)',
    durationMinutes: 120,
    priceCents: 13900,
    category: 'auto'
  },
  'interieur_exterieur_complet_auto': {
    serviceId: 'interieur_exterieur_complet_auto',
    defaultVariationId: '342W7MSVZOPPNMQAMPZIXAPK',
    squareVariationId: '342W7MSVZOPPNMQAMPZIXAPK',
    serviceName: 'Intérieur + Extérieur Complet (Auto / Berline)',
    durationMinutes: 150,
    priceCents: 14900,
    category: 'auto'
  },
  'interieur_exterieur_complet_suv': {
    serviceId: 'interieur_exterieur_complet_suv',
    defaultVariationId: 'UDZ4SIUF4K6QV4BPWMKIGX35',
    squareVariationId: 'UDZ4SIUF4K6QV4BPWMKIGX35',
    serviceName: 'Intérieur + Extérieur Complet (VUS / SUV)',
    durationMinutes: 180,
    priceCents: 17900,
    category: 'auto'
  },
  'interieur_exterieur_complet_truck_van': {
    serviceId: 'interieur_exterieur_complet_truck_van',
    defaultVariationId: 'KZL6U2U75JJOWTGJTWO5IEDX',
    squareVariationId: 'KZL6U2U75JJOWTGJTWO5IEDX',
    serviceName: 'Intérieur + Extérieur Complet (Camionnette / Van)',
    durationMinutes: 210,
    priceCents: 20900,
    category: 'auto'
  },
  'remise_a_neuf_auto': {
    serviceId: 'remise_a_neuf_auto',
    defaultVariationId: '7KZWAQU77QAKHASY2EFL2Z6V',
    squareVariationId: '7KZWAQU77QAKHASY2EFL2Z6V',
    serviceName: 'Remise à Neuf Suprême (Auto / Berline)',
    durationMinutes: 240,
    priceCents: 19900,
    category: 'auto'
  },
  'remise_a_neuf_suv': {
    serviceId: 'remise_a_neuf_suv',
    defaultVariationId: 'VJVKHA5UNYFOMJ2HZKTJBS67',
    squareVariationId: 'VJVKHA5UNYFOMJ2HZKTJBS67',
    serviceName: 'Remise à Neuf Suprême (VUS / SUV)',
    durationMinutes: 270,
    priceCents: 23900,
    category: 'auto'
  },
  'remise_a_neuf_truck_van': {
    serviceId: 'remise_a_neuf_truck_van',
    defaultVariationId: 'V2NQ5MWCRVCF34LNP36Z7WQF',
    squareVariationId: 'V2NQ5MWCRVCF34LNP36Z7WQF',
    serviceName: 'Remise à Neuf Suprême (Camionnette / Van)',
    durationMinutes: 300,
    priceCents: 26900,
    category: 'auto'
  },

  // 2. Sofas & Furniture
  'fauteuil': {
    serviceId: 'fauteuil',
    defaultVariationId: 'VAR_FAUTEUIL_SIMPLE',
    serviceName: 'Nettoyage Fauteuil 1 place',
    durationMinutes: 45,
    priceCents: 7000,
    category: 'furniture'
  },
  'fauteuil_simple': {
    serviceId: 'fauteuil_simple',
    defaultVariationId: 'VAR_FAUTEUIL_SIMPLE',
    serviceName: 'Nettoyage Fauteuil 1 place',
    durationMinutes: 45,
    priceCents: 7000,
    category: 'furniture'
  },
  'causeuse': {
    serviceId: 'causeuse',
    defaultVariationId: 'VAR_SOFA_2_PLACES',
    serviceName: 'Nettoyage Causeuse 2 places',
    durationMinutes: 60,
    priceCents: 10000,
    category: 'furniture'
  },
  'sofa_2_places': {
    serviceId: 'sofa_2_places',
    defaultVariationId: 'VAR_SOFA_2_PLACES',
    serviceName: 'Nettoyage Causeuse 2 places',
    durationMinutes: 60,
    priceCents: 10000,
    category: 'furniture'
  },
  'sofa_3': {
    serviceId: 'sofa_3',
    defaultVariationId: 'VAR_SOFA_3_PLACES',
    serviceName: 'Nettoyage Sofa standard 3 places',
    durationMinutes: 90,
    priceCents: 13000,
    category: 'furniture'
  },
  'sofa_3_places': {
    serviceId: 'sofa_3_places',
    defaultVariationId: 'VAR_SOFA_3_PLACES',
    serviceName: 'Nettoyage Sofa standard 3 places',
    durationMinutes: 90,
    priceCents: 13000,
    category: 'furniture'
  },
  'sectionnel_l': {
    serviceId: 'sectionnel_l',
    defaultVariationId: 'VAR_SOFA_SECTIONNEL_L',
    serviceName: 'Nettoyage Divan sectionnel en L',
    durationMinutes: 120,
    priceCents: 17000,
    category: 'furniture'
  },
  'sofa_sectionnel_l': {
    serviceId: 'sofa_sectionnel_l',
    defaultVariationId: 'VAR_SOFA_SECTIONNEL_L',
    serviceName: 'Nettoyage Divan sectionnel en L',
    durationMinutes: 120,
    priceCents: 17000,
    category: 'furniture'
  },
  'sectionnel_u': {
    serviceId: 'sectionnel_u',
    defaultVariationId: 'VAR_SOFA_SECTIONNEL_U',
    serviceName: 'Nettoyage Divan sectionnel en U / XL',
    durationMinutes: 150,
    priceCents: 21000,
    category: 'furniture'
  },
  'sofa_sectionnel_u': {
    serviceId: 'sofa_sectionnel_u',
    defaultVariationId: 'VAR_SOFA_SECTIONNEL_U',
    serviceName: 'Nettoyage Divan sectionnel en U / XL',
    durationMinutes: 150,
    priceCents: 21000,
    category: 'furniture'
  },
  'chaise_salle': {
    serviceId: 'chaise_salle',
    defaultVariationId: 'VAR_CHAISE_MANGER',
    serviceName: 'Nettoyage Chaise de salle à manger',
    durationMinutes: 20,
    priceCents: 2000,
    category: 'furniture'
  },
  'chaise_salle_manger': {
    serviceId: 'chaise_salle_manger',
    defaultVariationId: 'VAR_CHAISE_MANGER',
    serviceName: 'Nettoyage Chaise de salle à manger',
    durationMinutes: 20,
    priceCents: 2000,
    category: 'furniture'
  },

  // 3. Carpets & Stairs
  'carpet_sqft': {
    serviceId: 'carpet_sqft',
    defaultVariationId: 'VAR_TAPIS_PI2',
    serviceName: 'Nettoyage Tapis & Moquette au pi²',
    durationMinutes: 60,
    priceCents: 6000,
    category: 'carpet'
  },
  'tapis_pi2': {
    serviceId: 'tapis_pi2',
    defaultVariationId: 'VAR_TAPIS_PI2',
    serviceName: 'Nettoyage Tapis & Moquette au pi²',
    durationMinutes: 60,
    priceCents: 6000,
    category: 'carpet'
  },
  'carpet_stairs': {
    serviceId: 'carpet_stairs',
    defaultVariationId: 'VAR_ESCALIER_COMPLET',
    serviceName: 'Nettoyage Escalier moquetté complet',
    durationMinutes: 90,
    priceCents: 12000,
    category: 'carpet'
  },
  'escalier_complet': {
    serviceId: 'escalier_complet',
    defaultVariationId: 'VAR_ESCALIER_COMPLET',
    serviceName: 'Nettoyage Escalier moquetté complet',
    durationMinutes: 90,
    priceCents: 12000,
    category: 'carpet'
  },
  'tapis_petit': {
    serviceId: 'tapis_petit',
    defaultVariationId: 'VAR_TAPIS_PETIT',
    serviceName: 'Nettoyage Tapis d\'appoint petit',
    durationMinutes: 30,
    priceCents: 4000,
    category: 'carpet'
  },
  'tapis_moyen': {
    serviceId: 'tapis_moyen',
    defaultVariationId: 'VAR_TAPIS_MOYEN',
    serviceName: 'Nettoyage Tapis moyen',
    durationMinutes: 45,
    priceCents: 6500,
    category: 'carpet'
  },
  'tapis_grand': {
    serviceId: 'tapis_grand',
    defaultVariationId: 'VAR_TAPIS_GRAND',
    serviceName: 'Nettoyage Grand tapis de salon',
    durationMinutes: 60,
    priceCents: 9500,
    category: 'carpet'
  },
  'escalier_marche': {
    serviceId: 'escalier_marche',
    defaultVariationId: 'VAR_ESCALIER_MARCHE',
    serviceName: 'Nettoyage Marches d\'escalier moquette',
    durationMinutes: 45,
    priceCents: 500,
    category: 'carpet'
  },

  // 4. Mattresses
  'mattress_twin': {
    serviceId: 'mattress_twin',
    defaultVariationId: 'VAR_MATELAS_SIMPLE',
    serviceName: 'Nettoyage Matelas Simple (Twin)',
    durationMinutes: 45,
    priceCents: 8000,
    category: 'mattress'
  },
  'matelas_simple': {
    serviceId: 'matelas_simple',
    defaultVariationId: 'VAR_MATELAS_SIMPLE',
    serviceName: 'Nettoyage & Désinfection Matelas Simple',
    durationMinutes: 45,
    priceCents: 8000,
    category: 'mattress'
  },
  'mattress_full': {
    serviceId: 'mattress_full',
    defaultVariationId: 'VAR_MATELAS_DOUBLE',
    serviceName: 'Nettoyage Matelas Double / Full',
    durationMinutes: 60,
    priceCents: 10000,
    category: 'mattress'
  },
  'matelas_double': {
    serviceId: 'matelas_double',
    defaultVariationId: 'VAR_MATELAS_DOUBLE',
    serviceName: 'Nettoyage & Désinfection Matelas Double / Full',
    durationMinutes: 60,
    priceCents: 10000,
    category: 'mattress'
  },
  'mattress_queen': {
    serviceId: 'mattress_queen',
    defaultVariationId: 'VAR_MATELAS_QUEEN',
    serviceName: 'Nettoyage Matelas Queen',
    durationMinutes: 75,
    priceCents: 12000,
    category: 'mattress'
  },
  'matelas_queen': {
    serviceId: 'matelas_queen',
    defaultVariationId: 'VAR_MATELAS_QUEEN',
    serviceName: 'Nettoyage & Désinfection Matelas Queen',
    durationMinutes: 75,
    priceCents: 12000,
    category: 'mattress'
  },
  'mattress_king': {
    serviceId: 'mattress_king',
    defaultVariationId: 'VAR_MATELAS_KING',
    serviceName: 'Nettoyage Matelas King',
    durationMinutes: 90,
    priceCents: 15000,
    category: 'mattress'
  },
  'matelas_king': {
    serviceId: 'matelas_king',
    defaultVariationId: 'VAR_MATELAS_KING',
    serviceName: 'Nettoyage & Désinfection Matelas King',
    durationMinutes: 90,
    priceCents: 15000,
    category: 'mattress'
  },
  'siege_auto_bebe': {
    serviceId: 'siege_auto_bebe',
    defaultVariationId: 'VAR_SIEGE_BEBE',
    serviceName: 'Nettoyage Siège d\'auto enfant / bébé',
    durationMinutes: 30,
    priceCents: 2500,
    category: 'mattress'
  },

  // 5. Heavy Trucks & RVs
  'camion_couchette': {
    serviceId: 'camion_couchette',
    defaultVariationId: 'VAR_TRUCK_SLEEPER',
    serviceName: 'Nettoyage Camion Lourd - Cabine de dormeur complète',
    durationMinutes: 180,
    priceCents: 22000,
    category: 'truck'
  },
  'camion_sleeper': {
    serviceId: 'camion_sleeper',
    defaultVariationId: 'VAR_TRUCK_SLEEPER',
    serviceName: 'Nettoyage Cabine Poids Lourd avec Couchette (Sleeper)',
    durationMinutes: 180,
    priceCents: 22000,
    category: 'truck'
  },
  'camion_jour': {
    serviceId: 'camion_jour',
    defaultVariationId: 'VAR_TRUCK_CAB_SIMPLE',
    serviceName: 'Nettoyage Camion Lourd - Cabine de jour (Day Cab)',
    durationMinutes: 120,
    priceCents: 14000,
    category: 'truck'
  },
  'camion_cabine_simple': {
    serviceId: 'camion_cabine_simple',
    defaultVariationId: 'VAR_TRUCK_CAB_SIMPLE',
    serviceName: 'Nettoyage Cabine Poids Lourd Day Cab',
    durationMinutes: 120,
    priceCents: 14000,
    category: 'truck'
  },
  'vr_motorise': {
    serviceId: 'vr_motorise',
    defaultVariationId: 'VAR_VR_ROULOTTE',
    serviceName: 'Nettoyage VR & Motorisé (Véhicule Récréatif)',
    durationMinutes: 180,
    priceCents: 18000,
    category: 'truck'
  },
  'vr_roulotte_pied': {
    serviceId: 'vr_roulotte_pied',
    defaultVariationId: 'VAR_VR_ROULOTTE',
    serviceName: 'Nettoyage Intérieur VR & Roulotte',
    durationMinutes: 180,
    priceCents: 18000,
    category: 'truck'
  },

  // 6. Extras & Options
  'poils_animaux': {
    serviceId: 'poils_animaux',
    defaultVariationId: 'VAR_EXTRA_PET_HAIR',
    serviceName: 'Supplément Élimination poils d\'animaux',
    durationMinutes: 30,
    priceCents: 2000,
    category: 'extra'
  },
  'elimination_poils_animaux': {
    serviceId: 'elimination_poils_animaux',
    defaultVariationId: 'VAR_EXTRA_PET_HAIR',
    serviceName: 'Supplément Élimination poils d\'animaux',
    durationMinutes: 30,
    priceCents: 2000,
    category: 'extra'
  },
  'odeurs_bacteries': {
    serviceId: 'odeurs_bacteries',
    defaultVariationId: 'VAR_EXTRA_OZONE',
    serviceName: 'Traitement anti-odeur & désinfection',
    durationMinutes: 30,
    priceCents: 3000,
    category: 'extra'
  },
  'desodorisation_ozone': {
    serviceId: 'desodorisation_ozone',
    defaultVariationId: 'VAR_EXTRA_OZONE',
    serviceName: 'Traitement anti-odeur & désinfection',
    durationMinutes: 30,
    priceCents: 3000,
    category: 'extra'
  },
  'traitement_cuir': {
    serviceId: 'traitement_cuir',
    defaultVariationId: 'VAR_EXTRA_PROTECTANT',
    serviceName: 'Nettoyage & Soin nourrissant cuir',
    durationMinutes: 30,
    priceCents: 4000,
    category: 'extra'
  },
  'protection_tissus_cuir': {
    serviceId: 'protection_tissus_cuir',
    defaultVariationId: 'VAR_EXTRA_PROTECTANT',
    serviceName: 'Traitement scellant hydrophobe tissus / cuir',
    durationMinutes: 20,
    priceCents: 2500,
    category: 'extra'
  },
  'shampoing_sieges_supp': {
    serviceId: 'shampoing_sieges_supp',
    defaultVariationId: 'VAR_EXTRA_SEAT_SHAMPOO',
    serviceName: 'Shampooing / Extraction en profondeur',
    durationMinutes: 45,
    priceCents: 4000,
    category: 'extra'
  }
};

/**
 * Finds or constructs the best matching ServiceVariation for a given cart item.
 */
export function resolveServiceVariation(
  itemId: string, 
  itemCategory: string,
  liveCatalogVariations: LiveSquareVariation[] = [],
  defaultTeamMemberId: string = 'TMFJ6AiDibVJenrB'
): {
  serviceVariationId: string;
  serviceVariationVersion: number;
  teamMemberId: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  category: string;
} {
  // 1. Check if mapping has a known Square Catalog Variation ID that matches live catalog
  const mapped = SQUARE_SERVICE_MAPPINGS[itemId];
  if (mapped && mapped.squareVariationId) {
    const liveMatch = liveCatalogVariations.find(v => v.id === mapped.squareVariationId);
    if (liveMatch) {
      const teamId = liveMatch.teamMemberIds?.[0] || defaultTeamMemberId;
      return {
        serviceVariationId: liveMatch.id,
        serviceVariationVersion: liveMatch.version || 1,
        teamMemberId: teamId,
        name: liveMatch.itemName ? `${liveMatch.itemName} (${liveMatch.name})` : (mapped.serviceName || liveMatch.name),
        durationMinutes: liveMatch.durationMinutes || mapped.durationMinutes || 90,
        priceCents: liveMatch.priceCents || mapped.priceCents || 9900,
        category: mapped.category
      };
    }
  }

  // 2. Exact or fuzzy match in live catalog variations by name / keyword
  if (liveCatalogVariations.length > 0) {
    const cleanId = itemId.toLowerCase().replace(/_/g, ' ');
    const directMatch = liveCatalogVariations.find(v => {
      const fullName = `${v.itemName || ''} ${v.name}`.toLowerCase();
      return (
        fullName.includes(cleanId) ||
        (mapped && fullName.includes(mapped.serviceName.toLowerCase()))
      );
    });

    if (directMatch) {
      const teamId = directMatch.teamMemberIds?.[0] || defaultTeamMemberId;
      return {
        serviceVariationId: directMatch.id,
        serviceVariationVersion: directMatch.version || 1,
        teamMemberId: teamId,
        name: directMatch.itemName ? `${directMatch.itemName} (${directMatch.name})` : directMatch.name,
        durationMinutes: directMatch.durationMinutes || 90,
        priceCents: directMatch.priceCents || (mapped?.priceCents ?? 9900),
        category: itemCategory
      };
    }
  }

  // 3. Fallback to primary live catalog variation if available (e.g. for custom furniture / mattresses)
  if (liveCatalogVariations.length > 0) {
    const primary = liveCatalogVariations[0];
    const teamId = primary.teamMemberIds?.[0] || defaultTeamMemberId;
    return {
      serviceVariationId: primary.id,
      serviceVariationVersion: primary.version || 1,
      teamMemberId: teamId,
      name: mapped?.serviceName || `${primary.itemName || primary.name} (MaxExpert360)`,
      durationMinutes: mapped?.durationMinutes || primary.durationMinutes || 60,
      priceCents: mapped?.priceCents || primary.priceCents || 5000,
      category: itemCategory
    };
  }

  // 4. Default fallback (when catalog is offline)
  const defaultVarId = mapped?.squareVariationId || mapped?.defaultVariationId || 'CQ4JQP7RN4JGAS42Y2F4BSUG';
  return {
    serviceVariationId: defaultVarId,
    serviceVariationVersion: 1,
    teamMemberId: defaultTeamMemberId,
    name: mapped?.serviceName || `Service ${itemCategory} - MaxExpert360`,
    durationMinutes: mapped?.durationMinutes || 60,
    priceCents: mapped?.priceCents || 5000,
    category: itemCategory
  };
}

