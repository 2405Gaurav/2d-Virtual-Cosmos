import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
// PixiJS = high-performance 2D rendering engine (built on WebGL)
import { useCosmosStore } from '../../store/useCosmosStore'
import { useSocket } from '../../hooks/useSocket'
import { useMovement } from '../../hooks/useMovement'

const PROXIMITY_RADIUS = 150
const COLORS = [0x6366f1, 0xec4899, 0x14b8a6, 0xf59e0b, 0x10b981, 0xef4444]

export function CosmosCanvas({ username }: { username: string }) {
  const canvasRef = useRef<HTMLDivElement>(null)//The useRef hook is a built-in React tool that allows 
  // you to persist values across renders without triggering a re-render when those values change. 
  // It returns a mutable ref object with a single property called .current, 
  // which can hold any value (e.g., a DOM element, a timer ID, or a previous state)
  const appRef = useRef<PIXI.Application | null>(null) 
  //To store the actual Pixi Application instance (PIXI.Application)



  // useref --> acts as a "box" for values that don't affect the UI but need to be remembered

  const spritesRef = useRef<Map<string, PIXI.Container>>(new Map())
    //This ref holds a Map that associates user IDs (strings) with their corresponding PIXI.Container instances.
  const socketRef = useSocket(username)

  useMovement(socketRef)

  const { myPosition, myId, remoteUsers, nearbyUsers } = useCosmosStore()

useEffect(() => {
  const app = new PIXI.Application()
  let destroyed = false  // ← track if cleanup ran before init finished

  app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    background: 0x0f0f1a,
    antialias: true,
    resizeTo: window,
  }).then(() => {
    if (destroyed) return  // ← bail out if already unmounted

    appRef.current = app
    canvasRef.current?.appendChild(app.canvas)// as the user comes we append it to the canvasRef div

    // Starfield
    const stars = new PIXI.Graphics()
    for (let i = 0; i < 200; i++) {
      stars.circle(Math.random() * 1600, Math.random() * 1200, Math.random() * 1.5)
      stars.fill({ color: 0xffffff, alpha: Math.random() * 0.8 + 0.2 })
    }
    app.stage.addChild(stars)
  })

  return () => {
    destroyed = true                    // ← signal init to bail
    if (appRef.current) {               // ← only destroy if init completed
      appRef.current.destroy(true)
      appRef.current = null
    }
  }
}, [])

  // Draw / update users
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

    allUsers.forEach((user) => {
      const isNearby = nearbyUsers.includes(user.id)
      const isMe = user.id === myId

      if (!spritesRef.current.has(user.id)) {
        const container = new PIXI.Container()

        // Proximity ring — v8 Graphics API
        const ring = new PIXI.Graphics()
        ring.label = 'ring'
        ring.circle(0, 0, PROXIMITY_RADIUS)
        ring.stroke({ color: 0x6366f1, alpha: 0.3, width: 1.5 })
        container.addChild(ring)

        // Avatar circle
        const circle = new PIXI.Graphics()
        circle.circle(0, 0, 20)
        circle.fill({ color: user.color })
        container.addChild(circle)

        // Name label
        const label = new PIXI.Text({
          text: user.username,
          style: { fontSize: 12, fill: '#ffffff' },
        })
        label.anchor.set(0.5, 0)
        label.position.set(0, 26)
        container.addChild(label)

        app.stage.addChild(container)
        spritesRef.current.set(user.id, container)
      }

      const container = spritesRef.current.get(user.id)!
      container.position.set(user.x, user.y)

      // Camera follow local user
      if (isMe) {
        app.stage.pivot.set(
          user.x - window.innerWidth / 2,
          user.y - window.innerHeight / 2
        )
      }

      // Update ring highlight
      const ring = container.children.find(c => (c as PIXI.Graphics).label === 'ring') as PIXI.Graphics
      if (ring) {
        ring.alpha = isNearby ? 0.6 : 0.2
        ring.tint = isNearby ? 0x10b981 : 0xffffff
      }
    })

    // Cleanup disconnected users
    spritesRef.current.forEach((sprite, id) => {
      if (!allUsers.find(u => u.id === id)) {
        appRef.current?.stage.removeChild(sprite)
        spritesRef.current.delete(id)
      }
    })
  }, [myPosition, remoteUsers, nearbyUsers, myId, username])

  return <div ref={canvasRef} className="absolute inset-0" />
}