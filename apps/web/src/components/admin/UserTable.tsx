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
  Button,
  toast
} from '@zoom-out/ui'

type User = {
  id: string
  displayName: string
  role: 'admin' | 'host' | 'viewer'
}

export function UserTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const { data, error } = await api.users.get()
      if (error) {
        toast.error('Fallo en la sincronización de usuarios')
        return
      }
      setUsers((data as any)?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const toggleRole = async (user: User) => {
    const newRole = user.role === 'admin' ? 'viewer' : 'admin'
    const { error } = await api.users[user.id].role.patch({ role: newRole })
    if (!error) {
      toast.success(`Rol de ${user.displayName} actualizado`, {
        description: `Nivel de acceso: ${newRole.toUpperCase()}`
      })
      fetchUsers()
    } else {
      toast.error('Error al modificar privilegios')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <Card className="border-border/40 bg-card/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-border/10 pb-6">
        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/80">Directorio de Usuarios</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center animate-pulse">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Escaneando registros...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-12">Nombre de Usuario</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-12">Nivel de Acceso</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest h-12 px-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id} className="border-border/5 hover:bg-white/2 transition-colors">
                  <TableCell className="font-medium text-[13px] py-4">{user.displayName}</TableCell>
                  <TableCell className="py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      user.role === 'admin' 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-muted/20 text-muted-foreground border-border/40'
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-border/40 h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                      onClick={() => toggleRole(user)}
                    >
                      Modificar Privilegios
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-16">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">No hay registros de usuarios</p>
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
