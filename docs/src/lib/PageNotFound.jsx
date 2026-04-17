import { useLocation } from 'react-router-dom';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-7xl font-light text-muted-foreground">404</h1>
        <h2 className="text-2xl font-medium text-foreground">Page Not Found</h2>
        <p className="text-muted-foreground">The page "{pageName}" could not be found.</p>
        <button onClick={() => window.location.href = '/'} className="px-4 py-2 border border-border rounded text-foreground hover:border-primary transition-colors">
          Go Home
        </button>
      </div>
    </div>
  );
}
