import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const LOGO_ICON = "/assets/logo-icon.png";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-xl bg-background/80 border-b border-border' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 py-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('hero')}>
          <img src={LOGO_ICON} alt="Gavell Intelligence" className="h-8 w-8" />
          <span className="font-inter font-bold text-sm tracking-widest text-foreground hidden sm:inline">GAVELL INTELLIGENCE</span>
        </div>
        <div className="hidden md:flex items-center gap-2 font-mono text-xs text-accent">
          <span className="h-2 w-2 rounded-full bg-accent pulse-dot inline-block" />
          SYSTEM: OPERATIONAL
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo('services')} className="font-mono text-xs tracking-wider text-muted-foreground hover:text-foreground transition-colors">SERVICES</button>
          <button onClick={() => scrollTo('stack')} className="font-mono text-xs tracking-wider text-muted-foreground hover:text-foreground transition-colors">TECH STACK</button>
          <button onClick={() => scrollTo('about')} className="font-mono text-xs tracking-wider text-muted-foreground hover:text-foreground transition-colors">ABOUT</button>
          <button onClick={() => scrollTo('contact')} className="px-5 py-2 bg-primary text-primary-foreground font-inter font-semibold text-xs tracking-wider rounded hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:-translate-y-0.5">
            INITIATE CONTACT
          </button>
        </div>
        <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-t border-border px-6 py-6 space-y-4">
          <button onClick={() => scrollTo('services')} className="block font-mono text-sm text-muted-foreground hover:text-foreground w-full text-left">SERVICES</button>
          <button onClick={() => scrollTo('stack')} className="block font-mono text-sm text-muted-foreground hover:text-foreground w-full text-left">TECH STACK</button>
          <button onClick={() => scrollTo('about')} className="block font-mono text-sm text-muted-foreground hover:text-foreground w-full text-left">ABOUT</button>
          <button onClick={() => scrollTo('contact')} className="block w-full px-5 py-3 bg-primary text-primary-foreground font-inter font-semibold text-sm tracking-wider rounded text-center">
            INITIATE CONTACT
          </button>
        </div>
      )}
    </nav>
  );
}
