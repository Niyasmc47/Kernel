import { motion } from 'framer-motion';
import PixelMagnet from '../react-bits/PixelMagnet';
import AnimatedContent from '../react-bits/AnimatedContent';

interface MissionSectionProps {
  onReturnToHero: () => void;
}

export default function MissionSection({ onReturnToHero }: MissionSectionProps) {
  return (
    <section 
      id="mission" 
      className="relative w-full min-h-[85vh] flex items-center justify-center py-28 md:py-36 overflow-hidden text-center"
    >
      {/* Background panoramic sunrise landscape */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <motion.div 
          initial={{ scale: 1.05 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 10, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/assets/mission_bg.jpg')` }}
        />
        {/* Soft morning ambient gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8faf7] via-[#f8faf7]/40 to-[#f8faf7]/80 dark:from-[#070a0f] dark:via-[#070a0f]/40 dark:to-[#070a0f]/80 transition-colors duration-500" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#f8faf7]/50 to-[#f8faf7] dark:via-[#070a0f]/50 dark:to-[#070a0f]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-8 flex flex-col items-center">
        
        <AnimatedContent direction="down" className="mb-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-xs tracking-wider text-emerald-700 dark:text-emerald-400 uppercase font-semibold">
              STANDING BY TO HELP
            </span>
          </div>
        </AnimatedContent>

        <AnimatedContent direction="up" delay={0.1} className="mb-6">
          <h2 className="font-cinematic text-5xl sm:text-6xl lg:text-7xl font-normal text-gray-900 dark:text-white tracking-tight leading-[1.05]">
            THE MISSION <span className="italic text-emerald-600 dark:text-emerald-400">CONTINUES.</span>
          </h2>
        </AnimatedContent>

        <AnimatedContent direction="up" delay={0.2} className="max-w-2xl mb-10">
          <p className="font-sans text-base sm:text-lg text-gray-700 dark:text-gray-200 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            Theo operates in the quiet spaces where institutions fail and authority looks away.
            Whether you face systemic abuse, housing intimidation, or a crisis too strange for ordinary channels—Theo is listening.
          </p>
        </AnimatedContent>

        <AnimatedContent direction="up" delay={0.3}>
          <PixelMagnet onClick={onReturnToHero} className="text-base px-8 py-3.5 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
            Speak with KERNEL
          </PixelMagnet>
        </AnimatedContent>

      </div>
    </section>
  );
}

