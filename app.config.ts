export default defineAppConfig({
  ui: {
    card: {
      slots: {
        root: 'nuxt-card',
        header: 'nuxt-card-header flex',
        footer: 'nuxt-card-footer'
      }
    },
    modal: {
      slots: {
        title: 'text-start',
        content: 'fixed bg-default divide-y divide-default flex flex-col focus:outline-none text-center p-2'
      }
    }
  }
})
