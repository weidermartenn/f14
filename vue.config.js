const path = require('path');

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'), // Алиас @ для папки src
        '@components': path.resolve(__dirname, 'src/components'), // Пример алиаса для папки components
      },
    },
  },
};