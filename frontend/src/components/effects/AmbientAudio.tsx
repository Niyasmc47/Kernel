import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AmbientAudioProps {
  isPlaying?: boolean;
}

// Increased by 3x from baseline (0.12 -> 0.36) for rich, immersive audible background volume
const DEFAULT_VOLUME = 0.36;

export default function AmbientAudio({ isPlaying = true }: AmbientAudioProps) {
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem('kernel_ambient_muted') === 'true';
    } catch {
      return false;
    }
  });

  const [hasInteracted, setHasInteracted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<any[]>([]);

  // Setup generative atmospheric ambient drone using Web Audio API
  const initAudioEngine = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(muted ? 0 : DEFAULT_VOLUME, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // 1. Deep Sub-Harmonic Foundation (55Hz A1)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, ctx.currentTime);

      const gain1 = ctx.createGain();
      gain1.gain.setValueAtTime(0.5, ctx.currentTime);

      // 2. Harmonic Fifth (82.5Hz E2)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(82.4, ctx.currentTime);

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.25, ctx.currentTime);

      // 3. Resonant Mid-Atmosphere (110Hz A2)
      const osc3 = ctx.createOscillator();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(110, ctx.currentTime);

      const gain3 = ctx.createGain();
      gain3.gain.setValueAtTime(0.15, ctx.currentTime);

      // 4. Ethereal High Shimmer (220Hz + 221.5Hz binaural beat)
      const osc4 = ctx.createOscillator();
      osc4.type = 'sine';
      osc4.frequency.setValueAtTime(220, ctx.currentTime);

      const osc5 = ctx.createOscillator();
      osc5.type = 'sine';
      osc5.frequency.setValueAtTime(221.5, ctx.currentTime);

      const shimmerGain = ctx.createGain();
      shimmerGain.gain.setValueAtTime(0.08, ctx.currentTime);

      // Filter with slow breathing modulation
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, ctx.currentTime);
      filter.Q.setValueAtTime(3.5, ctx.currentTime);

      // LFO for filter breath
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // ~12 second breath cycle
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(120, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Connect oscillators to filter
      osc1.connect(gain1);
      gain1.connect(filter);

      osc2.connect(gain2);
      gain2.connect(filter);

      osc3.connect(gain3);
      gain3.connect(filter);

      osc4.connect(shimmerGain);
      osc5.connect(shimmerGain);
      shimmerGain.connect(filter);

      filter.connect(masterGain);

      // Start oscillators
      osc1.start();
      osc2.start();
      osc3.start();
      osc4.start();
      osc5.start();
      lfo.start();

      nodesRef.current = [osc1, osc2, osc3, osc4, osc5, lfo, gain1, gain2, gain3, shimmerGain, filter, lfoGain];
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  };

  const toggleMute = () => {
    setHasInteracted(true);
    const newMuted = !muted;
    setMuted(newMuted);

    try {
      localStorage.setItem('kernel_ambient_muted', String(newMuted));
      window.dispatchEvent(new CustomEvent('kernel_audio_mute_changed', { detail: { muted: newMuted } }));
    } catch {
      // ignore
    }

    if (!newMuted && !audioCtxRef.current) {
      initAudioEngine();
    }

    if (audioCtxRef.current && masterGainRef.current) {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended' && !newMuted) {
        ctx.resume();
      }

      const targetGain = newMuted ? 0 : DEFAULT_VOLUME;
      masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
      masterGainRef.current.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.8);
    }
  };

  // Start audio on first user gesture if not muted
  useEffect(() => {
    const handleFirstGesture = () => {
      setHasInteracted(true);
      if (!muted) {
        initAudioEngine();
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
      }
    };

    const handleExternalMuteChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ muted: boolean }>;
      if (customEvent.detail !== undefined) {
        setMuted(customEvent.detail.muted);
      }
    };

    window.addEventListener('click', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);
    window.addEventListener('touchstart', handleFirstGesture);
    window.addEventListener('pointerdown', handleFirstGesture);
    window.addEventListener('kernel_audio_mute_changed', handleExternalMuteChange);

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('kernel_audio_mute_changed', handleExternalMuteChange);
    };
  }, [muted]);

  // Handle master pause/resume when isPlaying prop changes (e.g. video intro)
  useEffect(() => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    if (!isPlaying) {
      masterGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    } else if (!muted) {
      masterGainRef.current.gain.linearRampToValueAtTime(DEFAULT_VOLUME, ctx.currentTime + 1.0);
    }
  }, [isPlaying, muted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      nodesRef.current.forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch {
          // ignore
        }
      });
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const isAudioActive = !muted && hasInteracted;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={toggleMute}
        title={muted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
        className={`group flex items-center space-x-2.5 px-3.5 py-2 rounded-full border backdrop-blur-xl shadow-lg transition-all duration-300 cursor-pointer ${
          isAudioActive
            ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
            : 'bg-white/80 dark:bg-black/60 border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        {isAudioActive ? (
          <>
            {/* Animated Sound Wave Bars */}
            <div className="flex items-center space-x-0.5 h-3">
              <span className="w-0.5 h-2 bg-emerald-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
              <span className="w-0.5 h-3.5 bg-emerald-500 rounded-full animate-[pulse_1.1s_ease-in-out_infinite_0.2s]" />
              <span className="w-0.5 h-2.5 bg-emerald-500 rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.4s]" />
            </div>
            <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-mono tracking-wider uppercase font-medium">
              AMBIENCE
            </span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono tracking-wider uppercase">
              AUDIO MUTED
            </span>
          </>
        )}
      </button>
    </div>
  );
}

