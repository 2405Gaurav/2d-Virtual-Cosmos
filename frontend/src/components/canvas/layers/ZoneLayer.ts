import * as PIXI from 'pixi.js'

export interface Zone {
  id:    string
  label: string
  emoji: string
  x:     number
  y:     number
  w:     number
  h:     number
  color: number   // hex number e.g. 0x6366f1
}

export const ZONES: Zone[] = [
  { id: 'fullstack', label: 'Full Stack Developers', emoji: '💻', x: 300,  y: 200, w: 1400, h: 700, color: 0x6366f1 },
  { id: 'company',   label: 'TuteDude HQ',           emoji: '🚀', x: 2200, y: 200, w: 1400, h: 700, color: 0x8b5cf6 },
  { id: 'uiux',      label: 'UI/UX Design Lab',      emoji: '🎨', x: 4100, y: 200, w: 1400, h: 700, color: 0xec4899 },
]

export function createZoneLayer(stage: PIXI.Container) {
  const container = new PIXI.Container()

  for (const zone of ZONES) {
    // ── Zone floor fill ─────────────────────────────────────
    const floor = new PIXI.Graphics()
    floor.roundRect(zone.x, zone.y, zone.w, zone.h, 24)
    floor.fill({ color: zone.color, alpha: 0.06 })

    // ── Zone border — dashed-look via thin solid line ────────
    const border = new PIXI.Graphics()
    border.roundRect(zone.x, zone.y, zone.w, zone.h, 24)
    border.stroke({ color: zone.color, width: 1.5, alpha: 0.35 })

    // ── Corner accents (top-left, top-right, bottom-left, bottom-right) ──
    const CORNER = 20
    const corners = new PIXI.Graphics()
    const cx = zone.x, cy = zone.y, cw = zone.w, ch = zone.h

    // TL
    corners.moveTo(cx, cy + CORNER).lineTo(cx, cy).lineTo(cx + CORNER, cy)
    // TR
    corners.moveTo(cx + cw - CORNER, cy).lineTo(cx + cw, cy).lineTo(cx + cw, cy + CORNER)
    // BL
    corners.moveTo(cx, cy + ch - CORNER).lineTo(cx, cy + ch).lineTo(cx + CORNER, cy + ch)
    // BR
    corners.moveTo(cx + cw - CORNER, cy + ch).lineTo(cx + cw, cy + ch).lineTo(cx + cw, cy + ch - CORNER)
    corners.stroke({ color: zone.color, width: 2.5, alpha: 0.9 })

    // ── Zone label (emoji + name) ────────────────────────────
    const label = new PIXI.Text({
      text: `${zone.emoji}  ${zone.label}`,
      style: new PIXI.TextStyle({
        fontSize:   15,
        fontWeight: '600',
        fill:       zone.color,
        fontFamily: 'system-ui, sans-serif',
        letterSpacing: 1.5,
      }),
    })
    label.alpha = 0.85
    label.position.set(zone.x + 16, zone.y + 14)

    container.addChild(floor, border, corners, label)
  }

  stage.addChild(container)
  return container
}