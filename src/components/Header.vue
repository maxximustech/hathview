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
        <v-btn icon :ripple="false" to="/profile">
          <v-avatar color="primary" size="30">
            <v-img v-if="typeof $store.state.user.imageUrl === 'string' && $store.state.user.imageUrl !== ''" :src="$store.state.user.imageUrl"/>
            <span class="font-weight-medium white--text" v-if="typeof $store.state.user.imageUrl !== 'string' || $store.state.user.imageUrl === ''">{{toFirstUpper($store.state.user.firstName).split('')[0]}}</span>
          </v-avatar>
        </v-btn>
        <v-btn
            @click="logout"
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