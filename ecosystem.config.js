module.exports = {
  apps: [
    {
      name: 'admin-panel',
      cwd: '/root/admin',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 5050,
        NODE_ENV: 'production'
      }
    }
  ]
}
