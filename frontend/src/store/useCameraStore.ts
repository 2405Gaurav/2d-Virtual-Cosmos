import { create } from 'zustand'

interface CameraStore {
  offsetX:  number
  offsetY:  number
  zoom:     number
  targetZoom: number
  setCamera: (x: number, y: number, zoom: number) => void
  setTargetZoom: (zoom: number) => void
}

// camera state - keeps track of where we're lookin at on the canvas
export const useCameraStore = create<CameraStore>((set) => ({
  offsetX:  0,
  offsetY:  0,
  zoom:     1,
  targetZoom: 1,
  setCamera: (x, y, zoom) => set({ offsetX: x, offsetY: y, zoom }),
  setTargetZoom: (targetZoom) => set({ targetZoom }),
}))