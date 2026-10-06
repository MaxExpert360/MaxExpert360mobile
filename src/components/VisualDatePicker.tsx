import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export interface VisualDatePickerProps {
  selectedDate: string; // Format 'YYYY-MM-DD'
  onSelectDate: (dateStr: string) => void;
  hasError?: boolean;
  id?: string;
  minDate?: string; // Format 'YYYY-MM-DD'
}

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const WEEK_DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/**
 * Returns today's date string in Quebec (America/Toronto timezone) as 'YYYY-MM-DD'
 */
export function getTodayDateStringQuebec(): string {
  const formatter = new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
}

/**
 * Formats a 'YYYY-MM-DD' string to a human-readable French string, e.g. "Mardi 6 octobre 2026"
 */
export function formatFullFrenchDate(dateStr: string): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const formatter = new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'America/Toronto',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const formatted = formatter.format(dateObj);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export const VisualDatePicker: React.FC<VisualDatePickerProps> = ({
  selectedDate,
  onSelectDate,
  hasError = false,
  id = 'booking-field-date',
  minDate
}) => {
  const todayStr = minDate || getTodayDateStringQuebec();
  const [todayYear, todayMonth] = todayStr.split('-').map(Number);

  // Initial view year and month (0-indexed)
  const initialYear = selectedDate ? parseInt(selectedDate.split('-')[0], 10) : todayYear;
  const initialMonth = selectedDate ? parseInt(selectedDate.split('-')[1], 10) - 1 : (todayMonth - 1);

  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync view when selectedDate changes from external prop
  useEffect(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      const [y, m] = selectedDate.split('-').map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    }
  }, [selectedDate]);

  // Handle clicking or tapping outside to close
  useEffect(() => {
    function handleEventOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleEventOutside);
      document.addEventListener('touchstart', handleEventOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleEventOutside);
      document.removeEventListener('touchstart', handleEventOutside);
    };
  }, [isOpen]);

  // When calendar opens, ensure it is comfortably in view
  useEffect(() => {
    if (isOpen && containerRef.current) {
      try {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch {
        // Fallback for older browsers
      }
    }
  }, [isOpen]);

  // Month navigation
  const canGoPrevious = () => {
    if (viewYear > todayYear) return true;
    if (viewYear === todayYear && viewMonth > (todayMonth - 1)) return true;
    return false;
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canGoPrevious()) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Build grid days for Monday-first week
  // Date(viewYear, viewMonth, 1).getDay() -> 0=Sun, 1=Mon, ..., 6=Sat
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  // Monday index: 0 = Mon, 1 = Tue, ..., 6 = Sun
  const mondayOffset = (firstDayOfWeek + 6) % 7;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Quick shortcuts helper
  const handleQuickSelect = (offsetDays: number) => {
    const [y, m, d] = todayStr.split('-').map(Number);
    const target = new Date(Date.UTC(y, m - 1, d + offsetDays, 12, 0, 0));
    const targetStr = target.toISOString().split('T')[0];
    onSelectDate(targetStr);
    setIsOpen(false);
  };

  // Find next Saturday
  const handleNextSaturday = () => {
    const [y, m, d] = todayStr.split('-').map(Number);
    const curr = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const dayOfWeek = curr.getUTCDay(); // 6 is Saturday
    let daysToAdd = (6 - dayOfWeek + 7) % 7;
    if (daysToAdd === 0) daysToAdd = 7; // next week Saturday if today is Saturday
    const target = new Date(Date.UTC(y, m - 1, d + daysToAdd, 12, 0, 0));
    onSelectDate(target.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full select-none" id={`${id}-container`}>
      {/* Trigger: Clicking anywhere on the field or icon opens/closes the visual calendar */}
      <div
        id={`${id}-trigger`}
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full flex items-center justify-between bg-[#080E0A] rounded-xl px-3.5 py-2.5 transition-all cursor-pointer select-none ${
          hasError
            ? 'border-2 border-red-500 bg-red-950/20 text-red-200'
            : isOpen
              ? 'border-2 border-[#22C55E] ring-2 ring-[#22C55E]/20 text-white shadow-lg shadow-[#22C55E]/10'
              : 'border border-[#203926] hover:border-[#22C55E]/60 text-white'
        }`}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Sélectionner la date souhaitée"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(prev => !prev);
          }
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Calendar Icon Button: Clicking explicitly toggles the calendar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(prev => !prev);
            }}
            className="p-1 rounded-lg text-[#22C55E] hover:bg-[#132819] transition-colors cursor-pointer shrink-0"
            title="Ouvrir le calendrier visuel"
            aria-label="Ouvrir le calendrier visuel"
          >
            <CalendarIcon className={`w-4 h-4 transition-colors ${
              hasError ? 'text-red-400' : 'text-[#22C55E]'
            }`} />
          </button>

          {/* Read-only Input: Disallows typing completely, displays human-readable French date */}
          <input
            id={id}
            type="text"
            readOnly
            inputMode="none"
            tabIndex={-1}
            value={selectedDate ? formatFullFrenchDate(selectedDate) : ''}
            placeholder="Cliquer pour choisir une date sur le calendrier..."
            className="w-full bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none cursor-pointer select-none font-medium truncate"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(prev => !prev);
            }}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {selectedDate && (
            <span className="text-[10px] font-mono font-bold bg-[#14291B] text-[#86EFAC] px-2 py-0.5 rounded border border-[#22C55E]/30 hidden sm:inline-block">
              {selectedDate}
            </span>
          )}
          <span className="text-xs text-[#22C55E] font-bold">
            {isOpen ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Visual Calendar Popup / Panel */}
      {isOpen && (
        <div
          className="mt-2 w-full bg-[#0C1610] border border-[#22C55E]/40 rounded-xl p-3.5 sm:p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
          style={{ isolation: 'isolate' }}
        >
          {/* Header: Navigation & Month Title */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#203926]">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!canGoPrevious()}
              className={`p-1.5 rounded-lg border transition-all ${
                canGoPrevious()
                  ? 'border-[#203926] text-white hover:bg-[#1A2E20] hover:border-[#22C55E] active:scale-95 cursor-pointer'
                  : 'border-transparent text-gray-600 cursor-not-allowed opacity-30'
              }`}
              title="Mois précédent"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-sm font-bold text-white tracking-wide">
                {MONTH_NAMES_FR[viewMonth]} {viewYear}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-[#203926] text-white hover:bg-[#1A2E20] hover:border-[#22C55E] active:scale-95 transition-all cursor-pointer"
              title="Mois suivant"
              aria-label="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => handleQuickSelect(0)}
              className="px-2.5 py-1 rounded-md bg-[#132419] border border-[#203926] text-[#86EFAC] hover:border-[#22C55E] hover:bg-[#1C3625] transition-all whitespace-nowrap cursor-pointer text-[11px] font-medium"
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(1)}
              className="px-2.5 py-1 rounded-md bg-[#132419] border border-[#203926] text-[#86EFAC] hover:border-[#22C55E] hover:bg-[#1C3625] transition-all whitespace-nowrap cursor-pointer text-[11px] font-medium"
            >
              Demain
            </button>
            <button
              type="button"
              onClick={handleNextSaturday}
              className="px-2.5 py-1 rounded-md bg-[#132419] border border-[#203926] text-[#86EFAC] hover:border-[#22C55E] hover:bg-[#1C3625] transition-all whitespace-nowrap cursor-pointer text-[11px] font-medium"
            >
              Samedi prochain
            </button>
          </div>

          {/* Days of Week Header (Monday first) */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEK_DAYS_FR.map((dayName, idx) => (
              <div
                key={dayName}
                className={`text-[11px] font-bold font-mono py-1 uppercase tracking-wider ${
                  idx >= 5 ? 'text-[#86EFAC]' : 'text-gray-400'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank cells for offset before month starts */}
            {Array.from({ length: mondayOffset }).map((_, i) => (
              <div key={`offset-${i}`} className="h-9 sm:h-10" />
            ))}

            {/* Days in the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isPast = dayStr < todayStr;
              const isToday = dayStr === todayStr;
              const isSelected = dayStr === selectedDate;

              return (
                <button
                  key={dayStr}
                  type="button"
                  disabled={isPast}
                  onClick={() => {
                    onSelectDate(dayStr);
                    setIsOpen(false);
                  }}
                  className={`relative h-9 sm:h-10 rounded-lg flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                    isPast
                      ? 'text-gray-600 bg-transparent cursor-not-allowed opacity-30 pointer-events-none'
                      : isSelected
                        ? 'bg-[#22C55E] text-black font-extrabold shadow-lg shadow-[#22C55E]/40 scale-105 z-10 cursor-pointer'
                        : 'text-gray-200 bg-[#101D14] hover:bg-[#1B3423] hover:text-white hover:border-[#22C55E]/60 border border-[#203926]/40 cursor-pointer active:scale-95'
                  }`}
                  aria-label={`${dayNum} ${MONTH_NAMES_FR[viewMonth]} ${viewYear}${isPast ? ' (Passé)' : ''}${isSelected ? ' (Sélectionné)' : ''}`}
                >
                  <span>{dayNum}</span>

                  {/* Indicator dot for today */}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#22C55E]" title="Aujourd'hui" />
                  )}

                  {/* Checkmark badge for selected */}
                  {isSelected && (
                    <Check className="w-3 h-3 absolute top-1 right-1 text-black" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer information */}
          <div className="mt-3 pt-2 border-t border-[#203926] flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block" />
              <span>Fuseau : Québec (America/Toronto)</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#86EFAC] hover:underline cursor-pointer font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
