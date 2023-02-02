<template>
  <vue-sticky-sidebar class="sidebar" containerSelector=".stick-container" innerWrapperSelector=".sidebar__inner">
    <v-app class="sidebar__inner" style="height: 100vh;">
      <v-main class="grey lighten-4 pa-3">
        <v-card style="height: 100%" class="rounded-xl" flat color="white">
          <v-card-text class="d-flex flex-column pa-0">
            <div class="text-center pa-4">
              <v-img
                  alt="Hathview Logo"
                  class="shrink"
                  contain
                  :src="require('../assets/hathview-logo.png')"
                  transition="scale-transition"
                  width="140"
              />
            </div>
            <div class="mt-auto">
              <v-list dense rounded color="transparent">
                <v-list-item-group>
                  <v-list-item color="primary" v-for="(item, i) in $store.state.menu" :key="i" :to="item.to">
                    <v-list-item-icon>
                      <v-icon>{{item.icon}}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{item.text}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
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
  name: "Sidebar",
  components: {
    vueStickySidebar
  },
  data: ()=>({

  })
}
</script>

<style scoped>

</style>