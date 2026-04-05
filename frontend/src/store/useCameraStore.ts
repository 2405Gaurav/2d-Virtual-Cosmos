// src/store/useCameraStore.ts
import { create } from 'zustand'

interface CameraStore {
  offsetX:  number
  offsetY:  number
  zoom:     number         // Current actual zoom level on screen
  targetZoom: number       // The desired zoom level (updated by wheel or buttons)
  setCamera: (x: number, y: number, zoom: number) => void
  setTargetZoom: (zoom: number) => void
}

export const useCameraStore = create<CameraStore>((set) => ({
  offsetX:  0,
  offsetY:  0,
  zoom:     1,
  targetZoom: 1, // Start at 1x
  setCamera: (x, y, zoom) => set({ offsetX: x, offsetY: y, zoom }),
  setTargetZoom: (targetZoom) => set({ targetZoom }),
}))