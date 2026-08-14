/**
 * Publication des deux CV PDF sur Firebase Storage, depuis le Doc CV.
 *
 * Ce script ne tourne pas dans ce dépôt : il s'exécute chez Google, lié au
 * document Google Docs où le CV s'écrit. Il vit ici parce que sa première
 * version n'existait que dans le Drive et avait fini par être oubliée — voir
 * docs/adr/0001-publication-du-cv-depuis-google-docs.md.
 *
 * Les identifiants de document n'ont pas leur place ici : ce dépôt est public.
 * Ils vivent en Script Properties, sous les noms déclarés ci-dessous, et le
 * script échoue en les nommant plutôt que de publier à moitié.
 */

/** Bucket du Site CV. Publiquement lisible, d'où des URL stables sans jeton. */
const BUCKET_NAME = 'cv-portfolio-b023a.appspot.com'

/**
 * Les deux langues publiées, dans l'ordre où elles partent.
 *
 * `objectPath` est l'adresse d'écriture du CV PDF. Le Site CV porte les
 * adresses de lecture correspondantes dans son composant d'en-tête
 * (molecules/HeaderBar) : elles doivent désigner les mêmes objets, et rien ne
 * peut le vérifier automatiquement puisqu'elles vivent dans deux runtimes
 * distincts. Toute modification d'un chemin doit être répercutée là-bas dans le
 * même changement.
 *
 * Le suffixe de langue est ce qui permet aux deux CV PDF de coexister. Un
 * chemin unique ferait viser le même objet aux deux Doc CV, et le dernier envoi
 * écraserait l'autre en silence.
 *
 * `downloadFileName` est le nom que le fichier portera dans les téléchargements
 * du visiteur, et non dans le bucket. Il reste en ASCII : un en-tête HTTP
 * transporte mal autre chose, et le `filename*` qui le permettrait n'apporte
 * rien ici.
 */
const CV_LANGUAGES = [
  {
    label: 'français',
    documentIdProperty: 'CV_DOC_ID_FR',
    objectPath: 'cv/cv-colas-durcy-fr.pdf',
    downloadFileName: 'CV Colas Durcy (FR).pdf',
  },
  {
    label: 'anglais',
    documentIdProperty: 'CV_DOC_ID_EN',
    objectPath: 'cv/cv-colas-durcy-en.pdf',
    downloadFileName: 'CV Colas Durcy (EN).pdf',
  },
]

/**
 * Trigger simple appelé par Google à l'ouverture du document. C'est le seul
 * contexte où une UI de document existe : l'exécuter à la main depuis
 * l'éditeur échoue avec « Cannot call DocumentApp.getUi() from this context ».
 */
// biome-ignore lint/correctness/noUnusedVariables: point d'entrée appelé par Google, pas par le code
function onOpen() {
  DocumentApp.getUi()
    .createMenu('CV Export')
    .addItem(
      'Exporter les deux CV PDF vers Firebase Storage',
      'exportToFirebase',
    )
    .addToUi()
}

/**
 * Exporte les deux Doc CV en PDF et les pousse sur le bucket du site.
 *
 * Les deux lectures d'abord, les deux envois ensuite : c'est ce qui rend la
 * publication atomique en pratique. Cloud Storage n'offre aucun commit à deux
 * phases, donc le seul levier est de ramener avant le premier octet envoyé tout
 * ce qui peut échouer — identifiant absent, Doc CV introuvable ou vide. Ce sont
 * les pannes qui arrivent réellement, et aucune ne peut plus publier une langue
 * sans l'autre.
 *
 * Reste le cas irréductible : un second envoi refusé après un premier accepté
 * laisse une langue en ligne, sans rollback possible. Il n'est pas masqué —
 * aucun succès n'est annoncé et le message nomme la langue fautive. Relancer
 * l'export republie les deux, l'envoi étant idempotent.
 *
 * Le script ne travaille pas sur le document actif : les deux Doc CV sont visés
 * par identifiant, quel que soit celui depuis lequel le menu a été déclenché.
 */
// biome-ignore lint/correctness/noUnusedVariables: référencée par la chaîne passée à addItem ci-dessus
function exportToFirebase() {
  const userInterface = DocumentApp.getUi()

  try {
    const publications = CV_LANGUAGES.map(readCvPdf)
    publications.forEach(uploadCvPdf)

    userInterface.alert(
      'Les CV PDF français et anglais ont été exportés sur Firebase Storage !',
    )
  } catch (error) {
    userInterface.alert(`Erreur: ${error.message}`)
  }
}

/**
 * Lit le Doc CV d'une langue et en produit le CV PDF, sans rien publier.
 *
 * Chaque échec nomme la langue : c'est le seul indice dont dispose le
 * propriétaire, les deux langues suivant le même chemin de code.
 */
function readCvPdf(language) {
  const documentId = PropertiesService.getScriptProperties().getProperty(
    language.documentIdProperty,
  )

  if (!documentId) {
    throw new Error(
      `identifiant du Doc CV ${language.label} absent des Script Properties (${language.documentIdProperty})`,
    )
  }

  let cvDocument

  try {
    cvDocument = DocumentApp.openById(documentId)
  } catch (error) {
    throw new Error(
      `Doc CV ${language.label} introuvable (${language.documentIdProperty}) : ${error.message}`,
    )
  }

  // Le vide se constate sur le Doc CV, pas sur son export : un document vide
  // s'exporte en une page blanche, soit un PDF de plusieurs kilo-octets qu'un
  // contrôle de taille laisserait passer.
  if (cvDocument.getBody().getText().trim() === '') {
    throw new Error(`Doc CV ${language.label} vide`)
  }

  const pdfBlob = DriveApp.getFileById(documentId).getAs('application/pdf')

  if (pdfBlob.getBytes().length === 0) {
    throw new Error(`CV PDF ${language.label} vide après export`)
  }

  return { language, pdfBlob }
}

/** Envoie un CV PDF déjà produit à son adresse, et lève si Storage refuse. */
function uploadCvPdf(publication) {
  const { language, pdfBlob } = publication

  // `uploadType=multipart` plutôt que `media` : c'est le seul mode qui pose
  // des métadonnées en même temps que le contenu, et `contentDisposition`
  // est le seul levier qui transforme le clic en téléchargement — l'attribut
  // HTML `download` étant ignoré d'une origine à l'autre. En multipart, le
  // chemin de l'objet se déclare dans les métadonnées et non plus dans
  // l'URL.
  const objectMetadata = {
    name: language.objectPath,
    contentType: 'application/pdf',
    contentDisposition: `attachment; filename="${language.downloadFileName}"`,
  }

  // Un UUID écarte le seul vrai risque du multipart : une frontière qui se
  // retrouverait telle quelle dans les octets du PDF couperait le corps au
  // mauvais endroit.
  const partBoundary = `cv-export-${Utilities.getUuid()}`
  const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${BUCKET_NAME}/o?uploadType=multipart`

  // Le corps se construit en octets, jamais en chaîne : un PDF traversé par
  // une conversion en texte revient corrompu. `getBytes()` rend un tableau
  // de nombres sous V8, d'où la concaténation.
  const requestBody = Utilities.newBlob(
    `--${partBoundary}\r\n` +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      `${JSON.stringify(objectMetadata)}\r\n` +
      `--${partBoundary}\r\n` +
      'Content-Type: application/pdf\r\n\r\n',
  )
    .getBytes()
    .concat(pdfBlob.getBytes())
    .concat(Utilities.newBlob(`\r\n--${partBoundary}--`).getBytes())

  const response = UrlFetchApp.fetch(uploadUrl, {
    method: 'POST',
    contentType: `multipart/related; boundary=${partBoundary}`,
    payload: requestBody,
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
  })

  // Cette branche n'est presque jamais atteinte : sans
  // `muteHttpExceptions: true`, UrlFetchApp lève sur tout code non-2xx et
  // l'erreur remonte au `catch` de l'appelant, qui n'en reçoit qu'un extrait
  // tronqué — de quoi reconnaître un rejet de Cloud Storage, pas de quoi le
  // lire en entier. Le défaut est conservé : c'est la relecture après envoi
  // qui reprendra ce filet, et elle seule.
  if (response.getResponseCode() !== 200) {
    throw new Error(
      `envoi du CV PDF ${language.label} refusé : ${response.getContentText()}`,
    )
  }
}
