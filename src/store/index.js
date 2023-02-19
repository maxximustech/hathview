import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    baseUrl: 'https://api.hathview.ng/',//'http://192.168.1.151:5000/',//'http://172.20.10.2:5000/','https://api.hatview.ng/'
    loggedIn: false,
    menu: [],
    showRightSidebar: false,
    user:{},
    jwt: '',
    loadingAuth: false,
    contentLoaded: false
  },
  getters: {
  },
  mutations: {
    setAuth: (state, payload)=>{
      state.jwt = payload.token;
      state.user = payload.user;
    },
    setContentLoaded: (state, val)=>{
      state.contentLoaded = val;
    },
    setLoadingAuth: (state, val)=>{
      state.loadingAuth = val;
    },
    updateWallet: (state, val)=>{
      state.user.wallet = +val;
    },
    updateAvatar: (state, val)=>{
      state.user.imageUrl = val;
    },
    setMenu: (state, payload)=>{
      state.menu = payload;
    }
  },
  actions: {
  },
  modules: {
  }
})
