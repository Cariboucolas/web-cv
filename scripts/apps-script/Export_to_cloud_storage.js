/**
 * Publication du CV PDF sur Firebase Storage, depuis le Doc CV.
 *
 * Ce script ne tourne pas dans ce dépôt : il s'exécute chez Google, lié au
 * document Google Docs où le CV s'écrit. Il vit ici parce que sa première
 * version n'existait que dans le Drive et avait fini par être oubliée — voir
 * docs/adr/0001-publication-du-cv-depuis-google-docs.md.
 *
 * Les identifiants de document n'ont pas leur place ici : ce dépôt est public.
 * Le script s'appuie sur le document actif, et les identifiants dont il aura
 * besoin pour viser deux langues vivront en Script Properties.
 */

/**
 * Trigger simple appelé par Google à l'ouverture du document. C'est le seul
 * contexte où une UI de document existe : l'exécuter à la main depuis
 * l'éditeur échoue avec « Cannot call DocumentApp.getUi() from this context ».
 */
// biome-ignore lint/correctness/noUnusedVariables: point d'entrée appelé par Google, pas par le code
function onOpen() {
  DocumentApp.getUi()
    .createMenu('CV Export')
    .addItem('Exporter vers Firebase Storage', 'exportToFirebase')
    .addToUi()
}

/** Exporte le document actif en PDF et le pousse sur le bucket du site. */
// biome-ignore lint/correctness/noUnusedVariables: référencée par la chaîne passée à addItem ci-dessus
function exportToFirebase() {
  const userInterface = DocumentApp.getUi()

  try {
    const activeDocument = DocumentApp.getActiveDocument()
    const pdfBlob = DriveApp.getFileById(activeDocument.getId()).getAs(
      'application/pdf',
    )

    // Adresse d'écriture du CV PDF. Le Site CV porte l'adresse de lecture
    // correspondante dans son composant d'en-tête (molecules/HeaderBar) : les
    // deux doivent désigner le même objet, et rien ne peut le vérifier
    // automatiquement puisqu'elles vivent dans deux runtimes distincts. Toute
    // modification de ce chemin doit être répercutée là-bas dans le même
    // changement.
    //
    // Le suffixe de langue est déjà là alors qu'une seule langue est publiée :
    // il évite que l'ajout de l'anglais ait à renommer un objet dont l'URL
    // sera, elle, diffusée d'ici là.
    const bucketName = 'cv-portfolio-b023a.appspot.com'
    const objectPath = 'cv/cv-colas-durcy-fr.pdf'

    // Nom que le fichier portera dans les téléchargements du visiteur, et non
    // dans le bucket. Il reste en ASCII : un en-tête HTTP transporte mal autre
    // chose, et le `filename*` qui le permettrait n'apporte rien ici.
    const downloadFileName = 'CV Colas Durcy (FR).pdf'

    // `uploadType=multipart` plutôt que `media` : c'est le seul mode qui pose
    // des métadonnées en même temps que le contenu, et `contentDisposition`
    // est le seul levier qui transforme le clic en téléchargement — l'attribut
    // HTML `download` étant ignoré d'une origine à l'autre. En multipart, le
    // chemin de l'objet se déclare dans les métadonnées et non plus dans
    // l'URL.
    const objectMetadata = {
      name: objectPath,
      contentType: 'application/pdf',
      contentDisposition: `attachment; filename="${downloadFileName}"`,
    }

    // Un UUID écarte le seul vrai risque du multipart : une frontière qui se
    // retrouverait telle quelle dans les octets du PDF couperait le corps au
    // mauvais endroit.
    const partBoundary = `cv-export-${Utilities.getUuid()}`
    const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${bucketName}/o?uploadType=multipart`

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

    // Cette branche `else` n'est presque jamais atteinte : sans
    // `muteHttpExceptions: true`, UrlFetchApp lève sur tout code non-2xx et
    // l'erreur part dans le `catch`, qui n'en reçoit qu'un extrait tronqué —
    // de quoi reconnaître un rejet de Cloud Storage, pas de quoi le lire en
    // entier. Le défaut est conservé : c'est la relecture après envoi qui
    // reprendra ce filet, et elle seule.
    if (response.getResponseCode() === 200) {
      userInterface.alert('CV exporté avec succès sur Firebase Storage !')
    } else {
      userInterface.alert(`Erreur: ${response.getContentText()}`)
    }
  } catch (error) {
    userInterface.alert(`Erreur: ${error.message}`)
  }
}
