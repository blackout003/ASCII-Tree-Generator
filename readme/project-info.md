# ASCII Tree Generator - Informations du Projet

## Description
Générateur d'arbres ASCII interactif développé avec Next.js et shadcn/ui.

## Technologies utilisées
- **Framework**: Next.js 15 avec TypeScript
- **Interface utilisateur**: shadcn/ui + Tailwind CSS
- **Linting**: ESLint

## Structure du projet
```
src/
├── app/                 # App Router de Next.js
├── components/          # Composants organisés par page
│   ├── ui/             # Composants shadcn/ui
│   ├── home/           # Composants de la page d'accueil
│   └── generator/      # Composants du générateur
└── lib/                # Utilitaires et helpers

readme/                 # Documentation du projet
```

## Règles de développement
- Organiser les composants par page dans des dossiers séparés
- Utiliser shadcn/ui pour l'interface utilisateur
- Respecter l'apparence visuelle générale du site
- Faire les modifications automatiquement
- Répondre en français

## Commandes disponibles
- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Construire l'application pour la production
- `npm run start` - Démarrer l'application en mode production
- `npm run lint` - Vérifier le code avec ESLint

## Ajout de composants shadcn/ui
```bash
npx shadcn@latest add [component-name]
```
