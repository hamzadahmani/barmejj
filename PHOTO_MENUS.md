# Menus photographiés et suggestions selon le budget

## Parcours livré

Dans BarmejPro, ouvrir le profil de l’établissement puis la gestion des menus. Ajouter une photo JPG, PNG ou WebP, lancer sa lecture, corriger les noms et les prix, choisir les catégories (plat, boisson, dessert, autre), puis confirmer la validation. Une saisie manuelle reste possible. La photo originale est conservée.

Barmejli compose ensuite des propositions à partir des plats et boissons disponibles des menus actifs et validés. Les brouillons ne sont jamais utilisés. Une validation datant de plus de 90 jours à la date de sortie exclut le menu des suggestions. Désactiver un menu retire ses propositions des nouveaux programmes ; les programmes déjà enregistrés conservent leur sélection et leurs prix.

Les prix sont stockés en millimes, sans approximation décimale. Les coûts des étapes existantes étant en dinars entiers, le montant est arrondi au dinar supérieur pour respecter le budget. L’application affiche aussi le total exact du menu et la date de validation. Les quantités suivent le nombre de participants interprété dans la demande ; sans nombre explicite, le planificateur utilise une personne (deux pour une sortie en amoureux). Transport, extras et changements de prix ultérieurs ne sont pas garantis.

## Mise en service nécessaire

La migration `20261001100000_validated_photo_menus` a été appliquée le 4 octobre 2026 sur la base PostgreSQL locale `barmej` (`localhost:5432`). Les 28 migrations sont à jour. Les lectures Prisma de `place_menus` et de `barmejli_steps.menu_selection` réussissent. Aucun déploiement d’application n’a été effectué. Les autres environnements doivent appliquer la migration séparément.

La configuration Cloudinary existante doit être présente pour l’envoi des photos. Les signatures et l’appartenance à l’établissement sont vérifiées côté backend. Maximum : 20 photos par établissement, 8 Mo et 20 mégapixels par photo.

La lecture utilise Tesseract.js avec les langues française et arabe. Au premier usage, les fichiers de langues sont téléchargés et mis en cache dans le dossier de lancement du backend ; ce dossier doit être accessible en écriture. Préparer ce cache sur le serveur évite l’attente du premier utilisateur. Ce moteur n’a pas de quota ou de frais d’API IA, mais l’hébergement, les ressources serveur et Cloudinary gardent leurs propres coûts et limites. Deux lectures simultanées au maximum. Les lignes ambiguës restent à saisir manuellement et les aliments doivent être classés avant validation.

## Vérifications

- Backend : TypeScript, compilation et 70 tests passent, dont lecture des prix, budget, validation explicite, conflits de modification et contrôle d’accès.
- BarmejPro : TypeScript, ESLint et 6 tests passent ; trois avertissements de styles préexistants demeurent.
- Barmej : TypeScript, ESLint et tests de rendu, dont quantités et prix exacts des menus.
- 116 appels statiquement résolus correspondent aux routes backend. Deux appels dynamiques préexistants ne sont pas résolus par ce contrôle.
- Lecture réelle d’une image synthétique : 18.500, 3.000 et 5.500 DT reconnus correctement avec les modèles français et arabe chargés.

La lecture d’une vraie photo client via Cloudinary et les parcours sur appareil iOS/Android ne sont pas validés par ces tests. La migration et les nouvelles colonnes ont été vérifiées sur la base locale. Aucun test Maestro n’a été utilisé.
