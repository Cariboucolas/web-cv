/**
 * Un projet de la vitrine, tel que `ProjectsSection` le déclare et que
 * `ProjectModal` le reçoit.
 *
 * Le type vivait en double, recopié dans chacun des deux composants : Nuxt
 * auto-importe les composants mais pas les types, donc la voie de moindre
 * résistance était de dupliquer. Les deux copies avaient déjà commencé à
 * diverger sur leur documentation, sans que `pnpm typecheck` puisse s'en
 * plaindre — chacune restait cohérente localement.
 */
export interface Project {
  key: string
  /** Logo de marque, prioritaire sur `icon`. */
  logo?: string
  /** Fond du carré, quand le logo ne tient pas sur le fond sombre par défaut. */
  logoBg?: string
  /** Icône material-symbols, affichée à défaut de logo. */
  icon?: string
  /**
   * Chemins sans suffixe ni extension : `ProjectShowcase` construit le srcset.
   * Les variantes attendues sont 380/570 en portrait et 560/940 en paysage —
   * un projet ajouté avec des largeurs qui ne correspondent pas tombe en 404
   * silencieux.
   */
  images: string[]
  technologies: string[]
  link: string
  orientation: 'portrait' | 'landscape'
}
