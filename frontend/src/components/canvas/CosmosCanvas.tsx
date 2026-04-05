import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import { useCosmosStore } from '../../store/useCosmosStore'
import { useCameraStore } from '../../store/useCameraStore'
import { useSocket } from '../../hooks/useSocket'
import { useMovement } from '../../hooks/useMovement'

const WORLD_W = 1600
const WORLD_H = 1200

export function CosmosCanvas({ username }: { username: string }) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const appRef    = useRef<PIXI.Application | null>(null)
  const camRef    = useRef({ x: 0, y: 0 })
  const tickerRef = useRef<PIXI.Ticker | null>(null)
  const linesRef  = useRef<PIXI.Graphics | null>(null)

  const socketRef = useSocket(username)
  useMovement(socketRef)

  useEffect(() => {
    const app = new PIXI.Application()
    let destroyed = false

    app.init({
      width:      window.innerWidth,
      height:     window.innerHeight,
      background: 0x050510,
      antialias:  true,
      resizeTo:   window,
    }).then(() => {
      if (destroyed) return
      appRef.current = app
      canvasRef.current?.appendChild(app.canvas)

      // ── Grid ──────────────────────────────────────────────
      const grid = new PIXI.Graphics()
      const GRID = 80
      for (let x = 0; x <= WORLD_W; x += GRID) { grid.moveTo(x, 0); grid.lineTo(x, WORLD_H) }
      for (let y = 0; y <= WORLD_H; y += GRID) { grid.moveTo(0, y); grid.lineTo(WORLD_W, y) }
      grid.stroke({ color: 0x1e2040, width: 1, alpha: 0.6 })
      for (let x = 0; x <= WORLD_W; x += GRID)
        for (let y = 0; y <= WORLD_H; y += GRID) {
          grid.circle(x, y, 1.2)
          grid.fill({ color: 0x3a3f6e, alpha: 0.5 })
        }
      app.stage.addChild(grid)

      // ── Stars ─────────────────────────────────────────────
      const stars = new PIXI.Graphics()
      for (let i = 0; i < 280; i++) {
        stars.circle(Math.random() * WORLD_W, Math.random() * WORLD_H, Math.random() * 1.6 + 0.2)
        stars.fill({ color: 0xffffff, alpha: Math.random() * 0.7 + 0.15 })
      }
      app.stage.addChild(stars)

      // Nebula blobs
      for (const [cx, cy, col] of [
        [400, 300, 0x3730a3], [1100, 700, 0x701a75], [800, 900, 0x0f4c81],
      ] as [number, number, number][]) {
        const blob = new PIXI.Graphics()
        blob.circle(cx, cy, 200)
        blob.fill({ color: col, alpha: 0.06 })
        app.stage.addChild(blob)
      }

      // ── Proximity lines ────────────────────────────────────
      const lines = new PIXI.Graphics()
      app.stage.addChild(lines)
      linesRef.current = lines

      // ── Ticker ────────────────────────────────────────────
      const ticker = new PIXI.Ticker()
      tickerRef.current = ticker

      // We add `t` (the ticker instance) to get access to deltaMS
      ticker.add((t) => {
        const { myPosition, nearbyUsers, remoteUsers, myId } = useCosmosStore.getState()

        // Camera: smoothly follow local user 
        const targetX = window.innerWidth  / 2 - myPosition.x
        const targetY = window.innerHeight / 2 - myPosition.y

        // FRAME-RATE INDEPENDENT LERP 
        const lerpFactor = 1.0 - Math.exp(-0.005 * t.deltaMS)

        camRef.current.x += (targetX - camRef.current.x) * lerpFactor
        camRef.current.y += (targetY - camRef.current.y) * lerpFactor

        app.stage.x = camRef.current.x
        app.stage.y = camRef.current.y

        useCameraStore.getState().setCamera(camRef.current.x, camRef.current.y)

        // ── Proximity lines
        const l = linesRef.current
        if (!l || !myId) return
        l.clear()

        nearbyUsers.forEach(otherId => {
          const other = remoteUsers.get(otherId)
          if (!other) return
          const dist  = Math.hypot(other.x - myPosition.x, other.y - myPosition.y)
          const alpha = Math.max(0, 1 - dist / 150) * 0.4
          l.moveTo(myPosition.x, myPosition.y)
          l.lineTo(other.x, other.y)
          l.stroke({ color: 0x10b981, width: 1.5, alpha })
        })
      })

      ticker.start()
    })

    return () => {
      destroyed = true
      tickerRef.current?.stop()
      tickerRef.current?.destroy()
      if (appRef.current) { appRef.current.destroy(true); appRef.current = null }
    }
  }, [])

  return <div ref={canvasRef} className="absolute inset-0" />
}