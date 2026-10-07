# Barmejli — planificateur sans modèle externe

Modifications du 1er octobre 2026, dans l'application Barmej et son backend local.
Aucun déploiement, migration de base de données ou appel à un modèle d'IA.

## Fonctionnement

Le moteur interprète des expressions reconnues puis compare plusieurs programmes
complets. Il privilégie les étapes correspondant à l'ambiance et au groupe,
leur variété, les catégories demandées et les trajets courts, dans les limites
du budget et de la durée. La recherche est bornée à 48 programmes intermédiaires
et 12 prolongements par programme pour maîtriser son temps de calcul.

Expressions prises en charge : budget en DT/TND, petit budget, sortie gratuite,
horaire comme « à 19h30 », durée et « jusqu'à 22h », « à pied », « sans voiture »
et exclusions de catégories comme « sans restaurant ». Quelques expressions
arabes/tunisiennes et les chiffres arabes sont reconnus ; ce n'est pas une
compréhension générale de toute phrase ou un modèle conversationnel.

Exemple : « Sortie calme à Tunis samedi à 19h jusqu'à 22h, budget 30 DT,
à pied, sans restaurant ».

Le moteur utilise uniquement les lieux et expériences référencés, leurs tarifs,
leurs horaires connus, fermetures et contraintes météo. Il exclut les prix
inconnus et les durées invalides. Par défaut, une sortie est limitée à six heures.
Pour une sortie à pied, chaque liaison et l'éloignement du point de recherche
sont limités à trois kilomètres à vol d'oiseau.

Les distances et temps sont des estimations entre étapes, sans itinéraire routier
ni trafic réel. Les prix restent indicatifs et ne garantissent pas la disponibilité
d'une table. Si les horaires d'un lieu ne sont pas renseignés, le moteur conserve
le comportement existant : il peut proposer le lieu sans confirmer son ouverture.
Les horaires utilisent le fuseau du processus serveur ; la recette doit vérifier
la configuration de ce fuseau et les sorties traversant minuit.

## Intégration

Les routes existantes sont conservées. Les réponses ajoutent une explication
globale, les hypothèses de la demande et une note par étape. Barmej les affiche
lorsqu'elles sont présentes et reste compatible avec les anciennes réponses.
Les programmes sauvegardés restent consultables même si leur ancienne demande
ne respecte plus les nouvelles règles d'interprétation.

Une ville non référencée ne renvoie plus silencieusement une sortie à La Marsa.
Un budget par personne nécessite une clarification du budget total ; les données
actuelles ne permettent pas de garantir un calcul fiable par participant.

Changer une étape recalcule tous les horaires, déplacements et totaux. La
modification est enregistrée dans une transaction uniquement si le programme
entier reste compatible avec les contraintes.

## Vérification

Backend : TypeScript, compilation et 62 tests réussis, dont cinq tests HTTP
avec base simulée. Les tests du moteur couvrent notamment la comparaison de
programmes, les exclusions, la marche et le recalcul d'une étape.
Les 109 appels statiques des applications correspondent aux routes backend.
Application : TypeScript et ESLint réussis ; 32 tests réussis dans 13 suites,
dont l'affichage des explications et des demandes de clarification Barmejli.
Bundle JavaScript Android : généré avec ses 20 ressources.

Les parcours avec une base réelle, les notifications météo et la navigation sur
appareil ne sont pas certifiés par ces tests locaux. Aucun déploiement ni Maestro.
