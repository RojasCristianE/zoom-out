import React, { useEffect, useState } from 'react';
import { api } from '@web/api/client';
import { useNavigate } from 'react-router-dom';

export default function AgendaPage() {
  const [audiencias, setAudiencias] = useState<any[]>([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarAgenda();
  }, [fecha]);

  const cargarAgenda = async () => {
    setLoading(true);
    try {
      const res = await api.agenda.get({
        $query: { fecha },
      });
      if (res.data) {
        setAudiencias(res.data as any[]);
      }
    } catch (err) {
      console.error('Error cargando agenda:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda de Audiencias</h1>
          <p className="text-sm text-muted-foreground">
            Programación diaria de salas judiciales y control de asistencia procesal
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border border-border bg-background rounded-md px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Cargando agenda judicial...</div>
      ) : audiencias.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-lg border-border">
          <p className="text-muted-foreground">No hay audiencias programadas para esta fecha.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {audiencias.map((item) => (
            <div
              key={item.audiencia.id}
              className="border border-border rounded-lg p-5 bg-card hover:border-primary/50 transition cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              onClick={() => navigate(`/audiencia/${item.audiencia.id}`)}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base">{item.expediente.numero}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    {item.tipo.nombre}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      item.audiencia.estado === 'en_curso'
                        ? 'bg-emerald-500/10 text-emerald-500 animate-pulse'
                        : item.audiencia.estado === 'finalizada'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-blue-500/10 text-blue-500'
                    }`}
                  >
                    {item.audiencia.estado.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 font-medium">{item.expediente.asunto}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>🏛️ {item.sala.nombre}</span>
                  <span>⚖️ Juez: {item.juez.displayName}</span>
                  <span>⏰ {item.audiencia.horaInicioEstimada} - {item.audiencia.horaFinEstimada}</span>
                </div>
              </div>

              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/audiencia/${item.audiencia.id}`);
                }}
              >
                Abrir Sala de Audiencia
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
