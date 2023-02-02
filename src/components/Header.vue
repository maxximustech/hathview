<template>
  <v-app-bar
      app
      color="transparent"
      elevation="0"
      class="py-2 px-1"
  >
    <div class="d-flex px-3 elevation-5" style="width: 100%;background-color: white; border-radius: 20px;">
      <div class="align-self-center">
        <v-img
            alt="Hathview Logo"
            class="shrink mr-2 py-2"
            contain
            :src="require('../assets/hathview-logo.png')"
            transition="scale-transition"
            :width="$vuetify.breakpoint.smAndDown?120:150"
        />
      </div>
      <div class="ml-auto align-self-center">
        <v-badge class="mr-n3" bordered top dot offset-x="30" offset-y="15">
          <v-btn
              plain :ripple="false"
          >
            <v-icon>mdi-bell-outline</v-icon>
          </v-btn>
        </v-badge>
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
        <v-btn
            class="px-0"
            icon :ripple="false"
        >
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </div>
    </div>
  </v-app-bar>
</template>

<script>
export default {
  name: "Header"
}
</script>

<style scoped>

</style>