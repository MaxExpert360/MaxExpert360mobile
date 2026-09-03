/**
 * MaxExpert360 Booking Availability Schedule Configuration (Server)
 * 
 * Rules (America/Toronto timezone):
 * - Monday: bookings can start from 17:00
 * - Tuesday: bookings can start from 17:00
 * - Wednesday: bookings can start from 17:00
 * - Thursday: bookings can start from 16:00
 * - Friday: bookings can start from 12:30
 * - Saturday: available all day (08:00 - 20:30)
 * - Sunday: available all day (08:00 - 20:30)
 * 
 * All legacy broad time-slot logic (morning, afternoon, evening, flexible, 08:30, 13:30, 16:30, 17:30)
 * has been completely removed in favor of exact start times.
 */

export interface DayScheduleRule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  dayName: { fr: string; ua: string; en: string };
  isFullyAvailable: boolean;
  minTime: string; // '17:00', '16:00', '12:30', '08:00'
  minMinutesFromMidnight: number;
  availableNotice: { fr: string; ua: string; en: string };
  availableNoticeShort: { fr: string; ua: string; en: string };
}

export const BOOKING_SCHEDULE_RULES: Record<number, DayScheduleRule> = {
  // Sunday
  0: {
    dayOfWeek: 0,
    dayName: { fr: 'Dimanche', ua: 'Неділя', en: 'Sunday' },
    isFullyAvailable: true,
    minTime: '08:00',
    minMinutesFromMidnight: 8 * 60, // 08:00 (480 mins)
    availableNotice: {
      fr: '📅 Dimanche : Disponible toute la journée (fuseau America/Toronto)',
      ua: '📅 Неділя : Доступно весь день (America/Toronto)',
      en: '📅 Sunday : Available all day (America/Toronto)'
    },
    availableNoticeShort: {
      fr: 'Toute la journée',
      ua: 'Весь день',
      en: 'All day'
    }
  },
  // Monday
  1: {
    dayOfWeek: 1,
    dayName: { fr: 'Lundi', ua: 'Понеділок', en: 'Monday' },
    isFullyAvailable: false,
    minTime: '17:00',
    minMinutesFromMidnight: 17 * 60, // 17:00 (1020 mins)
    availableNotice: {
      fr: '📅 Lundi : Réservations à partir de 17h00 (fuseau America/Toronto)',
      ua: '📅 Понеділок : Бронювання з 17:00 (America/Toronto)',
      en: '📅 Monday : Bookings available from 5:00 PM (America/Toronto)'
    },
    availableNoticeShort: {
      fr: 'Dès 17h00',
      ua: 'З 17:00',
      en: 'From 5:00 PM'
    }
  },
  // Tuesday
  2: {
    dayOfWeek: 2,
    dayName: { fr: 'Mardi', ua: 'Вівторок', en: 'Tuesday' },
    isFullyAvailable: false,
    minTime: '17:00',
    minMinutesFromMidnight: 17 * 60, // 17:00 (1020 mins)
    availableNotice: {
      fr: '📅 Mardi : Réservations à partir de 17h00 (fuseau America/Toronto)',
      ua: '📅 Вівторок : Бронювання з 17:00 (America/Toronto)',
      en: '📅 Tuesday : Bookings available from 5:00 PM (America/Toronto)'
    },
    availableNoticeShort: {
      fr: 'Dès 17h00',
      ua: 'З 17:00',
      en: 'From 5:00 PM'
    }
  },
  // Wednesday
  3: {
    dayOfWeek: 3,
    dayName: { fr: 'Mercredi', ua: 'Середа', en: 'Wednesday' },
    isFullyAvailable: false,
    minTime: '17:00',
    minMinutesFromMidnight: 17 * 60, // 17:00 (1020 mins)
    availableNotice: {
      fr: '📅 Mercredi : Réservations à partir de 17h00 (fuseau America/Toronto)',
      ua: '📅 Середа : Бронювання з 17:00 (America/Toronto)',
      en: '📅 Wednesday : Bookings available from 5:00 PM (America/Toronto)'
    },
    availableNoticeShort: {
      fr: 'Dès 17h00',
      ua: 'З 17:00',
      en: 'From 5:00 PM'
    }
  },
  // Thursday
  4: {
    dayOfWeek: 4,
    dayName: { fr: 'Jeudi', ua: 'Четвер', en: 'Thursday' },
    isFullyAvailable: false,
    minTime: '16:00',
    minMinutesFromMidnight: 16 * 60, // 16:00 (960 mins)
    availableNotice: {
      fr: '📅 Jeudi : Réservations à partir de 16h00 (fuseau America/Toronto)',
      ua: '📅 Четвер : Бронювання з 16:00 (America/Toronto)',
      en: '📅 Thursday : Bookings available from 4:00 PM (America/Toronto)'
    },
    availableNoticeShort: {
      fr: 'Dès 16h00',
      ua: 'З 16:00',
      en: 'From 4:00 PM'
    }
  },
  // Friday
  5: {
    dayOfWeek: 5,
    dayName: { fr: 'Vendredi', ua: 'П\'ятниця', en: 'Friday' },
    isFullyAvailable: false,
    minTime: '12:30',
    minMinutesFromMidnight: 12 * 60 + 30, // 12:30 (750 mins)
    availableNotice: {
      fr: '📅 Vendredi : Réservations à partir de 12h30 (fuseau America/Toronto)',
      ua: '📅 П\'ятниця : Бронювання з 12:30 (America/Toronto)',
      en: '📅 Friday : Bookings available from 12:30 PM (America/Toronto)'
    },
    availableNoticeShort: {
      fr: 'Dès 12h30',
      ua: 'З 12:30',
      en: 'From 12:30 PM'
    }
  },
  // Saturday
  6: {
    dayOfWeek: 6,
    dayName: { fr: 'Samedi', ua: 'Субота', en: 'Saturday' },
    isFullyAvailable: true,
    minTime: '08:00',
    minMinutesFromMidnight: 8 * 60, // 08:00 (480 mins)
    availableNotice: {
      fr: '📅 Samedi : Disponible toute la journée (fuseau America/Toronto)',
      ua: '📅 Субота : Доступно весь день (America/Toronto)',
      en: '📅 Saturday : Available all day (America/Toronto)'
    },
    availableNoticeShort: {
      fr: 'Toute la journée',
      ua: 'Весь день',
      en: 'All day'
    }
  }
};

export interface TimeSlotOption {
  value: string; // 'HH:mm'
  label: { fr: string; ua: string; en: string };
  startTime: string; // 'HH:mm:ss'
  minutesFromMidnight: number;
}

/**
 * Creates an exact time slot option with localized human-readable labels
 */
export function createTimeOption(h: number, m: number): TimeSlotOption {
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const value = `${hh}:${mm}`;

  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const enLabel = `${h12}:${mm} ${period}`;
  const frLabel = `${h}h${mm}`;
  const uaLabel = `${hh}:${mm}`;

  return {
    value,
    label: {
      fr: `${frLabel} (${enLabel})`,
      ua: uaLabel,
      en: enLabel
    },
    startTime: `${hh}:${mm}:00`,
    minutesFromMidnight: h * 60 + m
  };
}

/**
 * Parses YYYY-MM-DD and returns the day of week in America/Toronto (0 = Sunday, 1 = Monday, ... 6 = Saturday)
 */
export function getDayOfWeekFromDateString(dateStr: string): number {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return -1;
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return d.getUTCDay();
}

/**
 * Returns the schedule rule for a given date
 */
export function getScheduleRuleForDate(dateStr: string): DayScheduleRule | null {
  const dow = getDayOfWeekFromDateString(dateStr);
  if (dow < 0 || !(dow in BOOKING_SCHEDULE_RULES)) return null;
  return BOOKING_SCHEDULE_RULES[dow];
}

/**
 * Returns the Eastern Time (America/Toronto) ISO offset for a given date (-04:00 for EDT, -05:00 for EST)
 */
export function getEasternTimeOffset(dateStr: string): string {
  try {
    const testDate = new Date(`${dateStr}T12:00:00Z`);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Toronto',
      timeZoneName: 'shortOffset'
    });
    const parts = formatter.formatToParts(testDate);
    const tzPart = parts.find(p => p.type === 'timeZoneName')?.value;
    if (tzPart) {
      const match = tzPart.match(/GMT([+-]\d+)/);
      if (match) {
        const offsetNum = parseInt(match[1], 10);
        const sign = offsetNum >= 0 ? '+' : '-';
        const abs = Math.abs(offsetNum).toString().padStart(2, '0');
        return `${sign}${abs}:00`;
      }
    }
  } catch {
    // fallback
  }
  return '-04:00';
}

/**
 * Converts an exact time string (HH:mm or HH:mm:ss) into minutes from midnight.
 * Non-time strings return -1.
 * IMPORTANT: Does NOT convert old labels like morning/afternoon/flexible into fallback times.
 */
export function parseSlotToMinutes(slotOrTime: string, _dayOfWeek?: number): number {
  if (!slotOrTime) return -1;
  const trimmed = String(slotOrTime).trim();
  const match = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
  if (!match) return -1;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  return h * 60 + m;
}

/**
 * Computes exact start time 'HH:mm:ss' for Square appointment payload.
 * Strictly returns formatted time for valid time strings, or '' if invalid.
 * Never defaults to fallback times for old labels like morning/afternoon/flexible.
 */
export function computeStartTimeForBooking(_dateStr: string, slotOrTime: string): string {
  const mins = parseSlotToMinutes(slotOrTime);
  if (mins < 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

/**
 * Returns exact available start times for a specific date based on business rules:
 * - Monday: from 17:00
 * - Tuesday: from 17:00
 * - Wednesday: from 17:00
 * - Thursday: from 16:00
 * - Friday: from 12:30
 * - Saturday: available all day (08:00 - 20:00)
 * - Sunday: available all day (08:00 - 20:00)
 */
export function getTimeSlotOptionsForDate(dateStr: string): TimeSlotOption[] {
  const dow = getDayOfWeekFromDateString(dateStr);
  if (dow < 0) {
    return [
      {
        value: '',
        label: {
          fr: 'Sélectionnez une date d\'abord',
          ua: 'Спочатку оберіть дату',
          en: 'Please select a date first'
        },
        startTime: '17:00:00',
        minutesFromMidnight: 1020
      }
    ];
  }

  // Monday (1), Tuesday (2), Wednesday (3): bookings start from 17:00
  if (dow === 1 || dow === 2 || dow === 3) {
    return [
      createTimeOption(17, 0),
      createTimeOption(18, 0),
      createTimeOption(19, 0),
      createTimeOption(20, 0),
      createTimeOption(20, 30)
    ];
  }

  // Thursday (4): bookings start from 16:00
  if (dow === 4) {
    return [
      createTimeOption(16, 0),
      createTimeOption(17, 0),
      createTimeOption(18, 0),
      createTimeOption(19, 0),
      createTimeOption(20, 0),
      createTimeOption(20, 30)
    ];
  }

  // Friday (5): bookings start from 12:30
  if (dow === 5) {
    return [
      createTimeOption(12, 30),
      createTimeOption(13, 0),
      createTimeOption(14, 0),
      createTimeOption(15, 0),
      createTimeOption(16, 0),
      createTimeOption(17, 0),
      createTimeOption(18, 0),
      createTimeOption(19, 0),
      createTimeOption(20, 0),
      createTimeOption(20, 30)
    ];
  }

  // Saturday (6) & Sunday (0): available all day
  return [
    createTimeOption(8, 0),
    createTimeOption(9, 0),
    createTimeOption(10, 0),
    createTimeOption(11, 0),
    createTimeOption(12, 0),
    createTimeOption(13, 0),
    createTimeOption(14, 0),
    createTimeOption(15, 0),
    createTimeOption(16, 0),
    createTimeOption(17, 0),
    createTimeOption(18, 0),
    createTimeOption(19, 0),
    createTimeOption(20, 0),
    createTimeOption(20, 30)
  ];
}

/**
 * Validates whether a booking start time is permitted according to schedule rules:
 * - Monday: bookings can start from 17:00
 * - Tuesday: bookings can start from 17:00
 * - Wednesday: bookings can start from 17:00
 * - Thursday: bookings can start from 16:00
 * - Friday: bookings can start from 12:30
 * - Saturday: available all day (08:00 - 20:30)
 * - Sunday: available all day (08:00 - 20:30)
 * - Global: bookings cannot start after 20:30 on any day
 */
export function validateBookingSchedule(
  dateStr: string,
  timeSlotOrTime: string
): {
  isValid: boolean;
  error?: { fr: string; ua: string; en: string };
  startTime: string; // 'HH:mm:ss'
  startAtIso: string; // 'YYYY-MM-DDTHH:mm:ss-04:00'
} {
  const cleanDate = (dateStr || '').trim().split('T')[0];
  const dow = getDayOfWeekFromDateString(cleanDate);
  const offset = getEasternTimeOffset(cleanDate);

  if (dow < 0) {
    return {
      isValid: false,
      error: {
        fr: 'Veuillez sélectionner une date de réservation valide.',
        ua: 'Будь ласка, оберіть коректну дату бронювання.',
        en: 'Please select a valid booking date.'
      },
      startTime: '',
      startAtIso: ''
    };
  }

  const rule = BOOKING_SCHEDULE_RULES[dow];
  const requestedMinutes = parseSlotToMinutes(timeSlotOrTime);

  // Reject empty times and non-exact strings (e.g. legacy morning/afternoon/flexible labels)
  if (!timeSlotOrTime || requestedMinutes < 0) {
    return {
      isValid: false,
      error: {
        fr: 'Veuillez sélectionner une heure de début exacte (ex. 17:00, 18:00).',
        ua: 'Будь ласка, оберіть точний час початку (наприклад, 17:00, 18:00).',
        en: 'Please select an exact start time (e.g. 5:00 PM, 6:00 PM).'
      },
      startTime: '',
      startAtIso: ''
    };
  }

  // Format time strictly as HH:mm to match allowed schedule slots
  const reqH = Math.floor(requestedMinutes / 60);
  const reqM = requestedMinutes % 60;
  const formattedTimeSlot = `${String(reqH).padStart(2, '0')}:${String(reqM).padStart(2, '0')}`;

  // Verify that the requested HH:mm exactly matches one of the allowed options returned by getTimeSlotOptionsForDate(cleanDate)
  const allowedOptions = getTimeSlotOptionsForDate(cleanDate);
  const isAllowedSlot = allowedOptions.some(opt => opt.value === formattedTimeSlot);

  const startTimeStr = computeStartTimeForBooking(cleanDate, timeSlotOrTime);
  const startAtIso = `${cleanDate}T${startTimeStr}${offset}`;

  if (!isAllowedSlot) {
    return {
      isValid: false,
      error: {
        fr: 'Ce créneau horaire n\'est pas disponible pour cette date (fuseau America/Toronto).',
        ua: 'Цей часовий слот недоступний для цієї дати (America/Toronto).',
        en: 'This time slot is not available for this date (America/Toronto).'
      },
      startTime: startTimeStr,
      startAtIso
    };
  }

  // Global Check: No booking may start after 20:30 (1230 minutes) on any day
  if (requestedMinutes > 20 * 60 + 30) {
    return {
      isValid: false,
      error: {
        fr: 'Les réservations ne peuvent pas commencer après 20h30 (fuseau America/Toronto).',
        ua: 'Бронювання не може починатися пізніше 20:30 (America/Toronto).',
        en: 'Bookings cannot start after 8:30 PM (America/Toronto).'
      },
      startTime: startTimeStr,
      startAtIso
    };
  }

  // Monday (1), Tuesday (2), Wednesday (3): bookings can start from 17:00 (1020 mins)
  if ((dow === 1 || dow === 2 || dow === 3) && requestedMinutes < 17 * 60) {
    return {
      isValid: false,
      error: {
        fr: `Le ${rule.dayName.fr.toLowerCase()} : réservations possibles uniquement à partir de 17h00 (fuseau America/Toronto).`,
        ua: `У ${rule.dayName.ua.toLowerCase()} : бронювання можливе лише з 17:00 (America/Toronto).`,
        en: `On ${rule.dayName.en} : bookings can only start from 5:00 PM (America/Toronto).`
      },
      startTime: startTimeStr,
      startAtIso
    };
  }

  // Thursday (4): bookings can start from 16:00 (960 mins)
  if (dow === 4 && requestedMinutes < 16 * 60) {
    return {
      isValid: false,
      error: {
        fr: 'Le jeudi : réservations possibles uniquement à partir de 16h00 (fuseau America/Toronto).',
        ua: 'У четвер : бронювання можливе лише з 16:00 (America/Toronto).',
        en: 'On Thursday : bookings can only start from 4:00 PM (America/Toronto).'
      },
      startTime: startTimeStr,
      startAtIso
    };
  }

  // Friday (5): bookings can start from 12:30 (750 mins)
  if (dow === 5 && requestedMinutes < 12 * 60 + 30) {
    return {
      isValid: false,
      error: {
        fr: 'Le vendredi : réservations possibles uniquement à partir de 12h30 (fuseau America/Toronto).',
        ua: 'У п\'ятницю : бронювання можливе лише з 12:30 (America/Toronto).',
        en: 'On Friday : bookings can only start from 12:30 PM (America/Toronto).'
      },
      startTime: startTimeStr,
      startAtIso
    };
  }

  // Saturday (6) and Sunday (0): available all day (08:00 - 20:30)
  if ((dow === 0 || dow === 6) && requestedMinutes < 8 * 60) {
    return {
      isValid: false,
      error: {
        fr: 'Le samedi et le dimanche sont disponibles à partir de 8h00 (fuseau America/Toronto).',
        ua: 'У суботу та неділю бронювання можливе з 8:00 (America/Toronto).',
        en: 'Saturday and Sunday bookings are available from 8:00 AM (America/Toronto).'
      },
      startTime: startTimeStr,
      startAtIso
    };
  }

  return {
    isValid: true,
    startTime: startTimeStr,
    startAtIso
  };
}

/**
 * Returns localized human-readable label for an exact start time
 */
export function getLocalizedSlotLabel(
  dateStr: string,
  slotOrTime: string,
  lang: 'fr' | 'ua' | 'en' = 'fr'
): string {
  if (!slotOrTime) return '';
  const options = getTimeSlotOptionsForDate(dateStr);
  const matched = options.find(o => o.value === slotOrTime);
  if (matched) {
    return matched.label[lang] || matched.label.fr;
  }
  const match = slotOrTime.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (match) {
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const opt = createTimeOption(h, m);
    return opt.label[lang] || opt.label.fr;
  }
  return slotOrTime;
}
