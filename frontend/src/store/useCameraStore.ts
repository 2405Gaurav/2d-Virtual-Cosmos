import { create } from 'zustand'

interface CameraStore {
  offsetX: number   // stage.x  (world→screen: screenX = worldX + offsetX)
  offsetY: number   // stage.y
  setCamera: (x: number, y: number) => void
}

export const useCameraStore = create<CameraStore>((set) => ({
  offsetX: 0,
  offsetY: 0,
  setCamera: (x, y) => set({ offsetX: x, offsetY: y }),
}))