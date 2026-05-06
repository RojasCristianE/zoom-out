import { useParams } from 'react-router-dom'

export default function Room() {
  const { id } = useParams<{ id: string }>()

  return (
    <main>
      <h1>Sala: {id}</h1>
      {/* TODO: LiveKit VideoConference component */}
    </main>
  )
}
