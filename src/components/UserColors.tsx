import { useMemo } from 'react'

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
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        zIndex: 1000
      }}
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
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '3px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(5px)',
        position: 'relative',
        cursor: 'pointer',
        backgroundColor: color
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)'
      }}
    >
      <div
        style={{
          content: `"${userName}"`,
          position: 'absolute',
          bottom: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.7)',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '2px 4px',
          borderRadius: '3px',
          whiteSpace: 'nowrap',
          opacity: 1,
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none'
        }}
      >
        {userName}
      </div>
    </div>
  )
}

