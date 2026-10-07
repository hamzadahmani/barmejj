# Alignement Barmej / BarmejPro / backend

Vérification du 27 septembre 2026. Périmètre : code local, sans déploiement et sans Maestro.
BarmejPro est l’application professionnelle retenue ; BarmejjPro reste intact à la demande de l’utilisateur.

## Corrections

- Pro conserve le jeton de renouvellement, renouvelle une seule fois les requêtes concurrentes, rejoue les appels après expiration et retourne à la connexion si la session est invalide.
- La déconnexion Pro révoque le jeton de renouvellement. Une réponse tardive ne rétablit pas une ancienne session après déconnexion ou changement de compte.
- Un problème réseau temporaire conserve les identifiants de session des deux applications. Pro propose de réessayer au démarrage.
- Le formulaire Pro expose le champ Bon plan / Happy hour, le charge depuis `placeHappyHour` et l’envoie au backend sous `happyHour`.
- Le backend conserve les champs facultatifs omis par un ancien client. Un champ explicitement vide ou nul permet de supprimer une offre. Le prix zéro reste valide.
- La photo de couverture et l’offre sont renvoyées dans les champs attendus par Barmej.
- Les commandes Android Pro sélectionnent le même mode API que Barmej : lancement local, préparation d’APK en ligne. Aucune commande de préparation d’APK ni de déploiement n’a été exécutée.
- Deux effets de chargement Pro ont été corrigés ; le libellé permanent « OUVERT » sans vérification a été retiré.

## Vérifications effectuées

| Projet | Résultat |
| --- | --- |
| Barmej | TypeScript réussi ; ESLint sans erreur ; 17 tests réussis |
| BarmejPro | `npm run check` réussi ; 6 tests de session réussis ; 3 avertissements de styles préexistants |
| Backend | TypeScript et compilation locale réussis ; 49 tests réussis |
| Routes | 109 appels statiques correspondent aux routes backend ; appels dynamiques événements et récompenses vérifiés manuellement |

Les tests HTTP Pro → backend → Barmej vérifient la publication d’une photo et d’une offre, la conservation d’un champ omis, le retrait explicite d’une offre et le refus d’un gérant non autorisé. Ils utilisent l’application Express réelle avec une base simulée. Les tests de session exécutent le client Pro avec stockage et réseau simulés.

Une première exécution des tests Barmej sous charge parallèle a dépassé le délai de cinq secondes pour le carrousel. La suite complète relancée avec une limite de quinze secondes a réussi en environ sept secondes.

## Refaire les contrôles

- Barmej : `npx tsc --noEmit`, `npm run lint`, `npm test -- --runInBand --testTimeout=15000`.
- Pro : `npm run check`.
- Backend : `npm run check`.
- Depuis Barmej : `node scripts/check-api-alignment.cjs <dossier-backend> <dossier-BarmejPro>`.

## Limites

L’API locale sur le port 8091 ne répondait pas lors de cette intervention. Les scénarios avec PostgreSQL réel et les parcours sur appareil n’ont donc pas été rejoués. Ce rapport ne certifie ni les APK déjà installés ni le backend actuellement hébergé : les corrections doivent être incluses dans leurs prochaines versions, après recette locale.
