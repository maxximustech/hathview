<template>
  <v-app>
    <Header v-if="$vuetify.breakpoint.smAndDown&&!disablePages.includes($route.path)"/>
    <v-main class="big-mt grey lighten-4">
      <v-card class="px-5 px-md-0" color="transparent">
        <v-row class="px-0 no-gutters">
          <v-col class="stick-container" v-if="$vuetify.breakpoint.mdAndUp&&$store.state.loggedIn&&!disablePages.includes($route.path)" cols="3">
            <Sidebar/>
          </v-col>
          <v-col :cols="$vuetify.breakpoint.mdAndUp&&$store.state.loggedIn&&!disablePages.includes($route.path)?($store.state.showRightSidebar?6:7):12">
            <SlideYDownTransition :key="$route.fullPath" appear mode="out-in">
              <router-view/>
            </SlideYDownTransition>
          </v-col>
          <v-col class="stick-container" v-if="$vuetify.breakpoint.mdAndUp&&$store.state.loggedIn&&!disablePages.includes($route.path)&&!$store.state.showRightSidebar" cols="2">
            <RightSidebarButton/>
          </v-col>
          <v-col class="stick-container" v-if="$vuetify.breakpoint.mdAndUp&&$store.state.loggedIn&&!disablePages.includes($route.path)&&$store.state.showRightSidebar" cols="3">
            <RightSidebar/>
          </v-col>
        </v-row>
      </v-card>
    </v-main>
    <Footer v-if="$vuetify.breakpoint.smAndDown&&!disablePages.includes($route.path)"/>
  </v-app>
</template>

<script>

import Header from "@/components/Header";
import {SlideYDownTransition} from 'vue2-transitions';
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import RightSidebarButton from "@/components/RightSidebarButton";
export default {
  name: 'App',
  components: {RightSidebarButton, RightSidebar, Sidebar, Footer, Header,SlideYDownTransition},
  data: () => ({
    disablePages: [
        '/login',
        '/forgot-password',
        '/confirm-code',
        '/reset-password',
    ]
  }),
};
</script>
