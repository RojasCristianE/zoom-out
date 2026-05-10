import { useAuthStore } from '../store/auth'
import { api } from '../api/client'
import { RoomList } from '../components/admin/RoomList'
import { UserTable } from '../components/admin/UserTable'
import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { 
  toast,
  Button,
  BentoGrid,
  BentoGridItem,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from '@zoom-out/ui'

import { BackgroundBeams, Spotlight } from '@ui/index'

export default function Dashboard() {
  const user = useAuthStore(state => state.user)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchRooms = () => {
    // Esto es un hack para refrescar la lista. 
    // En una app real usaríamos un context o react-query.
    window.dispatchEvent(new CustomEvent('refresh-rooms'))
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoomName) {
      toast.error('Nombre de sala requerido')
      return
    }
    
    setCreating(true)
    const t = toast.loading('Iniciando despliegue...')
    
    try {
      const { error } = await api.rooms.post({ name: newRoomName })
      
      if (!error) {
        toast.dismiss(t)
        toast.success('Sala desplegada correctamente')
        setNewRoomName('')
        setIsDialogOpen(false)
        fetchRooms()
      } else {
        toast.dismiss(t)
        toast.error('Fallo en la creación de la sala')
      }
    } catch (err) {
      toast.dismiss(t)
      toast.error('Error de conexión')
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    if (user) {
      toast.success(`Bienvenido de vuelta, ${user.displayName}`, {
        description: "Terminal de administración sincronizada.",
      })
    }
  }, [user])

  const isAdmin = user?.role === 'admin'

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
          {isAdmin && (
            <div className="flex gap-4">
               <Button variant="outline" className="rounded-full uppercase tracking-tighter text-xs font-bold px-6 border-border/20">Sync DB</Button>
               
               <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full uppercase tracking-tighter text-xs font-bold px-6 border-border/20">Nueva Sala</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">Configurar Nueva Sala</DialogTitle>
                    <DialogDescription className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-bold">
                      Asigne un identificador único para el despliegue del nuevo entorno de comunicación.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateRoom} className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Identificador de Sala</Label>
                      <Input
                        id="name"
                        placeholder="ej. conferencia-anual"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        className="bg-muted/10 border-border/40 h-12 rounded-xl"
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={creating} className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[11px]">
                        {creating ? 'Iniciando...' : 'Confirmar Despliegue'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
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
          {isAdmin && (
            <BentoGridItem
              title="System Access"
              description="Authorized terminal operators."
              header={<div className="flex flex-1 w-full min-h-24 rounded-xl bg-linear-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 overflow-hidden p-2"><UserTable /></div>}
              className="md:col-span-1 md:row-span-2"
            />
          )}
        </BentoGrid>
      </div>
    </div>
  )
}
