import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, LogOut, Settings, Users, BarChart3 } from 'lucide-react';

import { useAuth } from '@/lib/AuthContext';

const LOGO_ICON = '/assets/logo-icon.png';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/contacts', icon: Users, label: 'Contacts' },
  { path: '/admin/heatmap', icon: BarChart3, label: 'Heatmap' },
  { path: '/admin/settings', icon: Settings, label: 'Site Settings' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout(false);
      navigate('/admin/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <img src={LOGO_ICON} alt="Gavell" className="h-8 w-8" />
        <div>
          <div className="font-inter font-bold text-sm text-foreground">GAVELL</div>
          <div className="font-mono text-[10px] text-muted-foreground">ADMIN PANEL</div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2">
        <p className="font-mono text-[10px] text-muted-foreground truncate">{user?.email || 'Not signed in'}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-inter text-sm transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary font-inter text-sm transition-all disabled:opacity-60"
        >
          <LogOut size={18} />
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary font-inter text-sm transition-all"
        >
          <ArrowLeft size={18} />
          Back to Site
        </Link>
      </div>
    </aside>
  );
}
