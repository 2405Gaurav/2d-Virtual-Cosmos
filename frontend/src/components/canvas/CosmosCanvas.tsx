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
export const MIN_ZOOM = 0.3
export const MAX_ZOOM = 2.0

export function CosmosCanvas({ username }: { username: string }) {
  const canvasRef  = useRef<HTMLDivElement>(null)
  const appRef     = useRef<PIXI.Application | null>(null)
  const camRef     = useRef({ x: 0, y: 0 })
  const tickerRef  = useRef<PIXI.Ticker | null>(null)
  const linesRef   = useRef<PIXI.Graphics | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // current zoom gets lerped toward targetZoom each frame
  const zoomCurrentRef = useRef(1)

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

      // zoom with scroll wheel - adjusts panOffset so we zoom
      // toward the mouse cursor instead of screen center
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault()
        const zoomFactor = Math.exp(-e.deltaY * 0.002)
        
        const currentTarget = useCameraStore.getState().targetZoom
        const newTarget = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentTarget * zoomFactor))

        // figure out the zoom ratio so we can adjust pan offset
        // this keeps the point under the cursor stationary
        const ratio = newTarget / currentTarget
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        const mx = e.clientX
        const my = e.clientY

        // shift pan so the spot under the mouse dosnt jump around
        panOffsetRef.current.x = (panOffsetRef.current.x - (mx - cx)) * ratio + (mx - cx)
        panOffsetRef.current.y = (panOffsetRef.current.y - (my - cy)) * ratio + (my - cy)

        useCameraStore.getState().setTargetZoom(newTarget)
      }

      // right click or middile click to drag-pan the camera
      const handleMouseDown = (e: MouseEvent) => {
        if (e.button !== 2 && e.button !== 1) return
        e.preventDefault()
        dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY }
        app.canvas.style.cursor = 'grabbing'
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (!dragRef.current.active) return
        const dx = e.clientX - dragRef.current.lastX
        const dy = e.clientY - dragRef.current.lastY
        dragRef.current.lastX = e.clientX
        dragRef.current.lastY = e.clientY
        panOffsetRef.current.x += dx
        panOffsetRef.current.y += dy
      }

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

      // main game loop - runs every frame
      const ticker = new PIXI.Ticker()
      tickerRef.current = ticker

      ticker.add((t) => {
        const { myPosition, nearbyUsers, remoteUsers, myId } = useCosmosStore.getState()

        // zoom interpolation - using a faster lerp factor so it
        // dosent feel sluggish when scrolling in or out
        const targetZoom = useCameraStore.getState().targetZoom
        const zoomLf = 1.0 - Math.exp(-0.025 * t.deltaMS)
        zoomCurrentRef.current += (targetZoom - zoomCurrentRef.current) * zoomLf
        const zoom = zoomCurrentRef.current

        // slowly reset pan offset when player moves so the camera
        // drifts back to center evenutally
        if (myPosition.x !== lastPlayerPosRef.current.x || myPosition.y !== lastPlayerPosRef.current.y) {
          panOffsetRef.current.x *= Math.exp(-0.01 * t.deltaMS) 
          panOffsetRef.current.y *= Math.exp(-0.01 * t.deltaMS)
          lastPlayerPosRef.current.x = myPosition.x
          lastPlayerPosRef.current.y = myPosition.y
        }

        // figure out where the camera should be pointing
        const baseTargetX = window.innerWidth  / 2 - myPosition.x * zoom
        const baseTargetY = window.innerHeight / 2 - myPosition.y * zoom
        const targetX = baseTargetX + panOffsetRef.current.x
        const targetY = baseTargetY + panOffsetRef.current.y

        // camera position lerp - faster value so it keeps up with
        // zoom changes and dosent lag behind causeing weird drift
        const camLf = dragRef.current.active
          ? 1.0 - Math.exp(-0.05 * t.deltaMS)
          : 1.0 - Math.exp(-0.025 * t.deltaMS)
        camRef.current.x += (targetX - camRef.current.x) * camLf
        camRef.current.y += (targetY - camRef.current.y) * camLf

        // apply evrything to the pixi stage
        app.stage.x = camRef.current.x
        app.stage.y = camRef.current.y
        app.stage.scale.set(zoom)

        // sync camera pos with the DOM overlay so UI stuff lines up
        useCameraStore.getState().setCamera(camRef.current.x, camRef.current.y, zoom)

        // draw proximity lines between ppl who are close
        if (linesRef.current && myId) {
          updateProximityLines(linesRef.current, myPosition, nearbyUsers, remoteUsers)
        }
      })

      ticker.start()

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