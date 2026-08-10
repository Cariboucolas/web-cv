import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  // Depuis le retrait de `@nuxtjs/tailwindcss`, plus personne ne dérive ces
  // chemins de `srcDir` : Tailwind les lit lui-même via PostCSS, résolus
  // depuis la racine du projet, où ces globs relatifs sont corrects.
  // Un glob qui ne matche rien vide la feuille sans lever d'erreur : toute
  // modification ici se vérifie sur les marqueurs du CSS produit.
  content: [
    './app/pages/**/*.{vue,js,ts}',
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.{vue,js,ts}',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['InterVariable', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        background: '#000000', // Utilisez la couleur de fond de votre thème Vuetify
      },
    },
  },
  plugins: [],
} satisfies Config
