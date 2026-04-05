import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom' 
import { CosmosCanvas }  from '../components/canvas/CosmosCanvas'
import { AvatarLayer }   from '../components/canvas/AvatarLayer'   
import { ChatPanel }     from '../components/Chat/ChatPanel'
import { IconPicker }    from '../components/canvas/IconPicker'
import { ZoomControls }  from '../components/ui/ZoomControls' 
import { useCosmosStore } from '../store/useCosmosStore'

export default function CosmosServer() {
  const username = useCosmosStore(s => s.username)
  const navigate = useNavigate()

  // redirect if no username, they shouldnt be here without one
  useEffect(() => {
    if (!username) navigate('/', { replace: true })
  }, [username, navigate])

  if (!username) return null

  return (
    <div className="w-screen h-screen bg-gray-950 overflow-hidden relative">
      {/* pixi canvas layer */}
      <CosmosCanvas username={username} />

      {/* dom avatar overlays */}
      <AvatarLayer />

      {/* ui controls on top */}
      <IconPicker />
      <ChatPanel />
      <ZoomControls />
    </div>
  )
}