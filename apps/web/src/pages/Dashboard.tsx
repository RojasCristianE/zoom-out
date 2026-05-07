import { useAuthStore } from '../store/auth'
import { RoomList } from '../components/admin/RoomList'
import { UserTable } from '../components/admin/UserTable'
import { Navigate } from 'react-router-dom'

export default function Dashboard() {
  const user = useAuthStore(state => state.user)

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center pt-[20vh] text-center">
        <h1 className="text-4xl font-bold text-rose-500 mb-4">Acceso Denegado</h1>
        <p className="text-slate-400 max-w-md">
          Solo los administradores tienen permisos para acceder a las herramientas de gestión.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Dashboard Administrativo
          </h1>
          <p className="text-slate-400 text-lg">
            Gestiona la infraestructura, usuarios y sesiones de Zoom-Out.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <RoomList />
        <UserTable />
      </div>
    </div>
  )
}
