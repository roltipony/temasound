module.exports = {
  apps: [
    {
      name: 'soundwave',
      script: 'server.js',
      cwd: '/opt/soundwave/server',
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        MUSIC_DIR: '/opt/soundwave/music',
        DB_PATH: '/opt/soundwave/soundwave.db',
        JWT_SECRET: 'REPLACE_WITH_A_LONG_RANDOM_STRING_HERE'
      }
    }
  ]
};
