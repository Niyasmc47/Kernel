import { useState, useEffect } from 'react';

const bootLines = [
  "INITIALIZING KERNEL...",
  "LOADING SECURE PROTOCOLS...",
  "ESTABLISHING NEURAL LINK...",
  "BYPASSING FIREWALLS...",
  "ACCESS GRANTED."
];

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex < bootLines.length) {
      const timer = setTimeout(() => {
        setLines(prev => [...prev, bootLines[currentLineIndex]]);
        setCurrentLineIndex(prev => prev + 1);
      }, 500 + Math.random() * 500); // Random delay for realism

      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentLineIndex, onComplete]);

  return (
    <div className="fixed inset-0 bg-kernel-navy z-50 p-8 font-mono text-kernel-cyan flex flex-col justify-end pb-24 scanline-overlay">
      <div className="max-w-3xl space-y-2">
        {lines.map((line, i) => (
          <div key={i} className="animate-glitch">
            {'>'} {line}
          </div>
        ))}
        {currentLineIndex < bootLines.length && (
          <div className="animate-pulse">
            {'>'} <span className="inline-block w-3 h-5 bg-kernel-cyan align-middle ml-1"></span>
          </div>
        )}
      </div>
    </div>
  );
}

