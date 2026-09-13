import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Wrench, 
  ShieldAlert, 
  HeartHandshake, 
  History, 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw, 
  Play, 
  Pause 
} from 'lucide-react';
import SpotlightCard from '../react-bits/SpotlightCard';

interface Ability {
  id: string;
  name: string;
  subname: string;
  category: string;
  summary: string;
  whatItDoes: string[];
  example: string;
  videoUrl: string;
  accent: string;
  badgeBg: string;
  icon: any;
}

const ABILITIES: Ability[] = [
  {
    id: 'schema-sight',
    name: 'X-Ray & Blueprint Sight',
    subname: 'Schema Sight',
    category: 'Diagnostics & Vision',
    summary: 'Allows Theo to see the hidden inner mechanics, wiring, and structural stress points of any machine or building without taking it apart.',
    whatItDoes: [
      'Locates internal mechanical cracks and electrical shorts through solid metal.',
      'Maps load-bearing weak spots in damaged buildings or bridges.',
      'Traces hidden power cables, pipes, and digital data lines through walls.'
    ],
    example: 'In his family appliance shop, Theo glances at a dead industrial washing motor. Within seconds, his eyes illuminate the copper coils inside, pinpointing a hairline fracture on winding #3—no tools required.',
    videoUrl: '/assets/abilities/schema_sight.mp4',
    accent: '#10b981',
    badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    icon: Eye,
  },
  {
    id: 'reforge',
    name: 'Instant Repair & Matter Reassembly',
    subname: 'Reforge',
    category: 'Physical Restoration',
    summary: 'Reassembles broken machinery, shattered metal, and cracked circuit boards by realigning their original atomic blueprint using harmonic resonance.',
    whatItDoes: [
      'Fuses broken metal rods, snapped gears, and cracked housings back into one piece.',
      'Re-establishes broken digital circuits and data traces on circuit boards.',
      'Temporarily reinforces vehicles or equipment to keep them running under heavy load.'
    ],
    example: 'During an escape, a piece of roadside debris punctures the delivery van’s radiator. Theo places his hand on the leaking metal; cyan resonance pulses across the rupture, knitting the crack shut and stabilizing the engine.',
    videoUrl: '/assets/abilities/reforge.mp4',
    accent: '#38bdf8',
    badgeBg: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30',
    icon: Wrench,
  },
  {
    id: 'kinetic-resonance',
    name: 'Kinetic Shield & Counter-Blast',
    subname: 'Kinetic Redirection',
    category: 'Defense & Force Return',
    summary: 'Deploys a protective resonance barrier that stops bullets, impacts, or concussive blasts cold, absorbs their momentum, and fires the force back.',
    whatItDoes: [
      'Blocks high-velocity bullets and explosive shockwaves with zero physical recoil.',
      'Converts absorbed attack energy into an expanding shockwave.',
      'Knocks back armed attackers and clears obstacles in a 20-foot radius.'
    ],
    example: 'Armed security opens fire. Theo raises a forearm—a violet resonance shield blooms. The incoming bullets freeze mid-air, their kinetic momentum absorbed and blasted back as a concussive shockwave that disarms the squad.',
    videoUrl: '/assets/abilities/kinetic_resonance.mp4',
    accent: '#a855f7',
    badgeBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
    icon: ShieldAlert,
  },
  {
    id: 'mind-resonance',
    name: 'Empathy Sense & Truth Detection',
    subname: 'Mind Resonance',
    category: 'Emotional Telepathy',
    summary: 'Tunes into emotional frequencies, allowing Theo to perceive someone’s hidden grief, panic, pain, or unvoiced truth without words.',
    whatItDoes: [
      'Instantly senses whether someone approaching is terrified, seeking help, or hostile.',
      'Verifies the authenticity of someone’s plea, detecting deceit and coercion.',
      'Calms panic attacks and traumatic shock through peaceful harmonic synchronization.'
    ],
    example: 'A terrified survivor arrives trembling and unable to speak. Theo sits nearby; teal harmonic waves synchronize, allowing him to perceive the exact events and terror the person endured without forcing them to relive it out loud.',
    videoUrl: '/assets/abilities/mind_resonance.mp4',
    accent: '#14b8a6',
    badgeBg: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30',
    icon: HeartHandshake,
  },
  {
    id: 'echo',
    name: 'Object Memory Recall',
    subname: 'Echo Recall',
    category: 'Psychometry & Investigation',
    summary: 'Reads residual energy signatures left on physical items, replaying holographic memories of who held them and what happened around them.',
    whatItDoes: [
      'Reveals the identity and silhouette of the last person who held an item.',
      'Reconstructs brief audio-visual fragments of past moments at a scene.',
      'Finds hidden mechanisms and forgotten history within antique machines.'
    ],
    example: 'Investigating an abandoned laboratory, Theo picks up a scorched security keycard. Golden ripples radiate from the plastic, projecting a ghost-like silhouette of the technician who dropped it while running from the containment breach 7 years ago.',
    videoUrl: '/assets/abilities/echo.mp4',
    accent: '#f59e0b',
    badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    icon: History,
  },
  {
    id: 'signal-bleed',
    name: 'Power Overload & Reality Glitch',
    subname: 'Signal Bleed',
    category: 'Emergency Overload',
    summary: 'An involuntary surge when Theo is pushed past his physical limits, emitting electromagnetic static and warping nearby digital optics.',
    whatItDoes: [
      'Scrambles nearby surveillance cameras, microphones, and digital tracking.',
      'Discharges high-voltage static that fries nearby electronic weapons and drones.',
      'Creates chromatic reality distortion, making Theo impossible to lock onto.'
    ],
    example: 'Cornered and wounded by tracking drones, Theo suffers sensory overload. His resonance surges unpredictably: red lightning static crackles through the air, all drone lenses shatter into static, and their navigation circuits short out.',
    videoUrl: '/assets/abilities/signal_bleed.mp4',
    accent: '#ef4444',
    badgeBg: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
    icon: Zap,
  },
];

export default function AbilitiesSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeAbility = ABILITIES[activeIdx];
  const ActiveIcon = activeAbility.icon;

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section id="abilities" className="relative w-full min-h-screen bg-[#f8faf7] dark:bg-[#070a0f] text-gray-900 dark:text-gray-100 py-24 md:py-32 px-6 sm:px-8 overflow-hidden transition-colors duration-300">
      {/* Ambient background glow matching active ability */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px] opacity-15 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: activeAbility.accent }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-14 items-start">
        
        {/* Left Column: Ability Selection List with Human-Friendly Wording */}
        <div className="flex-1 w-full lg:max-w-xl">
          <div className="flex items-center space-x-2.5 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="font-mono text-xs font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
              HOW THE POWERS WORK
            </span>
          </div>

          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-[1.15]">
            Theo’s Powers &amp; <span className="text-emerald-600 dark:text-emerald-400">Abilities</span>
          </h2>

          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Theo didn't ask for these abilities, but he uses them to protect people and repair what was broken. Click any power below to watch its simulation and see how it works in real-world scenarios.
          </p>

          <div className="flex flex-col space-y-3">
            {ABILITIES.map((ability, idx) => {
              const Icon = ability.icon;
              const isSelected = activeIdx === idx;

              return (
                <button
                  key={ability.id}
                  onClick={() => {
                    setActiveIdx(idx);
                    setIsPlaying(true);
                  }}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer group ${
                    isSelected
                      ? 'border-emerald-500/80 bg-emerald-50/80 dark:bg-emerald-950/30 shadow-[0_4px_24px_rgba(16,185,129,0.18)] translate-x-1 sm:translate-x-2'
                      : 'border-gray-200/90 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:border-emerald-500/40 hover:bg-gray-50/80 dark:hover:bg-white/[0.04] shadow-sm dark:shadow-none'
                  }`}
                >
                  <div className="flex items-start space-x-3.5 pr-4">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110"
                      style={{ 
                        backgroundColor: isSelected ? `${ability.accent}20` : 'rgba(128,128,128,0.08)',
                        color: ability.accent 
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="font-sans font-semibold text-base sm:text-lg text-gray-900 dark:text-white tracking-tight flex items-center space-x-2">
                        <span>{ability.name}</span>
                      </div>
                      <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400/90 font-medium mt-0.5">
                        {ability.subname} • <span className="text-gray-500 dark:text-gray-400 font-sans font-normal">{ability.category}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                        {ability.summary}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2 font-mono text-xs text-gray-400 dark:text-gray-500">
                    <span>0{idx + 1}</span>
                    <span className={`text-base transition-transform ${isSelected ? 'translate-x-0.5 text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: High-Quality Video Showcase & Clear Real-World Explanation */}
        <div className="flex-1 w-full lg:max-w-xl sticky top-24">
          <SpotlightCard 
            spotlightColor={`${activeAbility.accent}20`}
            className="p-6 sm:p-8 border-gray-200/90 dark:border-white/10 bg-white/95 dark:bg-black/50 shadow-2xl backdrop-blur-xl rounded-3xl"
          >
            {/* Live Video Simulation Window */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-gray-200/50 dark:border-white/10 shadow-inner group">
              <AnimatePresence mode="wait">
                <motion.video
                  key={activeAbility.videoUrl}
                  ref={videoRef}
                  src={activeAbility.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Status Header Overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
                  <span 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: activeAbility.accent }}
                  />
                  <span className="font-mono text-[10px] tracking-wider uppercase text-white font-semibold">
                    VIDEO SIMULATION
                  </span>
                </div>

                <span className="font-mono text-[10px] text-white/70 px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm border border-white/10">
                  {activeAbility.subname.toUpperCase()}
                </span>
              </div>

              {/* Video Play/Pause & Replay Controls */}
              <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleTogglePlay}
                  title={isPlaying ? "Pause Video" : "Play Video"}
                  className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleReplay}
                  title="Replay from start"
                  className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Description Details & Concrete Breakdown */}
            <div className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2.5">
                  <ActiveIcon className="w-5 h-5" style={{ color: activeAbility.accent }} />
                  <h3 className="font-sans font-bold text-xl sm:text-2xl text-gray-900 dark:text-white tracking-tight">
                    {activeAbility.name}
                  </h3>
                </div>

                <span className={`font-mono text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-full border uppercase ${activeAbility.badgeBg}`}>
                  {activeAbility.category}
                </span>
              </div>

              {/* Clear Summary */}
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-5 leading-relaxed font-normal">
                {activeAbility.summary}
              </p>

              {/* Concrete Breakdown: What it does */}
              <div className="mb-5 bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/5 rounded-2xl p-4">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Key Capabilities</span>
                </div>
                <ul className="space-y-2">
                  {activeAbility.whatItDoes.map((point, i) => (
                    <li key={i} className="flex items-start space-x-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <span 
                        className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" 
                        style={{ backgroundColor: activeAbility.accent }}
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Real-World Scenario Example */}
              <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/15">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-World Scenario Example</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 italic leading-relaxed">
                  "{activeAbility.example}"
                </p>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
