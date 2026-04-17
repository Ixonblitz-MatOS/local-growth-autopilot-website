import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { siteData } from '@/api/siteDataClient';
import { format } from 'date-fns';
import { Eye, Trash2, X } from 'lucide-react';

const statusColors = {
  new: 'bg-accent/10 text-accent',
  contacted: 'bg-primary/10 text-primary',
  in_progress: 'bg-yellow-500/10 text-yellow-400',
  closed: 'bg-muted text-muted-foreground',
};

export default function AdminContacts() {
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: contacts = [], isLoading } = useQuery({ queryKey: ['contacts'], queryFn: () => siteData.entities.ContactRequest.list('-created_date', 200) });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => siteData.entities.ContactRequest.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => siteData.entities.ContactRequest.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contacts'] }); setSelectedContact(null); },
  });

  const filtered = filterStatus === 'all' ? contacts : contacts.filter((c) => c.status === filterStatus);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="font-inter font-black text-2xl text-foreground">Contact Requests</h1><p className="font-mono text-xs text-muted-foreground mt-1">_LEAD_MANAGEMENT</p></div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 bg-card border border-border rounded text-foreground text-sm focus:outline-none focus:border-primary">
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      {isLoading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div> : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border bg-secondary/50">
                {['NAME','EMAIL','SERVICE','STATUS','DATE','ACTIONS'].map(h => <th key={h} className="px-6 py-3 text-left font-mono text-[10px] tracking-widest text-muted-foreground">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-inter text-sm font-medium text-foreground">{c.full_name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{c.email}</td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{c.service_interest?.replace(/_/g, ' ') || '—'}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded font-mono text-[10px] ${statusColors[c.status] || ''}`}>{c.status?.toUpperCase()}</span></td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{c.created_date ? format(new Date(c.created_date), 'MMM d, yyyy') : '—'}</td>
                    <td className="px-6 py-4"><button onClick={() => setSelectedContact(c)} className="text-primary hover:text-accent transition-colors"><Eye size={16} /></button></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground font-mono text-sm">No contacts found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {selectedContact && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-inter font-bold text-lg text-foreground">{selectedContact.full_name}</h2>
              <button onClick={() => setSelectedContact(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[['EMAIL', selectedContact.email],['PHONE', selectedContact.phone || '—'],['COMPANY', selectedContact.company || '—'],['SERVICE', selectedContact.service_interest?.replace(/_/g,' ') || '—']].map(([label, val]) => (
                  <div key={label}><div className="font-mono text-[10px] text-primary mb-1">{label}</div><div className="text-sm text-foreground">{val}</div></div>
                ))}
              </div>
              <div><div className="font-mono text-[10px] text-primary mb-1">MESSAGE</div><div className="text-sm text-foreground bg-secondary/50 p-3 rounded">{selectedContact.message}</div></div>
              <div>
                <div className="font-mono text-[10px] text-primary mb-2">STATUS</div>
                <select value={selectedContact.status} onChange={(e) => { updateMutation.mutate({ id: selectedContact.id, data: { status: e.target.value } }); setSelectedContact((prev) => ({ ...prev, status: e.target.value })); }}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded text-foreground text-sm focus:outline-none focus:border-primary">
                  <option value="new">New</option><option value="contacted">Contacted</option><option value="in_progress">In Progress</option><option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <div className="font-mono text-[10px] text-primary mb-2">INTERNAL NOTES</div>
                <textarea defaultValue={selectedContact.notes || ''} placeholder="Add internal notes..." rows={3}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded text-foreground text-sm focus:outline-none focus:border-primary resize-none"
                  onBlur={(e) => { if (e.target.value !== (selectedContact.notes || '')) updateMutation.mutate({ id: selectedContact.id, data: { notes: e.target.value } }); }} />
              </div>
              <button onClick={() => deleteMutation.mutate(selectedContact.id)} className="flex items-center gap-2 text-destructive text-sm hover:underline"><Trash2 size={14} /> Delete Contact</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
