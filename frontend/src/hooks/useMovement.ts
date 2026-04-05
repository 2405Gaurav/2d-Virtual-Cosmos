import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'   
import type { Socket } from 'socket.io-client'  
import { useCosmosStore } from '../store/useCosmosStore'

// Speed is now units per millisecond (0.3ms * 16ms = ~4.8 units per frame)
const SPEED = 0.3 
const WORLD_W = 1600
const WORLD_H = 1200
const NETWORK_TICK_RATE = 50 // Throttle socket emits to ~20 times per second

export function useMovement(socketRef: RefObject<Socket | null>) { 
  const keys = useRef<Set<string>>(new Set())

  useEffect(() => {
    // toLowerCase() handles CapsLock issues smoothly
    const onDown = (e: KeyboardEvent) => keys.current.add(e.key.toLowerCase())
    const onUp = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase())

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)

    let lastTime = performance.now()
    let lastEmitTime = 0
    let frameId: number

    const loop = (time: number) => {
      frameId = requestAnimationFrame(loop)
      
      const dt = time - lastTime
      lastTime = time
      
      // Prevent massive jumps if the user switches browser tabs and comes back
      if (dt > 100) return

      const { myPosition, setMyPosition } = useCosmosStore.getState()
      let { x, y } = myPosition
      const k = keys.current
      let isMoving = false

      // Frame-rate independent distance calculation
      const moveDist = SPEED * dt

      if (k.has('arrowup')    || k.has('w')) { y = Math.max(0, y - moveDist); isMoving = true }
      if (k.has('arrowdown')  || k.has('s')) { y = Math.min(WORLD_H, y + moveDist); isMoving = true }
      if (k.has('arrowleft')  || k.has('a')) { x = Math.max(0, x - moveDist); isMoving = true }
      if (k.has('arrowright') || k.has('d')) { x = Math.min(WORLD_W, x + moveDist); isMoving = true }

      if (isMoving) {
        // Update local state instantly for perfect smoothness
        setMyPosition({ x, y })

        // Throttle network emissions so we don't choke the server 
        // (which causes jitter/rubberbanding for others)
        if (time - lastEmitTime > NETWORK_TICK_RATE) {
          socketRef.current?.emit('user:move', { x, y })
          lastEmitTime = time
        }
      }
    }

    frameId = requestAnimationFrame((time) => {
      lastTime = time
      loop(time)
    })

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [socketRef])
}