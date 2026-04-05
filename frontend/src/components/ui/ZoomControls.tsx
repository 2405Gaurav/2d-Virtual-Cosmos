import { useCameraStore } from '../../store/useCameraStore'
import { MIN_ZOOM, MAX_ZOOM } from '../canvas/CosmosCanvas' 

export function ZoomControls() {
  // We read from the store so the UI updates when we use the mouse wheel!
  const targetZoom = useCameraStore(s => s.targetZoom)
  const setTargetZoom = useCameraStore(s => s.setTargetZoom)

  const handleZoomIn = () => {
    setTargetZoom(Math.min(MAX_ZOOM, targetZoom * 1.3)) // Jump by 30%
  }

  const handleZoomOut = () => {
    setTargetZoom(Math.max(MIN_ZOOM, targetZoom / 1.3))
  }

  // Calculate percentage for display (e.g., 1.0 -> 100%)
  const zoomPercent = Math.round(targetZoom * 100)

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl overflow-hidden shadow-xl z-50">
      
      {/* Zoom In (+) */}
      <button 
        onClick={handleZoomIn}
        className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
        title="Zoom In"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {/* Percentage Display */}
      <div className="w-10 py-1 text-center text-[10px] font-bold text-gray-400 border-y border-gray-700/50 bg-gray-950/50 cursor-default select-none">
        {zoomPercent}%
      </div>

      {/* Zoom Out (-) */}
      <button 
        onClick={handleZoomOut}
        className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
        title="Zoom Out"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

    </div>
  )
}