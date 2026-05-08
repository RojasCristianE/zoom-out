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
  Button,
  BentoGrid,
  BentoGridItem
} from '@zoom-out/ui'

import { BackgroundBeams, Spotlight } from '@ui/index'

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
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
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
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundBeams className="opacity-20" />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      <div className="relative z-10 space-y-16 max-w-7xl mx-auto py-8 px-6">
        <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/10 pb-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter text-primary uppercase">
              Control Center
            </h1>
            <p className="text-muted-foreground/60 text-sm tracking-widest uppercase font-medium">
              Management Layer / Infrastructure / Users
            </p>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-full uppercase tracking-tighter text-xs font-bold px-6 border-border/20">Sync DB</Button>
             <Button onClick={() => toast.info('Aún no funciona', { description: 'La creación de salas se implementará próximamente.' })} className="rounded-full uppercase tracking-tighter text-xs font-bold px-6 border-border/20">Nueva Sala</Button>
          </div>
        </header>

        <BentoGrid className="max-w-none">
          <BentoGridItem
            title="Live Sessions"
            description="Active video rooms currently utilizing SFU resources."
            header={<div className="flex flex-1 w-full min-h-24 rounded-xl bg-linear-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 overflow-hidden p-2"><RoomList /></div>}
            className="md:col-span-2 md:row-span-2"
          />
          <BentoGridItem
            title="Network Health"
            description="Real-time latency and packet loss metrics across edge nodes."
            header={<div className="flex flex-1 w-full min-h-24 rounded-xl bg-linear-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 p-4 font-mono text-[10px] text-muted-foreground/40">
              [TRAFFIC_NODE_01]: 42ms<br/>
              [TRAFFIC_NODE_02]: 12ms<br/>
              [SFU_LOAD]: 12.4%
            </div>}
          />
          <BentoGridItem
            title="System Access"
            description="Authorized terminal operators."
            header={<div className="flex flex-1 w-full min-h-24 rounded-xl bg-linear-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 overflow-hidden p-2"><UserTable /></div>}
            className="md:col-span-1 md:row-span-2"
          />
        </BentoGrid>
      </div>
    </div>
  )
}
