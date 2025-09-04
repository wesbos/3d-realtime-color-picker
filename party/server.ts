import { routePartykitRequest, Server, type Connection, } from "partyserver";

export class ColorPickerServer extends Server {
  // constructor(readonly room: Party.Room) {}

  onConnect(conn: Connection) {
    console.log(`User ${conn.id} connected`);

    // Send current user count to all connections
    this.broadcastUserCount();
  }

  async onMessage(sender: Connection, message: string | ArrayBuffer) {
    try {
      const data = JSON.parse(message as string);

      switch (data.type) {
        case 'cursor-move':
          // Broadcast cursor position to all other connections
          this.broadcast(JSON.stringify({
            type: 'cursor-move',
            sessionId: sender.id,
            position: data.position,
            normal: data.normal,
            color: data.color,
            rgb: data.rgb
          }), [sender.id]); // Exclude sender
          break;

        case 'cursor-leave':
          // Broadcast cursor leave to all other connections
          this.broadcast(JSON.stringify({
            type: 'cursor-leave',
            sessionId: sender.id
          }), [sender.id]); // Exclude sender
          break;

        case 'camera-sync':
          // Broadcast camera changes to all other connections
          this.broadcast(JSON.stringify({
            type: 'camera-sync',
            camera: data.camera
          }), [sender.id]); // Exclude sender
          break;
      }
    } catch (error) {
      console.error('Invalid message format:', error);
    }
  }

  onClose(connection: Connection) {
    console.log(`User ${connection.id} disconnected`);

    // Send user disconnect event (removes color circle)
    this.broadcast(JSON.stringify({
      type: 'user-disconnect',
      sessionId: connection.id
    }));

    // Update user count
    this.broadcastUserCount();
  }

  private broadcastUserCount() {
    const connections = Array.from(this.getConnections());
    // const userCount = [...this.room.connections].length;
    const userCount = connections.length;
    this.broadcast(JSON.stringify({
      type: 'user-count',
      count: userCount
    }));
  }
}


export default {
  // Set up your fetch handler to use configured Servers
  async fetch(request: Request, env: any) {
    const response = await routePartykitRequest(request, env, {
      // prefix: 'party/parties'
    });
    return response || new Response("Not Found", { status: 404 });
  }
};
