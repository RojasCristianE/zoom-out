import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useAuthStore } from '../../store/auth'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell, 
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  Input,
  Label,
  toast
} from '@zoom-out/ui'
import { useNavigate } from 'react-router-dom'

type Room = {
  id: string
  name: string
  status: 'waiting' | 'active' | 'ended'
  livekitRoomName: string | null
  createdAt: string
}

export function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)
  const isAdmin = user?.role === 'admin'

  const fetchRooms = async () => {
    try {
      const { data, error } = await api.rooms.get()
      if (error) {
        toast.error('Error al sincronizar salas')
        return
      }
      const roomsData = (data as any)?.data || []
      setRooms([...roomsData].reverse())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleStartRoom = async (id: string) => {
    const t = toast.loading('Iniciando sala...')
    try {
      const { error } = await api.rooms[id].start.post({})
      if (!error) {
        toast.dismiss(t)
        toast.success('Sala iniciada')
        fetchRooms()
      } else {
        toast.dismiss(t)
        toast.error('Fallo al iniciar sala')
      }
    } catch (err) {
      toast.dismiss(t)
      toast.error('Error de conexión')
    }
  }

  const handleEndRoom = async (id: string) => {
    const t = toast.loading('Finalizando sala...')
    try {
      const { error } = await api.rooms[id].end.post({})
      if (!error) {
        toast.dismiss(t)
        toast.success('Sala finalizada')
        fetchRooms()
      } else {
        toast.dismiss(t)
        toast.error('Fallo al finalizar sala')
      }
    } catch (err) {
      toast.dismiss(t)
      toast.error('Error de conexión')
    }
  }

  const handleJoinRoom = (id: string) => {
    navigate(`/room/${id}`)
  }

  // handleCreateRoom removido (movido a Dashboard)

  useEffect(() => {
    fetchRooms()
    
    const handleRefresh = () => fetchRooms()
    window.addEventListener('refresh-rooms', handleRefresh)
    return () => window.removeEventListener('refresh-rooms', handleRefresh)
  }, [])

  return (
    <Card className="border-border/40 bg-card/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/10">
        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/80">Salas Activas</CardTitle>
        
        {/* El Dialog se movió al Dashboard para mayor visibilidad */}
      </CardHeader>
      
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center animate-pulse">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Sincronizando con el núcleo...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-12">Slug</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-12">Estado</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-12">Despliegue</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest h-12 px-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map(room => (
                <TableRow key={room.id} className="border-border/5 hover:bg-white/2 transition-colors">
                  <TableCell className="font-mono text-xs py-4">{room.name}</TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${
                        room.status === 'active' ? 'bg-success animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                        room.status === 'waiting' ? 'bg-yellow-500' : 'bg-muted-foreground/20'
                      }`} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">
                        {room.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] font-medium text-muted-foreground/60 py-4">
                    {new Date(room.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </TableCell>
                  <TableCell className="text-right py-4 px-6 space-x-2">
                    {isAdmin && room.status === 'waiting' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10"
                        onClick={() => handleStartRoom(room.id)}
                      >
                        Iniciar
                      </Button>
                    )}
                    {room.status === 'active' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-[10px] font-bold uppercase tracking-widest text-success hover:bg-success/10"
                          onClick={() => handleJoinRoom(room.id)}
                        >
                          Unirse
                        </Button>
                        {isAdmin && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 text-[10px] font-bold uppercase tracking-widest text-error hover:bg-error/10"
                            onClick={() => handleEndRoom(room.id)}
                          >
                            Terminar
                          </Button>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {rooms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-16">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">No hay infraestructuras activas</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
