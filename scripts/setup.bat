@echo off
REM Script de setup automatique de Plume pour Windows

echo.
echo 🚀 Setup Plume App
echo ==================
echo.

REM Vérifier Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js n'est pas installé
    echo Télécharger depuis https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION%
echo.

REM Installer les dépendances
echo 📦 Installation des dépendances...
call npm install
echo ✅ Dépendances installées
echo.

REM Créer les fichiers de config
echo ⚙️ Configuration...

if not exist .env (
    echo 📝 Création de .env
    (
        echo # À remplir avec vos clés Supabase
        echo VITE_SUPABASE_URL=https://your-project.supabase.co
        echo VITE_SUPABASE_ANON_KEY=your-anon-key-here
    ) > .env
    echo 📋 .env créé - À remplir avec vos clés Supabase
) else (
    echo ✅ .env existe déjà
)

if not exist config.ts (
    copy config.example.ts config.ts
    echo ✅ config.ts créé
)

echo.
echo ✨ Setup terminé!
echo.
echo Prochaines étapes :
echo 1. Remplir .env avec vos clés Supabase
echo 2. Lancer : npm run dev
echo 3. Ouvrir : http://localhost:5173
echo.
echo Documentation : voir README.md
echo.
pause
