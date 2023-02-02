import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
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
    showRightSidebar: false
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
