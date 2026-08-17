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
 * Poids au-delà duquel un CV PDF est signalé — sans que rien ne s'arrête.
 *
 * Un seuil qui bloque doit protéger d'une faute, pas d'un choix : un CV PDF
 * lourd reste parfaitement valide, et refuser de le publier interdirait la mise
 * à jour d'un soir de presse pour une raison esthétique.
 *
 * 750 Ko laisse passer les deux CV PDF actuels, qui pèsent environ 505 Ko pour
 * deux pages, l'export Google Docs embarquant les polices.
 *
 * Un seuil placé juste sous eux a d'abord été essayé, pour que l'avertissement
 * rappelle qu'ils gagneraient à être allégés. Constat en production : il se
 * déclenchait deux fois à chaque publication, juste au-dessus du rappel de
 * repasser le Site CV. Un avertissement qui s'affiche toujours cesse d'être lu,
 * et emporte avec lui la ligne qui devait l'être. Le signal doit rester rare
 * pour rester un signal : à 750 Ko il désigne un accident — une image collée en
 * pleine page, une police doublée — et non l'état normal du fichier.
 */
const HEAVY_CV_PDF_THRESHOLD_BYTES = 750 * 1024

/** Annonce de succès, affichée seulement après relecture des deux objets. */
const SUCCESS_HEADLINE =
  'Les CV PDF français et anglais ont été publiés sur Firebase Storage, puis relus à leur adresse.'

/**
 * Rappel affiché après chaque succès.
 *
 * Le Site CV est le reflet du Doc CV, et aucun contrôle automatisé ne peut
 * constater une divergence de faits entre les deux. Le seul moment où ce
 * rappel a une chance d'être suivi est celui-ci : le nouveau CV PDF vient
 * d'être publié, et son Doc CV est encore sous les yeux de son auteur.
 */
const SITE_CV_REMINDER =
  'Rappel : repasser le Site CV au regard du nouveau Doc CV. Les deux doivent énoncer les mêmes faits — dates, intitulés, expériences — et rien ne peut le vérifier à ta place.'

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
 *
 * Le succès n'est annoncé qu'après relecture des deux objets publiés. Un code
 * retour 200 ne dit que « la requête a été acceptée », et c'est sur cette
 * confiance que la panne d'origine est passée inaperçue six mois durant : ce
 * qu'il faut constater, c'est ce qui est en ligne.
 */
// biome-ignore lint/correctness/noUnusedVariables: référencée par la chaîne passée à addItem ci-dessus
function exportToFirebase() {
  const userInterface = DocumentApp.getUi()

  try {
    const publications = CV_LANGUAGES.map(readCvPdf)
    publications.forEach(uploadCvPdf)
    const publishedCvPdfs = publications.map(verifyPublishedCvPdf)

    userInterface.alert(buildSuccessMessage(publishedCvPdfs))
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
  const exportedSizeInBytes = pdfBlob.getBytes().length

  if (exportedSizeInBytes === 0) {
    throw new Error(`CV PDF ${language.label} vide après export`)
  }

  // Le poids est retenu ici plutôt que recalculé à la relecture : `getBytes()`
  // recopie le blob à chaque appel, et c'est un demi-mégaoctet. Il sert de
  // référence au contrôle de taille, et c'est la lecture du Doc CV qui le
  // produit — pas l'envoi, dont la relecture ne croit rien sur parole.
  return { language, pdfBlob, exportedSizeInBytes }
}

/**
 * L'en-tête qui fait d'un clic un téléchargement, pour une langue donnée.
 *
 * Une seule définition, parce que l'envoi la pose et la relecture l'attend :
 * deux littéraux tenus de concorder finiraient par diverger, et la relecture
 * cesserait alors de constater quoi que ce soit.
 */
function buildContentDisposition(language) {
  return `attachment; filename="${language.downloadFileName}"`
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
    contentDisposition: buildContentDisposition(language),
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

  // `muteHttpExceptions: true` rend la main sur les codes non-2xx au lieu de
  // lever. Sans lui, UrlFetchApp jette une erreur dont le message ne porte
  // qu'un extrait tronqué de la réponse : de quoi reconnaître un rejet de
  // Cloud Storage, pas de quoi le lire. La branche ci-dessous devient donc
  // réellement atteignable, et rapporte le motif en entier.
  const response = UrlFetchApp.fetch(uploadUrl, {
    method: 'POST',
    contentType: `multipart/related; boundary=${partBoundary}`,
    payload: requestBody,
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    muteHttpExceptions: true,
  })

  if (response.getResponseCode() !== 200) {
    throw new Error(
      `envoi du CV PDF ${language.label} refusé (${response.getResponseCode()}) : ${response.getContentText()}`,
    )
  }
}

/**
 * Relit un CV PDF à son adresse et lève si ce qui s'y trouve n'est pas ce qui
 * devait y être publié. Rend le poids constaté, dont le message de succès tire
 * son éventuel avertissement.
 *
 * Tout ce que la fonction affirme vient de ce que Cloud Storage renvoie,
 * confronté à deux références qui ne doivent rien à l'envoi : `CV_LANGUAGES`
 * pour l'adresse et les en-têtes voulus, et le poids relevé à la lecture du
 * Doc CV. La relecture ne croit sur parole aucune étape qu'elle contrôle.
 *
 * La relecture interroge l'API JSON de Cloud Storage plutôt que l'URL de
 * téléchargement du Site CV : celle-ci passe par un autre service, qui remappe
 * les en-têtes au passage, alors que l'API rend les métadonnées **telles
 * qu'elles sont stockées**. C'est bien l'objet écrit qu'on veut constater, pas
 * la façon dont un intermédiaire le sert. Ces lectures sont fortement
 * cohérentes après écriture : rien à attendre entre l'envoi et le contrôle.
 *
 * Chaque échec nomme la langue, comme à la lecture : les deux langues suivent
 * le même chemin de code, et c'est le seul indice dont dispose le
 * propriétaire.
 */
function verifyPublishedCvPdf(publication) {
  const { language, exportedSizeInBytes } = publication

  // Le chemin de l'objet est un segment d'URL, pas une arborescence : ses
  // barres obliques doivent partir encodées, sans quoi l'API lit un objet
  // nommé « cv » dans un dossier qui n'existe pas.
  const metadataUrl = `https://storage.googleapis.com/storage/v1/b/${BUCKET_NAME}/o/${encodeURIComponent(language.objectPath)}`

  const response = UrlFetchApp.fetch(metadataUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    muteHttpExceptions: true,
  })

  if (response.getResponseCode() !== 200) {
    throw new Error(
      `relecture du CV PDF ${language.label} impossible (${response.getResponseCode()}) : ${response.getContentText()}`,
    )
  }

  let publishedObject

  try {
    publishedObject = JSON.parse(response.getContentText())
  } catch (error) {
    throw new Error(
      `relecture du CV PDF ${language.label} illisible : ${error.message}`,
    )
  }

  if (publishedObject.contentType !== 'application/pdf') {
    throw new Error(
      `CV PDF ${language.label} publié avec le type « ${publishedObject.contentType} » au lieu de application/pdf`,
    )
  }

  // Deux branches plutôt qu'une, parce que l'absence et la divergence n'ont ni
  // la même cause ni le même remède : un en-tête absent est une publication
  // passée à côté de ses métadonnées, un en-tête qui diffère est une langue qui
  // en a écrasé une autre.
  //
  // La seconde branche compare la valeur exacte, et pas seulement la présence
  // de l'en-tête : c'est ce qui distingue deux objets distincts d'un même objet
  // servi sous deux chemins. Si l'anglais avait écrasé le français, le chemin
  // français répondrait ici avec le nom de fichier anglais.
  const expectedContentDisposition = buildContentDisposition(language)

  if (!publishedObject.contentDisposition) {
    throw new Error(
      `CV PDF ${language.label} publié sans contentDisposition : un clic sur le Site CV l'ouvrirait dans un onglet au lieu de le télécharger`,
    )
  }

  if (publishedObject.contentDisposition !== expectedContentDisposition) {
    throw new Error(
      `CV PDF ${language.label} publié avec « ${publishedObject.contentDisposition} » au lieu de « ${expectedContentDisposition} » : un clic sur le Site CV n'y déposerait pas le bon fichier`,
    )
  }

  // `size` arrive en chaîne : l'API JSON de Cloud Storage sérialise les
  // entiers 64 bits en texte pour ne pas les tronquer. `Number.isFinite`
  // écarte du même geste la propriété absente, que la comparaison seule
  // laisserait passer pour un objet valide.
  const sizeInBytes = Number(publishedObject.size)

  if (!Number.isFinite(sizeInBytes) || sizeInBytes <= 0) {
    throw new Error(
      `CV PDF ${language.label} publié vide (taille annoncée : ${publishedObject.size})`,
    )
  }

  // Le contrôle le plus fort du lot, et le seul qui regarde le contenu plutôt
  // que son étiquette : un multipart dont la frontière couperait le corps au
  // mauvais endroit publierait un PDF tronqué, de type et d'en-tête
  // irréprochables. L'égalité est exacte, aucune tolérance n'ayant de sens —
  // Cloud Storage stocke les octets reçus tels quels, l'objet ne portant pas
  // de `contentEncoding` qui autoriserait une recompression au passage.
  if (sizeInBytes !== exportedSizeInBytes) {
    throw new Error(
      `CV PDF ${language.label} publié tronqué ou altéré : ${sizeInBytes} octets en ligne pour ${exportedSizeInBytes} octets exportés`,
    )
  }

  return { language, sizeInBytes }
}

/**
 * Compose le message de succès : l'annonce, les éventuels avertissements de
 * poids, puis le rappel de repasser le Site CV.
 *
 * Le rappel ferme le message plutôt que de l'ouvrir : il porte l'action qui
 * reste à faire, et c'est la dernière ligne qu'on relit avant de fermer une
 * boîte de dialogue.
 */
function buildSuccessMessage(publishedCvPdfs) {
  const heavyCvPdfWarnings = publishedCvPdfs
    .filter(
      (publishedCvPdf) =>
        publishedCvPdf.sizeInBytes > HEAVY_CV_PDF_THRESHOLD_BYTES,
    )
    .map(describeHeavyCvPdf)

  return [SUCCESS_HEADLINE, ...heavyCvPdfWarnings, SITE_CV_REMINDER].join(
    '\n\n',
  )
}

/** Formule l'avertissement de poids, en disant que rien n'a été suspendu. */
function describeHeavyCvPdf(publishedCvPdf) {
  return `⚠ Le CV PDF ${publishedCvPdf.language.label} pèse ${formatKilobytes(publishedCvPdf.sizeInBytes)}, au-delà du seuil de ${formatKilobytes(HEAVY_CV_PDF_THRESHOLD_BYTES)}. Il est publié quand même : c'est un signalement, pas un refus.`
}

/** Un poids en octets, rendu lisible dans un message destiné à un humain. */
function formatKilobytes(sizeInBytes) {
  return `${Math.round(sizeInBytes / 1024)} Ko`
}
