#!/usr/bin/env bash
# Valide le titre d'une pull request contre la convention du dépôt.
#
# Le titre arrive par la variable d'environnement PR_TITLE, jamais par
# interpolation directe dans le workflow : un titre est une chaîne contrôlée
# par l'auteur de la pull request, et `${{ github.event.pull_request.title }}`
# collé dans un `run:` serait exécuté par le shell.
set -uo pipefail

TYPES='feat|fix|docs|chore|refactor|perf|ci|build|test'
LONGUEUR_MAX=72

refuser() {
  echo "::error::$1"
  echo "Titre reçu : ${PR_TITLE:-}"
  exit 1
}

if [ -z "${PR_TITLE:-}" ]; then
  refuser "Titre vide."
fi

# 1. Longueur — au-delà, GitHub tronque le titre par des points de suspension.
longueur=${#PR_TITLE}
if [ "$longueur" -gt "$LONGUEUR_MAX" ]; then
  refuser "Titre trop long : $longueur caractères pour $LONGUEUR_MAX au maximum."
fi

# 2. Préfixe conventionnel, scope facultatif. Aucun des 98 commits de main n'en
#    porte, alors que Dependabot en met systématiquement : l'exiger casserait
#    l'un ou l'autre.
if ! printf '%s' "$PR_TITLE" | grep -qE "^($TYPES)(\([a-z-]+\))?: .+"; then
  refuser "Préfixe absent ou inconnu. Attendu « type: sujet » ou « type(scope): sujet », avec type parmi : $TYPES"
fi

# 3. Le sujet ne commence pas par un mot capitalisé. On vise « Add something »,
#    pas les acronymes : « feat: UI redesign » reste valide. Le préfixe (avec
#    son scope facultatif) est retiré avant le test, pour ancrer la règle sur
#    le début du sujet et non sur n'importe quel deux-points du titre.
sujet=$(printf '%s' "$PR_TITLE" | sed -E "s/^($TYPES)(\([a-z-]+\))?: //")
if printf '%s' "$sujet" | grep -qE '^[A-Z][a-z]'; then
  refuser "Le sujet ne doit pas commencer par un mot capitalisé. Les acronymes (UI, API, CI) restent acceptés."
fi

# 4. Ni cadratin ni demi-cadratin : la convention du dépôt les proscrit dans les
#    commits comme dans les titres de pull request. `-F` compare des chaînes
#    littérales et non une expression régulière : sous une locale non UTF-8
#    (LC_ALL=C), la classe de caractères [—–] dégénérerait en un ensemble
#    d'octets qui rejetterait à tort une apostrophe typographique ou des
#    points de suspension.
if printf '%s' "$PR_TITLE" | grep -qF -e '—' -e '–'; then
  refuser "Tiret cadratin (—) ou demi-cadratin (–) interdit. Utiliser un tiret simple ou deux-points."
fi

echo "Titre conforme : $PR_TITLE"
