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
    const bucketName = 'cv-portfolio-b023a.appspot.com'
    const objectPath = 'cv/cv-colas-durcy.pdf'
    const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${bucketName}/o?uploadType=media&name=${encodeURIComponent(objectPath)}`

    const response = UrlFetchApp.fetch(uploadUrl, {
      method: 'POST',
      contentType: 'application/pdf',
      payload: pdfBlob.getBytes(),
      headers: {
        Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
      },
    })

    // Cette branche `else` n'est presque jamais atteinte : sans
    // `muteHttpExceptions: true`, UrlFetchApp lève sur tout code non-2xx et
    // l'erreur part dans le `catch`, qui n'a pas le corps de la réponse. Le
    // défaut est conservé tel quel ici — ce ticket ne change pas le
    // comportement — et sera traité avec la relecture après envoi.
    if (response.getResponseCode() === 200) {
      userInterface.alert('CV exporté avec succès sur Firebase Storage !')
    } else {
      userInterface.alert(`Erreur: ${response.getContentText()}`)
    }
  } catch (error) {
    userInterface.alert(`Erreur: ${error.message}`)
  }
}
