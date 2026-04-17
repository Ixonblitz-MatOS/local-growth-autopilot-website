import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const terminalLines = [
  { type: 'comment', text: '# Network Operations Automation Platform' },
  { type: 'command', text: '$ deploy --target production --monitoring enabled' },
  { type: 'output', text: '\u2192 Initializing monitoring agents...' },
  { type: 'output', text: '\u2192 Configuring alerting thresholds...' },
  { type: 'success', text: '\u2713 47 network nodes connected' },
  { type: 'success', text: '\u2713 Auto-remediation policies active' },
  { type: 'blank', text: '' },
  { type: 'comment', text: '# Workflow Automation Pipeline' },
  { type: 'command', text: '$ pipeline.run --source email --dest api --transform clean' },
  { type: 'output', text: '\u2192 Extracting data from 1,247 emails...' },
  { type: 'output', text: '\u2192 Processing through validation layer...' },
  { type: 'output', text: '\u2192 Pushing to REST API endpoints...' },
  { type: 'success', text: '\u2713 1,247/1,247 records processed (0 errors)' },
  { type: 'blank', text: '' },
  { type: 'comment', text: '# Infrastructure Health Check' },
  { type: 'command', text: '$ status --all --verbose' },
  { type: 'success', text: '\u2713 Uptime: 99.97% (last 90 days)' },
  { type: 'success', text: '\u2713 Mean Recovery Time: 12s' },
  { type: 'success', text: '\u2713 Automated Remediations: 342' },
  { type: 'success', text: '\u2713 Manual Interventions Eliminated: 89%' },
];

const techCategories = [
  { label: 'AUTOMATION', items: ['Python', 'Ansible', 'Terraform', 'CI/CD Pipelines', 'REST APIs'] },
  { label: 'MONITORING', items: ['Prometheus', 'Grafana', 'SNMP/Telemetry', 'Custom Alerting', 'Log Analytics'] },
  { label: 'INFRASTRUCTURE', items: ['Linux Systems', 'Docker', 'Cloud Platforms', 'DNS/DHCP', 'Load Balancers'] },
  { label: 'INTEGRATION', items: ['API Development', 'Webhook Systems', 'Database Design', 'ETL Pipelines', 'OAuth/Auth'] },
];

export default function TechStack() {
  const [visibleLines, setVisibleLines] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((prev) => { if (prev >= terminalLines.length) { clearInterval(interval); return prev; } return prev + 1; });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const getLineColor = (type) => {
    switch (type) {
      case 'comment': return 'text-muted-foreground';
      case 'command': return 'text-foreground';
      case 'output': return 'text-primary';
      case 'success': return 'text-accent';
      default: return '';
    }
  };

  return (
    <section id="stack" className="relative py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
          <p className="font-mono text-xs tracking-widest text-primary mb-3">_DEVELOPER_PROFILE</p>
          <h2 className="font-inter font-black text-3xl md:text-5xl tracking-tight">THE LOGIC FLOW</h2>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-chart-4/60" />
              <div className="h-3 w-3 rounded-full bg-accent/60" />
              <span className="font-mono text-[10px] text-muted-foreground ml-3">gavell@ops:~</span>
            </div>
            <div className="p-5 font-mono text-xs leading-6 h-[400px] overflow-y-auto">
              {terminalLines.slice(0, visibleLines).map((line, i) => (
                <div key={i} className={`${getLineColor(line.type)} ${line.type === 'blank' ? 'h-4' : ''}`}>{line.text}</div>
              ))}
              {visibleLines < terminalLines.length && <span className="cursor-blink text-accent" />}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="space-y-6">
            {techCategories.map((cat) => (
              <div key={cat.label} className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[10px] text-primary tracking-widest">{cat.label}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span key={item} className="px-3 py-1.5 bg-secondary rounded font-mono text-xs text-foreground border border-border hover:border-primary/50 hover:text-primary transition-all cursor-default">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
