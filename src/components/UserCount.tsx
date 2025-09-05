import './UserCount.css'

interface UserCountProps {
  count: number
  isConnecting?: boolean
}

export function UserCount({ count, isConnecting = false }: UserCountProps) {
  return (
    <div
      id="userCount"
      className="user-count"
    >
      {isConnecting ? 'Connecting...' : `${count} user${count === 1 ? '' : 's'} online`}
    </div>
  )
}

