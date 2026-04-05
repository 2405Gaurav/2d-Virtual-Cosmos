import * as PIXI from 'pixi.js'

export function createBackgroundLayer(stage: PIXI.Container, worldW: number, worldH: number) {
  // Deep space base — solid color set on app background, but add a gradient overlay
  const bg = new PIXI.Graphics()
  bg.rect(0, 0, worldW, worldH)
  bg.fill({ color: 0x020818 })
  stage.addChild(bg)

  // ── Star field — three layers of depth ──────────────────
  const starLayer = new PIXI.Graphics()

  // Tiny distant stars
  for (let i = 0; i < 800; i++) {
    const r = Math.random() * 0.8 + 0.1
    starLayer.circle(Math.random() * worldW, Math.random() * worldH, r)
    starLayer.fill({ color: 0xffffff, alpha: Math.random() * 0.4 + 0.1 })
  }

  // Medium stars
  for (let i = 0; i < 300; i++) {
    const r = Math.random() * 1.4 + 0.4
    starLayer.circle(Math.random() * worldW, Math.random() * worldH, r)
    starLayer.fill({ color: 0xcdd6f4, alpha: Math.random() * 0.6 + 0.2 })
  }

  // Bright foreground stars with a soft glow
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * worldW
    const y = Math.random() * worldH
    const r = Math.random() * 2 + 1

    // Glow halo
    starLayer.circle(x, y, r * 4)
    starLayer.fill({ color: 0x89b4fa, alpha: 0.06 })

    // Core
    starLayer.circle(x, y, r)
    starLayer.fill({ color: 0xffffff, alpha: 0.95 })
  }

  stage.addChild(starLayer)

  // ── Nebula clouds ────────────────────────────────────────
  const nebula = new PIXI.Graphics()

  const nebulaData: [number, number, number, number, number][] = [
    // cx,   cy,   radius, color,      alpha
    [1000,  400,   500,   0x6366f1,   0.04],
    [3000,  800,   700,   0x8b5cf6,   0.03],
    [5500,  300,   600,   0x0ea5e9,   0.04],
    [7000,  900,   800,   0xec4899,   0.03],
    [9500,  500,   600,   0x6366f1,   0.035],
    [12000, 700,   700,   0x14b8a6,   0.03],
    [14000, 300,   500,   0x8b5cf6,   0.04],
    [16000, 800,   650,   0xf59e0b,   0.025],
    [18000, 400,   600,   0xec4899,   0.03],
  ]

  for (const [cx, cy, radius, color, alpha] of nebulaData) {
    // Outer soft bloom
    nebula.circle(cx, cy, radius)
    nebula.fill({ color, alpha: alpha * 0.5 })

    // Inner denser core
    nebula.circle(cx, cy, radius * 0.5)
    nebula.fill({ color, alpha })

    // Offset secondary blob for organic feel
    nebula.circle(cx + radius * 0.3, cy - radius * 0.2, radius * 0.6)
    nebula.fill({ color, alpha: alpha * 0.7 })
  }

  stage.addChild(nebula)
}