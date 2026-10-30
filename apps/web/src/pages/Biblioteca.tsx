import React, { useEffect, useState } from 'react';
import { api } from '@web/api/client';
import { useNavigate } from 'react-router-dom';

function formatearFecha(val: unknown): string {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'string') return val.split('T')[0];
  return String(val);
}

function formatearHora(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'string') return val.slice(0, 5);
  return String(val);
}

export default function BibliotecaPage() {
  const [arbol, setArbol] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarArbol();
  }, []);

  const cargarArbol = async () => {
    setLoading(true);
    try {
      const res = await api.biblioteca.arbol.get({
        $query: { modo: 'caso' },
      });
      if (res.data) setArbol(res.data as any[]);
    } catch (err) {
      console.error('Error cargando biblioteca:', err);
    } finally {
      setLoading(false);
    }
  };

  const ejecutarBusqueda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busqueda.trim()) return;

    setLoading(true);
    try {
      const res = await api.biblioteca.buscar.get({
        $query: { q: busqueda },
      });
      if (res.data) setResultados(res.data as any[]);
    } catch (err) {
      console.error('Error buscando:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Biblioteca de Audiencias Judiciales</h1>
        <p className="text-sm text-muted-foreground">
          CMS Jerárquico por Caso y Búsqueda Full-Text Search en Transcripciones
        </p>
      </div>

      {/* Buscador FTS */}
      <form onSubmit={ejecutarBusqueda} className="flex gap-2">
        <input
          type="text"
          placeholder="Buscar palabra o frase en transcripciones de audio (ej: robo, testigo, agravante)..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 border border-border bg-background rounded-md px-4 py-2 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
        >
          Buscar FTS
        </button>
      </form>

      {/* Resultados de Búsqueda */}
      {resultados.length > 0 && (
        <div className="border border-border rounded-lg p-5 bg-card space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Resultados de Búsqueda ({resultados.length})
          </h2>
          <div className="space-y-2">
            {resultados.map((r, idx) => {
              const audId = r.audienciaId || r.audiencia?.id;
              const expNum = r.expedienteNumero || r.expediente?.numero;
              const fecha = formatearFecha(r.fechaProgramada || r.audiencia?.fechaProgramada);

              return (
                <div
                  key={r.segmentoId || audId || idx}
                  onClick={() => audId && navigate(`/audiencia/${audId}`)}
                  className="p-3 border border-border rounded hover:bg-accent/50 cursor-pointer text-sm"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{String(expNum || 'Expediente')}</span>
                    <span className="text-xs text-muted-foreground">{fecha}</span>
                  </div>
                  {r.texto && (
                    <p className="text-xs font-mono bg-muted/50 p-2 rounded text-foreground/80">
                      "{String(r.texto)}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vista Jerárquica */}
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Estructura por Casos y Expedientes
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando expedientes...</p>
        ) : arbol.length === 0 ? (
          <p className="text-sm text-muted-foreground">No se encontraron expedientes registrados.</p>
        ) : (
          <div className="space-y-2">
            {arbol.map((item, idx) => {
              const fecha = formatearFecha(item.audienciaFecha);
              const hora = formatearHora(item.audienciaHora);

              return (
                <div
                  key={item.audienciaId || idx}
                  onClick={() => item.audienciaId && navigate(`/audiencia/${item.audienciaId}`)}
                  className="p-3 border border-border rounded flex justify-between items-center hover:bg-accent/50 cursor-pointer text-sm"
                >
                  <div>
                    <span className="font-semibold">{String(item.expedienteNumero || '')}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({String(item.materiaNombre || '')} • {String(item.anio || '')})
                    </span>
                    <p className="text-xs text-muted-foreground">{String(item.expedienteAsunto || '')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-muted-foreground">
                      {fecha} {hora}
                    </span>
                    <div className="text-xs font-semibold text-primary uppercase">
                      {String(item.audienciaEstado || '')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
