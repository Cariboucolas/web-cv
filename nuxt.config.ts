// https://nuxt.com/docs/api/configuration/nuxt-config
import {defineNuxtConfig} from 'nuxt/config'

export default defineNuxtConfig({
    ssr: false,
    compatibilityDate: '2024-11-01',
    devtools: {enabled: true},
    css: ['vuetify/styles', '~/assets/css/main.css'],
    modules: ['@nuxt/icon'],
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    nitro: {
        output: {
            publicDir: 'dist',
        },
    },
})
