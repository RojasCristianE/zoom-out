import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AgendaPage from './pages/Agenda';
import AudienciaConsole from './pages/AudienciaConsole';
import BibliotecaPage from './pages/Biblioteca';
import { Toaster } from '@zoom-out/ui';

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-base font-bold tracking-tight text-primary flex items-center gap-2">
              <span>🏛️</span>
              <span>PODER JUDICIAL</span>
            </Link>
            <div className="flex gap-6 text-sm font-medium text-muted-foreground">
              <Link to="/" className="hover:text-primary transition">
                Agenda de Audiencias
              </Link>
              <Link to="/biblioteca" className="hover:text-primary transition">
                Biblioteca Judicial
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs bg-muted px-2.5 py-1 rounded font-medium text-foreground">
              {user?.displayName} ({user?.role})
            </span>
            <button
              onClick={() => logout()}
              className="text-xs text-muted-foreground hover:text-destructive transition font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AgendaPage />} />
          <Route path="/audiencia/:id" element={<AudienciaConsole />} />
          <Route path="/biblioteca" element={<BibliotecaPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
