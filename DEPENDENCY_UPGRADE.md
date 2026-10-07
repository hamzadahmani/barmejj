# Mise à jour et nettoyage — 30 septembre 2026

## Périmètre

Application mobile Barmej de ce dépôt. Aucun déploiement, aucune utilisation
de Maestro. BarmejPro et le backend ne sont pas modifiés par cette opération.

## Principales versions

| Composant | Version retenue |
| --- | --- |
| React Native et outils associés | 0.87.1 |
| React / React DOM / test renderer | 19.2.3 |
| TanStack React Query | 5.104.0 |
| Axios | 1.20.0 |
| Firebase App et Messaging | 26.4.0 |
| AsyncStorage | 3.1.1 |
| React Navigation native / tabs / stack | 7.5.0 / 7.20.0 / 7.12.0 |
| Reanimated / Worklets | 4.7.0 / 0.13.0 |
| React Native Maps | 1.29.11 |
| Image Picker | 8.2.1 |
| React Hook Form / resolvers / Yup | 7.89.0 / 5.9.1 / 1.7.1 |
| Jest / Babel Jest | 30.5.2 |
| ESLint / Prettier | 9.39.5 / 3.9.9 |
| TypeScript / Babel | 6.0.3 / 7.29.7 |

React reste exactement aligné avec le moteur embarqué par React Native.
TypeScript 7 dépasse la plage supportée par le parseur ESLint installé
(`<6.1.0`). Le préréglage React Native dépend de Babel 7 et accepte ESLint 8/9,
pas ESLint 10. Ces contraintes sont conservées volontairement.

## Nettoyage

- Retrait de huit dépendances non utilisées : Dynamic Links, Google Sign-In,
  les deux bibliothèques de modales swipe, autocomplete-input,
  keyboard-aware-scrollview, react-native-share et styled-components.
- Retrait des mocks, déclarations et références Android associés.
- Installation standardisée sur npm et `package-lock.json` ; suppression du
  second verrouillage Yarn, qui ne respecte pas les remplacements npm.
- README remplacé par les instructions réelles du projet.
- ESLint migre vers la configuration plate. Les anciennes règles Flow du
  préréglage sont exclues car le projet utilise TypeScript. Les styles statiques,
  le masquage de variable et l'opérateur virgule signalés ont été nettoyés.

## Adaptations fonctionnelles

- AsyncStorage utilise `removeMany` et conserve son stockage historique pour
  préserver les sessions, contacts et préférences déjà enregistrés.
- Firebase Messaging utilise l'API modulaire. Le jeton est demandé une seule
  fois et retourné au demandeur ; les abonnements retournent leur nettoyage.
- Android laisse RNFirebase gérer les versions natives Firebase. Kotlin est
  aligné sur 2.2.10, version résolue par les nouvelles dépendances.
- Le Podfile iOS utilise les frameworks statiques Firebase et le sous-module
  Google de Maps.

## Correctifs de dépendances

NativeBase est conservé à sa dernière version 3.4.28 : il n'a pas été remplacé
par une autre bibliothèque d'interface. Son ancien `lodash.pick` est remplacé
par l'adaptateur local `vendor/lodash-pick`, qui délègue à `lodash/pick` 4.18.1.
Des tests vérifient les chemins imbriqués et les tentatives de modification du
prototype. `.npmrc` conserve la résolution des anciennes contraintes de pairs.

`image-size` est remplacé par 2.0.4. Metro 0.87 lui transmet maintenant un tampon
de données au lieu d'un chemin de fichier. Le script de postinstallation
`scripts/apply-compatibility-fixes.cjs` réapplique cette adaptation ainsi que les
adaptations NativeBase existantes. Un test charge réellement une image via Metro.

## Validation

- Réinstallation complète avec `npm ci` : réussie ; les correctifs de
  postinstallation sont réappliqués automatiquement.
- TypeScript (`tsc --noEmit`) : réussi.
- ESLint : aucune erreur ni avertissement.
- Jest : **30 tests réussis dans 12 suites**.
- Audit npm : **0 vulnérabilité**.
- Bundle JavaScript Android de production : généré avec ses 20 ressources.
- Compilation native Android : **réussie** (`assembleDebug`, ARM64 et x86_64,
  `BUILD SUCCESSFUL`, 561 tâches en 14 min 20 s). APK généré dans
  `android/app/build/outputs/apk/debug/app-debug.apk`.

Des avertissements restent dans les dépendances natives : anciennes API
Gradle/Android et tables de pile Google Play Services signalées par D8.
Ils n'ont pas empêché la compilation ; cette réussite ne remplace pas les
vérifications d'exécution sur appareil.

Aucun appareil ou émulateur Android n'est connecté : les parcours visuels et
les navigations sur appareil ne sont donc pas validés par cette opération.

Sur Windows, la compilation iOS n'est pas disponible. Le `Podfile.lock`
historique doit être régénéré sur macOS et la compilation Xcode vérifiée.
Les transactions contre un backend actif ne font pas partie de ces tests locaux.
