import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

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
    try {
      localStorage.setItem('kernel_ambient_muted', String(newMuted));
      window.dispatchEvent(new CustomEvent('kernel_audio_mute_changed', { detail: { muted: newMuted } }));
    } catch {
      // ignore
    }
    if (!newMuted) {
      video.play().catch(() => {});
    }
  };

  useEffect(() => {
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
      // First attempt autoplay with audio on (volume 100%)
      video.volume = 1.0;
      video.muted = false;
      setIsMuted(false);

      video.play().catch(() => {
        // If browser blocks unmuted autoplay without prior gesture, start muted
        video.muted = true;
        setIsMuted(true);
        video.play().catch((err) => {
          console.warn('Intro video autoplay prevented:', err);
          handleFinish();
        });

        // Unmute automatically on the very first user click/touch anywhere
        const enableAudioOnGesture = () => {
          if (videoRef.current) {
            videoRef.current.muted = false;
            setIsMuted(false);
            videoRef.current.play().catch(() => {});
          }
          window.removeEventListener('click', enableAudioOnGesture);
          window.removeEventListener('touchstart', enableAudioOnGesture);
          window.removeEventListener('keydown', enableAudioOnGesture);
        };

        window.addEventListener('click', enableAudioOnGesture, { once: true });
        window.addEventListener('touchstart', enableAudioOnGesture, { once: true });
        window.addEventListener('keydown', enableAudioOnGesture, { once: true });
      });
    }

    // Safety fallback: if video stalls or fails to trigger onEnded within 12 seconds
    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, 12000);

    return () => clearTimeout(safetyTimer);
  }, []);

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

          {/* Bottom Bar Responsive Controls */}
          <div className="absolute bottom-4 sm:bottom-8 inset-x-4 sm:inset-x-8 z-50 flex items-center justify-between pointer-events-none">
            {/* Sound Toggle Button */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              onClick={toggleSound}
              className={`pointer-events-auto px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border backdrop-blur-xl text-[10px] sm:text-xs font-mono tracking-wider uppercase transition-all duration-300 flex items-center space-x-1.5 sm:space-x-2 shadow-2xl cursor-pointer ${
                isMuted
                  ? 'border-amber-400/40 bg-amber-950/60 text-amber-300 hover:bg-amber-900/60 hover:border-amber-300 animate-pulse'
                  : 'border-emerald-500/30 bg-black/60 text-emerald-400 hover:bg-black/80 hover:border-emerald-400'
              }`}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>UNMUTE AUDIO</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-pulse shrink-0" />
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
              className="pointer-events-auto px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/15 bg-black/60 hover:bg-black/80 hover:border-white/40 backdrop-blur-xl text-white/80 hover:text-white text-[10px] sm:text-xs font-sans tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer shadow-2xl flex items-center space-x-1.5 sm:space-x-2 shrink-0"
            >
              <span>Skip Intro</span>
              <SkipForward className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
