import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Room from './pages/Room'
import Recordings from './pages/Recordings'

// ──────────────────────────────────────────────
// Protected Route Component
// ──────────────────────────────────────────────

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-50 flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Zoom-Out
            </h1>
            <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
              <a href="/" className="hover:text-blue-400 transition-colors">Dashboard</a>
              <a href="/recordings" className="hover:text-blue-400 transition-colors">Grabaciones</a>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-400">A</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 animate-in fade-in duration-700">
        <Outlet />
      </main>
      
      <footer className="border-t border-white/5 bg-black/10 py-6">
        <p className="text-center text-xs text-slate-500">
          © 2026 Zoom-Out — Plataforma de Video Privada
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
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/room/:id" element={<Room />} />
          <Route path="/recordings" element={<Recordings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
