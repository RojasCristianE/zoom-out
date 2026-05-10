import { GalleryVerticalEnd } from "lucide-react"
import { cn } from "@ui/lib/utils"
import { Button } from "@ui/components/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@ui/components/field"
import { Input } from "@ui/components/input"

interface SignupFormProps extends Omit<React.ComponentProps<"div">, "onSubmit"> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  displayName: string
  setDisplayName: (v: string) => void
  loading?: boolean
  error?: string | null
  footer?: React.ReactNode
}

export function SignupForm({
  className,
  onSubmit,
  email,
  setEmail,
  password,
  setPassword,
  displayName,
  setDisplayName,
  loading,
  error,
  footer,
  ...props
}: SignupFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase mt-2">Crear Cuenta</h1>
            <FieldDescription className="text-xs uppercase tracking-widest opacity-50">
              Únete a la Infraestructura Aether
            </FieldDescription>
          </div>
          
          <div className="grid gap-4">
            <Field>
              <FieldLabel htmlFor="displayName" className="text-[10px] uppercase tracking-widest font-bold opacity-50 ml-1">Nombre Completo</FieldLabel>
              <Input
                id="displayName"
                type="text"
                placeholder="Juan Pérez"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 rounded-xl bg-muted/20 border-border/50 focus:border-primary/50 transition-all"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold opacity-50 ml-1">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="nombre@empresa.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-muted/20 border-border/50 focus:border-primary/50 transition-all"
              />
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password" className="text-[10px] uppercase tracking-widest font-bold opacity-50 ml-1">Contraseña</FieldLabel>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-muted/20 border-border/50 focus:border-primary/50 transition-all"
              />
            </Field>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-[12px] p-3 rounded-xl text-center font-medium animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Registrarse"}
            </Button>
          </div>
        </FieldGroup>
      </form>
      {footer}
      <FieldDescription className="px-6 text-center text-[10px] leading-relaxed uppercase tracking-tighter opacity-30">
        Secure & Private Video Communications Layer <br/>
        Join the Network
      </FieldDescription>
    </div>
  )
}
