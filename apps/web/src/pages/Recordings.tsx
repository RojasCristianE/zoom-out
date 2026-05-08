import * as React from "react"
import { Calendar } from "@ui/index"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/index"
import { Search, Play, FileText, Calendar as CalendarIcon } from "lucide-react"

export default function Recordings() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  // Mock data for recordings
  const recordings = [
    { id: 1, title: "Reunión de Diseño - UI/UX", duration: "45:20", date: new Date(), hasTranscription: true },
    { id: 2, title: "Daily Standup", duration: "15:10", date: new Date(), hasTranscription: true },
    { id: 3, title: "Review Sprint 12", duration: "1:20:05", date: new Date(), hasTranscription: false },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grabaciones</h1>
          <p className="text-muted-foreground">Gestiona y revisa el historial de tus sesiones.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[350px_1fr]">
        {/* Historial / Calendario */}
        <div className="space-y-6">
          <Card className="border-none bg-accent/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <CalendarIcon className="size-4 text-primary" />
                Historial de Sesiones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border-none bg-transparent"
              />
            </CardContent>
          </Card>

          <div className="rounded-xl border border-dashed p-4 text-center">
            <p className="text-xs text-muted-foreground">Selecciona un día para ver las grabaciones disponibles.</p>
          </div>
        </div>

        {/* Lista de Grabaciones */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-accent/30 px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar por título..." 
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="grid gap-4">
            {recordings.map((rec) => (
              <Card key={rec.id} className="group overflow-hidden border-none bg-accent/10 transition-all hover:bg-accent/20">
                <div className="flex items-center gap-4 p-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Play className="size-5 fill-current" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{rec.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{rec.duration}</span>
                      <span>•</span>
                      <span>{rec.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {rec.hasTranscription && (
                      <div className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[10px] font-medium uppercase tracking-wider">
                        <FileText className="size-3" />
                        Transcripción
                      </div>
                    )}
                    <button className="rounded-md border border-primary/20 px-3 py-1 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground">
                      Abrir
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {recordings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 rounded-full bg-accent/20 p-4">
                <CalendarIcon className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Sin grabaciones</h3>
              <p className="text-sm text-muted-foreground">No se encontraron sesiones para la fecha seleccionada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
