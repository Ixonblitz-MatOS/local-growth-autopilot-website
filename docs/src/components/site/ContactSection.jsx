import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { siteData } from '@/api/siteDataClient';
import { Send, CheckCircle, Loader2 } from 'lucide-react';

export default function ContactSection() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', company: '', service_interest: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await siteData.entities.ContactRequest.create({ ...form, status: 'new' });
    setSubmitting(false);
    setSubmitted(true);
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  if (submitted) {
    return (
      <section id="contact" className="relative py-32 px-6 md:px-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="bg-card border border-primary/30 rounded-lg p-16">
            <CheckCircle size={48} className="text-accent mx-auto mb-6" />
            <h3 className="font-inter font-bold text-2xl mb-3">TRANSMISSION COMPLETE</h3>
            <p className="font-mono text-sm text-muted-foreground">Your project parameters have been received. Expect a response within 24 hours.</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="relative py-32 px-6 md:px-10">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12 text-center">
          <p className="font-mono text-xs tracking-widest text-primary mb-3">_SECURE_LINK</p>
          <h2 className="font-inter font-black text-3xl md:text-5xl tracking-tight mb-4">INITIATE CONTACT</h2>
          <p className="font-inter text-muted-foreground">Enter project parameters for immediate assessment.</p>
        </motion.div>
        <motion.form initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 md:p-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[['full_name','_IDENTIFIER *','Full Name','text',true],['email','_COMM_PROTOCOL *','Email Address','email',true],['phone','_PHONE_LINE','Phone Number','text',false],['company','_ORGANIZATION','Company Name','text',false]].map(([field, label, placeholder, type, req]) => (
              <div key={field}>
                <label className="block font-mono text-[10px] tracking-widest text-primary mb-2">{label}</label>
                <input type={type} placeholder={placeholder} required={req} value={form[field]} onChange={(e) => updateField(field, e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent text-sm" />
              </div>
            ))}
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-primary mb-2">_SERVICE_TYPE</label>
            <select value={form.service_interest} onChange={(e) => updateField('service_interest', e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded text-foreground focus:outline-none focus:border-accent text-sm">
              <option value="">Select area of interest</option>
              <option value="network_automation">Network Automation</option>
              <option value="monitoring">Monitoring & Alerting</option>
              <option value="infrastructure">Infrastructure Engineering</option>
              <option value="integration">Systems Integration</option>
              <option value="general">General Inquiry</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-primary mb-2">_MISSION_DETAILS *</label>
            <textarea placeholder="Describe your project, workflow, or problem..." required rows={5} value={form.message} onChange={(e) => updateField('message', e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent text-sm resize-none" />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-4 border border-primary text-primary font-inter font-bold text-sm tracking-wider rounded hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50">
            {submitting ? <><Loader2 size={16} className="animate-spin" /> TRANSMITTING...</> : <><Send size={16} /> TRANSMIT DATA</>}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
