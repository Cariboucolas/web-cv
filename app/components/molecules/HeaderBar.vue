<template>
  <header class="page-header">
    <div class="header-content">
      <!-- L'ordre des ancres suit celui des sections dans index.vue : une
           navigation qui annonce un ordre que la page ne tient pas force le
           lecteur à chercher. -->
      <a href="#experiences" class="header-link">{{ $t('experiences.title') }}</a>
      <span class="header-separator">•</span>
      <a href="#projects" class="header-link">{{ $t('projects.title') }}</a>
      <span class="header-separator">•</span>
      <a href="#skills" class="header-link">{{ $t('skills.title') }}</a>
      <span class="header-separator">•</span>
      <a href="#about" class="header-link">{{ $t('about.title') }}</a>
    </div>
    <div class="header-actions">
      <!-- Deux actions seulement, et cette contrainte tient : un lien de
           téléchargement par langue dupliquerait ce que la bascule dit déjà,
           et laisserait le visiteur choisir une langue de document distincte
           de celle qu'il lit. La cible suit la locale ; elle ne s'ajoute pas
           à côté. Les liens vers les profils, eux, vivent dans ProfileSection :
           ces actions-ci portent sur le document, pas sur la personne.

           Pas de `target="_blank"` : cette action rapporte un fichier, et un
           téléchargement ouvert dans un onglet y laisse une page vide que le
           visiteur doit refermer. C'est l'objet publié qui porte
           `content-disposition: attachment` — l'attribut HTML `download`
           serait ignoré, le fichier venant d'une autre origine. -->
      <a :href="cvDownloadUrl" class="header-social">
        <Icon name="material-symbols:download" size="16"/>
      </a>
      <AtomsLanguageIndicator :lang="currentLang" @click="toggleLanguage"/>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/** Les deux langues du site. Nommée pour que la bascule, l'indicateur et le
    lien de téléchargement s'accordent sur le même jeu plutôt que de le
    réécrire chacun de leur côté. */
type Locale = 'fr' | 'en'

const { locale } = useI18n()

const currentLang = computed(() => locale.value as Locale)

const toggleLanguage = () => {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
}

/** Bucket du Site CV. Publiquement lisible, d'où des URL stables sans jeton. */
const CV_BUCKET = 'cv-portfolio-b023a.appspot.com'

/**
 * Adresses de lecture des deux CV PDF. Le script de publication
 * (scripts/apps-script/Export_to_cloud_storage.js) porte les adresses
 * d'écriture correspondantes : les deux jeux désignent les mêmes objets, et
 * rien ne peut le vérifier automatiquement puisqu'ils vivent dans deux
 * runtimes distincts. Déplacer l'un sans l'autre laisse ce bouton sur un 404.
 */
const CV_OBJECT_PATHS: Record<Locale, string> = {
  fr: 'cv/cv-colas-durcy-fr.pdf',
  en: 'cv/cv-colas-durcy-en.pdf',
}

/**
 * La cible est dérivée de la locale, et non fixée au chargement : le visiteur
 * qui bascule en anglais doit repartir avec le CV anglais, sans rechargement.
 * C'est un `computed` pour cette raison — une constante calculée une fois
 * laisserait le lien sur la langue d'arrivée.
 */
const cvDownloadUrl = computed(
  () =>
    `https://firebasestorage.googleapis.com/v0/b/${CV_BUCKET}/o/${encodeURIComponent(CV_OBJECT_PATHS[currentLang.value])}?alt=media`,
)
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 50px;
  padding-top: 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 20px;
}

.header-link {
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-transform: none;
  text-decoration: none;
  transition: color 0.2s ease;
}

.header-separator {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  user-select: none;
}

.header-link:hover {
  color: #42b883;
}

.header-social {
  width: 40px;
  height: 40px;
  background: #161616;
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all 0.2s ease;
}

.header-social:hover {
  background: #222222;
  border-color: rgba(255, 255, 255, 0.25);
  color: #42b883;
}

@media (max-width: 900px) {
  .header-link {
    font-size: 12px;
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    height: auto;
    gap: 10px;
    align-items: flex-end;
  }

  .header-content {
    gap: 5px;
    justify-content: flex-end;
  }

  .header-link {
    font-size: 11px;
    letter-spacing: 0;
  }

  .header-separator {
    font-size: 8px;
  }

  .header-actions {
    padding-left: 0;
  }

}
</style>
