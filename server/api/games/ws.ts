// This file is no longer needed as we've replaced WebSockets with SSE
export default defineEventHandler(() => {
  return {
    statusCode: 301,
    statusMessage: 'Moved Permanently',
    headers: {
      Location: '/api/games'
    }
  }
})
