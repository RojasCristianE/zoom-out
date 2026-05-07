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
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6 font-sans">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black tracking-tighter text-primary uppercase">
            Zoom-Out
          </h1>
          <p className="text-muted-foreground/60 text-xs tracking-[0.2em] uppercase">
            Aether Infrastructure Access
          </p>
        </div>

        <Card className="border-border bg-card shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl p-2">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1 pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-bold tracking-tight">
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-muted-foreground/60 text-[13px]">
                Credenciales requeridas para acceso administrativo.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-5 px-6 pb-6">
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">Email</label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted/10 border-border/40 focus:border-primary/40 focus:ring-0 transition-all duration-300 h-12 rounded-xl text-[13px]"
                />
              </div>
              
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">Contraseña</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-muted/10 border-border/40 focus:border-primary/40 focus:ring-0 transition-all duration-300 h-12 rounded-xl text-[13px]"
                />
              </div>

              {error && (
                <div className="bg-error/5 border border-error/20 text-error p-4 rounded-xl text-[12px] text-center font-medium animate-in shake-in">
                  {error}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-6 px-6 pb-8">
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest text-[11px] h-14 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/10"
              >
                {loading ? 'Autenticando...' : 'Acceder'}
              </Button>
              <p className="text-[9px] text-center text-muted-foreground/30 uppercase tracking-[0.2em] leading-relaxed">
                Secure & Private <br/> Video Communications Layer
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
