import { motion } from 'framer-motion';

export default function StorySection() {
  return (
    <section className="py-20 px-4 md:px-20 max-w-6xl mx-auto border-t border-kernel-cyan/30">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-12"
      >
        <div className="space-y-4">
          <h2 className="text-3xl font-pixel text-kernel-cyan">ORIGIN</h2>
          <p className="text-lg text-kernel-gray max-w-3xl leading-relaxed">
            Theo grew up in East Detroit above his family's appliance repair shop. He became a self-taught engineer.
            His younger sister was deaf, which inspired his work with neural-interface technology.
          </p>
          <p className="text-lg text-kernel-gray max-w-3xl leading-relaxed">
            While working with experimental military quantum-lattice technology, Theo discovered that the technology 
            was interacting with something far deeper than ordinary computation. An accident synchronized his 
            nervous system with the underlying structure. He became KERNEL.
          </p>
        </div>

        <div className="space-y-4 pt-10">
          <h2 className="text-3xl font-pixel text-kernel-violet">ROOT ACCESS</h2>
          <p className="text-lg text-kernel-gray max-w-3xl leading-relaxed">
            Kernel repairs what is broken. Root Access replaces it. 
            An unknown signature has infiltrated the system.
          </p>
          <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-md animate-pulse mt-4 max-w-xl">
            <span className="font-mono text-red-500 font-bold tracking-widest">ACCESS INTERRUPTION DETECTED</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

