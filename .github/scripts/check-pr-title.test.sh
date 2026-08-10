#!/usr/bin/env bash
# Vérifie check-pr-title.sh contre des titres réels du dépôt.
# Chaque ligne : <code de sortie attendu> <TAB> <titre>
set -uo pipefail

VALIDATEUR="$(dirname "$0")/check-pr-title.sh"

CASES=$(cat <<'EOF'
0	feat: add the contact block
0	fix: restore the English locale, broken by the Nuxt 4 migration
0	chore(deps): bump tailwindcss from 3.4.17 to 4.3.3
0	chore(deps-dev): bump typescript from 5.9.3 to 6.0.3
0	feat: UI redesign phase 3 - header and profile components
0	ci: keep the build meaningful on Dependabot pull requests
1	Feat: add ui on mouse mouvement
1	add experiences section
1	feat: Add the contact block
1	feat: refonte UI lot 2 — mouvement (champ de cubes)
1	feat: add a section that is far too long to fit inside the seventy-two characters
1	random text without any prefix at all
0	fix: update readme: Add screenshot
1	fix(ci): Bump the runner image
EOF
)

failures=0
while IFS=$'\t' read -r expected title; do
  [ -z "$expected" ] && continue
  PR_TITLE="$title" "$VALIDATEUR" >/dev/null 2>&1
  actual=$?
  if [ "$actual" != "$expected" ]; then
    echo "ECHEC (attendu $expected, obtenu $actual) : $title"
    failures=$((failures + 1))
  fi
done <<< "$CASES"

if [ "$failures" -eq 0 ]; then
  echo "Les 14 cas passent."
else
  echo "$failures cas en échec."
fi
exit "$failures"
