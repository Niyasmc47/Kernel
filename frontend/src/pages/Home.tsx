import { useState } from 'react';
import { motion } from 'framer-motion';
import CinematicIntro from '../components/effects/CinematicIntro';
import KernelEye from '../components/effects/KernelEye';
import AmbientAudio from '../components/effects/AmbientAudio';
import FloatingNav from '../components/navigation/FloatingNav';
import CinematicHero from '../components/story/CinematicHero';
import StoryChapter from '../components/story/StoryChapter';
import AbilitiesSection from '../components/story/AbilitiesSection';
import RootAccessSection from '../components/story/RootAccessSection';
import MissionSection from '../components/story/MissionSection';

export default function Home() {
  const [introFinished, setIntroFinished] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return true;
      }
      return sessionStorage.getItem('kernel_intro_played') === 'true';
    } catch {
      return false;
    }
  });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] dark:bg-[#070a0f] text-gray-900 dark:text-gray-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300 transition-colors duration-500 subtle-grain-overlay">
      {/* Fullscreen Cinematic Intro Video Overlay */}
      {!introFinished && (
        <CinematicIntro onComplete={() => setIntroFinished(true)} />
      )}
      
      <motion.div 
        initial={{ opacity: introFinished ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="relative w-full"
      >
          {/* Floating Navigation Pill */}
          <FloatingNav onNavigate={scrollToSection} />
          
          <main className="w-full">
            {/* 1. Cinematic Hero Section with Embedded Dialogue & KERNEL Character */}
            <CinematicHero isIntroFinished={introFinished} />

            {/* Invisible Global Easter Egg Listener */}
            <KernelEye />

            {/* Mutable Atmospheric Ambient Soundscape */}
            <AmbientAudio isPlaying={introFinished} />

            {/* 2. Chapter I: Origin (East Detroit Workshop) */}
            <StoryChapter 
              id="origin"
              title="EAST DETROIT."
              subtitle="CHAPTER I • ORIGIN"
              tag="THE REPAIR SHOP"
              theme="dark"
              imagePosition="right"
              imageUrl="/assets/origin_bg.jpg"
              paragraphs={[
                "Before the powers, there was only his family's appliance repair shop in East Detroit. Old motors, copper wire coils, and the smell of soldering iron in the winter cold.",
                "Theo grew up fixing what everyone else threw away. While others saw junk, he saw how machines fit together and how things worked. He learned early on that when something is broken, it can always be repaired with patience and care."
              ]}
            />

            {/* 3. Chapter II: The Lattice (Surreal Geometric Landscape) */}
            <StoryChapter 
              id="lattice"
              title="THE LATTICE."
              subtitle="CHAPTER II • THE INVISIBLE WORLD"
              tag="ENERGY & EMOTIONS"
              theme="light"
              imagePosition="left"
              imageUrl="/assets/lattice_bg.jpg"
              paragraphs={[
                "Physical objects, electricity, and human memories are all connected by an invisible energy framework that Theo calls the Lattice.",
                "When someone is hurt, betrayed, or suffering in silence, the emotional impact leaves real stress fractures in this energy grid. Theo can feel those fractures like vibrations, alerting him to people in urgent need of help."
              ]}
            />

            {/* 4. Chapter III: The Incident (Laboratory Overload) */}
            <StoryChapter 
              id="incident"
              title="THE LABORATORY ACCIDENT."
              subtitle="CHAPTER III • HOW HE GOT HIS POWERS"
              tag="TURNING POINT"
              theme="dark"
              imagePosition="right"
              imageUrl="/assets/incident_bg.jpg"
              paragraphs={[
                "Years later, while working in an advanced energy research lab, a high-voltage core malfunctioned. The reaction didn't blow up like a bomb—it unleashed a wave of raw resonance energy that tore through the room.",
                "Theo threw himself into the containment chamber to protect his team. The energy wave permanently altered his nervous system, giving him the ability to see inside machines, deflect kinetic force, and heal broken structures."
              ]}
            />

            {/* 5. Abilities Section (Interactive Showcase with Live SVG Simulations) */}
            <AbilitiesSection />

            {/* 6. Root Access Section (The Corrupted Antagonist Dialectic) */}
            <RootAccessSection />

            {/* 7. Mission Section (Panoramic Mountain Sunrise Overlook) */}
            <MissionSection onReturnToHero={() => scrollToSection('top')} />
          </main>
          
          {/* Editorial Colophon Footer */}
          <footer className="w-full py-12 px-6 border-t border-white/10 bg-[#05070a] text-center text-xs font-sans text-gray-500 tracking-wider">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="font-pixel text-[10px] text-emerald-400 tracking-[0.2em]">KERNEL</span>
                <span className="text-gray-600">|</span>
                <span>Central Superhero Relay</span>
              </div>
              <p className="text-gray-400 text-xs">
                Built with empathy for those who fell through the cracks.
              </p>
              <div className="text-[11px] text-gray-500 font-mono">
                SEC-ID // THEO-AD-25
              </div>
            </div>
          </footer>
        </motion.div>
    </div>
  );
}
