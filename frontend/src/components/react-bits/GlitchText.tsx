import { useState, useEffect } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export default function GlitchText({ text, className = '', speed = 80 }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const triggerInterval = setInterval(() => {
      setIsGlitching(true);
      let iteration = 0;
      const chars = '█▓▒░#$!%&*+=?@01';
      
      const glitchInterval = setInterval(() => {
        setDisplayText(
          text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iteration) return text[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        if (iteration >= text.length) {
          clearInterval(glitchInterval);
          setIsGlitching(false);
          setDisplayText(text);
        }
        iteration += 1 / 2;
      }, speed);
    }, 4500);

    return () => clearInterval(triggerInterval);
  }, [text, speed]);

  return (
    <span
      className={`inline-block font-pixel tracking-widest relative ${className} ${
        isGlitching ? 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]' : ''
      }`}
    >
      {displayText}
    </span>
  );
}

