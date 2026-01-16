module.exports = {
  apps: [
    {
      name: 'dart_legend-be',
      script: './dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: true,
    },
    {
      name: 'cronjob',
      script: 'node',
      args: './dist/cron-program/program.service.js',
      instances: 1,
      watch: false,
      autorestart: true,
      env: {
        NODE_APP_INSTANCE: 'scan',
      },
    },
  ],
};
