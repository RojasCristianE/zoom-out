import { useEffect, useState } from 'react'
import { api } from '../../api/client'
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
  Button 
} from '@zoom-out/ui'

type Room = {
  id: string
  name: string
  active?: boolean
  hostId: string | null
  createdAt: string
}

export function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRooms = async () => {
    try {
      const { data, error } = await api.rooms.get()
      if (error) {
        console.error('Failed to fetch rooms:', error.value)
        return
      }
      setRooms((data as any)?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const createRoom = async () => {
    const name = prompt('Nombre de la sala:')
    if (!name) return
    
    const { error } = await api.rooms.post({ name })
    if (!error) {
      fetchRooms()
    } else {
      alert('Error al crear sala')
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-bold">Salas</CardTitle>
        <Button size="sm" onClick={createRoom}>Nueva Sala</Button>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Cargando salas...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map(room => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      room.active 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-white/10 text-white'
                    }`}>
                      {room.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(room.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => alert('No implementado')}>
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rooms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No hay salas activas
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
