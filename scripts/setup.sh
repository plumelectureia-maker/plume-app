#!/bin/bash

# Script de setup automatique de Plume
# Usage: bash scripts/setup.sh

set -e

echo "🚀 Setup Plume App"
echo "=================="
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "Télécharger depuis https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo ""

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install
echo "✅ Dépendances installées"
echo ""

# Créer les fichiers de config
echo "⚙️ Configuration..."

if [ ! -f .env ]; then
    echo "📝 Création de .env"
    cat > .env << EOF
# À remplir avec vos clés Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
EOF
    echo "📋 .env créé - À remplir avec vos clés Supabase"
else
    echo "✅ .env existe déjà"
fi

if [ ! -f config.ts ]; then
    cp config.example.ts config.ts
    echo "✅ config.ts créé"
fi

echo ""
echo "✨ Setup terminé !"
echo ""
echo "Prochaines étapes :"
echo "1. Remplir .env avec vos clés Supabase"
echo "2. Lancer : npm run dev"
echo "3. Ouvrir : http://localhost:5173"
echo ""
echo "Documentation : voir README.md"
