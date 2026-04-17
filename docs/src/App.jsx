import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import PageNotFound from '@/lib/PageNotFound';

import Home from '@/pages/Home';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminContacts from '@/pages/admin/AdminContacts';
import AdminHeatmap from '@/pages/admin/AdminHeatmap';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminLogin from '@/pages/admin/AdminLogin';

const FullscreenSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
  </div>
);

const RequireAdmin = ({ children }) => {
  const location = useLocation();
  const { isLoadingAuth, isAuthenticated } = useAuth();

  if (isLoadingAuth) return <FullscreenSpinner />;
  if (!isAuthenticated) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/admin/login?next=${next}`} replace />;
  }

  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route
      path="/admin"
      element={
        <RequireAdmin>
          <AdminLayout />
        </RequireAdmin>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="contacts" element={<AdminContacts />} />
      <Route path="heatmap" element={<AdminHeatmap />} />
      <Route path="settings" element={<AdminSettings />} />
    </Route>
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppRoutes />
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
