<template>
  <div>
    <vue-sticky-sidebar class="sidebar" containerSelector=".stick-container" innerWrapperSelector=".sidebar__inner">
      <v-app class="sidebar__inner">
        <v-main class="grey lighten-4 pt-16 px-1 py-4 pr-5 text-right">
          <div class="d-flex flex-column pa-0">
            <div class="d-block text-center mb-5 align-self-center">
              <v-btn icon plain :ripple="false" to="/profile">
                <v-avatar color="primary" size="30">
                  <v-img v-if="typeof $store.state.user.imageUrl === 'string' && $store.state.user.imageUrl !== ''" :src="$store.state.user.imageUrl"/>
                  <span class="font-weight-medium white--text" v-if="typeof $store.state.user.imageUrl !== 'string' || $store.state.user.imageUrl === ''">{{toFirstUpper($store.state.user.firstName).split('')[0]}}</span>
                </v-avatar>
              </v-btn>
            </div>
            <v-btn
                @click="logoutDialog"
                class="d-block text-center mb-5 align-self-center"
                icon :ripple="false"
            >
              <v-icon>mdi-logout</v-icon>
            </v-btn>
          </div>
        </v-main>
      </v-app>
    </vue-sticky-sidebar>
    <Dialog :dialog="customDialog"/>
  </div>
</template>

<script>
import vueStickySidebar from 'vue-sticky-sidebar';
import Dialog from "@/components/Dialog";
export default {
  name: "RightSidebarButton",
  components: {
    Dialog,
    vueStickySidebar
  },
  data: ()=>({
    customDialog: undefined
  })
}
</script>

<style scoped>

</style>