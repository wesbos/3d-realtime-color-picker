import { useState, useCallback, useRef } from 'react'
import { RGBCubeVisualizer, type RGBCubeVisualizerHandle } from './RGBCubeVisualizer'
import { UserCount } from './UserCount'
import { UserColors } from './UserColors'
import { ColorDisplay } from './ColorDisplay'
import { usePartyConnection } from '../hooks/usePartyConnection'

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
  const handleCursorMove = useCallback((sessionId: string, position: any, normal: any, color: string) => {
    visualizerRef.current?.showRemoteCursor(sessionId, position, normal, color)

    // Update user color
    setUserColors(prev => {
      const newMap = new Map(prev)
      newMap.set(sessionId, color)
      return newMap
    })
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

  // Use PartyKit connection
  const {
    isConnected,
    userSessionId,
    sendColorPick,
    sendCursorLeave,
    sendCameraChange
  } = usePartyConnection({
    onCursorMove: handleCursorMove,
    onCursorLeave: handleCursorLeave,
    onUserDisconnect: handleUserDisconnect,
    onCameraSync: handleCameraSync,
    onUserCountUpdate: handleUserCountUpdate
  })

  // Visualizer callbacks
  const handleColorPick = useCallback((event: {
    position: { x: number; y: number; z: number }
    normal: { x: number; y: number; z: number }
    color: string
    rgb: { r: number; g: number; b: number }
  }) => {
    sendColorPick(event)

    // Update current user's color
    if (userSessionId) {
      setUserColors(prev => {
        const newMap = new Map(prev)
        newMap.set(userSessionId, event.color)
        return newMap
      })
    }
  }, [sendColorPick, userSessionId])

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
    <div style={{
      margin: 0,
      padding: 0,
      background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
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
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '16px',
        fontWeight: 300,
        textAlign: 'center',
        zIndex: 1000,
        pointerEvents: 'none',
        animation: 'pulse 2s ease-in-out infinite',
        display: colorDisplay.text ? 'none' : 'block'
      }}>
        Generating RGB Color Cube...
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          background: radial-gradient(circle at center, #1a1a1a 0%, #000000 100%);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        #canvas:active {
          cursor: grabbing;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }

        /* High DPI display optimizations */
        @media (-webkit-min-device-pixel-ratio: 2) {
          #canvas {
            image-rendering: -webkit-optimize-contrast;
          }
        }
      `}</style>
    </div>
  )
}
