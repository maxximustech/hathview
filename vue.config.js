const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: '/',
  pwa: {
    name: 'HathView Investment',
    themeColor: '#f5f5f5',
    msTileColor: '#121212',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: '#121212',
    iconPaths: {
      faviconSVG: 'hathview-favicon.png',
      favicon32: 'hathview-favicon.png',
      favicon16: 'hathview-favicon.png',
      appleTouchIcon: 'hathview-favicon.png',
      maskIcon: 'hathview-favicon.png',
      msTileImage: 'hathview-favicon.png',
    },
    // configure the workbox plugin
    workboxPluginMode: 'GenerateSW'
  }
})
