import { useState } from 'react';
import { motion } from 'framer-motion';

export default function PowerDemos() {
  const [activePower, setActivePower] = useState<string | null>(null);

  const powers = [
    { id: 'schema', name: 'SCHEMA SIGHT', desc: 'Shows hidden structures and blueprints.' },
    { id: 'reforge', name: 'REFORGE', desc: 'Shows broken structures repairing/reassembling.' },
    { id: 'kinetic', name: 'KINETIC RESONANCE', desc: 'Shows force travelling through structures.' },
    { id: 'bleed', name: 'SIGNAL BLEED', desc: 'Dangerous consequences of overusing Kernel abilities.' },
  ];

  return (
    <section className="py-20 px-4 md:px-20 max-w-6xl mx-auto border-t border-kernel-violet/30">
      <h2 className="text-3xl font-pixel text-kernel-cyan mb-10 text-center">ABILITIES</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {powers.map(power => (
          <div 
            key={power.id}
            onMouseEnter={() => setActivePower(power.id)}
            onMouseLeave={() => setActivePower(null)}
            className={`cursor-pointer p-6 border transition-all duration-300 ${
              activePower === power.id 
                ? 'border-kernel-cyan bg-kernel-cyan/10 shadow-[0_0_15px_rgba(102,252,241,0.5)]' 
                : 'border-kernel-gray/20 bg-kernel-dark/50 hover:border-kernel-cyan/50'
            }`}
          >
            <h3 className="font-pixel text-sm mb-2 text-kernel-violet">{power.name}</h3>
            <p className="text-sm text-kernel-gray">{power.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 h-64 border border-kernel-gray/30 bg-black/50 relative overflow-hidden flex items-center justify-center">
        {!activePower && <span className="font-mono text-kernel-gray opacity-50">HOVER TO INITIALIZE</span>}
        
        {activePower === 'schema' && (
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgwem0xMCAxMGgxMHYxMEgxMHoiIGZpbGw9InJnYmEoMTAyLCAyNTIsIDI0MSwgMC4xKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] animate-pulse">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-kernel-cyan w-32 h-32 rotate-45 transition-transform duration-1000 scale-150" />
            <span className="absolute top-4 left-4 font-mono text-kernel-cyan text-xs">STRUCTURAL.INTEGRITY: 94%</span>
          </div>
        )}

        {activePower === 'reforge' && (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div 
                key={i}
                initial={{ y: 50, opacity: 0, rotate: Math.random() * 90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="w-12 h-12 bg-kernel-violet border border-white"
              />
            ))}
          </div>
        )}

        {activePower === 'kinetic' && (
          <div className="relative w-full h-full flex items-center justify-center">
             <motion.div 
                animate={{ scale: [1, 3], opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute w-20 h-20 border-2 border-kernel-orange rounded-full"
             />
          </div>
        )}

        {activePower === 'bleed' && (
          <div className="absolute inset-0 animate-glitch bg-red-900/20 mix-blend-screen flex items-center justify-center">
             <span className="font-pixel text-4xl text-white mix-blend-difference">CRITICAL ERROR</span>
          </div>
        )}
      </div>
    </section>
  );
}

