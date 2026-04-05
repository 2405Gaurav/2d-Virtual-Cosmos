import { useState } from 'react'

interface UserAvatarProps {
  // position on screen (already converted from world coords)
  screenX:  number
  screenY:  number
  username: string
  icon:     string
  bio:      string
  color:    string        // hex string e.g. "#6366f1"
  isMe:     boolean
  isNearby: boolean
  scale:    number        // 1.0 or 1.08 for nearby pulse
}

export function UserAvatar({
  screenX, screenY,
  username, icon, bio, color,
  isMe, isNearby, scale,
}: UserAvatarProps) {
  const [hovered, setHovered] = useState(false)

  // Ring animates via CSS, not Pixi ticker
  const ringStyle: React.CSSProperties = {
    position:    'absolute',
    width:       300,         // diameter = PROXIMITY_RADIUS * 2
    height:      300,
    borderRadius: '50%',
    border:      `1.5px solid ${isNearby ? '#10b981' : color}`,
    opacity:     isNearby ? 0.4 : 0.15,
    left:        screenX - 150,
    top:         screenY - 150,
    pointerEvents: 'none',
    transition:  'opacity 0.3s, border-color 0.3s',
    animation:   isNearby ? 'proximityPulse 2s ease-in-out infinite' : 'none',
  }

  const containerStyle: React.CSSProperties = {
    position:  'absolute',
    left:      screenX,
    top:       screenY,
    transform: `translate(-50%, -50%) scale(${scale})`,
    transition: 'transform 0.15s ease-out',
    cursor:    isMe ? 'default' : 'pointer',
    userSelect: 'none',
  }

  return (
    <>
      {/* Proximity ring — separate element so it doesn't scale with avatar */}
      <div style={ringStyle} />

      {/* Avatar + tooltip wrapper */}
      <div
        style={containerStyle}
        onMouseEnter={() => !isMe && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Glow behind circle */}
        <div style={{
          position:     'absolute',
          inset:        -8,
          borderRadius: '50%',
          background:   color,
          opacity:      0.15,
          pointerEvents: 'none',
        }} />

        {/* Main circle */}
        <div style={{
          width:          48,
          height:         48,
          borderRadius:   '50%',
          background:     color,
          border:         `1.5px solid rgba(255,255,255,0.25)`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       18,
          lineHeight:     1,
          position:       'relative',
          zIndex:         1,
        }}>
          {icon}
        </div>

        {/* Name pill */}
        <div style={{
          position:       'absolute',
          top:            50,
          left:           '50%',
          transform:      'translateX(-50%)',
          background:     'rgba(13,13,31,0.85)',
          border:         `1px solid ${color}80`,
          borderRadius:   7,
          padding:        '2px 8px',
          fontSize:       15,
          color:          '#e2e8f0',
          whiteSpace:     'nowrap',
          pointerEvents:  'none',
        }}>
          {username}
        </div>

        {/* YOU badge */}
        {isMe && (
          <div style={{
            position:   'absolute',
            bottom:        60,
            left:       '50%',
            transform:  'translateX(-50%)',
            fontSize:   12,
            color:      '#6366f1',
            whiteSpace: 'nowrap',
          }}>
            ● YOU
          </div>
        )}

        {/* Hover tooltip — only for remote users */}
        {hovered && !isMe && (
          <div style={{
            position:    'absolute',
            bottom:      48,
            left:        '50%',
            transform:   'translateX(-50%)',
            background:  'rgba(13,13,31,0.95)',
            backdropFilter: 'blur(8px)',
            border:      '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding:     '8px 12px',
            minWidth:    140,
            maxWidth:    250,
            zIndex:      50,
            pointerEvents: 'none',
            boxShadow:   '0 4px 24px rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: bio ? 4 : 0 }}>
              <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{username}</span>
            </div>
            {bio && (
              <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4, margin: 0 }}>
                {bio}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}