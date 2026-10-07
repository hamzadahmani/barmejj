# Migration TanStack React Query — 29 septembre 2026

## Périmètre

Application mobile de ce dépôt `Barmej`. Version installée : **5.104.0**
(précédemment 4.36.1, déclarée `^4.29.14`). `package-lock.json` et `yarn.lock`
sont synchronisés. Aucun déploiement effectué ; Maestro non utilisé.

Les 27 appels `useQuery`, le flux `useInfiniteQuery` et les 23 mutations
utilisent la signature objet v5. Les mutations utilisent `isPending` ; les
recherches conservent leurs résultats avec `placeholderData: keepPreviousData`.
Le flux vidéo déclare explicitement son premier curseur.

## Organisation

- `src/query/client.ts` : création du client, durée de fraîcheur de 5 secondes,
  collecte du cache inutilisé après 5 minutes, absence de répétition automatique
  des écritures et invalidation ciblée après succès.
- `src/query/keys.ts` : clés de ressources et dépendances des mutations.
  Profil, favoris, fidélité, réservations utilisateur et lieux mis en avant
  partagent leur cache entre écrans.
- `src/query/NativeQueryLifecycle.tsx` : connexion réseau et passage de
  l'application au premier plan, avec désabonnement au démontage.
- `AuthProvider` : suppression des requêtes et mutations en cache à la connexion
  et à l'expiration de session. Les réponses tardives d'une ancienne requête ne
  peuvent pas repeupler le cache du nouveau compte ; une ancienne mutation
  supprimée ne déclenche pas ses invalidations sur le nouveau compte.

Pour une nouvelle lecture, utiliser une clé centralisée, suivie de tous ses
paramètres. Pour une écriture, déclarer `meta: mutationEffects.<ressource>`.
Les écrans actifs sont actualisés ; les entrées inactives sont marquées périmées.
Éviter un second `refetch()` dans `onSuccess` pour les mêmes ressources.

## Corrections associées

- Les cartes lisent le véritable état des favoris dans le cache partagé.
- Création, annulation et modification des réservations actualisent aussi le
  prochain rendez-vous, les disponibilités et les listes concernées.
- La création d'un bon de fidélité utilise une mutation et actualise les comptes.
- Les rafraîchissements du profil ne remplacent pas les modifications en cours.
- Les créneaux d'une précédente date ne sont plus conservés comme résultats
  temporaires ; la validation est bloquée pendant le chargement des disponibilités.
- Recherche, carte, fiches, catégories et flux vidéo transmettent le signal
  d'annulation de la requête à Axios.

## Vérifications

- `npx tsc --noEmit` : réussi.
- `npx eslint .` : aucune erreur, 31 avertissements restants.
- Jest, avec détection des ressources encore ouvertes : **25 tests, 9 suites,
  tous réussis**, processus terminé normalement.
- Tests supplémentaires : partage du profil, invalidation des variantes,
  échec sans répétition, isolation entre sessions, pagination, événements
  réseau et cycle de vie mobile.
- Bundle JavaScript Android de production : généré avec succès dans le dossier
  temporaire, avec ses ressources. Ce contrôle ne constitue pas un build APK.
- Les tests existants Explorer et routes passent. Aucun parcours manuel complet
  sur appareil, ni validation des transactions contre un backend actif, n'a été
  effectué pendant cette migration.

Références : [migration officielle v5](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5),
[intégration React Native](https://tanstack.com/query/latest/docs/framework/react/react-native).
