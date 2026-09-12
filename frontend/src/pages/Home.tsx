import { useState } from 'react';
import BootSequence from '../components/effects/BootSequence';
import KernelEye from '../components/effects/KernelEye';
import { Button } from '../components/common/Button';
import ChatInterface from '../components/chat/ChatInterface';
import StorySection from '../components/story/StorySection';
import PowerDemos from '../components/story/PowerDemos';

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-kernel-navy text-kernel-cyan font-cinematic scanline-overlay">
      {!booted && <BootSequence onComplete={() => setBooted(true)} />}
      
      {booted && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <KernelEye />
          <h1 className="text-4xl md:text-6xl font-pixel mb-8 text-shadow-cyan text-center mt-6">KERNEL SYSTEM</h1>
          <p className="text-xl mb-8 max-w-2xl text-center text-kernel-gray">
            Interactive Superhero Help Portal. Submit your grievance securely.
          </p>
          <Button size="lg" onClick={() => setChatOpen(true)}>
            ACCESS TERMINAL
          </Button>

          {chatOpen && (
            <div className="mt-12 w-full max-w-4xl opacity-100 transition-opacity duration-500">
              <ChatInterface />
            </div>
          )}
        </div>
      )}
      
      {booted && (
        <>
          <StorySection />
          <PowerDemos />
        </>
      )}
    </div>
  );
}

