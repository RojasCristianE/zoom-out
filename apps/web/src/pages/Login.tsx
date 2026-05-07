import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@web/api/client'
import { useAuthStore } from '@web/store/auth'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Button,
  Input
} from '@zoom-out/ui'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: apiError } = await api.auth.login.post({
        email,
        password,
      })

      if (apiError) throw new Error(apiError.value?.message || 'Error al iniciar sesión')
      
      if (data?.user && data?.accessToken) {
        setAuth(data.user, data.accessToken)
        navigate('/')
      } else {
        throw new Error('Respuesta del servidor incompleta')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle_at_top_left,#1a1a2e_0%,#16213e_50%,#0f3460_100%)] p-4">
      <Card className="glass w-full max-w-md border-white/10 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Zoom-Out
          </CardTitle>
          <CardDescription className="text-blue-200/60">
            Bienvenido de nuevo. Inicia sesión para continuar.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-200/70 ml-1">Email</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/20 border-white/10 focus:border-blue-400 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-200/70 ml-1">Contraseña</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-black/20 border-white/10 focus:border-blue-400 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold py-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Cargando...' : 'Entrar'}
            </Button>
            <p className="text-xs text-center text-blue-200/40">
              Sistema de videollamadas privado y seguro.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
