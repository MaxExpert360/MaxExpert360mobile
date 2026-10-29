/**
 * Utility for formatting durations in Quebec French (fr-CA), Ukrainian (uk-UA), and English (en)
 * Strictly uses integer minutes as the single source of truth.
 * Never uses toLocaleTimeString or time-of-day formats for labor durations.
 * 
 * Standards:
 * FR:
 * - 30 min
 * - 1 h
 * - 1 h 30 min
 * - 2 h
 * - 3 h 30 min
 * - 4 à 5 h
 * 
 * UA:
 * - 30 хв
 * - 1 год
 * - 1 год 30 хв
 * - 2 год
 * - 3 год 30 хв
 * - 4–5 год
 * 
 * EN:
 * - 30 min
 * - 1 hr
 * - 1 hr 30 min
 * - 2 hrs
 * - 3 hrs 30 min
 * - 4–5 hrs
 */

export function formatSingleDuration(minutes: number, lang: 'fr' | 'ua' | 'en' = 'fr'): string {
  const totalM = Math.max(0, Math.round(minutes));
  const h = Math.floor(totalM / 60);
  const m = totalM % 60;

  if (lang === 'fr') {
    if (h === 0 && m > 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
  }

  if (lang === 'ua') {
    if (h === 0 && m > 0) return `${m} хв`;
    if (m === 0) return `${h} год`;
    return `${h} год ${m} хв`;
  }

  // en
  if (h === 0 && m > 0) return `${m} min`;
  const hrUnit = h === 1 ? 'hr' : 'hrs';
  if (m === 0) return `${h} ${hrUnit}`;
  return `${h} ${hrUnit} ${m} min`;
}

export function formatDurationRange(
  minMinutes: number,
  maxMinutes?: number,
  lang: 'fr' | 'ua' | 'en' = 'fr'
): string {
  const minM = Math.max(0, Math.round(minMinutes));
  const maxM = maxMinutes !== undefined ? Math.max(0, Math.round(maxMinutes)) : minM;

  if (minM === maxM) {
    return formatSingleDuration(minM, lang);
  }

  const isMinWholeHours = minM % 60 === 0;
  const isMaxWholeHours = maxM % 60 === 0;
  const minH = minM / 60;
  const maxH = maxM / 60;

  if (isMinWholeHours && isMaxWholeHours) {
    if (lang === 'fr') {
      return `${minH} à ${maxH} h`;
    }
    if (lang === 'ua') {
      return `${minH}–${maxH} год`;
    }
    // en
    return `${minH}–${maxH} hrs`;
  }

  // If one or both have remaining minutes (e.g. 90 to 120 -> 1 h 30 min à 2 h)
  const startStr = formatSingleDuration(minM, lang);
  const endStr = formatSingleDuration(maxM, lang);
  if (lang === 'fr') {
    return `${startStr} à ${endStr}`;
  }
  return `${startStr} – ${endStr}`;
}

export function formatDurationLocalized(
  minVal: number,
  maxVal?: number,
  lang: 'fr' | 'ua' | 'en' = 'fr'
): string {
  // If values are <= 24, they were passed in hours (e.g. 1.5, 2 or 3, 4). Convert to integer minutes.
  const minMinutes = minVal <= 24 ? Math.round(minVal * 60) : Math.round(minVal);
  const maxMinutes = maxVal !== undefined 
    ? (maxVal <= 24 ? Math.round(maxVal * 60) : Math.round(maxVal))
    : minMinutes;

  return formatDurationRange(minMinutes, maxMinutes, lang);
}

export function formatSingleDurationFr(hoursOrMinutes: number): string {
  const minutes = hoursOrMinutes <= 24 ? Math.round(hoursOrMinutes * 60) : Math.round(hoursOrMinutes);
  return formatSingleDuration(minutes, 'fr');
}

export function formatDurationFr(minHoursOrMinutes: number, maxHoursOrMinutes?: number): string {
  return formatDurationLocalized(minHoursOrMinutes, maxHoursOrMinutes, 'fr');
}
