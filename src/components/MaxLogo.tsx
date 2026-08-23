import React from 'react';

interface MaxLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const MaxLogo: React.FC<MaxLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const sizeConfig = {
    sm: {
      badge: 'w-9 h-9',
      svg: 'w-6 h-6',
      title: 'text-sm tracking-tight',
      sub: 'text-[7px]',
      badgeText: 'text-[9px]'
    },
    md: {
      badge: 'w-11 h-11',
      svg: 'w-7 h-7',
      title: 'text-base sm:text-lg tracking-tight',
      sub: 'text-[8.5px]',
      badgeText: 'text-[11px]'
    },
    lg: {
      badge: 'w-16 h-16',
      svg: 'w-10 h-10',
      title: 'text-xl sm:text-2xl tracking-normal',
      sub: 'text-[10px]',
      badgeText: 'text-sm'
    },
    xl: {
      badge: 'w-24 h-24',
      svg: 'w-16 h-16',
      title: 'text-3xl sm:text-4xl tracking-normal',
      sub: 'text-xs',
      badgeText: 'text-lg'
    }
  }[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Circular Emblem matching the exact flyer seal */}
      <div className={`relative ${sizeConfig.badge} rounded-full bg-gradient-to-b from-[#162A1B] to-[#0A120D] border-2 border-[#22C55E] flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)] shrink-0 overflow-hidden group`}>
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.25)_0%,transparent_70%)]" />
        
        {/* Stylized SVG Emblem inside */}
        <svg 
          viewBox="0 0 100 100" 
          className={`${sizeConfig.svg} text-[#22C55E] relative z-10`}
          fill="none" 
          stroke="currentColor"
        >
          {/* Bubbles */}
          <circle cx="50" cy="18" r="4" fill="#22C55E" opacity="0.8" />
          <circle cx="62" cy="14" r="2.5" fill="#4ADE80" opacity="0.9" />
          <circle cx="38" cy="16" r="2" fill="#86EFAC" opacity="0.7" />
          
          {/* Car outline */}
          <path 
            d="M26 46 L34 32 L66 32 L74 46 L82 48 C85 49 87 52 87 55 L87 63 C87 65 85 67 83 67 L79 67 C79 62 75 58 70 58 C65 58 61 62 61 67 L39 67 C39 62 35 58 30 58 C25 58 21 62 21 67 L17 67 C15 67 13 65 13 63 L13 55 C13 52 15 49 18 48 Z" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.15"
          />
          {/* Wheels */}
          <circle cx="30" cy="67" r="6" fill="#15803D" stroke="#4ADE80" strokeWidth="2.5" />
          <circle cx="70" cy="67" r="6" fill="#15803D" stroke="#4ADE80" strokeWidth="2.5" />
          
          {/* Car Windshield divider */}
          <path d="M37 44 L41 35 L59 35 L63 44 Z" strokeWidth="2" stroke="white" fill="#22C55E" fillOpacity="0.4" />

          {/* Clean stylized 360 text */}
          <text 
            x="50" 
            y="88" 
            textAnchor="middle" 
            fill="#4ADE80" 
            fontSize="15" 
            fontWeight="900" 
            fontFamily="Montserrat, sans-serif"
            letterSpacing="1"
          >
            360°
          </text>
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black font-heading text-white uppercase ${sizeConfig.title}`}>
            MAX<span className="text-[#22C55E]">EXPERT</span>
          </span>
          <span className="bg-[#15803D] text-white text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded tracking-wide shadow-sm">
            360
          </span>
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`font-black tracking-[0.25em] text-[#86EFAC] uppercase font-mono ${sizeConfig.sub}`}>
              MOBILE
            </span>
            <span className="w-1 h-1 rounded-full bg-[#22C55E]" />
            <span className={`font-semibold tracking-wider text-[#9CA3AF] uppercase ${sizeConfig.sub}`}>
              Drummondville
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
