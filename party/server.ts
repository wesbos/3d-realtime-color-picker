import type * as Party from "partykit/server";

export default class ColorPickerServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    console.log(`User ${conn.id} connected`);

    // Send current user count to all connections
    this.broadcastUserCount();
  }

  onMessage(message: string | ArrayBuffer, sender: Party.Connection) {
    try {
      const data = JSON.parse(message as string);

      switch (data.type) {
        case 'cursor-move':
          // Broadcast cursor position to all other connections
          this.room.broadcast(JSON.stringify({
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
          this.room.broadcast(JSON.stringify({
            type: 'cursor-leave',
            sessionId: sender.id
          }), [sender.id]); // Exclude sender
          break;

        case 'camera-sync':
          // Broadcast camera changes to all other connections
          this.room.broadcast(JSON.stringify({
            type: 'camera-sync',
            camera: data.camera
          }), [sender.id]); // Exclude sender
          break;
      }
    } catch (error) {
      console.error('Invalid message format:', error);
    }
  }

  onClose(connection: Party.Connection) {
    console.log(`User ${connection.id} disconnected`);

    // Send user disconnect event (removes color circle)
    this.room.broadcast(JSON.stringify({
      type: 'user-disconnect',
      sessionId: connection.id
    }));

    // Update user count
    this.broadcastUserCount();
  }

  private broadcastUserCount() {
    const userCount = [...this.room.connections].length;
    this.room.broadcast(JSON.stringify({
      type: 'user-count',
      count: userCount
    }));
  }
}
