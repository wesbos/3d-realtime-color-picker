import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PartySocket } from 'partysocket';

class RGBCubeVisualizer extends EventTarget {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private cube: THREE.Mesh | null = null;
  private colorDisplay: HTMLElement;
  private cursorIndicator: THREE.Mesh | null = null;
  private remoteCursors = new Map<string, THREE.Mesh>();
  private userColorCircles = new Map<string, HTMLElement>();
  private isCameraMoving = false;

  constructor(canvas: HTMLCanvasElement, colorDisplay?: HTMLElement) {
    super();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.colorDisplay = colorDisplay || document.getElementById('colorDisplay')!;

    this.initScene(canvas);
    this.createRGBCube();
    this.setupInteraction(canvas);
    this.animate();
  }

  private initScene(canvas: HTMLCanvasElement): void {
    const canvasWidth = canvas.clientWidth || window.innerWidth;
    const canvasHeight = canvas.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      canvasWidth / canvasHeight,
      0.1, // Much closer near plane to prevent clipping
      1000
    );
    this.camera.position.set(1.5, 1.5, 1.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true
    });
    this.renderer.setSize(canvasWidth, canvasHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;

    // Set zoom limits to prevent going inside the cube
    // Cube extends ±0.5, so we can get much closer now with the fixed near plane
    this.controls.minDistance = 0.7; // Can get really close for detailed inspection
    this.controls.maxDistance = 15;  // Can't zoom out further than this
    this.controls.enableZoom = true;

    // Listen for camera interaction start/end to prevent picker circle jumping
    this.controls.addEventListener('start', () => {
      this.isCameraMoving = true;
      // Hide cursor indicator during camera movement
      if (this.cursorIndicator) {
        this.cursorIndicator.visible = false;
      }
    });

    this.controls.addEventListener('end', () => {
      this.isCameraMoving = false;
      // Re-trigger color display update when camera movement ends
      this.updateColorDisplay();
    });

    // Listen for camera changes and emit events
    this.setupCameraSync();

    // Handle resize
    window.addEventListener('resize', () => this.handleResize());
  }

      private createRGBCube(): void {
    console.log('Creating RGB color cube...');

    // Reduce vertex count from 8,000 to 125 vertices while maintaining visual quality
    const geometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);

    // Get positions and create color array
    const positions = geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    // Color each vertex based on its position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Map position from [-0.5, 0.5] to [0, 1] for RGB values
      let r = x + 0.5;
      let g = y + 0.5;
      let b = z + 0.5;

      // Apply gamma correction to make colors more perceptually uniform
      r = Math.pow(r, 2.2);
      g = Math.pow(g, 2.2);
      b = Math.pow(b, 2.2);

      colors[i * 3] = r;     // Red channel
      colors[i * 3 + 1] = g; // Green channel
      colors[i * 3 + 2] = b; // Blue channel
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create material with vertex colors - reduce interpolation bleeding
    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      flatShading: true, // Reduces color bleeding between faces
      transparent: false,
      opacity: 1.0
    });

    // Create the cube mesh
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    // Add helpers and interactive elements
    this.addHelpers();
    this.addCubeEdges();
    this.createCursorIndicator();

    // Hide loading message
    this.hideLoadingMessage();

    console.log('RGB cube created successfully!');
  }

  private setupInteraction(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Skip color display updates during camera movement to prevent picker circle jumping
      if (this.isCameraMoving) return;

      this.updateColorDisplay();
    });

    canvas.addEventListener('mouseleave', () => {
      // Just hide the local cursor indicator, keep last color state
      if (this.cursorIndicator) {
        this.cursorIndicator.visible = false;
      }

      // Emit cursor leave event for other users
      this.dispatchEvent(new CustomEvent('cursorleave'));
    });
  }

  private updateColorDisplay(): void {
    if (!this.cube) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.cube);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const point = intersection.point;
      const normal = intersection.face?.normal;

      // Convert world position back to RGB values
      // Cube is centered at origin with size 1, so vertices are at [-0.5, 0.5]
      const r = Math.round((point.x + 0.5) * 255);
      const g = Math.round((point.y + 0.5) * 255);
      const b = Math.round((point.z + 0.5) * 255);

      // Clamp values to valid range
      const rClamped = Math.max(0, Math.min(255, r));
      const gClamped = Math.max(0, Math.min(255, g));
      const bClamped = Math.max(0, Math.min(255, b));

      const toHex = (n: number) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      const hexColor = `#${toHex(rClamped)}${toHex(gClamped)}${toHex(bClamped)}`;

      // Show and position cursor indicator
      if (this.cursorIndicator && normal) {
        this.cursorIndicator.visible = true;

                // Position indicator with tiny offset to prevent z-fighting
        const offset = normal.clone().multiplyScalar(0.002);
        this.cursorIndicator.position.copy(point).add(offset);

        // Orient the disc to lie flat on the surface
        // Point the disc away from the surface (opposite to normal) so it faces outward
        this.cursorIndicator.lookAt(point.clone().sub(normal));

        // Update cursor color to match the hovered color
        (this.cursorIndicator.material as THREE.MeshBasicMaterial).color.setStyle(hexColor);

        // Emit color pick event
        this.dispatchEvent(new CustomEvent('colorpick', {
          detail: {
            position: { x: point.x, y: point.y, z: point.z },
            normal: { x: normal.x, y: normal.y, z: normal.z },
            color: hexColor,
            rgb: { r: rClamped, g: gClamped, b: bClamped }
          }
        }));
      }

      this.colorDisplay.textContent = `RGB(${rClamped}, ${gClamped}, ${bClamped}) • ${hexColor.toUpperCase()}`;
      this.colorDisplay.style.backgroundColor = hexColor;
      this.colorDisplay.style.color = (rClamped + gClamped + bClamped) > 384 ? 'black' : 'white';
    } else {
      if (this.cursorIndicator) {
        this.cursorIndicator.visible = false;
      }
    }
  }

  private createCursorIndicator(): void {
    // Create a flat disc that will show the hovered color
    const geometry = new THREE.CircleGeometry(0.025, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: false,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false
    });

    this.cursorIndicator = new THREE.Mesh(geometry, material);
    this.cursorIndicator.visible = false; // Hidden by default
    this.cursorIndicator.renderOrder = 1; // Render on top

    // Black border ring for contrast
    const ringGeometry = new THREE.RingGeometry(0.025, 0.03, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.renderOrder = 2; // Render ring on top of disc
    this.cursorIndicator.add(ring);

    this.scene.add(this.cursorIndicator);
  }

  private addCubeEdges(): void {
    // Create wireframe edges for the cube
    const edgeGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.25,
      linewidth: 1
    });

    const wireframe = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    this.scene.add(wireframe);

    // Add more detailed grid lines on each face for better reference when zoomed
    this.addFaceGridLines();
  }

  private addFaceGridLines(): void {
    const gridLines = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1
    });

    // Create grid lines for each face (every 0.2 units)
    for (let i = -0.4; i <= 0.4; i += 0.2) {
      // Vertical lines on front and back faces
      const frontVertical = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i, -0.5, 0.5),
        new THREE.Vector3(i, 0.5, 0.5)
      ]);
      gridLines.add(new THREE.Line(frontVertical, lineMaterial));

      const backVertical = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i, -0.5, -0.5),
        new THREE.Vector3(i, 0.5, -0.5)
      ]);
      gridLines.add(new THREE.Line(backVertical, lineMaterial));

      // Horizontal lines on front and back faces
      const frontHorizontal = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.5, i, 0.5),
        new THREE.Vector3(0.5, i, 0.5)
      ]);
      gridLines.add(new THREE.Line(frontHorizontal, lineMaterial));

      const backHorizontal = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.5, i, -0.5),
        new THREE.Vector3(0.5, i, -0.5)
      ]);
      gridLines.add(new THREE.Line(backHorizontal, lineMaterial));

      // Lines on left and right faces
      const leftVertical = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.5, i, -0.5),
        new THREE.Vector3(-0.5, i, 0.5)
      ]);
      gridLines.add(new THREE.Line(leftVertical, lineMaterial));

      const rightVertical = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.5, i, -0.5),
        new THREE.Vector3(0.5, i, 0.5)
      ]);
      gridLines.add(new THREE.Line(rightVertical, lineMaterial));
    }

    this.scene.add(gridLines);
  }

  private addHelpers(): void {
    // Add axes helper
    const axesHelper = new THREE.AxesHelper(0.75);
    this.scene.add(axesHelper);
  }

  // Public methods for external WebSocket handling
  showRemoteCursor(sessionId: string, position: any, normal: any, color: string): void {
    this.updateRemoteCursor(sessionId, position, normal, color);
    this.updateUserColorCircle(sessionId, color);
  }

  hideRemoteCursor(sessionId: string): void {
    this.removeRemoteCursor(sessionId);
    // Keep the color circle - don't remove it when cursor leaves
  }

  removeUser(sessionId: string): void {
    this.removeRemoteCursor(sessionId);
    this.removeUserColorCircle(sessionId);
  }

  updateUserCount(count: number): void {
    const userCountEl = document.getElementById('userCount');
    if (userCountEl) {
      userCountEl.textContent = `${count} user${count === 1 ? '' : 's'} online`;
    }
  }

  syncCamera(cameraData: any): void {
    // Direct camera sync without blocking delays for responsive real-time sync
    // Removed 100ms blocking timeout that was causing lag in camera updates
    this.camera.position.set(cameraData.position.x, cameraData.position.y, cameraData.position.z);
    this.controls.target.set(cameraData.target.x, cameraData.target.y, cameraData.target.z);
    this.controls.update();
  }

  private updateRemoteCursor(sessionId: string, position: any, normal: any, color: string): void {
    let remoteCursor = this.remoteCursors.get(sessionId);

    if (!remoteCursor) {
      // Create new remote cursor
      const geometry = new THREE.CircleGeometry(0.02, 16);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: false
      });

      remoteCursor = new THREE.Mesh(geometry, material);
      remoteCursor.renderOrder = 0; // Render below local cursor

      const ringGeometry = new THREE.RingGeometry(0.02, 0.025, 16);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: false
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      remoteCursor.add(ring);

      this.scene.add(remoteCursor);
      this.remoteCursors.set(sessionId, remoteCursor);
    }

    // Update position with slight offset to prevent z-fighting
    const surfaceNormal = new THREE.Vector3(normal.x, normal.y, normal.z);
    const offset = surfaceNormal.clone().multiplyScalar(0.002);
    const finalPosition = new THREE.Vector3(position.x, position.y, position.z).add(offset);
    remoteCursor.position.copy(finalPosition);

    // Orient the disc to lie flat on the surface (same as local cursor)
    remoteCursor.lookAt(finalPosition.clone().sub(surfaceNormal));

    // Update color
    (remoteCursor.material as THREE.MeshBasicMaterial).color.setStyle(color);
    remoteCursor.visible = true;
  }

  private removeRemoteCursor(sessionId: string): void {
    const remoteCursor = this.remoteCursors.get(sessionId);
    if (remoteCursor) {
      this.scene.remove(remoteCursor);
      this.remoteCursors.delete(sessionId);
    }
  }

  private updateUserColorCircle(sessionId: string, color: string): void {
    let circle = this.userColorCircles.get(sessionId);

    if (!circle) {
      // Create new color circle
      circle = document.createElement('div');
      circle.className = 'user-color-circle';
      circle.setAttribute('data-user-id', `User ${sessionId.slice(-4)}`);

      const userColorsContainer = document.getElementById('userColors');
      if (userColorsContainer) {
        userColorsContainer.appendChild(circle);
        this.userColorCircles.set(sessionId, circle);
      }
    }

    if (circle) {
      circle.style.backgroundColor = color;
    }
  }

  private removeUserColorCircle(sessionId: string): void {
    const circle = this.userColorCircles.get(sessionId);
    if (circle) {
      circle.remove();
      this.userColorCircles.delete(sessionId);
    }
  }

  private setupCameraSync(): void {
    let lastCameraUpdate = 0;
    /*

    - 1 second = 1000 milliseconds
    - 1000ms ÷ 16ms = 62.5 updates per second ~60 FPS

    Common throttle values:
    - 8ms = 125 FPS (very responsive but more network traffic)
    - 16ms = 60 FPS (matches most monitor refresh rates)
    - 33ms = 30 FPS
    - 50ms = 20 FPS
    */

    // Provides smoother real-time camera synchronization between windows
    const CAMERA_UPDATE_THROTTLE = 16; // ms - 60fps for smooth camera sync

    this.controls.addEventListener('change', () => {
      const now = Date.now();
      if (now - lastCameraUpdate > CAMERA_UPDATE_THROTTLE) {
        lastCameraUpdate = now;

        this.dispatchEvent(new CustomEvent('camerachange', {
          detail: {
            position: {
              x: this.camera.position.x,
              y: this.camera.position.y,
              z: this.camera.position.z
            },
            target: {
              x: this.controls.target.x,
              y: this.controls.target.y,
              z: this.controls.target.z
            }
          }
        }));
      }
    });
  }



  private animate(): void {
    const animate = () => {
      requestAnimationFrame(animate);
      this.controls.update();

      // Animate cursor indicator with subtle pulsing
      if (this.cursorIndicator && this.cursorIndicator.visible) {
        const time = Date.now() * 0.005;
        const scale = 1 + Math.sin(time) * 0.1;
        this.cursorIndicator.scale.set(scale, scale, scale);
      }

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  private hideLoadingMessage(): void {
    // Remove the loading message by modifying the body's ::before pseudo-element
    const style = document.createElement('style');
    style.textContent = `
      body::before {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  private handleResize(): void {
    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }
}

// PartyKit connection manager
class ColorPickerConnection {
  private socket: any = null; // PartySocket type
  private colorPicker: RGBCubeVisualizer;

  constructor(colorPicker: RGBCubeVisualizer, partyHost?: string) {
    this.colorPicker = colorPicker;
    this.connectToParty(partyHost);
    this.setupEventListeners();
  }

  private async connectToParty(partyHost?: string): Promise<void> {
    const host = partyHost || 'localhost:1999'; // Default PartyKit dev server

    this.socket = new PartySocket({
      host: window.location.host,
      party: "color-picker-server",
      room: 'color-picker'
    });

    this.socket.addEventListener('message', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        this.handlePartyMessage(data);
      } catch (error) {
        console.error('Invalid message format:', error);
      }
    });

    this.socket.addEventListener('close', () => {
      console.log('PartySocket disconnected');
      // Disabled automatic reconnection to prevent connection storms
      // Previously caused infinite reconnection loops creating phantom user connections
      // setTimeout(() => this.connectToParty(partyHost), 1000);
    });
  }

  private handlePartyMessage(data: any): void {
    switch (data.type) {
      case 'cursor-move':
        this.colorPicker.showRemoteCursor(data.sessionId, data.position, data.normal, data.color);
        break;
      case 'cursor-leave':
        this.colorPicker.hideRemoteCursor(data.sessionId);
        break;
      case 'user-disconnect':
        this.colorPicker.removeUser(data.sessionId);
        break;
      case 'camera-sync':
        this.colorPicker.syncCamera(data.camera);
        break;
      case 'user-count':
        this.colorPicker.updateUserCount(data.count);
        break;
    }
  }

  private setupEventListeners(): void {
    this.colorPicker.addEventListener('colorpick', (event: any) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'cursor-move',
          position: event.detail.position,
          normal: event.detail.normal,
          color: event.detail.color,
          rgb: event.detail.rgb
        }));
      }
    });

    this.colorPicker.addEventListener('cursorleave', () => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'cursor-leave'
        }));
      }
    });

    this.colorPicker.addEventListener('camerachange', (event: any) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'camera-sync',
          camera: event.detail
        }));
      }
    });
  }
}

// Initialize the visualization
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (canvas) {
    const colorPicker = new RGBCubeVisualizer(canvas);
    new ColorPickerConnection(colorPicker);
  }
});
