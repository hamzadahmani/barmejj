# Adaptations iOS — 30 septembre 2026

## Modifications

- Cible iOS 15.1 alignée sur React Native 0.87.1, dans l'application, les tests
  et le projet Xcode. Capacités processeur ARM64.
- Démarrage Objective-C++ avec `RCTReactNativeFactory` et
  `RCTAppDependencyProvider`, en remplacement de `RCTAppDelegate`.
  Firebase et la configuration Google Maps existante sont conservés.
- Acheminement des URL vers React Native et déclaration du schéma `barmejApp`
  utilisé par les liens de partage. Aucun domaine universel n'est inventé.
- Identifiant `com.barmej.ios` identique sur simulateur et appareil.
- Justifications de localisation et de photothèque ajoutées pour les usages
  actuels. L'application ne demande pas de permissions caméra ou microphone.
- Notifications : droit APNs, capacité Push et mode `remote-notification`.
  Le traitement et l'autorisation utilisateur restent gérés par RNFirebase.
- Manifeste de confidentialité intégré aux ressources, avec les raisons d'API
  fournies par React Native. CocoaPods agrégera celles des dépendances.
  Les déclarations de collecte et de suivi pour une publication doivent être
  établies à partir des pratiques réelles du produit et du backend ; elles ne
  sont pas déduites de ce contrôle de compatibilité.
- CocoaPods 1.16.2 minimum et xcodeproj 1.27 minimum via Bundler ; script macOS
  de mise à jour du verrouillage historique. Scripts Xcode autorisés à accéder
  aux fichiers nécessaires à Metro et aux scripts des dépendances.
- Remplacement du test natif du modèle React Native par deux contrôles du
  démarrage et des ressources/autorisations de Barmej.

## Vérifications et limites

Les fichiers plist et le manifeste sont valides au format XML. Le bundle iOS
de production est généré (16 ressources) et ESLint réussit sans avertissement.

La compilation et les tests Xcode, la résolution CocoaPods et la signature
ne peuvent pas être exécutés sur Windows. `Podfile.lock` reste historique
jusqu'à l'exécution de `sh scripts/prepare-ios.sh` sur Mac. La clé APNs Firebase,
le profil Apple, les notifications et les navigations sur appareil restent à
vérifier sur Mac/iPhone. Les icônes iOS du catalogue historique doivent être
complétées avant publication. Aucun déploiement et aucune utilisation de Maestro.

Références : [démarrage React Native](https://reactnative.dev/docs/integration-with-existing-apps.html),
[notifications iOS RNFirebase](https://rnfirebase.io/messaging/usage/ios-setup),
[outillage Firebase Apple](https://firebase.google.com/docs/ios/installation-methods).
