import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const principles = [
  'Break down the real problem before writing code',
  'Focus on reliability and long-term maintainability',
  'Design solutions that scale with your business',
  'Stay responsive, especially for production issues',
];

const stats = [
  { value: '99.97%', label: 'Uptime Achieved' },
  { value: '89%', label: 'Manual Tasks Eliminated' },
  { value: '<12s', label: 'Mean Recovery Time' },
  { value: '24/7', label: 'Monitoring Coverage' },
];

export default function AboutSection() {
  return (
    <section id="about" className="relative py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <p className="font-mono text-xs tracking-widest text-primary mb-3">_METHODOLOGY</p>
            <h2 className="font-inter font-black text-3xl md:text-5xl tracking-tight mb-8">HOW I WORK</h2>
            <p className="font-inter text-muted-foreground leading-relaxed mb-8 text-base">
              I work at the intersection of network automation, monitoring, infrastructure, and systems integration —
              building systems that reduce manual work, prevent failures, and keep operations running reliably.
            </p>
            <div className="space-y-4">
              {principles.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-accent mt-0.5 flex-shrink-0" />
                  <span className="font-inter text-sm text-foreground">{p}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="grid grid-cols-2 gap-5">
            {stats.map((stat, i) => (
              <div key={i} className="bg-card/50 border border-border rounded-lg p-6 text-center hover:border-primary/40 transition-colors">
                <div className="font-inter font-black text-3xl md:text-4xl text-accent mb-2">{stat.value}</div>
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
