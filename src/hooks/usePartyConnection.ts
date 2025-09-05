import { useCallback, useState, useEffect } from 'react'
import { usePartySocket } from 'partysocket/react'

interface ColorPickEvent {
  position: { x: number; y: number; z: number }
  normal: { x: number; y: number; z: number }
  color: string
  rgb: { r: number; g: number; b: number }
}

interface CameraChangeEvent {
  position: { x: number; y: number; z: number }
  target: { x: number; y: number; z: number }
}

interface PartyMessage {
  type: 'cursor-move' | 'cursor-leave' | 'user-disconnect' | 'camera-sync' | 'user-count' | 'user-joined' | 'user-color-change' | 'user-identified' | 'identify'
  sessionId?: string
  persistentUserId?: string
  position?: any
  normal?: any
  color?: string
  camera?: any
  count?: number
}

interface UsePartyConnectionOptions {
  onCursorMove?: (sessionId: string, position: any, normal: any, color: string) => void
  onCursorLeave?: (sessionId: string) => void
  onUserJoined?: (sessionId: string, color: string) => void
  onUserDisconnect?: (sessionId: string) => void
  onCameraSync?: (camera: any) => void
  onUserCountUpdate?: (count: number) => void
  onUserColorChange?: (sessionId: string, color: string) => void
  partyHost?: string
}

export function usePartyConnection({
  onCursorMove,
  onCursorLeave,
  onUserJoined,
  onUserDisconnect,
  onCameraSync,
  onUserCountUpdate,
  onUserColorChange,
  partyHost
}: UsePartyConnectionOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [userSessionId, setUserSessionId] = useState<string | null>(null)

  // Get or create persistent user ID
  const getPersistentUserId = useCallback(() => {
    const stored = localStorage.getItem('color-picker-user-id')
    if (stored) {
      return stored
    }
    const newId = crypto.randomUUID()
    localStorage.setItem('color-picker-user-id', newId)
    return newId
  }, [])

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: PartyMessage = JSON.parse(event.data)

      switch (data.type) {
        case 'cursor-move':
          if (data.sessionId && onCursorMove) {
            onCursorMove(data.sessionId, data.position, data.normal, data.color!)
          }
          break
        case 'cursor-leave':
          if (data.sessionId && onCursorLeave) {
            onCursorLeave(data.sessionId)
          }
          break
        case 'user-joined':
          if (data.sessionId && data.color && onUserJoined) {
            onUserJoined(data.sessionId, data.color)
          }
          break
        case 'user-disconnect':
          if (data.sessionId && onUserDisconnect) {
            onUserDisconnect(data.sessionId)
          }
          break
        case 'camera-sync':
          if (data.camera && onCameraSync) {
            onCameraSync(data.camera)
          }
          break
        case 'user-count':
          if (typeof data.count === 'number' && onUserCountUpdate) {
            onUserCountUpdate(data.count)
          }
          break
        case 'user-color-change':
          if (data.sessionId && data.color && onUserColorChange) {
            onUserColorChange(data.sessionId, data.color)
          }
          break
        case 'user-identified':
          if (data.sessionId) {
            setUserSessionId(data.sessionId)
          }
          break
      }
    } catch (error) {
      console.error('Invalid message format:', error)
    }
  }, [onCursorMove, onCursorLeave, onUserJoined, onUserDisconnect, onCameraSync, onUserCountUpdate, onUserColorChange])

  const handleOpen = useCallback(() => {
    console.log('PartySocket connected')
    setIsConnected(true)
  }, [])

  const handleClose = useCallback(() => {
    console.log('PartySocket disconnected')
    setIsConnected(false)
    setUserSessionId(null)
  }, [])

  // Use the official PartyKit React hook
  const socket = usePartySocket({
    host: partyHost || window.location.host,
    party: "color-picker-server",
    room: 'color-picker',
    onOpen: handleOpen,
    onClose: handleClose,
    onMessage: handleMessage,
  })

  // Send identify message when socket becomes available
  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN && isConnected) {
      const persistentId = getPersistentUserId()
      socket.send(JSON.stringify({
        type: 'identify',
        persistentUserId: persistentId
      }))
    }
  }, [socket, isConnected, getPersistentUserId])

  const sendColorPick = useCallback((event: ColorPickEvent) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'cursor-move',
        position: event.position,
        normal: event.normal,
        color: event.color,
        rgb: event.rgb
      }))
    }
  }, [socket])

  const sendCursorLeave = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'cursor-leave'
      }))
    }
  }, [socket])

  const sendCameraChange = useCallback((event: CameraChangeEvent) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'camera-sync',
        camera: event
      }))
    }
  }, [socket])

  const sendColorChange = useCallback((color: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'user-color-change',
        color: color
      }))
    }
  }, [socket])

  return {
    isConnected,
    userSessionId,
    sendColorPick,
    sendCursorLeave,
    sendCameraChange,
    sendColorChange
  }
}

