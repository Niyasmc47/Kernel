import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function KernelEye() {
  const navigate = useNavigate();
  
  const [, setClicks] = useState(0);
  const [resonance, setResonance] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [keySequence, setKeySequence] = useState<number>(0);
  
  const TARGET_SEQUENCE = ['K', 'E', 'R', 'N', 'E', 'L'];
  
  // Mobile swipe tracking
  const touchStartY = useRef<number | null>(null);
  const touchSwiped = useRef<boolean>(false);

  const handleEyeClick = () => {
    if (unlocked) return;
    
    // If resonance is active and we're on mobile, tapping the eye again after a swipe unlocks it
    if (resonance && touchSwiped.current) {
      triggerUnlock();
      return;
    }

    if (resonance) return; // Ignore clicks if already resonating but not swiped

    setClicks(prev => {
      const newCount = prev + 1;
      if (newCount === 3) {
        setResonance(true);
        return 0;
      }
      return newCount;
    });

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    clickTimeoutRef.current = setTimeout(() => {
      setClicks(0);
      setResonance(false);
      setKeySequence(0);
      touchSwiped.current = false;
    }, 5000); // Reset after 5 seconds of inactivity
  };

  const triggerUnlock = () => {
    setUnlocked(true);
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
  };

  useEffect(() => {
    if (!resonance || unlocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input or textarea
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || (activeElement as HTMLElement).isContentEditable)) {
        return;
      }

      if (e.shiftKey && e.key.toUpperCase() === TARGET_SEQUENCE[keySequence]) {
        const nextSequence = keySequence + 1;
        if (nextSequence === TARGET_SEQUENCE.length) {
          triggerUnlock();
        } else {
          setKeySequence(nextSequence);
        }
      } else if (e.key === 'Shift') {
        // Just pressing shift is fine, do nothing
      } else {
        // Wrong key pressed
        setKeySequence(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resonance, keySequence, unlocked]);

  // Mobile interaction listeners on the window (since they might swipe outside the eye)
  useEffect(() => {
    if (!resonance || unlocked) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY.current) return;
      const currentY = e.touches[0].clientY;
      const diffY = currentY - touchStartY.current;
      
      // Swipe down
      if (diffY > 50) {
        touchSwiped.current = true;
      }
    };

    const handleTouchEnd = () => {
      touchStartY.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [resonance, unlocked]);

  if (unlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-1000">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDEwaDQwdjFIMHptMCAyMGg0MHYxSDB6TTEwIDB2NDBoLTFWMHptMjAgMHY0MGgtMVYweiIgZmlsbD0iIzAwZmZmZiIvPjwvc3ZnPg==')] animate-pulse" style={{ backgroundSize: '40px 40px' }} />
        
        <div className="relative flex flex-col items-center animate-[glitch_1s_ease-in-out_infinite]">
          <h2 className="text-kernel-cyan font-pixel text-xl tracking-[0.5em] mb-4 opacity-50">SCHEMA DETECTED</h2>
          <h1 className="text-white font-pixel text-4xl md:text-6xl tracking-widest mb-12 drop-shadow-[0_0_15px_rgba(0,255,255,1)]">ROOT ACCESS</h1>
          <p className="text-kernel-gray font-mono mb-8 opacity-80">"...you found the layer underneath."</p>
          
          <button 
            onClick={() => navigate('/admin')}
            className="px-8 py-4 bg-transparent border-2 border-kernel-cyan text-kernel-cyan font-pixel hover:bg-kernel-cyan hover:text-black transition-all duration-300 tracking-widest shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] cursor-pointer"
          >
            [ ACCESS CORE ]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center my-8 select-none">
      <div 
        className={`relative w-16 h-16 md:w-24 md:h-24 cursor-crosshair flex items-center justify-center transition-all duration-500 ${resonance ? 'scale-110 drop-shadow-[0_0_30px_rgba(0,255,255,0.8)]' : 'hover:scale-105 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]'}`}
        onClick={handleEyeClick}
        onTouchEnd={handleEyeClick}
      >
        {/* Abstract Eye / Visor Geometric Shape */}
        <div className="absolute inset-0 bg-kernel-cyan/10 rounded-full animate-pulse" />
        <div className="w-full h-2/3 border-t-4 border-b-4 border-kernel-cyan rounded-[100%] absolute" />
        <div className={`w-4 h-4 md:w-6 md:h-6 bg-kernel-cyan rounded-full transition-all duration-300 ${resonance ? 'animate-ping opacity-100' : 'opacity-80'}`} />
        
        {/* Resonance indicators */}
        {resonance && (
          <>
            <div className="absolute -inset-4 border border-kernel-cyan/30 rounded-full animate-[spin_4s_linear_infinite]" />
            <div className="absolute -inset-8 border border-dashed border-kernel-cyan/20 rounded-full animate-[spin_8s_linear_infinite_reverse]" />
          </>
        )}
      </div>

      {resonance && (
        <div className="absolute top-full mt-4 text-[10px] text-kernel-cyan/50 font-pixel tracking-widest animate-fade-in pointer-events-none">
          resonance detected...
        </div>
      )}
    </div>
  );
}
