<template>
  <vue-sticky-sidebar class="sidebar" containerSelector=".stick-container" innerWrapperSelector=".sidebar__inner">
    <v-app class="sidebar__inner" style="height: 100vh;">
      <v-main class="grey lighten-4 pa-3">
        <v-card style="height: 100%" class="rounded-xl" flat color="white">
          <v-card-text class="d-flex flex-column pa-0">
            <div class="d-flex px-4 py-4" style="width: 100%;">
              <div class="ml-auto align-self-center">
                <v-badge bordered top dot offset-x="10" offset-y="10">
                  <v-avatar size="30">
                    <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt=""/>
                  </v-avatar>
                </v-badge>
              </div>
            </div>
            <div class="mt-auto">
              <v-card flat class="px-3">
                <v-card-text class="text-center">
                  <v-avatar style="position: relative;" size="80" class="elevation-5">
                    <v-img src="https://cdn.vuetifyjs.com/images/john.jpg"/>
                    <v-icon style="position: absolute; bottom: 0; right: 0;">mdi-camera</v-icon>
                  </v-avatar>
                  <div class="text-subtitle-2 mt-3 font-weight-bold">
                    Tunde Adeladan
                  </div>
                  <div class="text-caption">
                    @tundeadelad
                  </div>
                  <v-btn class="mt-2" small outlined color="primary">Edit Profile</v-btn>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-main>
    </v-app>
  </vue-sticky-sidebar>
</template>

<script>
import vueStickySidebar from 'vue-sticky-sidebar';
export default {
  name: "RightSidebar",
  components: {
    vueStickySidebar
  },
  data: ()=>({

  })
}
</script>

<style scoped>

</style>