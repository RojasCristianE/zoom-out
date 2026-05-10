import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '@web/api/client'
import { useAuthStore } from '@web/store/auth'
import { LoginForm } from '@zoom-out/ui'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    <div className="grid min-h-svh lg:grid-cols-2 bg-background font-sans overflow-hidden">
      <div className="flex flex-col gap-4 p-6 md:p-10 justify-center items-center relative z-20">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
          <LoginForm 
            onSubmit={handleSubmit}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loading={loading}
            error={error}
            footer={
              <div className="text-center text-xs text-muted-foreground uppercase tracking-widest font-bold mt-2">
                ¿No tienes cuenta?{' '}
                <Link to="/signup" className="text-primary hover:underline transition-all">
                  Regístrate
                </Link>
              </div>
            }
          />
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block overflow-hidden border-l border-border/50 animate-in fade-in slide-in-from-right-12 duration-1000">
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-background/20 z-10" />
        <div className="absolute inset-0 bg-primary/5 mix-blend-overlay z-10" />
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop"
          alt="Aether Background"
          className="absolute inset-0 h-full w-full object-cover grayscale opacity-60 scale-105 hover:scale-110 transition-transform duration-[10s] ease-out"
        />
        <div className="absolute bottom-12 left-12 right-12 z-20 space-y-6">
          <div className="h-px w-24 bg-primary/50" />
          <blockquote className="space-y-4">
            <p className="text-2xl font-black text-primary leading-tight tracking-tight uppercase">
              Infraestructura <br/>
              Aether <span className="text-muted-foreground/40 font-light text-lg">v4.0</span>
            </p>
            <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-md uppercase tracking-widest font-bold">
              Capa de comunicaciones privada y segura diseñada para control total.
            </p>
          </blockquote>
        </div>
      </div>
    </div>
  )
}
