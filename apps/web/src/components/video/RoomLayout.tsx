import { useTracks } from '@livekit/components-react'
import { Track } from 'livekit-client'
import ParticipantTile from './ParticipantTile'
import RoomControls from './RoomControls'
import { BackgroundBeams, Spotlight } from '@zoom-out/ui'

export default function RoomLayout() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  )

  // Layout grid auto-ajustable
  const getGridCols = (count: number) => {
    if (count === 0 || count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-1 md:grid-cols-2'
    if (count <= 4) return 'grid-cols-2'
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3'
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  }

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Elementos decorativos Aether */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      
      <div className={`flex-1 p-2 md:p-4 grid gap-2 md:gap-4 ${getGridCols(tracks.length)} auto-rows-fr overflow-y-auto min-h-0 z-10`}>
        {tracks.map((track) => (
          <div key={`${track.participant.identity}-${track.source}`} className="w-full h-full min-h-[200px] md:min-h-[300px]">
             <ParticipantTile trackRef={track} />
          </div>
        ))}
        
        {tracks.length === 0 && (
           <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground h-full min-h-[300px] relative">
              <BackgroundBeams />
              <div className="z-10 flex flex-col items-center">
                <div className="h-16 w-16 mb-4 rounded-full border-4 border-muted flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <span className="text-2xl animate-pulse">👥</span>
                </div>
                <p className="font-medium tracking-tight">Esperando a que los participantes compartan video...</p>
                <p className="text-xs opacity-50 mt-1">La sesión está lista para comenzar</p>
              </div>
           </div>
        )}
      </div>

      <div className="z-20">
        <RoomControls />
      </div>
    </div>
  )
}

