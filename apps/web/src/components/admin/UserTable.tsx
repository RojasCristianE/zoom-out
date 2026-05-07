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
        console.error('Failed to fetch users:', error.value)
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
      fetchUsers()
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Usuarios</CardTitle>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Cargando usuarios...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.displayName}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' 
                        ? 'bg-rose-500/20 text-rose-400' 
                        : 'bg-white/10 text-white'
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => toggleRole(user)}>
                      Cambiar Rol
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No hay usuarios
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
