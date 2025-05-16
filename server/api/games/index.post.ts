import { defineEventHandler, readBody } from 'h3';
import { makeMove as makeGameMove } from '#shared/utils/make-move';

// Get the global sessions store
const getSessionsStore = () => {
  return useNitroApp().sessionsStore;
};

const generateCode = () => {
  const array = new Uint8Array(6); // Create an array with space for 6 random numbers
  crypto.getRandomValues(array); // Populate the array with cryptographically secure random values
  return Array.from(array, (value) => String.fromCharCode(65 + (value % 26))).join('');
}

type ActionResult = {
  action: string;
  [key: string]: any;
};

interface GameActionHandler {
  (data: any): ActionResult;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { action, data } = body;
  
  let actionResult: ActionResult;

  try {
    switch (action) {
      case 'create-room':
        actionResult = createRoom(data);
        break;

      case 'join-room':
        actionResult = joinRoom(data);
        break;

      case 'make-move':
        actionResult = makeMove(data);
        // Broadcast to all clients in the session
        broadcastToSession(data.sessionId, actionResult);
        break;

      case 'restart':
        actionResult = restart(data);
        // Broadcast to all clients in the session
        broadcastToSession(data.sessionId, actionResult);
        break;

      case 'end-session':
        actionResult = endSession(data);
        // Broadcast to all clients before removing
        broadcastToSession(data.sessionId, actionResult);
        break;

      default:
        throw new Error('Unknown action');
    }
  } catch (error) {
    console.error(error);
    return {
      action: 'error',
      message: (error as Error).message
    };
  }

  return actionResult;
});

const createRoom: GameActionHandler = (data) => {
  const sessionsStore = getSessionsStore();
  const sessionsCount = Object.keys(sessionsStore).length;
  const config = useRuntimeConfig();

  if (sessionsCount >= config.sessionsLimit) {
    throw new Error('Server is full, try again later');
  }

  const sessionId = generateCode();
  
  // Create new session
  sessionsStore[sessionId] = {
    session: {
      sessionStarted: false,
      fieldRules: data.fieldRules,
      gameFeatures: data.gameFeatures,
      currentMove: 'cross',
      points: [],
      winner: undefined
    },
    clients: new Set()
  };

  return { action: 'room-created', sessionId };
};

const joinRoom: GameActionHandler = (data) => {
  const sessionsStore = getSessionsStore();
  const sessionEntry = sessionsStore[data.sessionId];
  
  if (!sessionEntry) {
    throw new Error('Room does not exist');
  }
  
  const session = sessionEntry.session;

  if (session.sessionStarted) {
    throw new Error('Room is full');
  }

  session.sessionStarted = true;

  return { action: 'room-joined', session };
};

const makeMove: GameActionHandler = (data) => {
  const sessionsStore = getSessionsStore();
  const sessionEntry = sessionsStore[data.sessionId];
  
  if (!sessionEntry) {
    throw new Error('Room does not exist');
  }
  
  const session = sessionEntry.session;

  const { x, y } = data.move;
  const newPoint = { X: x, Y: y, player: session.currentMove };
  const moveResults = makeGameMove(
    newPoint, 
    session.points, 
    session.gameFeatures, 
    session.fieldRules.pointsInRowToWin
  );

  session.points = moveResults.updatedPoints;
  session.winner = moveResults.winner;
  session.currentMove = moveResults.nextTurn;

  return { action: 'move-made', session };
};

const restart: GameActionHandler = (data) => {
  const sessionsStore = getSessionsStore();
  const sessionEntry = sessionsStore[data.sessionId];
  
  if (!sessionEntry) {
    throw new Error('Room does not exist');
  }
  
  const session = sessionEntry.session;

  session.currentMove = 'cross';
  session.points = [];
  session.winner = undefined;

  return { action: 'restarted', session };
};

const endSession: GameActionHandler = (data) => {
  const sessionsStore = getSessionsStore();
  
  if (!(data.sessionId in sessionsStore)) {
    throw new Error('Room does not exist');
  }

  // Remove session after sending the end notification
  setTimeout(() => {
    const store = getSessionsStore();
    delete store[data.sessionId];
  }, 500);

  return { action: 'session-ended', sessionId: data.sessionId };
};

// Helper function to broadcast updates to all clients in a session
function broadcastToSession(sessionId: string, data: any) {
  const sessionsStore = getSessionsStore();
  const sessionEntry = sessionsStore[sessionId];
  if (!sessionEntry || !sessionEntry.clients) return;

  console.log(`Broadcasting to ${sessionEntry.clients.size} clients in session ${sessionId}`);
  const encodedData = `data: ${JSON.stringify(data)}\n\n`;
  
  // Convert to array to safely remove during iteration
  const clientsToRemove: string[] = [];
  
  sessionEntry.clients.forEach(client => {
    try {
      client.controller.enqueue(encodedData);
    } catch (error) {
      console.error('Error sending to client:', error);
      // Mark this client for removal
      clientsToRemove.push(client.id);
    }
  });
  
  // Clean up any disconnected clients
  if (clientsToRemove.length > 0) {
    clientsToRemove.forEach(id => {
      const clientToRemove = Array.from(sessionEntry.clients).find(c => c.id === id);
      if (clientToRemove) {
        sessionEntry.clients.delete(clientToRemove);
      }
    });
    console.log(`Removed ${clientsToRemove.length} disconnected clients`);
  }
}
