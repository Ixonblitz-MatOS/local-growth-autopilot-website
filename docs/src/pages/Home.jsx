import React from 'react';
import GridBackground from '../components/site/GridBackground';
import Navbar from '../components/site/Navbar';
import HeroSection from '../components/site/HeroSection';
import ServicesGrid from '../components/site/ServicesGrid';
import TechStack from '../components/site/TechStack';
import AboutSection from '../components/site/AboutSection';
import ContactSection from '../components/site/ContactSection';
import Footer from '../components/site/Footer';
import SectionTracker from '../components/site/SectionTracker';

const TRACKED_SECTIONS = ['hero', 'services', 'stack', 'about', 'contact'];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-inter relative">
      <GridBackground />
      <Navbar />
      <SectionTracker sections={TRACKED_SECTIONS} />
      <main className="relative z-10">
        <HeroSection />
        <ServicesGrid />
        <TechStack />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
