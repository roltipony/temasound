module.exports = {
  apps: [
    {
      name: 'temasound',
      script: 'server.js',
      cwd: '/opt/temasound/server',
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        MUSIC_DIR: '/opt/temasound/music',
        DB_PATH: '/opt/temasound/temasound.db',
        JWT_SECRET: 'REPLACE_WITH_A_LONG_RANDOM_STRING_HERE'
      }
    }
  ]
};
