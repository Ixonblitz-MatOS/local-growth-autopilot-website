import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { siteData } from '@/api/siteDataClient';
import { Users, Eye, Mail, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: () => siteData.entities.ContactRequest.list('-created_date', 100) });
  const { data: views = [] } = useQuery({ queryKey: ['section-views'], queryFn: () => siteData.entities.SectionView.list('-created_date', 500) });

  const newContacts = contacts.filter((c) => c.status === 'new').length;
  const uniqueSessions = new Set(views.map((v) => v.session_id)).size;

  const stats = [
    { label: 'Total Leads', value: contacts.length, icon: Users, color: 'text-primary' },
    { label: 'New Requests', value: newContacts, icon: Mail, color: 'text-accent' },
    { label: 'Page Views', value: views.length, icon: Eye, color: 'text-chart-4' },
    { label: 'Unique Sessions', value: uniqueSessions, icon: Activity, color: 'text-chart-5' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="font-inter font-black text-2xl text-foreground">Command Center</h1><p className="font-mono text-xs text-muted-foreground mt-1">_SYSTEM_OVERVIEW</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((s) => { const Icon = s.icon; return (
          <div key={s.label} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4"><Icon size={20} className={s.color} /><span className="font-mono text-[10px] text-muted-foreground">{s.label.toUpperCase()}</span></div>
            <div className="font-inter font-black text-3xl text-foreground">{s.value}</div>
          </div>
        ); })}
      </div>
      <div className="bg-card border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border"><h2 className="font-inter font-bold text-sm text-foreground">Recent Contact Requests</h2></div>
        <div className="divide-y divide-border">
          {contacts.length === 0 && <div className="p-6 text-center text-muted-foreground font-mono text-sm">No contact requests yet.</div>}
          {contacts.slice(0, 5).map((c) => (
            <div key={c.id} className="px-6 py-4 flex items-center justify-between">
              <div><div className="font-inter font-semibold text-sm text-foreground">{c.full_name}</div><div className="font-mono text-xs text-muted-foreground">{c.email}</div></div>
              <span className={`px-2 py-1 rounded font-mono text-[10px] ${c.status === 'new' ? 'bg-accent/10 text-accent' : c.status === 'contacted' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{c.status?.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
