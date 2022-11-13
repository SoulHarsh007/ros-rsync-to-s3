module.exports = {
  apps: [
    {
      name: 'ROS: Rsync to S3',
      script: './index.js',
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};
