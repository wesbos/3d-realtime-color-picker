import { useMemo } from 'react'
import './UserColors.css'

interface UserColor {
  sessionId: string
  color: string
  isCurrentUser?: boolean
}

interface UserColorsProps {
  userColors: Map<string, string>
  currentUserSessionId?: string | null
}

export function UserColors({ userColors, currentUserSessionId }: UserColorsProps) {
  const userColorArray = useMemo(() => {
    const colors: UserColor[] = []
    userColors.forEach((color, sessionId) => {
      colors.push({
        sessionId,
        color,
        isCurrentUser: sessionId === currentUserSessionId
      })
    })
    return colors.sort((a, b) => {
      // Sort so current user appears first
      if (a.isCurrentUser) return -1
      if (b.isCurrentUser) return 1
      return a.sessionId.localeCompare(b.sessionId)
    })
  }, [userColors, currentUserSessionId])

  return (
    <div
      id="userColors"
      className="user-colors"
    >
      {userColorArray.map(({ sessionId, color, isCurrentUser }) => (
        <UserColorCircle
          key={sessionId}
          sessionId={sessionId}
          color={color}
          isCurrentUser={isCurrentUser}
        />
      ))}
    </div>
  )
}

interface UserColorCircleProps {
  sessionId: string
  color: string
  isCurrentUser?: boolean
}

function UserColorCircle({ sessionId, color, isCurrentUser }: UserColorCircleProps) {
  const userName = isCurrentUser ? `User ${sessionId.slice(-4)} (you!)` : `User ${sessionId.slice(-4)}`

  return (
    <div
      className="user-color-circle"
      data-user-id={userName}
      style={{ backgroundColor: color }}
    >
      <div className="user-name-tooltip">
        {userName}
      </div>
    </div>
  )
}

