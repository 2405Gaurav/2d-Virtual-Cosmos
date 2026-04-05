import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import { useCosmosStore } from '../../store/useCosmosStore'
import { useSocket } from '../../hooks/useSocket'
import { useMovement } from '../../hooks/useMovement'

const PROXIMITY_RADIUS = 150
const WORLD_W = 1600
const WORLD_H = 1200

// Hex palette per user slot
const COLORS = [0x6366f1, 0xec4899, 0x14b8a6, 0xf59e0b, 0x10b981, 0xef4444]

// Lerp helper for smooth camera / remote position
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// Each remote user gets a lerped display position
interface DisplayUser {
  displayX: number
  displayY: number
}

export function CosmosCanvas({ username }: { username: string }) {
  const canvasRef   = useRef<HTMLDivElement>(null)
  const appRef      = useRef<PIXI.Application | null>(null)
  const spritesRef  = useRef<Map<string, PIXI.Container>>(new Map())
  const displayPos  = useRef<Map<string, DisplayUser>>(new Map())
  const camRef      = useRef({ x: 0, y: 0 })          // smoothed camera pivot
  const linesRef    = useRef<PIXI.Graphics | null>(null) // connection lines layer
  const tickerRef   = useRef<PIXI.Ticker | null>(null)

  const socketRef = useSocket(username)
  useMovement(socketRef)

  const { myPosition, myId, remoteUsers, nearbyUsers } = useCosmosStore()

  // ─── Init Pixi ────────────────────────────────────────────────
  useEffect(() => {
    const app = new PIXI.Application()
    let destroyed = false

    app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      background: 0x050510,
      antialias: true,
      resizeTo: window,
    }).then(() => {
      if (destroyed) return
      appRef.current = app
      canvasRef.current?.appendChild(app.canvas)

      // ── World grid ──────────────────────────────────────────
      const grid = new PIXI.Graphics()
      const GRID = 80
      for (let x = 0; x <= WORLD_W; x += GRID) {
        grid.moveTo(x, 0)
        grid.lineTo(x, WORLD_H)
      }
      for (let y = 0; y <= WORLD_H; y += GRID) {
        grid.moveTo(0, y)
        grid.lineTo(WORLD_W, y)
      }
      grid.stroke({ color: 0x1e2040, width: 1, alpha: 0.6 })

      // Dot at each grid intersection
      for (let x = 0; x <= WORLD_W; x += GRID) {
        for (let y = 0; y <= WORLD_H; y += GRID) {
          grid.circle(x, y, 1.2)
          grid.fill({ color: 0x3a3f6e, alpha: 0.5 })
        }
      }
      app.stage.addChild(grid)

      // ── Stars ───────────────────────────────────────────────
      const stars = new PIXI.Graphics()
      for (let i = 0; i < 280; i++) {
        const r = Math.random() * 1.6 + 0.2
        const alpha = Math.random() * 0.7 + 0.15
        stars.circle(Math.random() * WORLD_W, Math.random() * WORLD_H, r)
        stars.fill({ color: 0xffffff, alpha })
      }
      app.stage.addChild(stars)

      // Subtle nebula blobs
      for (const [cx, cy, col] of [
        [400, 300, 0x3730a3],
        [1100, 700, 0x701a75],
        [800, 900, 0x0f4c81],
      ] as [number, number, number][]) {
        const blob = new PIXI.Graphics()
        blob.circle(cx, cy, 200)
        blob.fill({ color: col, alpha: 0.06 })
        app.stage.addChild(blob)
      }

      // ── Connection lines layer (drawn on top of grid, under avatars) ──
      const lines = new PIXI.Graphics()
      lines.label = 'lines'
      app.stage.addChild(lines)
      linesRef.current = lines

      // ── Ticker for smooth lerp ───────────────────────────────
      const ticker = new PIXI.Ticker()
      tickerRef.current = ticker

      ticker.add(() => {
        const stage = app.stage
        if (!stage) return

        // Smooth camera toward local user
        const target = displayPos.current.get('__me') ?? { displayX: WORLD_W / 2, displayY: WORLD_H / 2 }
        camRef.current.x = lerp(camRef.current.x, target.displayX - window.innerWidth / 2, 0.08)
        camRef.current.y = lerp(camRef.current.y, target.displayY - window.innerHeight / 2, 0.08)
        stage.pivot.set(camRef.current.x, camRef.current.y)

        // Lerp remote user display positions
        displayPos.current.forEach((dp, id) => {
          if (id === '__me') return
          const remote = spritesRef.current.get(id)
          if (!remote) return

          const ru = Array.from(useCosmosStore.getState().remoteUsers.values()).find(u => u.id === id)
          if (!ru) return

          dp.displayX = lerp(dp.displayX, ru.x, 0.12)
          dp.displayY = lerp(dp.displayY, ru.y, 0.12)
          remote.position.set(dp.displayX, dp.displayY)
        })

        // Animate proximity rings (pulse)
        const t = ticker.lastTime / 1000
        spritesRef.current.forEach((container, id) => {
          const ring = container.children.find(c => (c as PIXI.Graphics).label === 'ring') as PIXI.Graphics | undefined
          if (!ring) return
          const nearby = useCosmosStore.getState().nearbyUsers.includes(id)
          if (nearby) {
            ring.alpha = 0.35 + Math.sin(t * 3) * 0.15
          }
        })

        // Redraw connection lines
        const lines = linesRef.current
        if (!lines) return
        lines.clear()
        const state = useCosmosStore.getState()
        const mePos = displayPos.current.get('__me')
        if (!mePos || !state.myId) return

        state.nearbyUsers.forEach(otherId => {
          const otherDp = displayPos.current.get(otherId)
          if (!otherDp) return
          const dist = Math.hypot(otherDp.displayX - mePos.displayX, otherDp.displayY - mePos.displayY)
          const alpha = Math.max(0, 1 - dist / PROXIMITY_RADIUS) * 0.4
          lines.moveTo(mePos.displayX, mePos.displayY)
          lines.lineTo(otherDp.displayX, otherDp.displayY)
          lines.stroke({ color: 0x10b981, width: 1.5, alpha })
        })
      })
      ticker.start()
    })

    return () => {
      destroyed = true
      tickerRef.current?.stop()
      tickerRef.current?.destroy()
      if (appRef.current) {
        appRef.current.destroy(true)
        appRef.current = null
      }
    }
  }, [])

  // ─── Create / update sprites ──────────────────────────────────
  useEffect(() => {
    const app = appRef.current
    if (!app || !myId) return

    const allUsers = [
      { id: myId, username, ...myPosition, color: COLORS[0] },
      ...Array.from(remoteUsers.values()).map((u, i) => ({
        ...u,
        color: COLORS[(i + 1) % COLORS.length],
      })),
    ]

    // Update local user display pos (camera target)
    displayPos.current.set('__me', { displayX: myPosition.x, displayY: myPosition.y })

    allUsers.forEach((user) => {
      const isNearby = nearbyUsers.includes(user.id)
      const isMe = user.id === myId

      // ── Create sprite if first time ────────────────────────
      if (!spritesRef.current.has(user.id)) {
        // Init remote lerp position at actual position
        if (!isMe) {
          displayPos.current.set(user.id, { displayX: user.x, displayY: user.y })
        }

        const container = new PIXI.Container()

        // Outer glow ring (proximity zone)
        const ring = new PIXI.Graphics()
        ring.label = 'ring'
        ring.circle(0, 0, PROXIMITY_RADIUS)
        ring.stroke({ color: 0x6366f1, alpha: 0.25, width: 1.5 })
        ring.fill({ color: 0x6366f1, alpha: 0.03 })
        container.addChild(ring)

        // Soft glow behind avatar
        const glow = new PIXI.Graphics()
        glow.circle(0, 0, 30)
        glow.fill({ color: user.color, alpha: 0.15 })
        container.addChild(glow)

        // Avatar body
        const circle = new PIXI.Graphics()
        circle.circle(0, 0, 18)
        circle.fill({ color: user.color })
        // Inner highlight
        circle.circle(-5, -5, 7)
        circle.fill({ color: 0xffffff, alpha: 0.18 })
        container.addChild(circle)

        // Border ring on avatar
        const border = new PIXI.Graphics()
        border.circle(0, 0, 18)
        border.stroke({ color: 0xffffff, alpha: 0.25, width: 1.5 })
        container.addChild(border)

        // Initial letter inside avatar
        const initial = new PIXI.Text({
          text: user.username.charAt(0).toUpperCase(),
          style: {
            fontSize: 13,
            fill: '#ffffff',
            fontWeight: 'bold',
            fontFamily: 'system-ui',
          },
        })
        initial.anchor.set(0.5)
        initial.position.set(0, 0)
        container.addChild(initial)

        // Name pill below avatar
        const pillBg = new PIXI.Graphics()
        pillBg.label = 'pill'
        const pillW = user.username.length * 7.5 + 16
        pillBg.roundRect(-pillW / 2, 26, pillW, 20, 10)
        pillBg.fill({ color: 0x0d0d1f, alpha: 0.75 })
        pillBg.stroke({ color: user.color, alpha: 0.5, width: 1 })
        container.addChild(pillBg)

        const label = new PIXI.Text({
          text: user.username,
          style: {
            fontSize: 11,
            fill: '#e2e8f0',
            fontFamily: 'system-ui',
          },
        })
        label.anchor.set(0.5, 0)
        label.position.set(0, 29)
        container.addChild(label)

        // "You" indicator for local user
        if (isMe) {
          const youText = new PIXI.Text({
            text: '● YOU',
            style: { fontSize: 9, fill: '#6366f1', fontFamily: 'system-ui' },
          })
          youText.anchor.set(0.5, 0)
          youText.position.set(0, 50)
          container.addChild(youText)
        }

        app.stage.addChild(container)
        spritesRef.current.set(user.id, container)
      }

      // ── Update positions ───────────────────────────────────
      const container = spritesRef.current.get(user.id)!

      if (isMe) {
        // Local user moves instantly
        container.position.set(user.x, user.y)
      }
      // Remote users are lerped inside the ticker

      // ── Ring state ─────────────────────────────────────────
      const ring = container.children.find(c => (c as PIXI.Graphics).label === 'ring') as PIXI.Graphics
      if (ring) {
        if (isNearby) {
          ring.tint = 0x10b981
          ring.alpha = 0.5
        } else {
          ring.tint = 0xffffff
          ring.alpha = 0.2
        }
      }

      // Scale pulse on nearby connect
      const targetScale = isNearby ? 1.08 : 1.0
      container.scale.set(
        lerp(container.scale.x, targetScale, 0.1)
      )
    })

    // ── Remove disconnected users ────────────────────────────
    spritesRef.current.forEach((sprite, id) => {
      if (!allUsers.find(u => u.id === id)) {
        appRef.current?.stage.removeChild(sprite)
        spritesRef.current.delete(id)
        displayPos.current.delete(id)
      }
    })
  }, [myPosition, remoteUsers, nearbyUsers, myId, username])

  return <div ref={canvasRef} className="absolute inset-0" />
}