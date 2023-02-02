<template>
  <v-app>
    <v-main class="add-mt px-0 px-md-3 grey lighten-4">
      <v-row class="px-0">
        <v-col class="col-12">
          <v-card flat color="transparent" class="">
            <v-card-text class="px-0">
              <div v-if="showLoader">
                <v-skeleton-loader class="mb-4" type="image"/>
                <v-skeleton-loader type="article, article, article, actions"/>
              </div>
              <div v-else>
                <v-row>
                  <v-col cols="12">
                    <v-card flat color="transparent">
                      <v-card-text class="pa-0 ma-0">
                        <div class="text-center">
                          <v-avatar color="primary lighten-1" size="100">
                          <span class="white--text text-h4 font-weight-bold">
                            SA
                          </span>
                            <div style="width: 100%; height: 100%; position: absolute;" class="d-flex justify-center">
                              <v-btn icon plain :ripple="false" class="align-self-center">
                                <v-icon size="30">mdi-camera</v-icon>
                              </v-btn>
                            </div>
                          </v-avatar>
                          <h4 class="text-subtitle-2 font-weight-bold mt-2">Maxx Tech</h4>
                          <h6 class="text-caption font-weight-medium primary--text mt-n1 mb-1">Customer</h6>
                        </div>
                        <v-list class="mt-3" dense rounded color="transparent">
                          <v-list-item-group>
                            <v-list-item v-for="(item, i) in menu" color="primary" :key="i" @click="currentComponent = item.comp">
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
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12">
                    <v-card
                        flat class="rounded-xl sidebar__inner pa-5 elevation-4"
                    >
                      <div class="px-3">
                        <slide-y-up-transition mode="out-in">
                          <component :is="currentComponent"/>
                        </slide-y-up-transition>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>

              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
import EditProfile from "@/components/EditProfile";
import {SlideYUpTransition} from 'vue2-transitions';
export default {
  name: "SingleUser",
  components: {EditProfile,SlideYUpTransition},
  created(){
    setTimeout(()=>{
      this.showLoader = false;
    },1000);
  },
  data: ()=>({
    showLoader: true,
    currentComponent: EditProfile,
    menu: [
      {
        icon: 'mdi-account',
        text: 'Edit Profile',
        comp: EditProfile,
        id: 'editProfile'
      }
    ],
  })
}
</script>

<style scoped>

</style>