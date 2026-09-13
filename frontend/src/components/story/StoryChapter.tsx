import { motion } from 'framer-motion';
import AnimatedContent from '../react-bits/AnimatedContent';

interface StoryChapterProps {
  id?: string;
  title: string;
  subtitle?: string;
  paragraphs: string[];
  imagePosition?: 'left' | 'right' | 'background';
  imageUrl: string;
  theme?: 'light' | 'dark' | 'root';
  tag?: string;
}

export default function StoryChapter({
  id,
  title,
  subtitle,
  paragraphs,
  imagePosition = 'right',
  imageUrl,
  theme = 'dark',
  tag,
}: StoryChapterProps) {
  const isBackground = imagePosition === 'background';

  const containerBg =
    theme === 'root'
      ? 'bg-[#080507] text-gray-200'
      : theme === 'light'
      ? 'bg-[#fcfdf9] dark:bg-[#080c12] text-gray-900 dark:text-gray-200 border-y border-gray-200 dark:border-white/5 transition-colors duration-300'
      : 'bg-[#f6f8f5] dark:bg-[#070a0f] text-gray-900 dark:text-gray-200 border-y border-gray-200/80 dark:border-white/5 transition-colors duration-300';

  const headingColor =
    theme === 'root'
      ? 'text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.5)]'
      : 'text-gray-900 dark:text-white';

  const subtitleColor =
    theme === 'root'
      ? 'text-red-400/80'
      : 'text-emerald-700 dark:text-emerald-400/90';

  const textColor =
    theme === 'root'
      ? 'text-gray-300'
      : 'text-gray-700 dark:text-gray-300/90';

  return (
    <section
      id={id}
      className={`relative w-full min-h-[65vh] md:min-h-[75vh] flex items-center justify-center py-12 sm:py-16 md:py-28 ${containerBg} overflow-hidden`}
    >
      {/* Background artwork mode */}
      {isBackground && (
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 opacity-30 md:opacity-40"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080507] via-transparent to-[#080507]/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.4),rgba(8,5,7,0.95))]" />
        </div>
      )}

      <div
        className={`relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col ${
          imagePosition === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'
        } items-center justify-between gap-8 sm:gap-12 lg:gap-16`}
      >
        {/* Editorial Text Column */}
        <AnimatedContent
          direction="up"
          className="flex-1 flex flex-col items-start max-w-xl"
        >
          {/* Subtle tag / classification */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 mb-3 sm:mb-4">
            <span className={`font-pixel text-[9px] tracking-[0.25em] uppercase ${subtitleColor}`}>
              {subtitle || 'RECORD ENTRY'}
            </span>
            {tag && (
              <>
                <span className="text-gray-500 text-xs">•</span>
                <span className="font-sans text-xs tracking-wider text-gray-400">{tag}</span>
              </>
            )}
          </div>

          <h2 className={`font-cinematic text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.08] tracking-tight mb-4 sm:mb-6 md:mb-8 ${headingColor}`}>
            {title}
          </h2>

          <div className={`font-sans text-sm sm:text-base md:text-lg leading-relaxed space-y-3.5 sm:space-y-4 ${textColor}`}>
            {paragraphs.map((p, idx) => (
              <p key={idx} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </AnimatedContent>

        {/* Cinematic Illustration Artwork Card */}
        {!isBackground && (
          <AnimatedContent
            direction={imagePosition === 'left' ? 'right' : 'left'}
            className="flex-1 w-full max-w-xl"
          >
            <div className="relative group">
              {/* Subtle ambient backlight aura */}
              <div className="absolute -inset-2 rounded-3xl bg-emerald-500/10 dark:bg-emerald-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] aspect-[16/10] bg-gray-100 dark:bg-black/40">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none" />
                <div className="absolute bottom-4 left-5 text-[11px] font-mono text-white/80 tracking-widest uppercase flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{subtitle}</span>
                </div>
              </div>
            </div>
          </AnimatedContent>
        )}
      </div>
    </section>
  );
}
