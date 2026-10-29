/**
 * Utility for formatting durations in Quebec French (fr-CA)
 * Strictly follows standards:
 * - '+1 h'
 * - '+30 min'
 * - '1 h 30 min'
 * - 'Durée totale estimée : 4 h 30 min'
 * - '3 h à 4 h'
 * - '4 h 30 min à 5 h 30 min'
 */

export function formatSingleDurationFr(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0 && m > 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function formatDurationFr(minHours: number, maxHours?: number): string {
  if (maxHours === undefined || minHours === maxHours) {
    return formatSingleDurationFr(minHours);
  }
  return `${formatSingleDurationFr(minHours)} à ${formatSingleDurationFr(maxHours)}`;
}

export function formatDurationLocalized(
  minHours: number,
  maxHours: number,
  lang: 'fr' | 'ua' | 'en' = 'fr'
): string {
  if (lang === 'fr') {
    return formatDurationFr(minHours, maxHours);
  }
  if (lang === 'ua') {
    if (minHours === maxHours) {
      const h = Math.floor(minHours);
      const m = Math.round((minHours - h) * 60);
      if (h === 0 && m > 0) return `${m} хв`;
      if (m === 0) return `${h} ${h >= 2 && h <= 4 ? 'години' : h === 1 ? 'година' : 'годин'}`;
      return `${h} год ${m} хв`;
    }
    const unit = (maxHours % 1 !== 0) ? 'год' : (Math.floor(maxHours) >= 2 && Math.floor(maxHours) <= 4) ? 'години' : 'годин';
    return `${minHours} - ${maxHours} ${unit}`;
  }
  // English
  if (minHours === maxHours) {
    const h = Math.floor(minHours);
    const m = Math.round((minHours - h) * 60);
    if (h === 0 && m > 0) return `${m} min`;
    if (m === 0) return `${h} hour${h > 1 ? 's' : ''}`;
    return `${h} h ${m} min`;
  }
  return `${minHours} - ${maxHours} hours`;
}
