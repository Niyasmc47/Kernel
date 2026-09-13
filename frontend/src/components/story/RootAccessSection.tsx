import { motion } from 'framer-motion';
import GlitchText from '../react-bits/GlitchText';
import AnimatedContent from '../react-bits/AnimatedContent';

export default function RootAccessSection() {
  return (
    <section 
      id="root-access" 
      className="relative w-full min-h-[75vh] md:min-h-[90vh] flex items-center justify-center py-16 sm:py-24 md:py-36 bg-[#040203] text-gray-200 overflow-hidden"
    >
      {/* Background artwork with corruption glow */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <motion.div 
          initial={{ scale: 1.05 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 8, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center opacity-45 md:opacity-55"
          style={{ backgroundImage: `url('/assets/root_access_bg.jpg')` }}
        />
        {/* Obsidian vignette & burning ember gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040203] via-transparent to-[#040203]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.12),rgba(4,2,3,0.92)_70%)]" />
      </div>

      {/* Floating corrupted digital ember particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
        {[
          { top: '25%', left: '15%', size: 'w-1.5 h-1.5', delay: 0 },
          { top: '65%', left: '22%', size: 'w-1 h-1', delay: 1.8 },
          { top: '35%', left: '75%', size: 'w-2 h-2', delay: 0.9 },
          { top: '78%', left: '80%', size: 'w-1 h-1', delay: 2.5 },
          { top: '48%', left: '50%', size: 'w-1.5 h-1.5', delay: 1.2 },
        ].map((pt, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] ${pt.size}`}
            style={{ top: pt.top, left: pt.left }}
            animate={{
              y: [0, -45, 0],
              opacity: [0.2, 0.9, 0.2],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: pt.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center text-center">
        
        <AnimatedContent direction="down" className="mb-4 sm:mb-6">
          <div className="inline-flex items-center space-x-2.5 sm:space-x-3 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-red-950/50 border border-red-500/30 backdrop-blur-md">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-mono text-[10px] sm:text-xs tracking-wider text-red-400 uppercase font-semibold">
              THE OPPOSING FORCE • ROOT ACCESS
            </span>
          </div>
        </AnimatedContent>

        <AnimatedContent direction="up" delay={0.2} className="mb-6 sm:mb-8 max-w-3xl">
          <h2 className="font-cinematic text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-white mb-3 sm:mb-6 drop-shadow-[0_4px_24px_rgba(239,68,68,0.4)]">
            <GlitchText text="ROOT ACCESS." className="text-red-500" />
          </h2>
          <p className="font-cinematic text-xl sm:text-2xl md:text-3xl text-red-200/90 italic font-light">
            "Some things were never meant to be rebuilt."
          </p>
        </AnimatedContent>

        <AnimatedContent direction="up" delay={0.4} className="max-w-2xl text-center">
          <div className="font-sans text-sm sm:text-base md:text-lg text-gray-300/90 leading-relaxed space-y-3.5 sm:space-y-4 mb-6 sm:mb-10">
            <p>
              While KERNEL seeks to protect people and repair the fractures of human lives, 
              <strong className="text-red-400 font-medium"> ROOT ACCESS</strong> believes broken things should simply be wiped clean.
            </p>
            <p>
              A cold, corrupted entity spreading along the world's stress lines. It doesn't mend damaged systems—it purges them, consuming memory, empathy, and matter into a silent, unresponsive void.
            </p>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-black/60 border border-red-500/20 backdrop-blur-md inline-block max-w-lg text-left">
            <div className="font-mono text-[11px] sm:text-xs text-red-400/90 font-semibold tracking-wider uppercase mb-2">
              TWO OPPOSING BELIEFS
            </div>
            <div className="font-sans text-xs sm:text-sm text-gray-300 leading-relaxed space-y-1">
              <div><span className="text-emerald-400 font-medium">KERNEL:</span> "Fix what is broken. Honor the fracture."</div>
              <div><span className="text-red-400 font-medium">ROOT ACCESS:</span> "Delete the flawed. Impose the clean state."</div>
            </div>
          </div>
        </AnimatedContent>

      </div>
    </section>
  );
}

