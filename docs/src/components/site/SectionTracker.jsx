import { useEffect, useRef } from 'react';
import { siteData } from '@/api/siteDataClient';

const getDeviceType = () => { const w = window.innerWidth; if (w < 768) return 'mobile'; if (w < 1024) return 'tablet'; return 'desktop'; };

const getSessionId = () => {
  let sid = sessionStorage.getItem('gavell_session');
  if (!sid) { sid = Math.random().toString(36).substr(2, 12) + Date.now().toString(36); sessionStorage.setItem('gavell_session', sid); }
  return sid;
};

export default function SectionTracker({ sections }) {
  const timers = useRef({});
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const name = entry.target.id;
        if (entry.isIntersecting) { timers.current[name] = Date.now(); }
        else if (timers.current[name]) {
          const duration = Date.now() - timers.current[name];
          if (duration > 1000) {
            siteData.entities.SectionView.create({ section_name: name, view_duration_ms: duration, viewport_percentage: Math.round(entry.intersectionRatio * 100), session_id: getSessionId(), device_type: getDeviceType(), referrer: document.referrer || 'direct' }).catch(() => {});
          }
          delete timers.current[name];
        }
      });
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    sections.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [sections]);
  return null;
}
