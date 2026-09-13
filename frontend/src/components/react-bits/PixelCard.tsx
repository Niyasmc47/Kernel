import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PixelCardProps {
  children: ReactNode;
  className?: string;
  isActive?: boolean;
}

export default function PixelCard({ children, className = '', isActive = false }: PixelCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 border ${
        isActive
          ? 'border-emerald-400/80 bg-emerald-950/20 shadow-[0_0_30px_rgba(52,211,153,0.15)]'
          : 'border-white/10 dark:border-white/10 bg-white/5 dark:bg-black/40 hover:border-emerald-500/40 hover:bg-emerald-950/10'
      } backdrop-blur-md ${className}`}
    >
      <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-emerald-400/40" />
      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400/40" />
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-emerald-400/40" />
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-emerald-400/40" />
      {children}
    </motion.div>
  );
}

