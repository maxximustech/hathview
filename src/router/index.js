import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/Customers.vue')
  },
  {
    path: '/users/:ref',
    name: 'user',
    component: () => import('../views/SingleUser.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/SingleUser.vue')
  },
  {
    path: '/thrifts',
    name: 'thrifts',
    component: () => import('../views/Thrift.vue')
  },
  {
    path: '/thrifts/:id',
    name: 'single-thrift',
    component: () => import('../views/SingleThrift.vue')
  },
  {
    path: '/cooperatives',
    name: 'cooperatives',
    component: () => import('../views/Cooperative.vue')
  },
  {
    path: '/cooperatives/:id',
    name: 'single-cooperative',
    component: () => import('../views/SingleCooperative.vue')
  },
  {
    path: '/loans',
    name: 'loans',
    component: () => import('../views/Loan.vue')
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: () => import('../views/Transactions.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Auth/Login.vue')
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/Auth/ForgotPassword.vue')
  },
  {
    path: '/confirm-code',
    name: 'confirm-code',
    component: () => import('../views/Auth/ConfirmCode.vue')
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('../views/Auth/ConfirmNewPassword.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to,from,savedPosition){
    if(savedPosition){
      return savedPosition;
    }else if(to.hash){
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }else{
      return {
        x: 0,
        y: 0
      }
    }
  }
})

export default router
