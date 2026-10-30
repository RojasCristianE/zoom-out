import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@web/api/client';
import { useAuthStore } from '@web/store/auth';

const BOTONERA_MARCADORES = [
  { tipo: 'apertura', label: '1. Apertura', shortcut: '1' },
  { tipo: 'alegato_inicial_acusacion', label: '2. Alegato Acusación', shortcut: '2' },
  { tipo: 'alegato_inicial_defensa', label: '3. Alegato Defensa', shortcut: '3' },
  { tipo: 'declaracion_imputado', label: '4. Declaración Imputado', shortcut: '4' },
  { tipo: 'prueba_testifical', label: '5. Testifical', shortcut: '5' },
  { tipo: 'prueba_documental', label: '6. Documental', shortcut: '6' },
  { tipo: 'incidente', label: '7. Incidente', shortcut: '7' },
  { tipo: 'fallo', label: '8. Fallo', shortcut: '8' },
  { tipo: 'cierre', label: '9. Cierre', shortcut: '9' },
];

export default function AudienciaConsole() {
  const { id } = useParams<{ id: string }>();
  const [audiencia, setAudiencia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [segundos, setSegundos] = useState(0);
  const [grabando, setGrabando] = useState(false);
  const usuario = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) cargarAudiencia();
  }, [id]);

  useEffect(() => {
    let interval: any;
    if (grabando) {
      interval = setInterval(() => setSegundos((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [grabando]);

  const cargarAudiencia = async () => {
    setLoading(true);
    try {
      const res = await (api.audiencias as any)[id!].get();
      if (res.data) {
        setAudiencia(res.data);
        if (res.data.estado === 'en_curso') {
          setGrabando(true);
        }
      }
    } catch (err) {
      console.error('Error cargando audiencia:', err);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    try {
      await (api.audiencias as any)[id!].estado.post({
        nuevoEstado,
      });
      await cargarAudiencia();
      if (nuevoEstado === 'en_curso') setGrabando(true);
      if (nuevoEstado === 'finalizada') setGrabando(false);
    } catch (err) {
      console.error('Error cambiando estado:', err);
    }
  };

  const agregarMarcador = async (tipo: string, etiqueta: string) => {
    try {
      await api.marcadores.post({
        audienciaId: id!,
        timestampMs: segundos * 1000,
        tipo: tipo as any,
        etiqueta,
      });
      await cargarAudiencia();
    } catch (err) {
      console.error('Error agregando marcador:', err);
    }
  };

  const solicitarDocumento = async (tipo: string) => {
    try {
      await api.documentos.generar.post({
        audienciaId: id!,
        tipo: tipo as any,
      });
      alert(`Generación de ${tipo} iniciada en segundo plano.`);
      await cargarAudiencia();
    } catch (err) {
      console.error('Error solicitando documento:', err);
    }
  };

  if (loading || !audiencia) {
    return <div className="p-8 text-center text-muted-foreground">Cargando sala judicial...</div>;
  }

  const formatoTiempo = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const segs = s % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${segs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Cabecera de la Audiencia */}
      <div className="border border-border bg-card rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold">{audiencia.expediente?.numero}</span>
            <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-primary/10 text-primary">
              {audiencia.tipoAudiencia?.nombre}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-muted text-muted-foreground">
              {audiencia.sala?.nombre}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground/80">{audiencia.expediente?.asunto}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Juez: {audiencia.juez?.displayName} | Tribunal: República de Nicaragua
          </p>
        </div>

        {/* Grabación y Control */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {grabando ? '🔴 GRABANDO AUDIO' : 'PAUSADO'}
            </div>
            <div className="text-2xl font-mono font-bold tracking-tight">{formatoTiempo(segundos)}</div>
          </div>

          {audiencia.estado === 'programada' && (
            <button
              onClick={() => cambiarEstado('en_curso')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md font-medium text-sm hover:bg-emerald-700"
            >
              Iniciar Audiencia
            </button>
          )}

          {audiencia.estado === 'en_curso' && (
            <button
              onClick={() => cambiarEstado('finalizada')}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md font-medium text-sm hover:opacity-90"
            >
              Finalizar Audiencia
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Botonera de Marcadores */}
        <div className="border border-border bg-card rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Botonera de Marcadores en Vivo
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {BOTONERA_MARCADORES.map((b) => (
              <button
                key={b.tipo}
                disabled={audiencia.estado !== 'en_curso'}
                onClick={() => agregarMarcador(b.tipo, b.label)}
                className="w-full text-left px-3 py-2 border border-border rounded text-sm hover:bg-accent disabled:opacity-50 transition flex justify-between items-center"
              >
                <span>{b.label}</span>
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                  [{b.shortcut}]
                </span>
              </button>
            ))}
          </div>

          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-4 border-t border-border">
            Marcadores Registrados
          </h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {(audiencia.marcadores || []).map((m: any) => (
              <div key={m.id} className="text-xs flex justify-between py-1 border-b border-border/50">
                <span className="font-medium">{m.etiqueta}</span>
                <span className="font-mono text-muted-foreground">
                  {Math.floor(m.timestampMs / 1000)}s
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Columna Central: Partes y Transcripción */}
        <div className="border border-border bg-card rounded-lg p-5 space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Documentos y Automatización IA
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => solicitarDocumento('acta_integral')}
                className="text-xs px-2.5 py-1.5 border border-border rounded hover:bg-accent font-medium"
              >
                Acta Integral PDF
              </button>
              <button
                onClick={() => solicitarDocumento('resumen_simple')}
                className="text-xs px-2.5 py-1.5 border border-border rounded hover:bg-accent font-medium"
              >
                Resumen Simple PDF
              </button>
              {['admin', 'juez'].includes(usuario?.role || '') && (
                <button
                  onClick={() => solicitarDocumento('evaluacion_predictiva')}
                  className="text-xs px-2.5 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
                >
                  Evaluación Predictiva IA
                </button>
              )}
            </div>
          </div>

          {/* Lista de Documentos Generados */}
          <div className="space-y-2">
            {(audiencia.documentos || []).length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No hay documentos generados aún.</p>
            ) : (
              (audiencia.documentos || []).map((d: any) => (
                <div
                  key={d.id}
                  className="p-3 border border-border rounded flex justify-between items-center text-sm"
                >
                  <div>
                    <span className="font-medium">{d.titulo}</span>
                    <span className="text-xs text-muted-foreground ml-2">({d.tipo})</span>
                  </div>
                  {d.urlPdf && (
                    <a
                      href={d.urlPdf}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Descargar PDF
                    </a>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Transcripción de Audio */}
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground pt-4 border-t border-border">
            Transcripción de Audio en Vivo / Procesada
          </h2>
          <div className="bg-muted/30 p-4 rounded-lg min-h-[160px] text-sm text-foreground/90 font-mono">
            {audiencia.transcripcion?.textoCompleto ||
              'Esperando procesamiento de audio por Faster-Whisper...'}
          </div>
        </div>
      </div>
    </div>
  );
}
