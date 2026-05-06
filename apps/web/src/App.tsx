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
    <div className="app-layout">
      {/* Sidebar / Navbar could go here */}
      <main className="app-content">
        <Outlet />
      </main>
      
      <style>{`
        .app-layout {
          min-height: 100vh;
          background: #0f172a;
          color: white;
          display: flex;
        }
        .app-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }
      `}</style>
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
