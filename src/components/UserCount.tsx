interface UserCountProps {
  count: number
  isConnecting?: boolean
}

export function UserCount({ count, isConnecting = false }: UserCountProps) {
  return (
    <div
      id="userCount"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '14px',
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '8px 12px',
        borderRadius: '6px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1000
      }}
    >
      {isConnecting ? 'Connecting...' : `${count} user${count === 1 ? '' : 's'} online`}
    </div>
  )
}

