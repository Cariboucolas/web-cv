import path from 'node:path'
import {defineNuxtConfig} from 'nuxt/config'

export default defineNuxtConfig({
    ssr: true,
    devtools: {enabled: true},
    css: ['vuetify/styles', '~/assets/css/main.css'],
    modules: ['@nuxt/icon', '@nuxtjs/tailwindcss', '@nuxtjs/i18n'],

    build: {
        transpile: ['vuetify'],
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
            title: 'Mon CV - Portfolio',
            meta: [
                {charset: 'utf-8'},
                {name: 'viewport', content: 'width=device-width, initial-scale=1'},
                {name: 'description', content: 'Portfolio professionnel et CV'},
            ],
            link: [
                {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
                },
            ],
        },
    },

    vite: {
        resolve: {
            alias: {
                '#app-manifest': path.resolve(__dirname, 'src/app-manifest'),
            },
        },
    },

    compatibilityDate: '2025-01-18',

    i18n: {
        locales: [
            { 
                code: 'fr', 
                iso: 'fr-FR', 
                file: 'fr.json',
                name: 'Français'
            },
            { 
                code: 'en', 
                iso: 'en-US', 
                file: 'en.json',
                name: 'English'
            }
        ],
        defaultLocale: 'fr',
        langDir: 'locales',
        strategy: 'no_prefix',
        detectBrowserLanguage: false,
        lazy: false,
    },
})
