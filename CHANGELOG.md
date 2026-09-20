# Changelog

Toutes les évolutions notables de ASCII Tools sont documentées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
et le projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

## [2.2.1] - 2026-09-20

Ajout d'un accès direct aux signalements GitHub depuis le menu.

### Ajouté

- **Menu « Un retour ? »** dans la barre latérale : signaler un bug ou proposer une
  fonctionnalité ouvre directement le modèle de ticket GitHub correspondant.

## [2.2.0] - 2026-09-20

Ajout d'un **générateur de QR code ASCII**.

### Ajouté

- **Générateur de QR code ASCII** (`/tools/qr-code-generator`) : QR codes
  scannables dessinés avec des caractères texte.
- Trois styles : demi-blocs Unicode, blocs pleins Unicode et ASCII 7 bits pur,
  avec option « Inverser » pour les fonds sombres.
- Modèles guidés : texte, URL, Wi-Fi, e-mail, téléphone, SMS et vCard, dans la
  limite de 300 caractères.
- Niveau de correction d'erreur réglable (M par défaut).
- Export : copie, bloc Markdown, fichier `.txt` et image PNG.
- Génération 100 % dans le navigateur : le contenu n'est jamais envoyé à un serveur.
- Premiers tests automatisés (Vitest) : les QR codes générés sont relus par un
  décodeur (jsQR) pour garantir qu'ils restent scannables.

## [2.1.0] - 2026-07-18

Ajout d'un **éditeur Markdown** avec aperçu en direct.

### Ajouté

- **Éditeur Markdown** : édition en direct avec aperçu côte à côte, prise en
  charge du GitHub Flavored Markdown (tableaux, listes de tâches, texte barré)
  et coloration syntaxique des blocs de code.
- **Barre de formatage** : gras, italique, titres, listes, citations, code et
  liens insérés autour de la sélection.
- **Export** : copie du Markdown, copie du HTML rendu et téléchargement en `.md`.
- **Modes d'affichage** (partagé, éditeur seul, aperçu seul) et localisation dans
  les 8 langues (fr, en, es, de, it, pt, ru, ja).

## [2.0.0] - 2026-07-14

Passage d'un générateur unique à une **suite d'outils ASCII** complète, avec
navigation dédiée, guides de référence et localisation dans 8 langues.

### Ajouté

- **Nouvelle architecture multi-outils** : espace unifié avec barre latérale de
  navigation, en-tête et mise en page partagée entre tous les outils.
- **Générateur de tableaux ASCII** : conversion de données en tableaux ASCII
  avec gestion des lignes et alignement.
- **Sparklines ASCII** : génération de mini-graphiques et de graphiques en barres
  (avec hauteur de barre minimale garantie).
- **Générateur de bannières** : création de bannières en art ASCII avec aperçu
  en direct.
- **Outil emoji ASCII** : bibliothèque d'emojis classés par catégories, avec
  recherche et localisation.
- **Guide Markdown** : page de référence de la syntaxe Markdown.
- **Section Ressources** : regroupement des guides et références dans la
  navigation.
- **Section outils sur la page d'accueil** avec animations et vitrine des outils.
- **Pied de page enrichi** d'une section dédiée aux outils.

### Modifié

- Localisation étendue et retravaillée pour les 8 langues (fr, en, es, de, it,
  pt, ru, ja), incluant les descriptions d'outils et les slogans.
- Variables de thème de la barre latérale migrées vers des propriétés CSS
  personnalisées pour plus de cohérence.
- Réinitialisation du contenu lors du changement d'options dans le générateur
  d'arborescence.
- Mise en page de la barre latérale ajustée pour masquer les informations
  additionnelles en mode réduit.

## [1.0.0]

- Générateur d'arborescence ASCII initial : édition de l'arbre, glisser-déposer,
  options de rendu (styles Unicode et ASCII), aperçu, copie et téléchargement.
- Internationalisation initiale et pages légales.
