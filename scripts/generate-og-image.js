#!/usr/bin/env node

/**
 * Script pour générer l'image Open Graph
 * Utilise Canvas API pour créer une image 1200x630px
 */

const fs = require('fs');
const path = require('path');

// Configuration de l'image Open Graph
const OG_CONFIG = {
  width: 1200,
  height: 630,
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  accentColor: '#3b82f6',
  title: 'ASCII Tree Generator',
  subtitle: 'Créez des structures de projet visuelles',
  description: 'Générateur d\'arbre ASCII gratuit et intuitif'
};

// Fonction pour créer l'image Open Graph avec Canvas
function generateOGImage() {
  // Note: Ce script nécessite une implémentation Canvas
  // Pour une solution complète, utilisez une bibliothèque comme node-canvas
  
  console.log('Génération de l\'image Open Graph...');
  console.log('Configuration:', OG_CONFIG);
  
  // Créer un fichier SVG temporaire comme alternative
  const svgContent = generateSVG();
  const outputPath = path.join(__dirname, '../public/og-image.svg');
  
  fs.writeFileSync(outputPath, svgContent);
  console.log(`Image Open Graph générée: ${outputPath}`);
  
  // Instructions pour convertir en PNG
  console.log('\nPour convertir en PNG, utilisez:');
  console.log('1. Un outil en ligne comme svgtopng.com');
  console.log('2. Ou installez node-canvas: npm install canvas');
  console.log('3. Ou utilisez un service comme Vercel OG Image');
}

function generateSVG() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_CONFIG.width}" height="${OG_CONFIG.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Arrière-plan -->
  <rect width="100%" height="100%" fill="url(#bg)"/>
  
  <!-- Motif de fond -->
  <g opacity="0.1">
    <text x="50" y="100" font-family="monospace" font-size="24" fill="${OG_CONFIG.textColor}">├── src/</text>
    <text x="50" y="130" font-family="monospace" font-size="24" fill="${OG_CONFIG.textColor}">│   ├── components/</text>
    <text x="50" y="160" font-family="monospace" font-size="24" fill="${OG_CONFIG.textColor}">│   └── pages/</text>
    <text x="50" y="190" font-family="monospace" font-size="24" fill="${OG_CONFIG.textColor}">└── public/</text>
  </g>
  
  <!-- Contenu principal -->
  <g>
    <!-- Titre principal -->
    <text x="60" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="bold" fill="${OG_CONFIG.textColor}">
      ${OG_CONFIG.title}
    </text>
    
    <!-- Sous-titre -->
    <text x="60" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="${OG_CONFIG.accentColor}">
      ${OG_CONFIG.subtitle}
    </text>
    
    <!-- Description -->
    <text x="60" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="${OG_CONFIG.textColor}" opacity="0.8">
      ${OG_CONFIG.description}
    </text>
    
    <!-- Call-to-action -->
    <rect x="60" y="480" width="200" height="50" rx="8" fill="${OG_CONFIG.accentColor}"/>
    <text x="160" y="510" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="white" text-anchor="middle">
      Commencer
    </text>
  </g>
  
  <!-- Logo/icône -->
  <g transform="translate(1000, 100)">
    <rect width="80" height="80" rx="12" fill="${OG_CONFIG.accentColor}"/>
    <text x="40" y="50" font-family="monospace" font-size="32" fill="white" text-anchor="middle">🌳</text>
  </g>
</svg>`;
}

// Exécuter le script
if (require.main === module) {
  generateOGImage();
}

module.exports = { generateOGImage, OG_CONFIG };
