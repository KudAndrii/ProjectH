export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const sessionsStore = useNitroApp().sessionsStore

  if (body.sessionId in sessionsStore) {
    // Remove the session after sending the end notification
    setTimeout(() => {
      const store = useNitroApp().sessionsStore
      delete store[body.sessionId]
    }, 500)
  }
})