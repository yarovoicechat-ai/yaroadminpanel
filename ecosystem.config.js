module.exports = {
  apps: [
    {
      name: 'app-admin',
      cwd: '/root/apps/app-admin',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3002,
        NODE_ENV: 'production'
      }
    }
  ]
}

