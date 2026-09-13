import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function KernelEye() {
  const navigate = useNavigate();
  
  const [resonance, setResonance] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [keySequence, setKeySequence] = useState(0);

  const clicksRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resonanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const TARGET_SEQUENCE = ['K', 'E', 'R', 'N', 'E', 'L'];
  
  // Mobile swipe detection
  const touchStartY = useRef<number | null>(null);

  // 1. Listen for 3 clicks anywhere on the page
  useEffect(() => {
    if (unlocked) return;

    const handleGlobalClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      // Ignore clicks inside form inputs or buttons to avoid interfering with normal interactions
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      clicksRef.current += 1;

      if (clicksRef.current >= 3) {
        clicksRef.current = 0;
        setResonance(true);
        setKeySequence(0);

        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        if (resonanceTimerRef.current) clearTimeout(resonanceTimerRef.current);

        // User has 8 seconds to enter SHIFT + K E R N E L
        resonanceTimerRef.current = setTimeout(() => {
          setResonance(false);
          setKeySequence(0);
        }, 8000);
        return;
      }

      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        clicksRef.current = 0;
      }, 2500); // 3 clicks must occur within 2.5 seconds
    };

    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (resonanceTimerRef.current) clearTimeout(resonanceTimerRef.current);
    };
  }, [unlocked]);

  // 2. Listen for SHIFT + K E R N E L when resonance is active
  useEffect(() => {
    if (!resonance || unlocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || (activeElement as HTMLElement).isContentEditable)) {
        return;
      }

      if (e.key === 'Shift') {
        return; // Ignore lone Shift presses
      }

      if (e.shiftKey && e.key.toUpperCase() === TARGET_SEQUENCE[keySequence]) {
        const nextSequence = keySequence + 1;
        if (nextSequence === TARGET_SEQUENCE.length) {
          try {
            sessionStorage.setItem('kernel_root_unlocked', 'true');
          } catch {}
          setUnlocked(true);
          setResonance(false);
          setKeySequence(0);
          if (resonanceTimerRef.current) clearTimeout(resonanceTimerRef.current);
        } else {
          setKeySequence(nextSequence);
        }
      } else {
        // Wrong key typed
        setKeySequence(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resonance, keySequence, unlocked]);

  // 3. Mobile swipe gesture equivalent when resonance is active
  useEffect(() => {
    if (!resonance || unlocked) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const endY = e.changedTouches[0].clientY;
      const diffY = endY - touchStartY.current;
      
      // Swipe down gesture
      if (diffY > 60) {
        try {
          sessionStorage.setItem('kernel_root_unlocked', 'true');
        } catch {}
        setUnlocked(true);
        setResonance(false);
        if (resonanceTimerRef.current) clearTimeout(resonanceTimerRef.current);
      }
      touchStartY.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [resonance, unlocked]);

  // If unlocked, render the cinematic fullscreen ROOT ACCESS overlay
  if (unlocked) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-700 select-none">
        {/* Fractured geometric background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px] animate-pulse" />
        
        {/* Close overlay button */}
        <button 
          onClick={() => setUnlocked(false)}
          className="absolute top-8 right-8 text-gray-400 hover:text-white font-sans text-sm tracking-widest px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
        >
          ✕ CLOSE
        </button>

        <div className="relative flex flex-col items-center text-center p-8 max-w-xl animate-[glitch_1s_ease-in-out]">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-pixel text-[9px] tracking-[0.3em] text-emerald-400 uppercase">
              SCHEMA DETECTED
            </span>
          </div>

          <h1 className="font-cinematic text-5xl md:text-7xl text-white font-normal tracking-tight mb-4 drop-shadow-[0_0_25px_rgba(52,211,153,0.7)]">
            ROOT ACCESS
          </h1>

          <p className="font-sans text-gray-300 text-sm md:text-base mb-10 max-w-md italic opacity-90">
            "...you found the layer underneath."
          </p>
          
          <button 
            onClick={() => {
              try {
                sessionStorage.setItem('kernel_root_unlocked', 'true');
                sessionStorage.removeItem('adminToken');
                localStorage.removeItem('adminToken');
              } catch {}
              navigate('/admin');
            }}
            className="px-8 py-4 bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 font-pixel hover:bg-emerald-400 hover:text-black transition-all duration-300 tracking-widest text-xs shadow-[0_0_25px_rgba(52,211,153,0.3)] hover:shadow-[0_0_40px_rgba(52,211,153,0.8)] cursor-pointer rounded-lg"
          >
            [ ACCESS CORE ]
          </button>
        </div>
      </div>
    );
  }

  // Completely invisible when idle or listening
  return null;
}
