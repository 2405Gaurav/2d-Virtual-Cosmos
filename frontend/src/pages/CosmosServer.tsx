import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { CosmosCanvas }  from '../components/canvas/CosmosCanvas'
import { AvatarLayer }   from '../components/canvas/AvatarLayer'
import { ChatPanel }     from '../components/Chat/ChatPanel'
import { IconPicker }    from '../components/canvas/IconPicker'
import { useCosmosStore } from '../store/useCosmosStore'
import { useCameraStore } from '../store/useCameraStore'

export default function CosmosServer() {
  const username = useCosmosStore(s => s.username)
  const navigate = useNavigate()
  const { zoom, setZoom } = useCameraStore()

  const MIN_ZOOM = 0.3
  const MAX_ZOOM = 2.0

  useEffect(() => {
    if (!username) navigate('/', { replace: true })
  }, [username, navigate])

  if (!username) return null

  return (
    <div className="w-screen h-screen bg-gray-950 overflow-hidden relative">
      {/* Layer 1 — Pixi canvas */}
      <CosmosCanvas username={username} />

      {/* Layer 2 — DOM avatars */}
      <AvatarLayer />

      {/* Layer 3 — UI chrome */}
      <IconPicker />
      <ChatPanel />

      {/* Zoom controls */}
      <div className="absolute bottom-6 left-6 z-50 flex flex-col items-center gap-1">
        <button
          onClick={() => setZoom(Math.min(MAX_ZOOM, parseFloat((zoom + 0.1).toFixed(1))))}
          className="w-9 h-9 bg-gray-900/90 border border-gray-700 hover:border-indigo-500 text-white rounded-xl flex items-center justify-center text-xl transition-colors"
        >
          +
        </button>
        <span className="text-[10px] text-gray-500 w-9 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.max(MIN_ZOOM, parseFloat((zoom - 0.1).toFixed(1))))}
          className="w-9 h-9 bg-gray-900/90 border border-gray-700 hover:border-indigo-500 text-white rounded-xl flex items-center justify-center text-xl transition-colors"
        >
          −
        </button>
      </div>

      {/* Controls hint */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-4 py-2 rounded-full text-[11px] text-gray-500"
        style={{ background: 'rgba(9,9,20,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span>⬆⬇⬅➡ or WASD to move</span>
        <span className="text-gray-700">·</span>
        <span>scroll to zoom</span>
      </div>
    </div>
  )
}