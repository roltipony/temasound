#!/bin/bash
# ============================================================
#  SoundWave - Script de instalación para Mac Mini
#  Ejecutar como: bash deploy.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()   { echo -e "${YELLOW}[!]${NC} $1"; }
error()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
step()   { echo -e "\n${YELLOW}━━━ $1 ━━━${NC}"; }

# ── 1. Verificar Homebrew ──────────────────────────────────────
step "Verificando Homebrew"
if ! command -v brew &>/dev/null; then
  warn "Homebrew no encontrado. Instalando..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi
log "Homebrew OK"

# ── 2. Instalar Node.js ────────────────────────────────────────
step "Verificando Node.js"
if ! command -v node &>/dev/null; then
  warn "Instalando Node.js..."
  brew install node
fi
NODE_VERSION=$(node -v)
log "Node.js $NODE_VERSION OK"

# ── 3. Instalar PM2 ───────────────────────────────────────────
step "Verificando PM2"
if ! command -v pm2 &>/dev/null; then
  warn "Instalando PM2..."
  npm install -g pm2
fi
log "PM2 OK"

# ── 4. Crear directorios ───────────────────────────────────────
step "Creando estructura de directorios"
sudo mkdir -p /opt/soundwave/server
sudo mkdir -p /opt/soundwave/music
sudo chown -R $(whoami) /opt/soundwave
log "Directorios creados en /opt/soundwave"

# ── 5. Copiar archivos del servidor ────────────────────────────
step "Copiando archivos del servidor"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -f "$SCRIPT_DIR/server/server.js" ]; then
  error "No se encuentra server/server.js. Ejecuta este script desde la raíz del proyecto."
fi

cp -r "$SCRIPT_DIR/server/"* /opt/soundwave/server/
log "Archivos copiados"

# ── 6. Instalar dependencias npm ───────────────────────────────
step "Instalando dependencias Node.js"
cd /opt/soundwave/server
npm install --production
log "Dependencias instaladas"

# ── 7. Generar JWT_SECRET aleatorio ───────────────────────────
step "Configurando JWT Secret"
JWT_SECRET=$(openssl rand -hex 32)
sed -i '' "s/REPLACE_WITH_A_LONG_RANDOM_STRING_HERE/$JWT_SECRET/" /opt/soundwave/server/ecosystem.config.js
log "JWT_SECRET generado y configurado"

# ── 8. Iniciar con PM2 ────────────────────────────────────────
step "Iniciando servidor con PM2"
cd /opt/soundwave/server
pm2 start ecosystem.config.js
pm2 save
log "Servidor iniciado"

# ── 9. Configurar PM2 para arranque automático ─────────────────
step "Configurando arranque automático"
pm2 startup | tail -1 | bash 2>/dev/null || warn "Ejecuta manualmente: pm2 startup"
pm2 save
log "Arranque automático configurado"

# ── 10. Obtener IP local ───────────────────────────────────────
step "Información de red"
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "No encontrada")

echo ""
echo "════════════════════════════════════════════════"
echo "  🎵 SoundWave instalado correctamente"
echo "════════════════════════════════════════════════"
echo ""
echo "  IP local del Mac Mini: ${GREEN}$LOCAL_IP${NC}"
echo "  URL del servidor:      ${GREEN}http://$LOCAL_IP:3000${NC}"
echo "  Directorio música:     /opt/soundwave/music"
echo "  Base de datos:         /opt/soundwave/soundwave.db"
echo ""
echo "  Usuario admin por defecto:"
echo "    Usuario:  admin"
echo "    Password: admin123  ${RED}← CÁMBIALO${NC}"
echo ""
echo "  Comandos útiles:"
echo "    pm2 status           → Ver estado"
echo "    pm2 logs soundwave   → Ver logs"
echo "    pm2 restart soundwave → Reiniciar"
echo ""
echo "  En la app móvil, configura:"
echo "    SERVER_URL = http://$LOCAL_IP:3000"
echo "════════════════════════════════════════════════"
