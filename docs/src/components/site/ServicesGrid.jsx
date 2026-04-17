import React from 'react';
import { motion } from 'framer-motion';
import { Workflow, Activity, Server, Link2, Zap, Shield } from 'lucide-react';

const services = [
  { num: '01', icon: Workflow, title: 'Network Automation', description: 'Self-healing infrastructures and CI/CD pipelines for network configurations. Eliminate manual provisioning with intelligent automation.', status: 'ACTIVE' },
  { num: '02', icon: Activity, title: 'Monitoring & Alerting', description: 'Real-time telemetry and predictive analytics for proactive fault detection. Detect failures before they become outages.', status: 'ACTIVE' },
  { num: '03', icon: Server, title: 'Infrastructure Engineering', description: 'High-availability architecture design and multi-vendor systems. Built for scale, reliability, and long-term maintainability.', status: 'ACTIVE' },
  { num: '04', icon: Link2, title: 'Systems Integration', description: 'Connect disconnected tools into seamless workflows. Gmail, APIs, databases, spreadsheets — unified into one pipeline.', status: 'ACTIVE' },
  { num: '05', icon: Zap, title: 'Process Automation', description: 'Transform hours of repetitive manual work into reliable automated pipelines that run consistently without intervention.', status: 'ACTIVE' },
  { num: '06', icon: Shield, title: 'System Reliability', description: 'Fix broken automations, eliminate infinite loops, resolve duplicate API calls, and stabilize production systems.', status: 'ACTIVE' },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } };

export default function ServicesGrid() {
  return (
    <section id="services" className="relative py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
          <p className="font-mono text-xs tracking-widest text-primary mb-3">_CAPABILITIES</p>
          <h2 className="font-inter font-black text-3xl md:text-5xl tracking-tight">THE INTELLIGENCE STACK</h2>
        </motion.div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div key={service.num} variants={itemVariants} className="group relative bg-card/50 border border-border rounded-lg p-8 hover:border-primary/50 hover:bg-primary/5 transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-primary">{service.num}</span>
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" /><span className="font-mono text-[10px] text-accent">{service.status}</span></div>
                </div>
                <Icon size={28} className="text-primary mb-5 group-hover:text-accent transition-colors duration-300" />
                <h3 className="font-inter font-bold text-lg mb-3 text-foreground">{service.title}</h3>
                <p className="font-inter text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
