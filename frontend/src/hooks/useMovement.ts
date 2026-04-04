import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'   
import type { Socket } from 'socket.io-client'  
import { useCosmosStore } from '../store/useCosmosStore'

const SPEED = 4
const WORLD_W = 1600
const WORLD_H = 1200

export function useMovement(socketRef: RefObject<Socket | null>) { 
  const keys = useRef<Set<string>>(new Set())
  const { myPosition, setMyPosition } = useCosmosStore()
  const posRef = useRef(myPosition)

  useEffect(() => { posRef.current = myPosition }, [myPosition])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => keys.current.add(e.key)
    const onUp = (e: KeyboardEvent) => keys.current.delete(e.key)

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)

    const loop = setInterval(() => {
      let { x, y } = posRef.current
      const k = keys.current

      if (k.has('ArrowUp')    || k.has('w')) y = Math.max(0, y - SPEED)
      if (k.has('ArrowDown')  || k.has('s')) y = Math.min(WORLD_H, y + SPEED)
      if (k.has('ArrowLeft')  || k.has('a')) x = Math.max(0, x - SPEED)
      if (k.has('ArrowRight') || k.has('d')) x = Math.min(WORLD_W, x + SPEED)

      if (x !== posRef.current.x || y !== posRef.current.y) {
        setMyPosition({ x, y })
        socketRef.current?.emit('user:move', { x, y })
      }
    }, 16)

    return () => {
      clearInterval(loop)
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // ← intentionally empty: setMyPosition & socketRef are stable refs
}