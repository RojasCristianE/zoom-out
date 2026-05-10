import { useLocalParticipant, useRoomContext } from '@livekit/components-react'
import { Button } from '@zoom-out/ui'
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff } from 'lucide-react'

export default function RoomControls() {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant()
  const room = useRoomContext()
  const canPublish = localParticipant.permissions?.canPublish ?? false

  const toggleMic = () => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
  const toggleCam = () => localParticipant.setCameraEnabled(!isCameraEnabled)
  const toggleScreen = () => localParticipant.setScreenShareEnabled(!isScreenShareEnabled)
  const disconnect = () => room.disconnect()

  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-background/80 backdrop-blur-md border-t border-border/40 w-full shrink-0">
      {canPublish && (
        <>
          <Button 
            variant={isMicrophoneEnabled ? 'outline' : 'destructive'} 
            size="icon" 
            onClick={toggleMic}
            className="rounded-full h-12 w-12 transition-all hover:scale-105"
          >
            {isMicrophoneEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button 
            variant={isCameraEnabled ? 'outline' : 'destructive'} 
            size="icon" 
            onClick={toggleCam}
            className="rounded-full h-12 w-12 transition-all hover:scale-105"
          >
            {isCameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button 
            variant={isScreenShareEnabled ? 'default' : 'outline'} 
            size="icon" 
            onClick={toggleScreen}
            className="rounded-full h-12 w-12 hidden md:flex transition-all hover:scale-105"
          >
            <MonitorUp className="h-5 w-5" />
          </Button>

          <div className="w-px h-8 bg-border mx-2" />
        </>
      )}

      <Button 
        variant="destructive" 
        size="icon" 
        onClick={disconnect}
        className="rounded-full h-12 w-12 hover:bg-destructive/90 transition-all hover:scale-105 shadow-md shadow-destructive/20"
      >
        <PhoneOff className="h-5 w-5" />
      </Button>
    </div>
  )
}
