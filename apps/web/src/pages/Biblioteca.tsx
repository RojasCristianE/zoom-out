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
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resArbol, resDocs] = await Promise.all([
        api.biblioteca.arbol.get({
          $query: { modo: 'caso' },
        }),
        (api.biblioteca as any).documentos.get(),
      ]);

      if (resArbol.data) setArbol(resArbol.data as any[]);
      if (resDocs.data) setDocumentos(resDocs.data as any[]);
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

      {/* Documentos Judiciales Generados */}
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Documentos y Actas Judiciales Oficiales ({documentos.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Actas compiladas en formato PDF y evaluaciones de inteligencia artificial
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando documentos...</p>
        ) : documentos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay documentos generados actualmente.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documentos.map((doc) => {
              const fecha = formatearFecha(doc.createdAt || doc.audienciaFecha);
              return (
                <div
                  key={doc.id}
                  className="p-4 border border-border rounded-lg bg-background flex flex-col justify-between gap-3 hover:border-primary/50 transition"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="font-semibold text-sm line-clamp-1">{doc.titulo}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary whitespace-nowrap">
                        {doc.tipo}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Expediente: <span className="font-medium text-foreground">{doc.expedienteNumero}</span>
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{doc.expedienteAsunto}</p>
                    <div className="text-[11px] font-mono text-muted-foreground mt-2">
                      Fecha: {fecha} • Hash: {doc.sha256Pdf ? doc.sha256Pdf.slice(0, 10) + '...' : 'Pendiente'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <button
                      onClick={() => navigate(`/audiencia/${doc.audienciaId}`)}
                      className="text-xs text-muted-foreground hover:text-foreground font-medium"
                    >
                      Ir a Audiencia →
                    </button>
                    {doc.urlPdf ? (
                      <a
                        href={doc.urlPdf}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-semibold hover:opacity-90 transition shadow-sm"
                      >
                        <span>📄</span>
                        <span>Ver / Descargar PDF</span>
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">PDF no disponible</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
