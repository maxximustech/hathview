import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    baseUrl: 'http://172.20.10.6:5000/',
    loggedIn: true,
    menu: [
      {
        text: 'Dashboard',
        icon: 'mdi-home',
        'to': '/dashboard',
      },
      {
        text: 'Users',
        icon: 'mdi-account-multiple-outline',
        'to': '/users',
      },
      {
        text: 'Thrift',
        icon: 'mdi-piggy-bank-outline',
        'to': '/thrifts',
      },
      {
        text: 'Transactions',
        icon: 'mdi-script-outline',
        'to': '/transactions',
      },
      {
        text: 'Co-operatives',
        icon: 'mdi-view-dashboard-outline',
        'to': '/cooperatives',
      },
      {
        text: 'Loans',
        icon: 'mdi-cash-fast',
        'to': '/loans',
      }
    ],
    showRightSidebar: false,
    user:{},
    jwt: '',
  },
  getters: {
  },
  mutations: {
    setAuth: (state, payload)=>{
      state.jwt = payload.token;
      state.user = payload.user;
    },
  },
  actions: {
  },
  modules: {
  }
})
