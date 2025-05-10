export default defineAppConfig({
  ui: {
    card: {
      slots: {
        header: 'card-header'
      }
    },
    modal: {
      slots: {
        content: 'fixed bg-default divide-y divide-default flex flex-col focus:outline-none text-center p-2'
      }
    }
  }
})
