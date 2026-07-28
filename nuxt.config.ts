import {defineNuxtConfig} from 'nuxt/config'
import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
    ssr: true,
    devtools: {enabled: true},
    css: ['vuetify/styles', '~/assets/css/main.css'],
    modules: ['@nuxt/icon', '@nuxtjs/tailwindcss', '@nuxtjs/i18n'],

    build: {
        transpile: ['vuetify'],
    },

    hooks: {
        'vite:extendConfig': (config) => {
            config.plugins?.push(vuetify({autoImport: true}))
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
                {charset: 'utf-8'},
                {name: 'viewport', content: 'width=device-width, initial-scale=1'},
                {name: 'description', content: 'Portfolio professionnel et CV'},
            ],
            link: [
                // Le PNG 32px est préféré par les navigateurs modernes, l'ICO reste le repli.
                {
                    rel: 'icon',
                    type: 'image/png',
                    sizes: '32x32',
                    href: '/favicon-32.png',
                },
                {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
                {
                    rel: 'apple-touch-icon',
                    sizes: '180x180',
                    href: '/apple-touch-icon.png',
                },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
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
