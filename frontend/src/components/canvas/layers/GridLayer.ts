import * as PIXI from 'pixi.js'

export function createGridLayer(stage: PIXI.Container, worldW: number, worldH: number) {
  const GRID = 120
  const grid = new PIXI.Graphics()

  // subtile grid lines
  for (let x = 0; x <= worldW; x += GRID) {
    grid.moveTo(x, 0)
    grid.lineTo(x, worldH)
  }
  for (let y = 0; y <= worldH; y += GRID) {
    grid.moveTo(0, y)
    grid.lineTo(worldW, y)
  }
  grid.stroke({ color: 0x1e3a5f, width: 0.5, alpha: 0.3 })

  // litle dots at intersections
  for (let x = 0; x <= worldW; x += GRID) {
    for (let y = 0; y <= worldH; y += GRID) {
      grid.circle(x, y, 1)
      grid.fill({ color: 0x3b82f6, alpha: 0.2 })
    }
  }

  stage.addChild(grid)
}