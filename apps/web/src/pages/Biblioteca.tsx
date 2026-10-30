import React, { useEffect, useState } from 'react';
import { api } from '@web/api/client';
import { useNavigate } from 'react-router-dom';

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
            {resultados.map((r) => (
              <div
                key={r.segmentoId || r.audiencia?.id}
                onClick={() => navigate(`/audiencia/${r.audienciaId || r.audiencia?.id}`)}
                className="p-3 border border-border rounded hover:bg-accent/50 cursor-pointer text-sm"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">{r.expedienteNumero || r.expediente?.numero}</span>
                  <span className="text-xs text-muted-foreground">{r.fechaProgramada}</span>
                </div>
                {r.texto && (
                  <p className="text-xs font-mono bg-muted/50 p-2 rounded text-foreground/80">
                    "{r.texto}"
                  </p>
                )}
              </div>
            ))}
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
        ) : (
          <div className="space-y-2">
            {arbol.map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/audiencia/${item.audienciaId}`)}
                className="p-3 border border-border rounded flex justify-between items-center hover:bg-accent/50 cursor-pointer text-sm"
              >
                <div>
                  <span className="font-semibold">{item.expedienteNumero}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({item.materiaNombre} • {item.anio})
                  </span>
                  <p className="text-xs text-muted-foreground">{item.expedienteAsunto}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-muted-foreground">
                    {item.audienciaFecha} {item.audienciaHora}
                  </span>
                  <div className="text-xs font-semibold text-primary">{item.audienciaEstado}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
