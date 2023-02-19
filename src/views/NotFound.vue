<template>
  <div class="add-mt text-center px-10" style="height: 100vh;">
    <v-img :src="require('@/assets/404.svg')"/>
    <h4  class="text-subtitle-2 text-md-h6 px-5 font-weight-bold">The page you are searching for does not exist or might have been moved or deleted.</h4>
    <v-btn @click="goBack()" color="primary" class="pa-6 px-md-10 mt-5">
      Go back
    </v-btn>
  </div>
</template>

<script>
export default {
  name: "NotFound",
  mounted(){

  },
  metaInfo(){
    return {
      title: 'Page Not Found'
    }
  },
  methods:{
    goBack(){
      window.history.back();
    }
  }
}
</script>

<style scoped>

</style>