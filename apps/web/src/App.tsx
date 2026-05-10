import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Room from './pages/Room'
import Recordings from './pages/Recordings'
import { Toaster } from '@zoom-out/ui'

// ──────────────────────────────────────────────
// Protected Route Component
// ──────────────────────────────────────────────

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Top Navbar */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <h1 className="text-lg font-bold tracking-tighter text-primary uppercase">
              Zoom-Out
            </h1>
            <div className="hidden md:flex gap-8 text-[13px] font-medium tracking-wide text-muted-foreground/80">
              <a href="/" className="hover:text-primary transition-all duration-300 relative group">
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/recordings" className="hover:text-primary transition-all duration-300 relative group">
                Grabaciones
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center bg-muted/20 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.05)]">
              <span className="text-[10px] font-bold text-muted-foreground">A</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12">
        <Outlet />
      </main>
      
      <footer className="border-t border-border/20 py-10 opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-center text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          © 2026 Zoom-Out — High End Video Infrastructure
        </p>
      </footer>
    </div>
  )
}

// ──────────────────────────────────────────────
// Main App Component
// ──────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/room/:id" element={<Room />} />
          <Route path="/recordings" element={<Recordings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="bottom-right" closeButton />
    </BrowserRouter>
  )
}
