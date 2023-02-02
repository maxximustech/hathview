<template>
  <vue-sticky-sidebar class="sidebar" containerSelector=".stick-container" innerWrapperSelector=".sidebar__inner">
    <v-app class="sidebar__inner">
      <v-main class="grey lighten-4 pt-16 px-1 py-4 pr-5 text-right">
        <div class="d-flex flex-column pa-0">
          <div class="d-block text-center mb-5 align-self-center">
            <v-badge bordered top dot offset-x="15" offset-y="15">
              <v-btn
                  class="px-0"
                  icon :ripple="false"
              >
                <v-icon>mdi-bell-outline</v-icon>
              </v-btn>
            </v-badge>
          </div>
          <div class="d-block text-center mb-5 align-self-center">
            <v-btn icon :ripple="false">
              <v-menu bottom right offset-y close-on-click class="elevation-0">
                <template v-slot:activator="{on,attrs}">
                  <v-avatar size="30" v-bind="attrs" v-on="on">
                    <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt=""/>
                  </v-avatar>
                </template>
                <v-list class="elevation-0">
                  <v-list-item to="/profile/edit">
                    <v-list-item-title class="text-subtitle-2">Edit Profile</v-list-item-title>
                  </v-list-item>
                  <v-list-item to="/profile/payment">
                    <v-list-item-title class="text-subtitle-2">Payment Details</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-btn>
          </div>
          <v-btn
              class="d-block text-center mb-5 align-self-center"
              icon :ripple="false"
          >
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </div>
      </v-main>
    </v-app>
  </vue-sticky-sidebar>
</template>

<script>
import vueStickySidebar from 'vue-sticky-sidebar';
export default {
  name: "RightSidebarButton",
  components: {
    vueStickySidebar
  },
  data: ()=>({

  })
}
</script>

<style scoped>

</style>