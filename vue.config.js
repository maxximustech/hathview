const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: '/app',
  pwa: {
    name: 'HathView',
    themeColor: '#f5f5f5',
    msTileColor: '#121212',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: '#121212',
    iconPaths: {
      // faviconSVG: 'img/kobbware-icon.png',
      // favicon32: 'img/kobbware-icon.png',
      // favicon16: 'img/kobbware-icon.png',
      // appleTouchIcon: 'img/kobbware-icon.png',
      // maskIcon: 'img/kobbware-icon.png',
      // msTileImage: 'img/kobbware-icon.png',
    },
    // configure the workbox plugin
    workboxPluginMode: 'GenerateSW'
  }
})
