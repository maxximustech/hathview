<template>
  <v-footer>
    <v-bottom-navigation height="80" style="width: 100%; background-color: transparent;" class="elevation-0" app>
      <div style="position: relative; height: 80px; width: 100%;background-color: white;" class="d-flex justify-space-around align-self-center">
        <v-btn class="px-0 ml-n2" x-small v-for="(item,i) in $store.state.menu.slice(0,4)" plain :ripple="false" :to="item.to" :key="i" color="primary">
          <div class="text-center">
            <v-icon class="d-block">{{item.icon}}</v-icon>
            <span class="mt-n2 foot-btn-text">{{item.text}}</span>
          </div>
        </v-btn>
        <v-btn class="px-0 ml-n2" x-small v-if="$store.state.menu.length > 4" plain :ripple="false">
          <v-menu top right offset-y close-on-click class="elevation-0">
            <template v-slot:activator="{on,attrs}">
              <v-btn icon plain :ripple="false" v-bind="attrs" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list class="elevation-0">
              <v-list-item v-for="(item,i) in $store.state.menu.slice(4,100)" :key="i" :to="item.to">
                <v-list-item-title class="text-subtitle-2">{{item.text}}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-btn>
      </div>
    </v-bottom-navigation>
  </v-footer>
</template>

<script>
import {SlideYDownTransition} from 'vue2-transitions';
export default {
  name: "Footer",
  components: {
    SlideYDownTransition
  },
  data: ()=>({
    value: 0
  })
}
</script>

<style>
.foot-btn-text{
  font-size: 8px !important;;
}
</style>