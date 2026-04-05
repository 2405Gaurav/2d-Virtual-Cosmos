import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'   
import type { Socket } from 'socket.io-client'  
import { useCosmosStore } from '../store/useCosmosStore'

const SPEED = 0.3 // units per ms, works out to about 4-5px per frame
const WORLD_W = 6200
const WORLD_H = 1200
const NETWORK_TICK_RATE = 50

export function useMovement(socketRef: RefObject<Socket | null>) { 
  const keys = useRef<Set<string>>(new Set())

  useEffect(() => {
    // dont capture keys when user is typing in a text feild, otherwise
    // pressing wasd in the chatbox moves the charcter lol
    const isTypingInInput = () => {
      const el = document.activeElement
      if (!el) return false
      const tag = el.tagName.toLowerCase()
      return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable
    }

    const onDown = (e: KeyboardEvent) => {
      if (isTypingInInput()) return
      keys.current.add(e.key.toLowerCase())
    }
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
      
      // skip if dt is huge, probaly user tabbed out
      if (dt > 100) return

      const { myPosition, setMyPosition } = useCosmosStore.getState()
      let { x, y } = myPosition
      const k = keys.current
      let isMoving = false

      // framerate independant movement
      const moveDist = SPEED * dt

      if (k.has('arrowup')    || k.has('w')) { y = Math.max(0, y - moveDist); isMoving = true }
      if (k.has('arrowdown')  || k.has('s')) { y = Math.min(WORLD_H, y + moveDist); isMoving = true }
      if (k.has('arrowleft')  || k.has('a')) { x = Math.max(0, x - moveDist); isMoving = true }
      if (k.has('arrowright') || k.has('d')) { x = Math.min(WORLD_W, x + moveDist); isMoving = true }

      if (isMoving) {
        setMyPosition({ x, y })

        // dont spam the server, throttle emits
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