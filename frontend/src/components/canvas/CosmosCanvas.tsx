import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import { useCosmosStore } from '../../store/useCosmosStore'
import { useCameraStore } from '../../store/useCameraStore'
import { useSocket } from '../../hooks/useSocket'
import { useMovement } from '../../hooks/useMovement'
import { createBackgroundLayer } from './layers/BackgroundLayer'
import { createGridLayer }       from './layers/GridLayer'
import { createZoneLayer }       from './layers/ZoneLayer'
import { createProximityLineLayer, updateProximityLines } from './layers/ProximityLineLayer'

export const WORLD_W = 6200
export const WORLD_H = 1200
const MIN_ZOOM = 0.3
const MAX_ZOOM = 2.0

export function CosmosCanvas({ username }: { username: string }) {
  const canvasRef  = useRef<HTMLDivElement>(null)
  const appRef     = useRef<PIXI.Application | null>(null)
  const camRef     = useRef({ x: 0, y: 0 })
  const tickerRef  = useRef<PIXI.Ticker | null>(null)
  const linesRef   = useRef<PIXI.Graphics | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Zoom: target (set by wheel) and current (lerped each frame)
  const zoomTargetRef  = useRef(1)
  const zoomCurrentRef = useRef(1)

  // Smooth Pan Offset
  const panOffsetRef = useRef({ x: 0, y: 0 })
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 })
  const lastPlayerPosRef = useRef({ x: -1, y: -1 })

  const socketRef = useSocket(username)
  useMovement(socketRef)

  useEffect(() => {
    const app = new PIXI.Application()
    let destroyed = false

    app.init({
      width:      window.innerWidth,
      height:     window.innerHeight,
      background: 0x020818,
      antialias:  true,
      resizeTo:   window,
    }).then(() => {
      if (destroyed) return
      appRef.current = app
      canvasRef.current?.appendChild(app.canvas)

      createBackgroundLayer(app.stage, WORLD_W, WORLD_H)
      createGridLayer(app.stage, WORLD_W, WORLD_H)
      createZoneLayer(app.stage)
      linesRef.current = createProximityLineLayer(app.stage)

      // ── Wheel: Trackpad & Mouse smooth scaling ────────────
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault()
        // Math.exp gives a perfectly smooth scale curve for both scroll wheels and trackpads
        const zoomFactor = Math.exp(-e.deltaY * 0.002)
        zoomTargetRef.current = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, zoomTargetRef.current * zoomFactor)
        )
      }

      // ── Mouse drag pan ────────────────────────────────────
      const handleMouseDown = (e: MouseEvent) => {
        // Only trigger on Right (2) or Middle (1) click
        if (e.button !== 2 && e.button !== 1) return
        e.preventDefault()
        
        dragRef.current = {
          active: true,
          lastX:  e.clientX,
          lastY:  e.clientY,
        }
        app.canvas.style.cursor = 'grabbing'
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (!dragRef.current.active) return
        
        // Calculate mouse delta
        const dx = e.clientX - dragRef.current.lastX
        const dy = e.clientY - dragRef.current.lastY
        
        // Update last pos
        dragRef.current.lastX = e.clientX
        dragRef.current.lastY = e.clientY

        // Add to our camera offset
        panOffsetRef.current.x += dx
        panOffsetRef.current.y += dy
      }

      // ── ESLint Fix: Removed the unused `_e` argument ────────
      const handleMouseUp = () => {
        if (!dragRef.current.active) return
        dragRef.current.active = false
        app.canvas.style.cursor = 'default'
      }

      const handleContextMenu = (e: Event) => e.preventDefault()

      app.canvas.addEventListener('wheel',        handleWheel,       { passive: false })
      app.canvas.addEventListener('mousedown',    handleMouseDown)
      window.addEventListener('mousemove',        handleMouseMove)
      window.addEventListener('mouseup',          handleMouseUp)
      app.canvas.addEventListener('contextmenu',  handleContextMenu)

      // ── Ticker ────────────────────────────────────────────
      const ticker = new PIXI.Ticker()
      tickerRef.current = ticker

      ticker.add((t) => {
        const { myPosition, nearbyUsers, remoteUsers, myId } = useCosmosStore.getState()

        // 1. Smooth Zoom Lerp
        const zoomLf = 1.0 - Math.exp(-0.008 * t.deltaMS)
        zoomCurrentRef.current += (zoomTargetRef.current - zoomCurrentRef.current) * zoomLf
        const zoom = zoomCurrentRef.current

        // 2. Auto-Recenter Pan Offset if the player moves using WASD
        if (myPosition.x !== lastPlayerPosRef.current.x || myPosition.y !== lastPlayerPosRef.current.y) {
          // Player is moving! Decay the pan offset back to zero to snap back to the player
          panOffsetRef.current.x *= Math.exp(-0.01 * t.deltaMS) // Smoothly slide back
          panOffsetRef.current.y *= Math.exp(-0.01 * t.deltaMS)
          
          lastPlayerPosRef.current.x = myPosition.x
          lastPlayerPosRef.current.y = myPosition.y
        }

        // 3. Base Camera Center (focused on player)
        const baseTargetX = window.innerWidth  / 2 - myPosition.x * zoom
        const baseTargetY = window.innerHeight / 2 - myPosition.y * zoom

        // 4. Final Target = Player Center + Mouse Pan Drag Offset
        const targetX = baseTargetX + panOffsetRef.current.x
        const targetY = baseTargetY + panOffsetRef.current.y

        // 5. Lerp camera towards target
        // Make the camera snappier when actively dragging, smoother when just following
        const camLf = dragRef.current.active 
          ? 1.0 - Math.exp(-0.03 * t.deltaMS) 
          : 1.0 - Math.exp(-0.005 * t.deltaMS)

        camRef.current.x += (targetX - camRef.current.x) * camLf
        camRef.current.y += (targetY - camRef.current.y) * camLf

        // 6. Apply to Pixi Stage
        app.stage.x = camRef.current.x
        app.stage.y = camRef.current.y
        app.stage.scale.set(zoom)

        // 7. Sync with DOM Layer
        useCameraStore.getState().setCamera(camRef.current.x, camRef.current.y, zoom)

        // 8. Lines
        if (linesRef.current && myId) {
          updateProximityLines(linesRef.current, myPosition, nearbyUsers, remoteUsers)
        }
      })

      ticker.start()

      // Store cleanup fns
      const canvas = app.canvas;
      cleanupRef.current = () => {
        canvas.removeEventListener('wheel',       handleWheel)
        canvas.removeEventListener('mousedown',   handleMouseDown)
        window.removeEventListener('mousemove',   handleMouseMove)
        window.removeEventListener('mouseup',     handleMouseUp)
        canvas.removeEventListener('contextmenu', handleContextMenu)
      }
    })

    return () => {
      destroyed = true;
      cleanupRef.current?.() 
      tickerRef.current?.stop()
      tickerRef.current?.destroy()
      if (appRef.current) { appRef.current.destroy(true); appRef.current = null }
    }
  }, [])

  return <div ref={canvasRef} className="absolute inset-0" />
}