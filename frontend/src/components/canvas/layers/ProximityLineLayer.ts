import * as PIXI from 'pixi.js'

export function createProximityLineLayer(stage: PIXI.Container): PIXI.Graphics {
  const lines = new PIXI.Graphics()
  stage.addChild(lines)
  return lines
}

export function updateProximityLines(
  lines: PIXI.Graphics,
  myPosition: { x: number; y: number },
  nearbyUsers: string[],
  remoteUsers: Map<string, { x: number; y: number }>,
) {
  lines.clear()

  nearbyUsers.forEach(otherId => {
    const other = remoteUsers.get(otherId)
    if (!other) return

    const dist  = Math.hypot(other.x - myPosition.x, other.y - myPosition.y)
    const alpha = Math.max(0, 1 - dist / 150) * 0.5

    lines.moveTo(myPosition.x, myPosition.y)
    lines.lineTo(other.x, other.y)
    lines.stroke({ color: 0x10b981, width: 1.5, alpha })
  })
}