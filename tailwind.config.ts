import type {Config} from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
    // Pas de `content` ici : le module @nuxtjs/tailwindcss dérive déjà les
    // chemins de `srcDir`, en absolu, et les recalcule donc tout seul après le
    // déménagement vers `app/`. Les redéclarer en relatif les faisait résoudre
    // depuis `.nuxt/tailwind/`, où ils ne matchaient rien — et le merger les
    // faisait gagner sur la détection correcte du module, vidant la feuille
    // sans la moindre erreur de build.
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
    // `content` est volontairement absent (voir plus haut), or le type `Config`
    // l'exige : on le retire du contrat plutôt que de déclarer une liste vide,
    // qui entrerait en concurrence avec celle du module au moment de la fusion.
} satisfies Omit<Config, 'content'>
