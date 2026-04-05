import { create } from 'zustand'

interface CameraStore {
  offsetX:  number
  offsetY:  number
  zoom:     number
  setCamera: (x: number, y: number, zoom: number) => void
  setZoom:   (zoom: number) => void
}

export const useCameraStore = create<CameraStore>((set) => ({
  offsetX:  0,
  offsetY:  0,
  zoom:     1,
  setCamera: (x, y, zoom) => set({ offsetX: x, offsetY: y, zoom }),
  setZoom:   (zoom)       => set({ zoom }),
}))