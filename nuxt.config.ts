import { defineNuxtConfig } from 'nuxt/config'
import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  css: ['vuetify/styles', '~/assets/css/main.css'],
  modules: ['@nuxt/icon', '@nuxtjs/tailwindcss', '@nuxtjs/i18n'],

  build: {
    transpile: ['vuetify'],
  },

  hooks: {
    'vite:extendConfig': (config) => {
      config.plugins?.push(vuetify({ autoImport: true }))
    },
  },

  plugins: ['~/plugins/vuetify'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  app: {
    head: {
      title: 'Colas Durcy - Full-Stack Developer',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Portfolio professionnel et CV' },
      ],
      link: [
        // Le PNG 32px est préféré par les navigateurs modernes, l'ICO reste le repli.
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32.png',
        },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
        // Les polices étaient importées depuis un <style scoped> de
        // pages/index.vue : chargées en cascade après la feuille de
        // styles, donc en requête série et avec un flash de texte non
        // stylé. Déclarées ici, elles partent dès le parsing du head.
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        { rel: 'preconnect', href: 'https://fonts.cdnfonts.com' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.cdnfonts.com/css/mona-sans',
        },
      ],
      script: [
        {
          // Amorçage de l'apparition au défilement. Le CSS ne masque les
          // éléments à révéler que si cette classe est présente : elle n'est
          // posée que lorsque le navigateur sait observer ET que l'utilisateur
          // n'a pas demandé moins d'animation. Sans JavaScript, la classe
          // n'arrive jamais et la page s'affiche entière.
          //
          // Inline et dans le <head> à dessein : exécuté avant le premier
          // rendu, il évite que le contenu se montre puis disparaisse.
          innerHTML:
            "if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js-reveal')",
          tagPosition: 'head',
        },
      ],
    },
  },

  compatibilityDate: '2025-01-18',

  // @ts-expect-error - i18n types are augmented by @nuxtjs/i18n module at runtime
  i18n: {
    locales: [
      {
        code: 'fr',
        iso: 'fr-FR',
        file: 'fr.json',
        name: 'Français',
      },
      {
        code: 'en',
        iso: 'en-US',
        file: 'en.json',
        name: 'English',
      },
    ],
    defaultLocale: 'fr',
    langDir: 'locales',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
    lazy: false,
  },
})
