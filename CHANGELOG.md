# Changelog

Toutes les évolutions notables de ASCII Tools sont documentées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
et le projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

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
