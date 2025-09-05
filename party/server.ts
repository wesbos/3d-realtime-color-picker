import { routePartykitRequest, Server, type Connection, } from "partyserver";

export class ColorPickerServer extends Server {
  static options = { hibernate: true };
  // Store connected users with their colors and persistent IDs
  private connectedUsers = new Map<string, {
    color: string;
    persistentUserId?: string;
    lastCursorPosition?: any;
    lastCursorNormal?: any;
  }>();

  onConnect(conn: Connection) {
    console.log(`User ${conn.id} connected`);

    // Assign a random color to the new user immediately
    const userColor = this.generateRandomColor();
    this.connectedUsers.set(conn.id, {
      color: userColor
    });

    // Send existing users to the new connection FIRST
    console.log(`Sending ${this.connectedUsers.size - 1} existing users to new user ${conn.id}`);
    this.sendExistingUsers(conn);

    // Send the new user their own color (this triggers their session ID setup)
    conn.send(JSON.stringify({
      type: 'user-joined',
      sessionId: conn.id,
      color: userColor
    }));

    // Broadcast new user to all other connections
    this.broadcast(JSON.stringify({
      type: 'user-joined',
      sessionId: conn.id,
      color: userColor
    }), [conn.id]); // Exclude the new user

    // Send updated user count to all connections
    this.broadcastUserCount();
  }

  async onMessage(sender: Connection, message: string | ArrayBuffer) {
    try {
      const data = JSON.parse(message as string);

      switch (data.type) {
        case 'identify':
          // Handle persistent user ID
          const existingUser = this.connectedUsers.get(sender.id);
          if (existingUser) {
            existingUser.persistentUserId = data.persistentUserId;

            // Clean up any old sessions with same persistent ID
            this.cleanupOldSessions(data.persistentUserId, sender.id);
          }

          // Send confirmation back to client
          sender.send(JSON.stringify({
            type: 'user-identified',
            sessionId: sender.id
          }));
          break;

        case 'cursor-move':
          // Update cursor position for existing user (user must already exist)
          const user = this.connectedUsers.get(sender.id);
          if (user) {
            user.lastCursorPosition = data.position;
            user.lastCursorNormal = data.normal;

            // Broadcast cursor position to all other connections using the user's assigned color
            this.broadcast(JSON.stringify({
              type: 'cursor-move',
              sessionId: sender.id,
              position: data.position,
              normal: data.normal,
              color: user.color, // Use the user's assigned color, not from client
              rgb: data.rgb
            }), [sender.id]); // Exclude sender
          }
          break;

        case 'cursor-leave':
          // Broadcast cursor leave to all other connections
          this.broadcast(JSON.stringify({
            type: 'cursor-leave',
            sessionId: sender.id
          }), [sender.id]); // Exclude sender
          break;

        case 'user-color-change':
          // Update user's color in server state
          console.log(`User ${sender.id} changed color to:`, data.color);
          const userToUpdate = this.connectedUsers.get(sender.id);
          if (userToUpdate) {
            userToUpdate.color = data.color;

            // Broadcast color change to all connections
            this.broadcast(JSON.stringify({
              type: 'user-color-change',
              sessionId: sender.id,
              color: data.color
            }));
            console.log(`Broadcasted color change for ${sender.id}:`, data.color);
          }
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

    // Remove user from connected users
    this.connectedUsers.delete(connection.id);

    // Send user disconnect event (removes color circle)
    this.broadcast(JSON.stringify({
      type: 'user-disconnect',
      sessionId: connection.id
    }));

    // Update user count
    this.broadcastUserCount();
  }

  private sendExistingUsers(conn: Connection) {
    // Send all existing users to the new connection
    console.log(`sendExistingUsers: ${this.connectedUsers.size} total users, sending to ${conn.id}`);

    for (const [sessionId, user] of this.connectedUsers.entries()) {
      if (sessionId !== conn.id) {
        console.log(`Sending existing user ${sessionId} with color ${user.color} to ${conn.id}`);

        conn.send(JSON.stringify({
          type: 'user-joined',
          sessionId: sessionId,
          color: user.color
        }));

        // If the user has a cursor position, send that too
        if (user.lastCursorPosition && user.lastCursorNormal) {
          conn.send(JSON.stringify({
            type: 'cursor-move',
            sessionId: sessionId,
            position: user.lastCursorPosition,
            normal: user.lastCursorNormal,
            color: user.color
          }));
        }
      }
    }
  }

  private generateRandomColor(): string {
    // Generate a random bright color
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70 + Math.random() * 30; // 70-100%
    const lightness = 50 + Math.random() * 20;  // 50-70%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  private cleanupOldSessions(persistentUserId: string, currentSessionId: string) {
    // Find and remove any old sessions with the same persistent user ID
    const toRemove: string[] = [];

    for (const [sessionId, user] of this.connectedUsers.entries()) {
      if (user.persistentUserId === persistentUserId && sessionId !== currentSessionId) {
        toRemove.push(sessionId);
      }
    }

    // Remove old sessions and notify clients
    toRemove.forEach(sessionId => {
      this.connectedUsers.delete(sessionId);
      this.broadcast(JSON.stringify({
        type: 'user-disconnect',
        sessionId: sessionId
      }));
    });
  }

  private broadcastUserCount() {
    const connections = Array.from(this.getConnections());
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
