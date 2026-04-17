import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { siteData } from '@/api/siteDataClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const SECTION_LABELS = { hero: 'Hero', services: 'Services', stack: 'Tech Stack', about: 'About', contact: 'Contact' };
const COLORS = ['hsl(226, 100%, 59%)', 'hsl(187, 100%, 50%)', 'hsl(220, 9%, 57%)', 'hsl(43, 74%, 66%)', 'hsl(12, 76%, 61%)'];

export default function AdminHeatmap() {
  const { data: views = [], isLoading } = useQuery({ queryKey: ['section-views-all'], queryFn: () => siteData.entities.SectionView.list('-created_date', 1000) });

  const sectionData = useMemo(() => {
    const grouped = {};
    views.forEach((v) => {
      if (!grouped[v.section_name]) grouped[v.section_name] = { views: 0, totalDuration: 0 };
      grouped[v.section_name].views += 1;
      grouped[v.section_name].totalDuration += (v.view_duration_ms || 0);
    });
    return Object.entries(grouped).map(([name, data]) => ({ name: SECTION_LABELS[name] || name, views: data.views, avgDuration: Math.round(data.totalDuration / data.views / 1000) })).sort((a, b) => b.views - a.views);
  }, [views]);

  const deviceData = useMemo(() => {
    const counts = { desktop: 0, tablet: 0, mobile: 0 };
    views.forEach((v) => { if (v.device_type) counts[v.device_type]++; });
    return Object.entries(counts).filter(([_, v]) => v > 0).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [views]);

  const uniqueSessions = new Set(views.map((v) => v.session_id)).size;
  const ttStyle = { contentStyle: { background: 'hsl(240, 6%, 7%)', border: '1px solid hsl(240, 4%, 16%)', borderRadius: 8, fontSize: 12 }, labelStyle: { color: 'hsl(210, 20%, 98%)' } };

  if (isLoading) return <div className="p-8 flex justify-center py-20"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="font-inter font-black text-2xl text-foreground">Site Heatmap</h1><p className="font-mono text-xs text-muted-foreground mt-1">_ENGAGEMENT_ANALYTICS</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {[['TOTAL SECTION VIEWS', views.length, 'text-foreground'],['UNIQUE SESSIONS', uniqueSessions, 'text-foreground'],['MOST VIEWED SECTION', sectionData[0]?.name || '—', 'text-accent']].map(([label, val, cls]) => (
          <div key={label} className="bg-card border border-border rounded-lg p-6"><div className="font-mono text-[10px] text-muted-foreground mb-2">{label}</div><div className={`font-inter font-black text-3xl ${cls}`}>{val}</div></div>
        ))}
      </div>
      {views.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-16 text-center"><p className="text-muted-foreground font-mono text-sm">No analytics data yet. Section views will appear here as visitors browse your site.</p></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[['Section Views','views','hsl(226, 100%, 59%)'],['Avg. Time per Section (seconds)','avgDuration','hsl(187, 100%, 50%)']].map(([title, key, fill]) => (
            <div key={title} className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-inter font-bold text-sm mb-6">{title}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectionData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(220, 9%, 57%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(220, 9%, 57%)' }} axisLine={false} tickLine={false} />
                  <Tooltip {...ttStyle} />
                  <Bar dataKey={key} fill={fill} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-inter font-bold text-sm mb-6">Device Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={ttStyle.contentStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-inter font-bold text-sm mb-6">Visual Section Heatmap</h3>
            <div className="space-y-3">
              {sectionData.map((s) => {
                const pct = Math.round((s.views / (sectionData[0]?.views || 1)) * 100);
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-1"><span className="font-mono text-xs text-foreground">{s.name}</span><span className="font-mono text-[10px] text-muted-foreground">{s.views} views</span></div>
                    <div className="h-6 bg-secondary rounded overflow-hidden"><div className="h-full rounded transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, hsl(226, 100%, 59%), hsl(187, 100%, 50%))' }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
