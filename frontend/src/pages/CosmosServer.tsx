import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { CosmosCanvas } from '../components/canvas/CosmosCanvas'
import { ChatPanel } from '../components/Chat/ChatPanel'
import { useCosmosStore } from '../store/useCosmosStore'

export default function CosmosServer() {
  const username = useCosmosStore(s => s.username)
  const navigate = useNavigate()

  // Guard: if someone hits /cosmos directly without a name, send them back
  useEffect(() => {
    if (!username) navigate('/', { replace: true })
  }, [username, navigate])

  if (!username) return null

  return (
    <div className="w-screen h-screen bg-gray-950 overflow-hidden relative">
      <CosmosCanvas username={username} />
      <ChatPanel />
    </div>
  )
}