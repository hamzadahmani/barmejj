# Recette E2E Barmej

Préconditions : backend local sur le port configuré par `npm run api:local`, données de démonstration chargées et APK debug installée.

Exécution :

```powershell
maestro test .maestro/flows/01-client-login-navigation.yaml
maestro test .maestro/flows/02-client-navigation.yaml
```

Les valeurs `CLIENT_EMAIL` et `CLIENT_PASSWORD` peuvent être remplacées avec `-e` sans modifier le scénario.

Les parcours sont volontairement courts : le pilote natif Maestro 2.9.0 sous Windows peut perdre son heartbeat lors d’une session longue. Lancez les fichiers dans l’ordre pour conserver la session client tout en renouvelant la connexion du pilote.
