import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { CosmosCanvas }  from '../components/canvas/CosmosCanvas'
import { AvatarLayer }   from '../components/canvas/AvatarLayer'   // ← new
import { ChatPanel }     from '../components/Chat/ChatPanel'
import { IconPicker }    from '../components/canvas/IconPicker'
import { useCosmosStore } from '../store/useCosmosStore'

export default function CosmosServer() {
  const username = useCosmosStore(s => s.username)
  const navigate = useNavigate()

  useEffect(() => {
    if (!username) navigate('/', { replace: true })
  }, [username, navigate])

  if (!username) return null

  return (
    <div className="w-screen h-screen bg-gray-950 overflow-hidden relative">
      {/* Layer 1 — Pixi canvas: grid, stars, proximity lines */}
      <CosmosCanvas username={username} />

      {/* Layer 2 — DOM avatars: positioned over canvas via camera sync */}
      <AvatarLayer />

      {/* Layer 3 — UI chrome */}
      <IconPicker />
      <ChatPanel />
    </div>
  )
}