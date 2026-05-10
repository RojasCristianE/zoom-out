import type { TrackReferenceOrPlaceholder, TrackReference } from '@livekit/components-react'
import { VideoTrack, AudioTrack, useIsSpeaking } from '@livekit/components-react'
import { Avatar, AvatarFallback } from '@zoom-out/ui'
import { MicOff, Mic, MonitorUp } from 'lucide-react'
import { Track } from 'livekit-client'

interface CustomParticipantTileProps {
  trackRef: TrackReferenceOrPlaceholder
}

export default function ParticipantTile({ trackRef }: CustomParticipantTileProps) {
  const { participant, publication, source } = trackRef
  
  const isSpeaking = useIsSpeaking(participant)
  const isLocal = participant.isLocal

  const isScreenShare = source === Track.Source.ScreenShare

  const microphonePublication = participant.getTrackPublication(Track.Source.Microphone)
  const cameraPublication = participant.getTrackPublication(Track.Source.Camera)

  // Evaluar el estado de los tracks (audio y video)
  const isVideoEnabled = cameraPublication?.isSubscribed && cameraPublication?.track && !cameraPublication?.isMuted
  const isAudioEnabled = microphonePublication?.isSubscribed && microphonePublication?.track && !microphonePublication?.isMuted
  
  const hasTrack = publication?.isSubscribed && publication?.track
  const isTrackMuted = publication?.isMuted

  return (
    <div className={`relative flex flex-col items-center justify-center bg-muted/30 rounded-xl overflow-hidden border transition-all w-full h-full min-h-[200px] ${
      isSpeaking 
        ? 'border-primary ring-2 ring-primary/50 shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
        : 'border-border/40'
    }`}>
      
      {/* Video Rendering */}
      {hasTrack && !isTrackMuted ? (
        <VideoTrack trackRef={trackRef as TrackReference} className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center">
          <Avatar className="h-24 w-24 mb-4 ring-4 ring-background/50 shadow-sm">
            <AvatarFallback className="text-3xl bg-primary/10 text-primary">
              {participant.identity.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Audio render for remote participants */}
      {!isLocal && isAudioEnabled && microphonePublication && (
        <AudioTrack trackRef={{ participant, publication: microphonePublication, source: Track.Source.Microphone } as TrackReference} />
      )}

      {/* Overlays / Indicators */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-border/40">
          {isAudioEnabled ? (
            <Mic className="h-3.5 w-3.5 text-success" />
          ) : (
            <MicOff className="h-3.5 w-3.5 text-destructive" />
          )}
          <span className="text-xs font-medium truncate max-w-[120px]">
            {participant.identity} {isLocal && '(Tú)'} {isScreenShare && <MonitorUp className="inline h-3 w-3 ml-1" />}
          </span>
        </div>
      </div>
    </div>
  )
}
