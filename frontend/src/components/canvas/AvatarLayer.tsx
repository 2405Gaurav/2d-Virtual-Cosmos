import { useCosmosStore } from '../../store/useCosmosStore'
import { useCameraStore } from '../../store/useCameraStore'
import { UserAvatar } from './UserAvatar'

const COLORS = ['#6366f1','#ec4899','#14b8a6','#f59e0b','#10b981','#ef4444']

export function AvatarLayer() {
  const { myId, myPosition, remoteUsers, nearbyUsers, username, icon, bio } = useCosmosStore()
  const { offsetX, offsetY,zoom } = useCameraStore()

const toScreen = (wx: number, wy: number) => ({
  sx: wx * zoom + offsetX,
  sy: wy * zoom + offsetY,
})

  // Wait until socket has assigned us an ID
  if (!myId || !username) return null

  const me = toScreen(myPosition.x, myPosition.y)

  const remoteList = Array.from(remoteUsers.values()).map((u, i) => {
    const { sx, sy } = toScreen(u.x, u.y)
    return {
      ...u,
      screenX: sx,
      screenY: sy,
      color: COLORS[(i + 1) % COLORS.length],
    }
  })

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: 'none' }}>
      <style>{`
        @keyframes proximityPulse {
          0%, 100% { opacity: 0.35; transform: scale(1);   }
          50%       { opacity: 0.55; transform: scale(1.03); }
        }
      `}</style>

      {/* Remote users */}
      {remoteList.map((u) => (
        <div key={u.id} style={{ pointerEvents: 'auto' }}>
          <UserAvatar
            screenX={u.screenX}
            screenY={u.screenY}
            username={u.username}
            icon={u.icon  ?? '👤'}
            bio={u.bio    ?? ''}
            color={u.color}
            isMe={false}
            isNearby={nearbyUsers.includes(u.id)}
            scale={nearbyUsers.includes(u.id) ? 1.08 : 1.0}
          />
        </div>
      ))}

      {/* Local user — pointer-events off so it doesn't block WASD/click movement */}
      <div style={{ pointerEvents: 'none' }}>
        <UserAvatar
          screenX={me.sx}
          screenY={me.sy}
          username={username}
          icon={icon}
          bio={bio}
          color={COLORS[0]}
          isMe={true}
          isNearby={false}
          scale={1.0}
        />
      </div>
    </div>
  )
}