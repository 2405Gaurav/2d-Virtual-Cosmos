import { UserState } from '../types'

const PROXIMITY_RADIUS = 150

export class ProximityService {
  getNearbyUsers(userId: string, activeUsers: Map<string, UserState>): string[] {
    const me = activeUsers.get(userId)
    if (!me) return []

    const nearby: string[] = []
    activeUsers.forEach((other, otherId) => {
      if (otherId === userId) return
      const dist = Math.hypot(other.x - me.x, other.y - me.y)
      if (dist < PROXIMITY_RADIUS) nearby.push(otherId)
    })
    return nearby
  }

  // room id is sorted so both users get the same room regardless of order
  getRoomId(idA: string, idB: string): string {
    return [idA, idB].sort().join('--')
  }

  getRoomsForUser(userId: string, nearbyIds: string[]): string[] {
    return nearbyIds.map(otherId => this.getRoomId(userId, otherId))
  }
}