import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const prefersReduced = useReducedMotion();

  const handleFinish = () => {
    try {
      sessionStorage.setItem('kernel_intro_played', 'true');
    } catch {
      // ignore storage errors in incognito/restricted mode
    }
    setIsVisible(false);
  };

  const toggleSound = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !video.muted;
    video.muted = newMuted;
    setIsMuted(newMuted);
    if (!newMuted) {
      video.play().catch(() => {});
    }
  };

  useEffect(() => {
    // If user prefers reduced motion, skip intro immediately
    if (prefersReduced) {
      handleFinish();
      onComplete();
      return;
    }

    // Check session storage
    try {
      if (sessionStorage.getItem('kernel_intro_played') === 'true') {
        setIsVisible(false);
        onComplete();
        return;
      }
    } catch {
      // ignore storage errors
    }

    const video = videoRef.current;
    if (video) {
      // First attempt autoplay with audio
      video.muted = false;
      setIsMuted(false);

      video.play().catch(() => {
        // If browser blocks unmuted autoplay, fall back to muted playback
        video.muted = true;
        setIsMuted(true);
        video.play().catch((err) => {
          console.warn('Intro video autoplay prevented:', err);
          handleFinish();
        });
      });
    }

    // Safety fallback: if video stalls or fails to trigger onEnded within 12 seconds
    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, 12000);

    return () => clearTimeout(safetyTimer);
  }, [prefersReduced]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          key="cinematic-intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="fixed inset-0 z-[9999] bg-black overflow-hidden select-none pointer-events-auto flex items-center justify-center cursor-pointer"
          onClick={toggleSound}
        >
          {/* Fullscreen Cover Video */}
          <video
            ref={videoRef}
            src="/assets/kernel-intro.mp4"
            autoPlay
            playsInline
            controls={false}
            onEnded={handleFinish}
            onError={handleFinish}
            className="w-full h-full object-cover select-none pointer-events-none"
          />

          {/* Subtle vignette border blend */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.7)_100%)]" />

          {/* Top Bar Hint */}
          <div className="absolute top-6 left-6 z-50 pointer-events-none flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-pixel text-[9px] tracking-[0.25em] text-emerald-400/80 uppercase">
              CINEMATIC PROLOGUE // TRANSMITTING
            </span>
          </div>

          {/* Sound Toggle Button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            onClick={toggleSound}
            className={`absolute bottom-6 left-6 sm:bottom-8 sm:left-8 z-50 px-4 py-2.5 rounded-full border backdrop-blur-xl text-xs font-mono tracking-wider uppercase transition-all duration-300 flex items-center space-x-2 shadow-2xl cursor-pointer ${
              isMuted
                ? 'border-amber-400/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 hover:border-amber-300 animate-pulse'
                : 'border-emerald-500/30 bg-black/60 text-emerald-400 hover:bg-black/80 hover:border-emerald-400'
            }`}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>UNMUTE AUDIO (CLICK TO HEAR)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>AUDIO ON</span>
              </>
            )}
          </motion.button>

          {/* Skip Intro Button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            onClick={(e) => {
              e.stopPropagation();
              handleFinish();
            }}
            className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 px-5 py-2.5 rounded-full border border-white/15 bg-black/50 hover:bg-black/80 hover:border-white/40 backdrop-blur-xl text-white/70 hover:text-white text-xs font-sans tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer shadow-2xl flex items-center space-x-2"
          >
            <span>Skip Intro</span>
            <SkipForward className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
