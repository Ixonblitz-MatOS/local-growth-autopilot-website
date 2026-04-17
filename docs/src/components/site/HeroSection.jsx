import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToServices = () => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 30%, hsl(226 100% 59% / 0.25), transparent 45%), radial-gradient(circle at 80% 20%, hsl(187 100% 50% / 0.2), transparent 45%), linear-gradient(180deg, hsl(240 7% 8%), hsl(240 7% 5%))',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(226 100% 59% / 0.3), transparent 70%)' }} />
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}>
          <p className="font-mono text-xs md:text-sm tracking-widest text-primary mb-6">_NETWORK OPERATIONS & AUTOMATION ENGINEERING</p>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="font-inter font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight mb-8">
          ARCHITECTING THE<br />
          <span className="text-glow" style={{ color: 'transparent', WebkitTextStroke: '1.5px hsl(210 20% 98%)' }}>AUTONOMOUS PULSE</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="font-inter text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Systems integration and infrastructure engineering for high-scale environments.
          We build the logic that eliminates downtime, automates complexity, and scales your operations.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={scrollToServices} className="group px-8 py-4 bg-primary text-primary-foreground font-inter font-bold text-sm tracking-wider rounded flex items-center gap-3 hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:-translate-y-1">
            VIEW CAPABILITIES
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={scrollToContact} className="px-8 py-4 border border-border text-foreground font-inter font-bold text-sm tracking-wider rounded hover:border-primary hover:text-primary transition-all duration-300">
            START A PROJECT
          </button>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <ChevronDown size={24} className="text-muted-foreground animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
