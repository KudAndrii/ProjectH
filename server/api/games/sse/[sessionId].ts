import { defineEventHandler, setResponseHeaders, sendStream } from 'h3';
import { GameSession } from '#shared/types/game-session';
import type { SessionWithClients } from '~/server/plugins/setup-session-store';

// Use the global sessionsStore from the nitro app
const getSessionsStore = () => {
  return useNitroApp().sessionsStore;
};

export default defineEventHandler((event) => {
  const sessionId = event.context.params?.sessionId;
  const sessionsStore = getSessionsStore();
  
  if (!sessionId || !sessionsStore[sessionId]) {
    throw createError({
      statusCode: 404,
      message: 'Session not found',
    });
  }

  // Set headers for SSE
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Create unique client ID
  const clientId = crypto.randomUUID();

  // Create stream and controller
  const stream = new ReadableStream({
    start(controller) {
      // Register this client with the session
      if (!sessionsStore[sessionId].clients) {
        sessionsStore[sessionId].clients = new Set();
      }
      
      sessionsStore[sessionId].clients.add({
        id: clientId,
        controller,
      });

      // Send initial session state
      const initialData = {
        action: 'session-state',
        session: sessionsStore[sessionId].session,
      };
      
      const encodedData = `data: ${JSON.stringify(initialData)}\n\n`;
      controller.enqueue(encodedData);

      // Send keep-alive comment every 30 seconds to prevent connection timeouts
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(": keep-alive\n\n");
        } catch (error) {
          // Connection might be closed already
          clearInterval(keepAliveInterval);
        }
      }, 30000);
  
      // Handle connection close
      event.node.req.on('close', () => {
        // Remove client when connection closes
        if (sessionsStore[sessionId]?.clients) {
          const clients = Array.from(sessionsStore[sessionId].clients);
          const clientToRemove = clients.find(c => c.id === clientId);
          if (clientToRemove) {
            sessionsStore[sessionId].clients.delete(clientToRemove);
          }
        }
        clearInterval(keepAliveInterval);
      });
      
      // Also handle end event
      event.node.req.on('end', () => {
        // Remove client when connection ends
        if (sessionsStore[sessionId]?.clients) {
          const clients = Array.from(sessionsStore[sessionId].clients);
          const clientToRemove = clients.find(c => c.id === clientId);
          if (clientToRemove) {
            sessionsStore[sessionId].clients.delete(clientToRemove);
          }
        }
        clearInterval(keepAliveInterval);
      });
    }
  });

  return sendStream(event, stream);
});
