import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface RGBCubeVisualizerProps {
  onColorPick?: (event: {
    position: { x: number; y: number; z: number }
    normal: { x: number; y: number; z: number }
    color: string
    rgb: { r: number; g: number; b: number }
  }) => void
  onCursorLeave?: () => void
  onCameraChange?: (event: {
    position: { x: number; y: number; z: number }
    target: { x: number; y: number; z: number }
  }) => void
  currentUserSessionId?: string | null
  onColorDisplay?: (colorText: string, backgroundColor: string, textColor: string) => void
}

export interface RGBCubeVisualizerHandle {
  showRemoteCursor: (sessionId: string, position: any, normal: any, color: string) => void
  hideRemoteCursor: (sessionId: string) => void
  removeUser: (sessionId: string) => void
  syncCamera: (cameraData: any) => void
}

export const RGBCubeVisualizer = forwardRef<RGBCubeVisualizerHandle, RGBCubeVisualizerProps>(({
  onColorPick,
  onCursorLeave,
  onCameraChange,
  currentUserSessionId,
  onColorDisplay
}, ref) => {
  // Use refs to store latest props to avoid dependency issues
  const onColorPickRef = useRef(onColorPick)
  const onCursorLeaveRef = useRef(onCursorLeave)
  const onCameraChangeRef = useRef(onCameraChange)
  const onColorDisplayRef = useRef(onColorDisplay)

  // Update refs when props change
  useEffect(() => {
    onColorPickRef.current = onColorPick
    onCursorLeaveRef.current = onCursorLeave
    onCameraChangeRef.current = onCameraChange
    onColorDisplayRef.current = onColorDisplay
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const cubeRef = useRef<THREE.Mesh | null>(null)
  const raycasterRef = useRef<THREE.Raycaster | null>(null)
  const mouseRef = useRef<THREE.Vector2 | null>(null)
  const cursorIndicatorRef = useRef<THREE.Mesh | null>(null)
  const remoteCursorsRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const isCameraMovingRef = useRef<boolean>(false)
  const animationIdRef = useRef<number | null>(null)

  const initScene = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const canvasWidth = canvas.clientWidth || window.innerWidth
    const canvasHeight = canvas.clientHeight || window.innerHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x222222)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(60, canvasWidth / canvasHeight, 0.1, 1000)
    camera.position.set(1.5, 1.5, 1.5)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(canvasWidth, canvasHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.minDistance = 0.7
    controls.maxDistance = 15
    controls.enableZoom = true
    controlsRef.current = controls

    // Camera interaction listeners
    controls.addEventListener('start', () => {
      isCameraMovingRef.current = true
      if (cursorIndicatorRef.current) {
        cursorIndicatorRef.current.visible = false
      }
    })

    controls.addEventListener('end', () => {
      isCameraMovingRef.current = false
      updateColorDisplay()
    })

    // Camera sync
    setupCameraSync(controls)

    // Initialize other refs
    raycasterRef.current = new THREE.Raycaster()
    mouseRef.current = new THREE.Vector2()

    // Handle resize
    const handleResize = () => {
      if (!camera || !renderer || !canvas) return
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const createRGBCube = useCallback(() => {
    if (!sceneRef.current) return

    console.log('Creating RGB color cube...')

    const geometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5)
    const positions = geometry.attributes.position
    const colors = new Float32Array(positions.count * 3)

    // Color each vertex based on its position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)

      // Map position from [-0.5, 0.5] to [0, 1] for RGB values
      let r = x + 0.5
      let g = y + 0.5
      let b = z + 0.5

      // Apply gamma correction
      r = Math.pow(r, 2.2)
      g = Math.pow(g, 2.2)
      b = Math.pow(b, 2.2)

      colors[i * 3] = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1.0
    })

    const cube = new THREE.Mesh(geometry, material)
    sceneRef.current.add(cube)
    cubeRef.current = cube

    // Add helpers and interactive elements
    addHelpers()
    addCubeEdges()
    createCursorIndicator()

    console.log('RGB cube created successfully!')
  }, [])

  const addHelpers = useCallback(() => {
    if (!sceneRef.current) return
    const axesHelper = new THREE.AxesHelper(0.75)
    sceneRef.current.add(axesHelper)
  }, [])

  const addCubeEdges = useCallback(() => {
    if (!sceneRef.current) return

    // Create wireframe edges for the cube
    const edgeGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1))
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.25,
      linewidth: 1
    })

    const wireframe = new THREE.LineSegments(edgeGeometry, edgeMaterial)
    sceneRef.current.add(wireframe)

    addFaceGridLines()
  }, [])

  const addFaceGridLines = useCallback(() => {
    if (!sceneRef.current) return

    const gridLines = new THREE.Group()
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1
    })

    // Create grid lines for each face (every 0.2 units)
    for (let i = -0.4; i <= 0.4; i += 0.2) {
      // Vertical lines on front and back faces
      const frontVertical = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i, -0.5, 0.5),
        new THREE.Vector3(i, 0.5, 0.5)
      ])
      gridLines.add(new THREE.Line(frontVertical, lineMaterial))

      const backVertical = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i, -0.5, -0.5),
        new THREE.Vector3(i, 0.5, -0.5)
      ])
      gridLines.add(new THREE.Line(backVertical, lineMaterial))

      // Horizontal lines on front and back faces
      const frontHorizontal = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.5, i, 0.5),
        new THREE.Vector3(0.5, i, 0.5)
      ])
      gridLines.add(new THREE.Line(frontHorizontal, lineMaterial))

      const backHorizontal = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.5, i, -0.5),
        new THREE.Vector3(0.5, i, -0.5)
      ])
      gridLines.add(new THREE.Line(backHorizontal, lineMaterial))

      // Lines on left and right faces
      const leftVertical = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.5, i, -0.5),
        new THREE.Vector3(-0.5, i, 0.5)
      ])
      gridLines.add(new THREE.Line(leftVertical, lineMaterial))

      const rightVertical = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.5, i, -0.5),
        new THREE.Vector3(0.5, i, 0.5)
      ])
      gridLines.add(new THREE.Line(rightVertical, lineMaterial))
    }

    sceneRef.current.add(gridLines)
  }, [])

  const createCursorIndicator = useCallback(() => {
    if (!sceneRef.current) return

    // Create a flat disc that will show the hovered color
    const geometry = new THREE.CircleGeometry(0.025, 16)
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: false,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false
    })

    const cursorIndicator = new THREE.Mesh(geometry, material)
    cursorIndicator.visible = false
    cursorIndicator.renderOrder = 1

    // Black border ring for contrast
    const ringGeometry = new THREE.RingGeometry(0.025, 0.03, 16)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.renderOrder = 2
    cursorIndicator.add(ring)

    sceneRef.current.add(cursorIndicator)
    cursorIndicatorRef.current = cursorIndicator
  }, [])

  const updateColorDisplay = useCallback(() => {
    if (!cubeRef.current || !raycasterRef.current || !mouseRef.current || !cameraRef.current) return

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
    const intersects = raycasterRef.current.intersectObject(cubeRef.current)

    if (intersects.length > 0) {
      const intersection = intersects[0]
      const point = intersection.point
      const normal = intersection.face?.normal

      // Convert world position back to RGB values
      const r = Math.round((point.x + 0.5) * 255)
      const g = Math.round((point.y + 0.5) * 255)
      const b = Math.round((point.z + 0.5) * 255)

      // Clamp values to valid range
      const rClamped = Math.max(0, Math.min(255, r))
      const gClamped = Math.max(0, Math.min(255, g))
      const bClamped = Math.max(0, Math.min(255, b))

      const toHex = (n: number) => {
        const hex = n.toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }
      const hexColor = `#${toHex(rClamped)}${toHex(gClamped)}${toHex(bClamped)}`

      // Show and position cursor indicator
      if (cursorIndicatorRef.current && normal) {
        cursorIndicatorRef.current.visible = true

        // Position indicator with tiny offset to prevent z-fighting
        const offset = normal.clone().multiplyScalar(0.002)
        cursorIndicatorRef.current.position.copy(point).add(offset)

        // Orient the disc to lie flat on the surface
        cursorIndicatorRef.current.lookAt(point.clone().sub(normal))

        // Update cursor color to match the hovered color
        ;(cursorIndicatorRef.current.material as THREE.MeshBasicMaterial).color.setStyle(hexColor)

        // Emit color pick event
        if (onColorPickRef.current) {
          onColorPickRef.current({
            position: { x: point.x, y: point.y, z: point.z },
            normal: { x: normal.x, y: normal.y, z: normal.z },
            color: hexColor,
            rgb: { r: rClamped, g: gClamped, b: bClamped }
          })
        }
      }

      // Update color display
      const colorText = `RGB(${rClamped}, ${gClamped}, ${bClamped}) • ${hexColor.toUpperCase()}`
      const textColor = (rClamped + gClamped + bClamped) > 384 ? 'black' : 'white'

      if (onColorDisplayRef.current) {
        onColorDisplayRef.current(colorText, hexColor, textColor)
      }
    } else {
      if (cursorIndicatorRef.current) {
        cursorIndicatorRef.current.visible = false
      }
    }
  }, []) // Remove dependencies since we'll use refs to access latest props

  const setupCameraSync = useCallback((controls: OrbitControls) => {
    let lastCameraUpdate = 0
    const CAMERA_UPDATE_THROTTLE = 16 // 60fps

    controls.addEventListener('change', () => {
      const now = Date.now()
      if (now - lastCameraUpdate > CAMERA_UPDATE_THROTTLE && onCameraChangeRef.current && cameraRef.current && controlsRef.current) {
        lastCameraUpdate = now

        onCameraChangeRef.current({
          position: {
            x: cameraRef.current.position.x,
            y: cameraRef.current.position.y,
            z: cameraRef.current.position.z
          },
          target: {
            x: controlsRef.current.target.x,
            y: controlsRef.current.target.y,
            z: controlsRef.current.target.z
          }
        })
      }
    })
  }, [])

  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return

    const animateLoop = () => {
      animationIdRef.current = requestAnimationFrame(animateLoop)

      controlsRef.current!.update()

      // Animate cursor indicator with subtle pulsing
      if (cursorIndicatorRef.current && cursorIndicatorRef.current.visible) {
        const time = Date.now() * 0.005
        const scale = 1 + Math.sin(time) * 0.1
        cursorIndicatorRef.current.scale.set(scale, scale, scale)
      }

      rendererRef.current!.render(sceneRef.current!, cameraRef.current!)
    }

    animateLoop()
  }, [])

  const setupInteraction = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current

    const handleMouseMove = (event: MouseEvent) => {
      if (!mouseRef.current) return

      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Skip color display updates during camera movement to prevent picker circle jumping
      if (isCameraMovingRef.current) return

      updateColorDisplay()
    }

    const handleMouseLeave = () => {
      // Just hide the local cursor indicator, keep last color state
      if (cursorIndicatorRef.current) {
        cursorIndicatorRef.current.visible = false
      }

      // Emit cursor leave event for other users
      if (onCursorLeaveRef.current) {
        onCursorLeaveRef.current()
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // Public methods for external use
  const showRemoteCursor = useCallback((sessionId: string, position: any, normal: any, color: string) => {
    if (!sceneRef.current) return

    let remoteCursor = remoteCursorsRef.current.get(sessionId)

    if (!remoteCursor) {
      // Create new remote cursor
      const geometry = new THREE.CircleGeometry(0.02, 16)
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: false
      })

      remoteCursor = new THREE.Mesh(geometry, material)
      remoteCursor.renderOrder = 0

      const ringGeometry = new THREE.RingGeometry(0.02, 0.025, 16)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: false
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      remoteCursor.add(ring)

      sceneRef.current.add(remoteCursor)
      remoteCursorsRef.current.set(sessionId, remoteCursor)
    }

    // Update position with slight offset to prevent z-fighting
    const surfaceNormal = new THREE.Vector3(normal.x, normal.y, normal.z)
    const offset = surfaceNormal.clone().multiplyScalar(0.002)
    const finalPosition = new THREE.Vector3(position.x, position.y, position.z).add(offset)
    remoteCursor.position.copy(finalPosition)

    // Orient the disc to lie flat on the surface
    remoteCursor.lookAt(finalPosition.clone().sub(surfaceNormal))

    // Update color
    ;(remoteCursor.material as THREE.MeshBasicMaterial).color.setStyle(color)
    remoteCursor.visible = true
  }, [])

  const hideRemoteCursor = useCallback((sessionId: string) => {
    const remoteCursor = remoteCursorsRef.current.get(sessionId)
    if (remoteCursor) {
      remoteCursor.visible = false
    }
  }, [])

  const removeUser = useCallback((sessionId: string) => {
    const remoteCursor = remoteCursorsRef.current.get(sessionId)
    if (remoteCursor && sceneRef.current) {
      sceneRef.current.remove(remoteCursor)
      remoteCursorsRef.current.delete(sessionId)
    }
  }, [])

  const syncCamera = useCallback((cameraData: any) => {
    if (!cameraRef.current || !controlsRef.current) return

    cameraRef.current.position.set(cameraData.position.x, cameraData.position.y, cameraData.position.z)
    controlsRef.current.target.set(cameraData.target.x, cameraData.target.y, cameraData.target.z)
    controlsRef.current.update()
  }, [])

  // Initialize everything
  useEffect(() => {
    const cleanup1 = initScene()
    createRGBCube()
    const cleanup2 = setupInteraction()
    animate()

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (cleanup1) cleanup1()
      if (cleanup2) cleanup2()
    }
  }, []) // Remove all dependencies since we want this to only run once on mount

  // Expose methods through imperative handle
  useImperativeHandle(ref, () => ({
    showRemoteCursor,
    hideRemoteCursor,
    removeUser,
    syncCamera
  }), [showRemoteCursor, hideRemoteCursor, removeUser, syncCamera])

  return (
    <canvas
      ref={canvasRef}
      id="canvas"
      style={{
        display: 'block',
        width: '80vmin',
        height: '80vmin',
        cursor: 'crosshair',
        touchAction: 'none',
        flexShrink: 0
      }}
    />
  )
})
