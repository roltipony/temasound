# 🎵 TemaSound

Plataforma de streaming de música self-hosted para tu red local.

## Estructura del proyecto

```
soundwave/
├── server/              ← Servidor Node.js para Mac Mini
│   ├── server.js
│   ├── package.json
│   └── ecosystem.config.js
├── mobile-app/          ← App React Native / Expo (iOS + Android)
│   ├── app/
│   │   ├── (auth)/      ← Pantallas de login/registro
│   │   ├── (tabs)/      ← Pantallas principales (library, playlists, upload, profile)
│   │   ├── playlist/    ← Detalle de playlist
│   │   ├── player.jsx   ← Reproductor pantalla completa
│   │   └── settings.jsx ← Configuración del servidor
│   ├── components/
│   │   ├── MiniPlayer.jsx
│   │   └── SongItem.jsx
│   └── lib/
│       ├── api.js        ← Cliente API + auth store
│       └── player.js     ← Store del reproductor
├── deploy.sh            ← Script de instalación automática
└── GUIA_DESPLIEGUE.md   ← Guía paso a paso
```

## Inicio rápido

1. `bash deploy.sh` en el Mac Mini
2. Edita `mobile-app/lib/api.js` con la IP del Mac
3. `cd mobile-app && npm install && npx expo start`
4. Escanea el QR con Expo Go en tu móvil

Ver `GUIA_DESPLIEGUE.md` para instrucciones completas.
