import { useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { motion } from 'framer-motion';

interface PixelMagnetProps {
  children: ReactNode;
  strength?: number;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function PixelMagnet({
  children,
  strength = 0.25,
  className = '',
  onClick,
  disabled = false,
}: PixelMagnetProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current || disabled) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) * strength;
    const dy = (e.clientY - centerY) * strength;
    setOffset({ x: dx, y: dy });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, mass: 0.5 }}
      className={`relative inline-flex items-center justify-center space-x-2 rounded-lg px-5 py-2.5 text-sm font-sans font-medium tracking-wide transition-all duration-300 border border-emerald-500/70 text-emerald-400 hover:text-white hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] bg-transparent backdrop-blur-sm cursor-pointer ${className}`}
    >
      <span>{children}</span>
      <span className="w-5 h-5 rounded-full border border-emerald-400/50 flex items-center justify-center text-xs">
        →
      </span>
    </motion.button>
  );
}

