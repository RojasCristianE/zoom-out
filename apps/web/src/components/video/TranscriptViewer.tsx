import { useState, useMemo } from 'react'
import type { TranscriptSegment } from '@zoom-out/shared-types'

// ──────────────────────────────────────────────
// Visor de Transcripción
// ──────────────────────────────────────────────

interface TranscriptViewerProps {
  segments: TranscriptSegment[]
  language?: string
  onClose?: () => void
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function TranscriptViewer({ segments, language, onClose }: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return segments
    const query = searchQuery.toLowerCase()
    return segments.filter((seg) => seg.text.toLowerCase().includes(query))
  }, [segments, searchQuery])

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const fullText = useMemo(() => segments.map((s) => s.text).join(' '), [segments])

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
            <span className="text-sm">📝</span>
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Transcripción</h3>
            <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
              {segments.length} segmentos{language ? ` · ${language}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopy(fullText, -1)}
            className="px-3 py-1.5 rounded-md bg-muted border border-border hover:bg-muted/80 text-[11px] font-medium transition-all"
          >
            {copiedIndex === -1 ? '✓ Copiado' : 'Copiar todo'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md bg-muted border border-border hover:bg-muted/80 text-[11px] font-medium transition-all"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="py-3">
        <input
          type="text"
          placeholder="Buscar en la transcripción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-muted border border-border text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Lista de segmentos */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {filteredSegments.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            {searchQuery ? 'Sin resultados para esta búsqueda' : 'Sin segmentos de transcripción'}
          </div>
        ) : (
          filteredSegments.map((segment, index) => (
            <button
              type="button"
              key={`${segment.start}-${segment.end}`}
              onClick={() => handleCopy(segment.text, index)}
              className="w-full text-left group flex gap-3 px-3 py-2 rounded-md hover:bg-muted/60 transition-all duration-200 cursor-pointer"
            >
              {/* Timestamp */}
              <span className="shrink-0 text-[10px] font-mono text-muted-foreground/60 pt-0.5 min-w-[5ch]">
                {formatTime(segment.start)}
              </span>

              {/* Texto */}
              <span className="text-sm text-foreground/90 leading-relaxed flex-1">
                {segment.speaker && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-2">
                    {segment.speaker}
                  </span>
                )}
                {segment.text}
              </span>

              {/* Indicador de copia */}
              <span className="shrink-0 text-[10px] text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5">
                {copiedIndex === index ? '✓' : 'copiar'}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
