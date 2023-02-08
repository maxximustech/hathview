<template>
  <v-sheet color="transparent" style="height: 100vh; width: 100vw;">
    <v-overlay absolute opacity="0" class="text-center minus-mt grey lighten-4" style="overflow: hidden;">
      <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </v-overlay>
  </v-sheet>
</template>

<script>
export default {
  name: "ContentLoading"
}
</script>

<style scoped>
.loader-div{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  margin: 0;
}
</style>