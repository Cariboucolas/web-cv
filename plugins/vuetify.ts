import { defineNuxtPlugin } from 'nuxt/app'
import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'dark',
      themes: {
        dark: {
          colors: {
            primary: '#42b883',
            secondary: '#35495e',
          },
        },
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
