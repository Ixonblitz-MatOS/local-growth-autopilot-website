import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { siteData } from '@/api/siteDataClient';
import { Save, Plus, Trash2, Loader2 } from 'lucide-react';

const defaultSettings = [
  { setting_key: 'hero_headline', setting_value: 'ARCHITECTING THE AUTONOMOUS PULSE', setting_group: 'hero' },
  { setting_key: 'hero_subtitle', setting_value: 'Systems integration and infrastructure engineering for high-scale environments.', setting_group: 'hero' },
  { setting_key: 'contact_email', setting_value: '', setting_group: 'contact' },
  { setting_key: 'footer_text', setting_value: '© 2026 GAVELL INTELLIGENCE', setting_group: 'footer' },
];

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(null);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newGroup, setNewGroup] = useState('general');

  const { data: settings = [], isLoading } = useQuery({ queryKey: ['site-settings'], queryFn: () => siteData.entities.SiteSettings.list() });

  const createMutation = useMutation({ mutationFn: (data) => siteData.entities.SiteSettings.create(data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['site-settings'] }) });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => siteData.entities.SiteSettings.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['site-settings'] }); setSaving(null); } });
  const deleteMutation = useMutation({ mutationFn: (id) => siteData.entities.SiteSettings.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['site-settings'] }) });

  const initDefaults = async () => {
    for (const def of defaultSettings) {
      if (!settings.find((s) => s.setting_key === def.setting_key)) await siteData.entities.SiteSettings.create(def);
    }
    queryClient.invalidateQueries({ queryKey: ['site-settings'] });
  };

  const addSetting = async () => {
    if (!newKey || !newValue) return;
    await createMutation.mutateAsync({ setting_key: newKey, setting_value: newValue, setting_group: newGroup });
    setNewKey(''); setNewValue('');
  };

  const groupedSettings = settings.reduce((acc, s) => { const g = s.setting_group || 'general'; if (!acc[g]) acc[g] = []; acc[g].push(s); return acc; }, {});

  if (isLoading) return <div className="p-8 flex justify-center py-20"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="font-inter font-black text-2xl text-foreground">Site Settings</h1><p className="font-mono text-xs text-muted-foreground mt-1">_CONFIGURATION_PANEL</p></div>
        {settings.length === 0 && <button onClick={initDefaults} className="px-4 py-2 bg-primary text-primary-foreground font-inter text-sm rounded hover:bg-accent hover:text-accent-foreground transition-all">Initialize Defaults</button>}
      </div>
      {Object.entries(groupedSettings).map(([group, items]) => (
        <div key={group} className="mb-8">
          <h3 className="font-mono text-xs tracking-widest text-primary mb-4 uppercase">{group}</h3>
          <div className="space-y-3">
            {items.map((s) => (
              <div key={s.id} className="bg-card border border-border rounded-lg p-4 flex items-start gap-4">
                <div className="flex-1">
                  <div className="font-mono text-[10px] text-muted-foreground mb-1">{s.setting_key}</div>
                  <textarea defaultValue={s.setting_value} className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary resize-none" rows={2}
                    onBlur={(e) => { if (e.target.value !== s.setting_value) { setSaving(s.id); updateMutation.mutate({ id: s.id, data: { setting_value: e.target.value } }); } }} />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  {saving === s.id ? <Loader2 size={16} className="animate-spin text-primary" /> : <Save size={16} className="text-muted-foreground" />}
                  <button onClick={() => deleteMutation.mutate(s.id)} className="text-destructive hover:text-destructive/80"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="bg-card border border-border rounded-lg p-6 mt-8">
        <h3 className="font-inter font-bold text-sm mb-4">Add New Setting</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[['KEY', newKey, setNewKey, 'setting_key'],['VALUE', newValue, setNewValue, 'Setting value'],['GROUP', newGroup, setNewGroup, 'general']].map(([label, val, setter, ph]) => (
            <div key={label}><label className="font-mono text-[10px] text-primary block mb-1">{label}</label><input value={val} onChange={(e) => setter(e.target.value)} placeholder={ph} className="w-full px-3 py-2 bg-secondary border border-border rounded text-foreground text-sm focus:outline-none focus:border-primary" /></div>
          ))}
        </div>
        <button onClick={addSetting} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-inter text-sm rounded hover:bg-accent hover:text-accent-foreground transition-all">
          <Plus size={16} /> Add Setting
        </button>
      </div>
    </div>
  );
}
