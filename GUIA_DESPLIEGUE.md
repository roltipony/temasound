# 🎵 SoundWave — Guía de Despliegue Completa

## Arquitectura del sistema

```
┌─────────────────────────────────┐
│         Mac Mini (Servidor)      │
│  Node.js + Express               │
│  Puerto: 3000                    │
│  /opt/soundwave/music  ←── MP3s  │
│  SQLite (usuarios, playlists)    │
└────────────┬────────────────────┘
             │ Red WiFi local
   ┌──────────┴──────────┐
   │                     │
┌──┴──┐             ┌────┴────┐
│ iOS │             │ Android │
│ App │             │  App    │
└─────┘             └─────────┘
  (streaming, sin guardar archivos)
```

---

## PARTE 1 — Servidor en Mac Mini

### Paso 1: Descargar el proyecto

Descarga o copia la carpeta `soundwave/` en tu Mac Mini, por ejemplo en tu escritorio:
```
~/Desktop/soundwave/
```

### Paso 2: Ejecutar el script de instalación

Abre **Terminal** y ejecuta:

```bash
cd ~/Desktop/soundwave
chmod +x deploy.sh
bash deploy.sh
```

El script hace automáticamente:
- Instala Homebrew (si no lo tienes)
- Instala Node.js
- Instala PM2 (gestor de procesos)
- Copia el servidor a `/opt/soundwave/`
- Instala dependencias npm
- Genera un JWT secret seguro
- Inicia el servidor
- Configura arranque automático al encender el Mac

### Paso 3: Verificar que funciona

```bash
pm2 status
```
Debes ver `soundwave` con estado `online`.

Prueba en el navegador de tu Mac:
```
http://localhost:3000/api/songs
```
Debe responder con `[]` (lista vacía).

### Paso 4: Anotar la IP local del Mac Mini

```bash
ipconfig getifaddr en0
```
Ejemplo de resultado: `192.168.1.45`

Esta IP es la que pondrás en la app móvil.

> **Consejo:** Asigna IP fija a tu Mac Mini en el router para que no cambie.
> Router → DHCP → Reservar IP para MAC address del Mac Mini.

### Paso 5: Cambiar la contraseña del admin

Cuando abras la app, el primer usuario creado por defecto es:
- **Usuario:** `admin`
- **Password:** `admin123`

Entra con esas credenciales y crea tu cuenta personal con el botón "Register".

---

## PARTE 2 — App Móvil (Expo)

### Paso 1: Instalar herramientas de desarrollo

En tu ordenador de desarrollo (puede ser el mismo Mac Mini):

```bash
# Instalar Node.js si no lo tienes
brew install node

# Instalar Expo CLI
npm install -g expo-cli eas-cli
```

### Paso 2: Configurar la IP del servidor

Edita el archivo `mobile-app/lib/api.js` y cambia:

```javascript
export const SERVER_URL = 'http://TU_IP_AQUI:3000';
// Ejemplo:
export const SERVER_URL = 'http://192.168.1.45:3000';
```

### Paso 3: Instalar dependencias de la app

```bash
cd ~/Desktop/soundwave/mobile-app
npm install
```

### Paso 4: Probar en tu móvil (modo desarrollo)

```bash
npx expo start
```

Esto muestra un **código QR**. Para usarlo:

**En iPhone:**
1. Instala la app **Expo Go** desde App Store
2. Abre la cámara y escanea el QR
3. La app se abre directamente

**En Android:**
1. Instala la app **Expo Go** desde Google Play
2. Escanea el QR desde la propia app Expo Go
3. La app se abre directamente

> Tu móvil y el Mac Mini deben estar en la **misma red WiFi**.

---

## PARTE 3 — Compilar la app (sin Expo Go)

Para tener una app nativa instalable directamente:

### Android (.apk)

```bash
cd mobile-app

# Login en Expo (gratis)
eas login

# Configurar el proyecto
eas build:configure

# Compilar APK para compartir
eas build --platform android --profile preview
```

Esto genera un link de descarga del `.apk`. Instálalo en cualquier Android activando "Fuentes desconocidas".

### iOS (TestFlight)

Requiere cuenta Apple Developer ($99/año):

```bash
eas build --platform ios --profile preview
```

Alternativamente, para pruebas sin pagar, usa **Expo Go** (Paso 4 arriba).

---

## PARTE 4 — Gestión del servidor

### Comandos PM2 útiles

```bash
pm2 status                  # Ver estado de todos los procesos
pm2 logs soundwave          # Ver logs en tiempo real
pm2 restart soundwave       # Reiniciar el servidor
pm2 stop soundwave          # Parar el servidor
pm2 start soundwave         # Iniciar el servidor
```

### Ver música almacenada

```bash
ls /opt/soundwave/music/
```

### Backup de la base de datos

```bash
cp /opt/soundwave/soundwave.db ~/Desktop/soundwave-backup-$(date +%Y%m%d).db
```

### Ver logs de errores

```bash
pm2 logs soundwave --err
```

---

## PARTE 5 — Futuro: Acceso desde fuera de casa

Cuando quieras acceder desde cualquier lugar (no solo WiFi local):

### Opción A: Tailscale (recomendada, gratis y fácil)

1. Instala Tailscale en tu Mac Mini: https://tailscale.com
2. Instala Tailscale en tu móvil
3. Ambos dispositivos estarán en una VPN privada
4. El Mac tendrá una IP fija tipo `100.x.x.x`
5. Cambia `SERVER_URL` en la app a esa IP

### Opción B: Túnel con Cloudflare (acceso HTTPS público)

```bash
# Instalar cloudflared
brew install cloudflare/cloudflare/cloudflared

# Crear túnel (requiere cuenta Cloudflare gratis)
cloudflared tunnel --url http://localhost:3000
```

Esto te da una URL pública tipo `https://xxxx.trycloudflare.com`.

### Opción C: Puerto abierto en el router

1. Router → Port Forwarding → Puerto 3000 → IP del Mac Mini
2. Consigue tu IP pública: https://whatismyip.com
3. Cambia `SERVER_URL` a `http://TU_IP_PUBLICA:3000`

> Para opción C, considera usar un dominio con DNS dinámico (DynDNS, Duck DNS).

---

## Solución de problemas frecuentes

| Problema | Solución |
|----------|----------|
| "Network request failed" en la app | Verifica que la IP en `api.js` sea correcta y estés en la misma WiFi |
| El servidor no arranca | `pm2 logs soundwave --err` para ver el error |
| Música no reproduce | Verifica que el archivo no esté corrupto con `pm2 logs soundwave` |
| App no encuentra el servidor tras reiniciar Mac | Ejecuta `pm2 resurrect` o reinicia: `pm2 start ecosystem.config.js` |
| "Expo Go" no conecta | Asegúrate de estar en la misma red WiFi que el Mac Mini |

---

## Estructura final de archivos

```
/opt/soundwave/
├── server/
│   ├── server.js          ← Servidor principal
│   ├── ecosystem.config.js ← Config de PM2
│   ├── package.json
│   └── node_modules/
├── music/                  ← Archivos de audio
└── soundwave.db            ← Base de datos SQLite
```
