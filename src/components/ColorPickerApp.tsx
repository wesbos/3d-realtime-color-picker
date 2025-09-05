import { useState, useCallback, useRef } from 'react'
import { RGBCubeVisualizer, type RGBCubeVisualizerHandle } from './RGBCubeVisualizer'
import { UserCount } from './UserCount'
import { UserColors } from './UserColors'
import { ColorDisplay } from './ColorDisplay'
import { usePartyConnection } from '../hooks/usePartyConnection'
import './ColorPickerApp.css'

export function ColorPickerApp() {
  const [userCount, setUserCount] = useState(0)
  const [userColors, setUserColors] = useState<Map<string, string>>(new Map())
  const [colorDisplay, setColorDisplay] = useState({
    text: '',
    backgroundColor: 'transparent',
    textColor: 'white'
  })

  const visualizerRef = useRef<RGBCubeVisualizerHandle>(null)

  // PartyKit connection callbacks
  const handleUserJoined = useCallback((sessionId: string, color: string) => {
    // Add user to the user colors list immediately when they join
    setUserColors(prev => {
      const newMap = new Map(prev)
      newMap.set(sessionId, color)
      return newMap
    })
  }, [])

  const handleCursorMove = useCallback((sessionId: string, position: any, normal: any, color: string) => {
    visualizerRef.current?.showRemoteCursor(sessionId, position, normal, color)
  }, [])

  const handleCursorLeave = useCallback((sessionId: string) => {
    visualizerRef.current?.hideRemoteCursor(sessionId)
  }, [])

  const handleUserDisconnect = useCallback((sessionId: string) => {
    visualizerRef.current?.removeUser(sessionId)

    // Remove user color
    setUserColors(prev => {
      const newMap = new Map(prev)
      newMap.delete(sessionId)
      return newMap
    })
  }, [])

  const handleCameraSync = useCallback((camera: any) => {
    visualizerRef.current?.syncCamera(camera)
  }, [])

  const handleUserCountUpdate = useCallback((count: number) => {
    setUserCount(count)
  }, [])

  const handleUserColorChange = useCallback((sessionId: string, color: string) => {
    // Update user's color in the userColors map
    setUserColors(prev => {
      const newMap = new Map(prev)
      newMap.set(sessionId, color)
      return newMap
    })
  }, [])

  // Use PartyKit connection
  const {
    isConnected,
    userSessionId,
    sendColorPick,
    sendCursorLeave,
    sendCameraChange,
    sendColorChange
  } = usePartyConnection({
    onCursorMove: handleCursorMove,
    onCursorLeave: handleCursorLeave,
    onUserJoined: handleUserJoined,
    onUserDisconnect: handleUserDisconnect,
    onCameraSync: handleCameraSync,
    onUserCountUpdate: handleUserCountUpdate,
    onUserColorChange: handleUserColorChange
  })

  // Visualizer callbacks
  const handleColorPick = useCallback((event: {
    position: { x: number; y: number; z: number }
    normal: { x: number; y: number; z: number }
    color: string
    rgb: { r: number; g: number; b: number }
  }) => {
    sendColorPick(event)
    // Send color change to update user's color
    sendColorChange(event.color)
  }, [sendColorPick, sendColorChange])

  const handleColorDisplay = useCallback((colorText: string, backgroundColor: string, textColor: string) => {
    setColorDisplay({ text: colorText, backgroundColor, textColor })
  }, [])

  const handleCameraChange = useCallback((event: {
    position: { x: number; y: number; z: number }
    target: { x: number; y: number; z: number }
  }) => {
    sendCameraChange(event)
  }, [sendCameraChange])

  return (
    <div className="color-picker-app">
      <UserCount count={userCount} isConnecting={!isConnected} />
      <UserColors userColors={userColors} currentUserSessionId={userSessionId} />

      {colorDisplay.text && (
        <ColorDisplay
          colorText={colorDisplay.text}
          backgroundColor={colorDisplay.backgroundColor}
          textColor={colorDisplay.textColor}
        />
      )}

      <RGBCubeVisualizer
        ref={visualizerRef}
        onColorPick={handleColorPick}
        onCursorLeave={sendCursorLeave}
        onCameraChange={handleCameraChange}
        currentUserSessionId={userSessionId}
        onColorDisplay={handleColorDisplay}
      />

      {/* Loading indicator */}
      <div className={`loading-indicator ${colorDisplay.text ? 'hidden' : ''}`}>

      </div>

    </div>
  )
}
