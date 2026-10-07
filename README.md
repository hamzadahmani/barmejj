# Barmej

Application mobile React Native. Utiliser **npm** et le fichier `package-lock.json`
pour conserver les versions et les correctifs de sécurité validés.

## Installation

- Node.js 22.13+ (branche 22), 24.3+ (branche 24) ou 26+.
- Android : JDK 17, Android SDK et NDK configurés dans Android Studio.
- iOS : macOS, Xcode et CocoaPods.

```sh
npm ci
```

Le script `postinstall` applique les adaptations NativeBase / React Native et
Metro / image-size. Ne pas utiliser `--ignore-scripts` pour une installation
normale. `.npmrc` conserve la résolution des dépendances compatible avec les
anciennes déclarations de compatibilité de NativeBase.

## Développement Android

```sh
npm run android:metro
```

Dans un second terminal, avec un émulateur ou appareil connecté :

```sh
npm run android
```

Ces commandes sélectionnent l'API locale. `npm run api:online` sélectionne
l'API distante. Sous PowerShell, utiliser `npm.cmd` / `npx.cmd` si les scripts
PowerShell sont bloqués.

## Vérifications

```sh
npm run check
npm audit
```

Les tests couvrent notamment Explorer, les routes, la session, le cache,
les notifications et les adaptations de dépendances.

## Compilation locale Android

```sh
npm run build:android:debug
```

Cette commande sélectionne l'API distante et produit un APK local ; elle ne
publie pas l'application. Pour garder la configuration API actuelle, lancer
`scripts/build-android-debug.cmd` directement.

## iOS

iOS 15.1 minimum. Sur macOS avec Xcode 26.2 ou supérieur et Ruby 3.2 ou supérieur :

```sh
npm ci
sh scripts/prepare-ios.sh
npm run ios
```

La préparation met à jour le verrouillage CocoaPods historique ; vérifier et
versionner ensuite `ios/Podfile.lock` et `Gemfile.lock`. Les installations
suivantes utilisent `cd ios && bundle exec pod install`.
Firebase utilise des frameworks statiques et Maps le sous-module Google.

Pour vérifier la compilation sans signature ni installation :

```sh
xcodebuild -workspace ios/Barmej.xcworkspace -scheme Barmej -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

Pour les tests natifs, sélectionner un simulateur disponible dans Xcode et
exécuter le schéma Barmej (Product → Test). Pour les notifications sur iPhone,
sélectionner l'équipe Apple et un profil autorisant Push Notifications, puis
vérifier la clé APNs dans Firebase. Xcode adapte l'environnement APNs lors de
la signature de distribution. Aucune clé ni équipe n'est générée par le dépôt.

Voir [les adaptations et les contrôles iOS](IOS_UPGRADE.md).

## Notes de maintenance

- [Migration React Query](REACT_QUERY_MIGRATION.md)
- `vendor/lodash-pick` remplace le paquet abandonné par `lodash/pick` maintenu.
- `scripts/apply-compatibility-fixes.cjs` applique les adaptations au réinstall.
- React reste aligné sur le moteur React Native (19.2.3). Babel 7, TypeScript 6
  et ESLint 9 correspondent aux contraintes des outils React Native installés.
