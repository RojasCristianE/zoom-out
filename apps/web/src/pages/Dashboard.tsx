import { useAuthStore } from '../store/auth'
import { RoomList } from '../components/admin/RoomList'
import { UserTable } from '../components/admin/UserTable'
import { Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { 
  toast, 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger,
  Button
} from '@zoom-out/ui'

import { BackgroundBeams } from '@ui/index'

export default function Dashboard() {
  const user = useAuthStore(state => state.user)

  useEffect(() => {
    if (user) {
      toast.success(`Bienvenido de vuelta, ${user.displayName}`, {
        description: "Terminal de administración sincronizada.",
      })
    }
  }, [user])

  if (user?.role !== 'admin') {
    return (
      <div className="relative flex min-h-[80vh] flex-col items-center justify-center text-center">
        <BackgroundBeams className="opacity-20" />
        <div className="relative z-10 space-y-6">
          <div className="mx-auto h-20 w-20 rounded-full border border-error/20 bg-error/5 flex items-center justify-center animate-pulse">
             <span className="text-2xl text-error font-bold">!</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-primary uppercase">Acceso Restringido</h1>
            <p className="text-muted-foreground/60 text-sm max-w-sm tracking-wide mx-auto">
              Esta terminal requiere privilegios de nivel administrador para la gestión de infraestructura.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-border/40 font-bold uppercase tracking-widest text-[10px] px-8 h-10 rounded-full hover:bg-white hover:text-black transition-all">
                Solicitar Credenciales
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Protocolo de Acceso</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción enviará una solicitud de elevación de privilegios al sistema central. ¿Deseas proceder con la autenticación forzada?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abortar</AlertDialogCancel>
                <AlertDialogAction onClick={() => toast.info("Solicitud enviada al núcleo.")}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundBeams className="opacity-10" />
      <div className="relative z-10 space-y-16 max-w-7xl mx-auto py-8 px-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/10 pb-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter text-primary uppercase">
              Control Center
            </h1>
            <p className="text-muted-foreground/60 text-sm tracking-widest uppercase font-medium">
              Management Layer / Infrastructure / Users
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="backdrop-blur-sm rounded-xl">
            <RoomList />
          </div>
          <div className="backdrop-blur-sm rounded-xl">
            <UserTable />
          </div>
        </div>
      </div>
    </div>
  )
}
