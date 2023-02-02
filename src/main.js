require('es6-promise').polyfill()

import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

import VueMeta from 'vue-meta'
import VueClipboard from "vue-clipboard2"
import VueCookies from 'vue-cookies'
import Flicking from '@egjs/vue-flicking'
import '@egjs/vue-flicking/dist/flicking.css'
import '@egjs/flicking-plugins/dist/pagination.css'

import mixins from './mixins'

require('vue2-animate/dist/vue2-animate.min.css')
require('./assets/css/style.css')

Vue.use(VueClipboard)
Vue.use(VueMeta,{
  refreshOnceOnNavigation: true
})
Vue.use(Flicking)
Vue.use(VueCookies, { expires: '30d'})
Vue.mixin(mixins);
Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
