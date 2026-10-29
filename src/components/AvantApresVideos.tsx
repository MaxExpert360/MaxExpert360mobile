import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, Play, Image as ImageIcon, RotateCw, CheckCircle2, Film, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface AvantApresVideosProps {
  currentLang?: Language;
  onOpenBooking?: () => void;
}

export const AvantApresVideos: React.FC<AvantApresVideosProps> = ({
  currentLang = 'fr',
  onOpenBooking
}) => {
  // 'video' or 'photo'
  const [currentMode, setCurrentMode] = useState<'video' | 'photo'>('video');
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0); // 0 to 100%

  // Candidate paths (prioritized: main preferred name, then common alternatives)
  const [videoIndex, setVideoIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  const videoSources = [
    '/videos/nettoyage-video.mp4',
    '/videos/video.mp4',
    '/videos/chrysler.mp4',
    '/videos/auto.mp4'
  ];

  const photoSources = [
    '/videos/avant-apres.jpg',
    '/videos/avant-apres.png',
    '/videos/avant-apres.jpeg',
    '/videos/chrysler.jpg',
    '/videos/photo.jpg'
  ];

  const activeVideoSrc = videoSources[videoIndex] || videoSources[0];
  const activePhotoSrc = photoSources[photoIndex] || photoSources[0];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = {
    fr: {
      eyebrow: 'RÉSULTATS 100% AUTHENTIQUES',
      title: 'Nos Réalisations sur le terrain',
      subtitle: 'Vidéo réelle de nettoyage automobile, suivie de la photo authentique AVANT / APRÈS du tapis Chrysler.',
      videoBadge: 'VIDÉO : NETTOYAGE PROFESSIONNEL',
      photoBadge: 'PHOTO RÉELLE : TAPIS CHRYSLER AVANT / APRÈS',
      unmute: 'Activer le son',
      muted: 'Sans son',
      btnVideo: '1. Vidéo du nettoyage',
      btnPhoto: '2. Photo Avant / Après (6.5s)',
      ctaText: 'Envie du même résultat pour votre véhicule ?',
      ctaBtn: 'RÉSERVER MON NETTOYAGE',
      waitingTitle: 'En attente de vos fichiers originaux',
      waitingSubtitle: 'Pour afficher exclusivement vos vrais travaux sans aucune image générée par IA, placez vos fichiers dans :',
      videoFileExpected: 'public/videos/nettoyage-video.mp4',
      photoFileExpected: 'public/videos/avant-apres.jpg',
      cycleNotice: 'Cycle automatique : Vidéo complète ➔ Photo Avant / Après (6.5s) ➔ Répétition infinie',
      authenticTag: '100% Photos & Vidéos Réelles • Aucun trucage IA'
    },
    ua: {
      eyebrow: '100% СПРАВЖНІ РЕЗУЛЬТАТИ',
      title: 'Наші Реальні Роботи',
      subtitle: 'Справжнє відео професійної хімчистки авто, після якого демонструється оригінальне фото килимка Chrysler ДО / ПІСЛЯ.',
      videoBadge: 'ВІДЕО : ПРОФЕСІЙНА ХІМЧИСТКА АВТО',
      photoBadge: 'ФОТО : КИЛИМОК CHRYSLER ДО / ПІСЛЯ',
      unmute: 'Увімкнути звук',
      muted: 'Без звуку',
      btnVideo: '1. Відео хімчистки',
      btnPhoto: '2. Фото До / Після (6.5с)',
      ctaText: 'Бажаєте такий самий бездоганний результат для вашого авто?',
      ctaBtn: 'ЗАМОВИТИ ХІМЧИСТКУ',
      waitingTitle: 'Очікуються ваші оригінальні файли',
      waitingSubtitle: 'Сайт використовує виключно ваші справжні роботи без жодного штучного фото AI. Файли мають бути у папці :',
      videoFileExpected: 'public/videos/nettoyage-video.mp4',
      photoFileExpected: 'public/videos/avant-apres.jpg',
      cycleNotice: 'Безкінечний цикл: Повне відео ➔ Фото До / Після (6.5с) ➔ Повторення',
      authenticTag: '100% Оригінальні Фото та Відео • Без штучного інтелекту'
    },
    en: {
      eyebrow: '100% AUTHENTIC RESULTS',
      title: 'Our Real On-Site Work',
      subtitle: 'Real video of professional auto detailing, followed by the genuine Chrysler floor mat BEFORE / AFTER photo.',
      videoBadge: 'VIDEO : PROFESSIONAL DETAILING',
      photoBadge: 'PHOTO : CHRYSLER FLOOR MAT BEFORE / AFTER',
      unmute: 'Unmute audio',
      muted: 'Muted',
      btnVideo: '1. Cleaning video',
      btnPhoto: '2. Before / After photo (6.5s)',
      ctaText: 'Want the exact same immaculate result?',
      ctaBtn: 'BOOK MY DETAILING',
      waitingTitle: 'Waiting for your original media files',
      waitingSubtitle: 'Only your genuine photos and videos will be displayed with zero AI placeholders. Files must be located in :',
      videoFileExpected: 'public/videos/nettoyage-video.mp4',
      photoFileExpected: 'public/videos/avant-apres.jpg',
      cycleNotice: 'Endless loop: Full Video ➔ Before / After Photo (6.5s) ➔ Continuous loop',
      authenticTag: '100% Real On-Site Work • No AI generation'
    }
  }[currentLang];

  // Handle Photo 6.5-second timer & transition back to video
  useEffect(() => {
    if (currentMode === 'photo') {
      const PHOTO_DURATION_MS = 6500; // Exactly 6.5 seconds as requested
      const intervalStep = 50;
      let elapsed = 0;

      setPhotoProgress(0);

      // Smooth progress bar indicator
      progressIntervalRef.current = setInterval(() => {
        elapsed += intervalStep;
        const pct = Math.min(100, (elapsed / PHOTO_DURATION_MS) * 100);
        setPhotoProgress(pct);
      }, intervalStep);

      // Auto-switch back to video after 6.5s
      timerRef.current = setTimeout(() => {
        setCurrentMode('video');
      }, PHOTO_DURATION_MS);
    } else {
      // Clear timers when in video mode
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setPhotoProgress(0);

      // Restart and play video smoothly
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          // Autoplay handled by browser
        });
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentMode]);

  // When video naturally ends, transition to photo
  const handleVideoEnded = () => {
    setCurrentMode('photo');
  };

  const handleVideoError = () => {
    if (videoIndex < videoSources.length - 1) {
      setVideoIndex(prev => prev + 1);
    } else {
      setVideoError(true);
    }
  };

  const handlePhotoError = () => {
    if (photoIndex < photoSources.length - 1) {
      setPhotoIndex(prev => prev + 1);
    } else {
      setPhotoError(true);
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  const switchToVideo = () => {
    setCurrentMode('video');
  };

  const switchToPhoto = () => {
    setCurrentMode('photo');
  };

  return (
    <section id="avant-apres" className="py-14 sm:py-20 bg-[#F4FAF6] border-y border-[#E2EFE7] relative overflow-hidden scroll-mt-16">
      {/* Decorative subtle background accents matching MaxExpert360 light-green palette */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#22C55E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#16A34A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E2F6EA] border border-[#22C55E]/30 text-[#15803D] text-xs font-bold tracking-wider uppercase mb-3 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>{t.eyebrow}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-[#122B1E] tracking-tight">
            {t.title}
          </h2>

          <p className="text-sm sm:text-base text-[#4A6B56] mt-2 font-medium">
            {t.subtitle}
          </p>

          {/* Authentic Guarantee pill */}
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-[#EBF7EF] border border-[#CDE5D7] text-[11px] font-semibold text-[#15803D]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>{t.authenticTag}</span>
          </div>

          {/* Manual mode switcher tabs */}
          <div className="flex items-center justify-center gap-1.5 p-1.5 mt-6 bg-[#E8F5EE] border border-[#CDE5D7] rounded-xl text-xs font-bold shadow-xs max-w-xs mx-auto">
            <button
              type="button"
              onClick={switchToVideo}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                currentMode === 'video'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-[#2D5A3D] hover:text-[#122B1E] hover:bg-[#DDF0E5]'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.btnVideo}</span>
            </button>

            <button
              type="button"
              onClick={switchToPhoto}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                currentMode === 'photo'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-[#2D5A3D] hover:text-[#122B1E] hover:bg-[#DDF0E5]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{t.btnPhoto}</span>
            </button>
          </div>
        </div>

        {/* The Showcase Window (Optimized 4:5 frame for iPhone and Desktop) */}
        <div className="relative mx-auto max-w-[460px] aspect-[4/5] rounded-3xl overflow-hidden bg-[#0A130D] border-3 border-[#16A34A]/40 shadow-2xl shadow-[#16A34A]/15 select-none transition-all">
          
          {/* Top Floating Stage Badge */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 max-w-[75%]">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-md transition-all ${
              currentMode === 'video'
                ? 'bg-[#22C55E] text-black ring-2 ring-black/20'
                : 'bg-[#F59E0B] text-black ring-2 ring-black/20'
            }`}>
              {currentMode === 'video' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
                  <span className="truncate">{t.videoBadge}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span className="truncate">{t.photoBadge}</span>
                </>
              )}
            </span>
          </div>

          {/* Sound Toggle Button (Available during video for iPhone & desktop) */}
          {currentMode === 'video' && !videoError && (
            <button
              type="button"
              onClick={toggleSound}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-lg"
              title={isMuted ? t.unmute : t.muted}
              aria-label={isMuted ? t.unmute : t.muted}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-red-400" />
                  <span className="hidden sm:inline text-[11px]">{t.unmute}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#22C55E]" />
                  <span className="hidden sm:inline text-[11px] text-[#86EFAC]">{t.muted}</span>
                </>
              )}
            </button>
          )}

          {/* MODE 1: THE CLEANING VIDEO */}
          {currentMode === 'video' && (
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              {!videoError ? (
                <video
                  ref={videoRef}
                  src={activeVideoSrc}
                  autoPlay
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  onEnded={handleVideoEnded}
                  onError={handleVideoError}
                  className="w-full h-full object-cover sm:object-contain bg-black block"
                />
              ) : (
                /* Information Card when video file is not yet placed on disk */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0C1710] text-white">
                  <div className="w-14 h-14 rounded-2xl bg-[#16A34A]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] mb-3 shadow-inner">
                    <Film className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-base text-[#86EFAC] mb-1.5">
                    {t.waitingTitle}
                  </h4>
                  <p className="text-xs text-gray-300 max-w-xs mb-3 leading-relaxed">
                    {t.waitingSubtitle}
                  </p>
                  <code className="text-[11px] px-3 py-1.5 rounded-lg bg-black/60 border border-[#22C55E]/30 font-mono text-[#86EFAC] mb-4 select-all">
                    {t.videoFileExpected}
                  </code>
                  <button
                    type="button"
                    onClick={switchToPhoto}
                    className="px-4 py-2 rounded-xl bg-[#22C55E] text-black text-xs font-bold cursor-pointer hover:bg-[#16A34A] transition-colors"
                  >
                    Перейти до фотографії ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: THE CHRYSLER FLOOR MAT AVANT / APRÈS PHOTO (Shown for 6.5 seconds) */}
          {currentMode === 'photo' && (
            <div className="w-full h-full relative flex items-center justify-center bg-[#0C1710] animate-fade-in">
              {!photoError ? (
                <img
                  src={activePhotoSrc}
                  alt="Kилимок Chrysler AVANT / APRÈS"
                  onError={handlePhotoError}
                  className="w-full h-full object-cover sm:object-contain block"
                />
              ) : (
                /* Information Card when photo file is not yet placed on disk */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0C1710] text-white">
                  <div className="w-14 h-14 rounded-2xl bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B] mb-3 shadow-inner">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-base text-[#FDE68A] mb-1.5">
                    {t.waitingTitle}
                  </h4>
                  <p className="text-xs text-gray-300 max-w-xs mb-3 leading-relaxed">
                    {t.waitingSubtitle}
                  </p>
                  <code className="text-[11px] px-3 py-1.5 rounded-lg bg-black/60 border border-[#F59E0B]/30 font-mono text-[#FDE68A] mb-4 select-all">
                    {t.photoFileExpected}
                  </code>
                  <button
                    type="button"
                    onClick={switchToVideo}
                    className="px-4 py-2 rounded-xl bg-[#22C55E] text-black text-xs font-bold cursor-pointer hover:bg-[#16A34A] transition-colors"
                  >
                    Повернутися до відео ➔
                  </button>
                </div>
              )}

              {/* Progress Bar counting down the 6.5 seconds */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/70 z-20">
                <div
                  className="h-full bg-gradient-to-r from-[#22C55E] via-[#86EFAC] to-[#F59E0B] transition-all duration-75"
                  style={{ width: `${photoProgress}%` }}
                />
              </div>

              {/* Bottom Countdown Badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-black/80 border border-white/20 backdrop-blur-md text-white text-[11px] font-mono flex items-center gap-1.5 shadow-xl">
                <RotateCw className="w-3.5 h-3.5 text-[#22C55E] animate-spin" />
                <span>6.5s ➔ Запуск відео знову</span>
              </div>
            </div>
          )}

          {/* Bottom Gradient Label */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10 flex items-center justify-between text-white">
            <div className="space-y-0.5">
              <span className="text-xs font-black text-white flex items-center gap-1.5 drop-shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                MaxExpert360 Mobile
              </span>
              <p className="text-[11px] text-gray-300 font-medium">
                {currentMode === 'video' ? 'Етап 1: Відео реальної хімчистки' : 'Етап 2: Фото килимка Chrysler ДО / ПІСЛЯ'}
              </p>
            </div>
          </div>
        </div>

        {/* Continuous Loop cycle reminder */}
        <div className="text-center mt-3.5 text-xs text-[#527860] font-medium flex items-center justify-center gap-1.5">
          <RotateCw className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>{t.cycleNotice}</span>
        </div>

        {/* CTA Button to Book */}
        {onOpenBooking && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-sm tracking-wide shadow-lg shadow-[#16A34A]/25 transition-all transform hover:-translate-y-0.5 cursor-pointer uppercase"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{t.ctaBtn}</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default AvantApresVideos;
