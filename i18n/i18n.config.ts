import en from './locales/en.json'
import fr from './locales/fr.json'

/**
 * Les messages sont fournis à la compilation plutôt que chargés à la demande.
 *
 * Depuis i18n 10, le chargement différé s'applique à toutes les locales sans
 * pouvoir être désactivé, et les fichiers sont retirés du bundle. Sur un site
 * généré en statique avec `strategy: 'no_prefix'`, il n'existe qu'une seule
 * URL et aucun serveur pour livrer les messages : seule la locale rendue au
 * prérendu arrivait au navigateur. Basculer en anglais affichait donc les clés
 * brutes (`profile.title` au lieu du texte).
 *
 * Les deux fichiers pèsent 9 Ko chacun : les embarquer coûte moins cher qu'une
 * requête, et supprime la dépendance à un chargement qui n'a pas lieu.
 */
export default defineI18nConfig(() => ({
  legacy: false,
  messages: { fr, en },
}))
