<template>
  <v-dialog
      v-model="cd.show"
      width="400"
      :persistent="cd.persistent"
      style="z-index: 1003;"
  >
    <v-card class="rounded-xl pa-4">
      <v-card-text class="pt-4">
        <div class="text-center" style="word-break: break-word;">
          <div v-if="cd.icon === 'success'" class="kbanim-icon kbanim-success kbanim-animate-success-icon" style="display: flex;">
            <div class="kbanim-success-circular-line-left" style="background-color: transparent;"></div>
            <span class="kbanim-success-line-tip"></span>
            <span class="kbanim-success-line-long"></span>
            <div class="kbanim-success-ring"></div>
            <div class="kbanim-success-fix" style="background-color: transparent;"></div>
            <div class="kbanim-success-circular-line-right" style="background-color: transparent;"></div>
          </div>
          <div v-if="cd.icon === 'error'" class="kbanim-icon kbanim-error kbanim-animate-error-icon" style="display: flex;"><span class="kbanim-x-mark"><span class="kbanim-x-mark-line-left"></span><span class="kbanim-x-mark-line-right"></span></span></div>
          {{cd.text}}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <template v-for="btn in cd.buttons">
          <v-btn
              v-if="btn != null"
              :loading="typeof btn.loading === 'boolean'?btn.loading:undefined"
              :disabled="typeof btn.disabled === 'boolean'?btn.disabled:undefined"
              :color="typeof btn.color !== 'undefined' && btn.color != null ? btn.color : 'primary'"
              text
              @click="btn.click"
          >
            {{btn.text || ''}}
          </v-btn>
        </template>
        <v-btn
            v-if="typeof cd.closeBtn !== 'undefined' && cd.closeBtn != null"
            :loading="typeof cd.closeBtn.loading === 'boolean'?cd.closeBtn.loading:undefined"
            :disabled="typeof cd.closeBtn.disabled === 'boolean'?cd.closeBtn.disabled:undefined"
            :color="typeof cd.closeBtn.color !== 'undefined' && cd.closeBtn.color != null ? cd.closeBtn.color : 'primary'"
            text
            @click="cd.closeBtn.click"
        >
          {{cd.closeBtn.text || ''}}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "Dialog",
  props:{
    dialog:{
      type: Object,
      default(){
        return {
          show: false,
          persistent: true,
          text: '',
          icon: '',
          closeBtn: {
            text: 'Close',
            color: 'primary',
            click: ()=>{
              this.cd.show = false;
            }
          },
          buttons: []
        };
      }
    }
  },
  computed:{
    cd:{
      get(){
        return this.dialog;
      },
      set(val){
        this.$emit('updated',val);
      }
    }
  }
}
</script>

<style scoped>

</style>