import { motion } from 'framer-motion';
import ChatInterface from '../chat/ChatInterface';
import PixelMagnet from '../react-bits/PixelMagnet';

interface CinematicHeroProps {
  isIntroFinished?: boolean;
}

export default function CinematicHero({ isIntroFinished = true }: CinematicHeroProps) {
  return (
    <section 
      id="top" 
      className="relative w-full min-h-[100dvh] flex flex-col justify-between overflow-hidden pb-8 sm:pb-10 md:pb-12 pt-20 sm:pt-24 md:pt-32"
    >
      {/* ========================================================================= */}
      {/* BACKGROUND ENVIRONMENT ART (Atmospheric Futuristic Mountain Landscape)     */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        {/* Full-bleed painted concept art background */}
        <motion.div 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/assets/hero_bg.jpg')` }}
        />

        {/* Atmospheric twilight vignette & deep mist depth gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a0f] via-[#070a0f]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070a0f]/90 via-[#070a0f]/40 to-[#070a0f]/85" />

        {/* Soft volumetric fog layer drifting slowly */}
        <motion.div 
          animate={{ x: [-20, 20, -20], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-x-0 bottom-16 h-80 bg-gradient-to-t from-emerald-950/20 via-emerald-500/[0.04] to-transparent blur-3xl pointer-events-none"
        />

        {/* Subtle floating emerald resonance particles in the night air */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { top: '22%', left: '18%', size: 'w-1 h-1', delay: 0, dur: 7 },
            { top: '38%', left: '32%', size: 'w-1.5 h-1.5', delay: 1.5, dur: 8.5 },
            { top: '55%', left: '12%', size: 'w-1 h-1', delay: 2.8, dur: 6.2 },
            { top: '70%', left: '26%', size: 'w-2 h-2', delay: 0.8, dur: 9.0 },
            { top: '30%', left: '46%', size: 'w-1 h-1', delay: 3.2, dur: 7.8 },
            { top: '65%', left: '42%', size: 'w-1.5 h-1.5', delay: 2.1, dur: 8.0 },
            { top: '48%', left: '68%', size: 'w-1 h-1', delay: 1.2, dur: 6.5 },
            { top: '25%', left: '78%', size: 'w-1.5 h-1.5', delay: 3.8, dur: 7.2 },
            { top: '75%', left: '58%', size: 'w-1 h-1', delay: 0.5, dur: 8.2 },
          ].map((pt, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] ${pt.size}`}
              style={{ top: pt.top, left: pt.left }}
              animate={{
                y: [0, -38, 0],
                x: [0, i % 2 === 0 ? 12 : -12, 0],
                opacity: [0.1, 0.85, 0.1],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: pt.dur,
                repeat: Infinity,
                delay: pt.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KERNEL CHARACTER ARTWORK (kernel-hero-transparent.png)                    */}
      {/* ========================================================================= */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-[6%] lg:left-[10%] w-[70%] sm:w-[55%] md:w-[46%] lg:w-[42%] h-[50%] sm:h-[65%] md:h-[90%] z-10 pointer-events-none flex items-end justify-center">
        {/* Soft emerald atmospheric aura strictly behind character silhouette */}
        <motion.div 
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [0.97, 1.03, 0.97] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-12 w-[240px] sm:w-[320px] md:w-[440px] h-[380px] md:h-[520px] bg-emerald-500/20 rounded-full blur-[80px] md:blur-[110px] -z-10"
        />

        {/* Character image with seamless edge blending & subtle idle breathing physics */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          className="relative w-full h-full flex items-end justify-center"
        >
          <motion.img 
            src="/assets/kernel-hero-transparent.png" 
            alt="KERNEL Superhero Character" 
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="max-h-[42vh] sm:max-h-[58vh] md:max-h-[88vh] w-auto object-contain object-bottom opacity-30 sm:opacity-40 md:opacity-100 transition-opacity duration-500 drop-shadow-[0_20px_45px_rgba(0,0,0,0.9)]"
          />
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* FOREGROUND CONTENT LAYER (Editorial Slogan on Left, Chat on Right)        */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-6 md:gap-8 my-auto">
        
        {/* Left Side: Compact Editorial Headline */}
        <div className="flex flex-col mb-2 md:mb-8 max-w-full md:max-w-sm z-30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black/60 border border-emerald-500/30 backdrop-blur-md mb-2.5 sm:mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] text-emerald-400 tracking-wider uppercase font-semibold">
                CENTRAL RELAY ONLINE
              </span>
            </div>

            <h1 className="font-cinematic text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.08] text-white tracking-tight mb-2 md:mb-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              EVERYTHING BREAKS.<br />
              <span className="italic font-light text-gray-200">That doesn't mean</span><br />
              <span className="text-emerald-400 font-medium drop-shadow-[0_0_20px_rgba(52,211,153,0.45)]">
                IT'S LOST.
              </span>
            </h1>

            <p className="font-sans text-gray-300 text-xs sm:text-sm leading-relaxed mb-3 md:mb-6 max-w-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Theo is listening. Share your grievance or emergency report below.
            </p>

            <div className="hidden md:block">
              <PixelMagnet onClick={() => {
                const el = document.getElementById('origin');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>
                Discover the Story
              </PixelMagnet>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Interactive Character Conversation Interface */}
        <div className="w-full md:w-[460px] lg:w-[500px] z-30">
          <ChatInterface startChat={isIntroFinished} />
        </div>

      </div>
    </section>
  );
}

